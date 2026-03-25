import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import config from "../config/env";
import File from "../models/File";
import User from "../models/User";
import * as fileService from "./fileService";
import logger from "../utils/logger";

// ── Groq LLM ──────────────────────────────────────────────────
function createLLM() {
  return new ChatGroq({
    apiKey: config.groqApiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    maxTokens: 2048,
  });
}

// ── Tool Definitions ──────────────────────────────────────────

const searchFilesTool = tool(
  async ({ query, userId }: { query: string; userId: string }) => {
    try {
      const files = await fileService.searchFiles(userId, query);
      if (files.length === 0) return "No files found matching your query.";
      return files
        .map(
          (f) =>
            `• ${f.filename} (${(f.size / 1024).toFixed(1)} KB, ${f.mimeType}, id: ${f._id})`
        )
        .join("\n");
    } catch (e: any) {
      return `Error searching files: ${e.message}`;
    }
  },
  {
    name: "search_files",
    description:
      "Search for files in the user's drive by name or keyword. Returns matching filenames, sizes, and IDs.",
    schema: z.object({
      query: z.string().describe("The search query / keyword to look for"),
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

const getFileContentTool = tool(
  async ({ fileId, userId }: { fileId: string; userId: string }) => {
    try {
      const file = await fileService.getFileById(fileId, userId);
      return JSON.stringify(
        {
          filename: file.filename,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          starred: (file as any).starred ?? false,
          sharedWith: file.sharedWith?.map((u: any) => u.email || u) || [],
          owner: (file.owner as any)?.email || file.owner,
        },
        null,
        2
      );
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "get_file_content",
    description:
      "Get detailed metadata of a specific file by its ID. Returns filename, size, type, dates, sharing info.",
    schema: z.object({
      fileId: z.string().describe("The file's _id"),
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

const shareFileTool = tool(
  async ({
    fileId,
    email,
    userId,
  }: {
    fileId: string;
    email: string;
    userId: string;
  }) => {
    try {
      const targetUser = await User.findOne({ email });
      if (!targetUser) return `No user found with email ${email}`;

      const file = await File.findById(fileId);
      if (!file) return "File not found.";
      if (file.owner.toString() !== userId)
        return "Only the owner can share this file.";

      const alreadyShared = file.sharedWith.some(
        (id: any) => id.toString() === targetUser._id.toString()
      );
      if (alreadyShared)
        return `File is already shared with ${email}.`;

      file.sharedWith.push(targetUser._id);
      await file.save();
      return `Successfully shared "${file.filename}" with ${email}.`;
    } catch (e: any) {
      return `Error sharing file: ${e.message}`;
    }
  },
  {
    name: "share_file",
    description: "Share a file with another user by their email address.",
    schema: z.object({
      fileId: z.string().describe("The file's _id to share"),
      email: z.string().describe("The email of the user to share with"),
      userId: z.string().describe("The authenticated user ID (file owner)"),
    }),
  }
);

const summarizeFileTool = tool(
  async ({ fileId, userId }: { fileId: string; userId: string }) => {
    try {
      const file = await fileService.getFileById(fileId, userId);
      return JSON.stringify({
        filename: file.filename,
        type: file.mimeType,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        created: file.createdAt,
        lastModified: file.updatedAt,
        starred: (file as any).starred ?? false,
        sharedWithCount: file.sharedWith?.length || 0,
        sharedWith: file.sharedWith?.map((u: any) => u.email || u) || [],
      });
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "summarize_file",
    description:
      "Get a detailed summary of a file including its metadata, sharing status, and activity.",
    schema: z.object({
      fileId: z.string().describe("The file's _id to summarize"),
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

const listFilesTool = tool(
  async ({
    userId,
    filter,
  }: {
    userId: string;
    filter: "all" | "recent" | "starred" | "shared" | "trash";
  }) => {
    try {
      let files;
      switch (filter) {
        case "recent":
          files = await fileService.getRecentFiles(userId, 10);
          break;
        case "starred":
          files = await fileService.getStarredFiles(userId);
          break;
        case "shared":
          files = await fileService.getSharedFiles(userId);
          break;
        case "trash":
          files = await fileService.getTrashedFiles(userId);
          break;
        default:
          files = await fileService.getUserFiles(userId);
      }
      if (files.length === 0) return `No files found in ${filter}.`;
      return files
        .map(
          (f) =>
            `• ${f.filename} (${(f.size / 1024).toFixed(1)} KB, ${f.mimeType}, id: ${f._id})`
        )
        .join("\n");
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "list_files",
    description:
      "List the user's files. Use filter to get all, recent, starred, shared, or trash files.",
    schema: z.object({
      userId: z.string().describe("The authenticated user ID"),
      filter: z
        .enum(["all", "recent", "starred", "shared", "trash"])
        .describe("Which file list to retrieve"),
    }),
  }
);

const getStorageStatsTool = tool(
  async ({ userId }: { userId: string }) => {
    try {
      const stats = await fileService.getStorageStats(userId);
      const usedGB = (stats.usedBytes / (1024 * 1024 * 1024)).toFixed(2);
      const totalGB = (stats.totalBytes / (1024 * 1024 * 1024)).toFixed(0);
      const percent = ((stats.usedBytes / stats.totalBytes) * 100).toFixed(1);
      return `Storage: ${usedGB} GB used of ${totalGB} GB (${percent}%). ${stats.fileCount} files stored.`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "get_storage_stats",
    description:
      "Get the user's current storage usage (used GB, total GB, percentage, file count).",
    schema: z.object({
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

const trashFileTool = tool(
  async ({ fileId, userId }: { fileId: string; userId: string }) => {
    try {
      const file = await fileService.trashFile(fileId, userId);
      return `"${file.filename}" has been moved to trash.`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "trash_file",
    description:
      "Move a file to trash (soft delete). The file can be restored later.",
    schema: z.object({
      fileId: z.string().describe("The file's _id to trash"),
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

const toggleStarTool = tool(
  async ({ fileId, userId }: { fileId: string; userId: string }) => {
    try {
      const file = await fileService.toggleStar(fileId, userId);
      const action = (file as any).starred ? "starred" : "unstarred";
      return `"${file.filename}" has been ${action}.`;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  },
  {
    name: "toggle_star",
    description: "Star or unstar a file to mark it as important.",
    schema: z.object({
      fileId: z.string().describe("The file's _id to star/unstar"),
      userId: z.string().describe("The authenticated user ID"),
    }),
  }
);

// ── All tools array ───────────────────────────────────────────
const allTools = [
  searchFilesTool,
  getFileContentTool,
  shareFileTool,
  summarizeFileTool,
  listFilesTool,
  getStorageStatsTool,
  trashFileTool,
  toggleStarTool,
];

// ── System Prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Drive AI, an intelligent assistant for a Google Drive-like file storage application.

You help users manage their files by searching, sharing, organizing, summarizing, and answering questions about their stored files.

**Capabilities:**
- Search files by name or keyword
- List files (all, recent, starred, shared, trash)
- Get detailed file information and summaries
- Share files with other users by email
- Star/unstar files for quick access
- Move files to trash
- Check storage usage

**Rules:**
1. Always be helpful, concise, and friendly.
2. When a user asks about their files, use the available tools to look up real data — never make up file names or details.
3. For actions like sharing, trashing, or starring — confirm what you did with the exact filename.
4. If the user's request is ambiguous, ask for clarification.
5. When listing files, format them nicely with bullet points.
6. Always include the userId parameter when calling tools — it will be provided to you in the conversation.
7. After using a tool, always INTERPRET the results for the user in a natural, friendly way. Never just dump raw tool output.
8. If a tool returns an error, explain it in simple terms.
9. You CANNOT upload files or create new files — tell the user to use the "New" button in the sidebar.
10. Keep responses concise and well-formatted using markdown.`;

// ── LangGraph Agent ───────────────────────────────────────────

function buildGraph() {
  const llm = createLLM();
  const llmWithTools = llm.bindTools(allTools);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ToolNode } = require("@langchain/langgraph/prebuilt");
  const toolNode = new ToolNode(allTools);

  // Agent node: call LLM
  async function agentNode(state: typeof MessagesAnnotation.State) {
    const response = await llmWithTools.invoke(state.messages);
    return { messages: [response] };
  }

  // Router: should we call tools or end?
  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return "tools";
    }
    return END;
  }

  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", agentNode)
    .addNode("tools", toolNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", shouldContinue, ["tools", END])
    .addEdge("tools", "agent")
    .compile();

  return graph;
}

// Singleton graph
let graphInstance: ReturnType<typeof buildGraph> | null = null;

function getGraph() {
  if (!graphInstance) {
    graphInstance = buildGraph();
  }
  return graphInstance;
}

// ── Chat Interface ────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chat(
  userId: string,
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  if (!config.groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured. Please add it to your .env file.");
  }

  const graph = getGraph();

  // Build message history
  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(
      SYSTEM_PROMPT +
        `\n\nIMPORTANT: The currently authenticated userId is "${userId}". Always pass this as the userId parameter to any tool call.`
    ),
  ];

  // Add conversation history
  for (const msg of conversationHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else {
      messages.push(new AIMessage(msg.content));
    }
  }

  // Add current message
  messages.push(new HumanMessage(userMessage));

  try {
    const result = await graph.invoke({ messages });

    // Get the last AI message
    const responseMessages = result.messages;
    for (let i = responseMessages.length - 1; i >= 0; i--) {
      const msg = responseMessages[i];
      if (msg instanceof AIMessage && typeof msg.content === "string" && msg.content.trim()) {
        return msg.content;
      }
    }
    return "I processed your request but have nothing to add.";
  } catch (error: any) {
    logger.error("AI Agent error:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}
