"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = chat;
const groq_1 = require("@langchain/groq");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const langgraph_1 = require("@langchain/langgraph");
const messages_1 = require("@langchain/core/messages");
const env_1 = __importDefault(require("../config/env"));
const File_1 = __importDefault(require("../models/File"));
const User_1 = __importDefault(require("../models/User"));
const fileService = __importStar(require("./fileService"));
const logger_1 = __importDefault(require("../utils/logger"));
// ── Groq LLM ──────────────────────────────────────────────────
function createLLM() {
    return new groq_1.ChatGroq({
        apiKey: env_1.default.groqApiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        maxTokens: 2048,
    });
}
// ── Tool Definitions ──────────────────────────────────────────
const searchFilesTool = (0, tools_1.tool)(async ({ query, userId }) => {
    try {
        const files = await fileService.searchFiles(userId, query);
        if (files.length === 0)
            return "No files found matching your query.";
        return files
            .map((f) => `• ${f.filename} (${(f.size / 1024).toFixed(1)} KB, ${f.mimeType}, id: ${f._id})`)
            .join("\n");
    }
    catch (e) {
        return `Error searching files: ${e.message}`;
    }
}, {
    name: "search_files",
    description: "Search for files in the user's drive by name or keyword. Returns matching filenames, sizes, and IDs.",
    schema: zod_1.z.object({
        query: zod_1.z.string().describe("The search query / keyword to look for"),
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
const getFileContentTool = (0, tools_1.tool)(async ({ fileId, userId }) => {
    try {
        const file = await fileService.getFileById(fileId, userId);
        return JSON.stringify({
            filename: file.filename,
            mimeType: file.mimeType,
            size: file.size,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            starred: file.starred ?? false,
            sharedWith: file.sharedWith?.map((u) => u.email || u) || [],
            owner: file.owner?.email || file.owner,
        }, null, 2);
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "get_file_content",
    description: "Get detailed metadata of a specific file by its ID. Returns filename, size, type, dates, sharing info.",
    schema: zod_1.z.object({
        fileId: zod_1.z.string().describe("The file's _id"),
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
const shareFileTool = (0, tools_1.tool)(async ({ fileId, email, userId, }) => {
    try {
        const targetUser = await User_1.default.findOne({ email });
        if (!targetUser)
            return `No user found with email ${email}`;
        const file = await File_1.default.findById(fileId);
        if (!file)
            return "File not found.";
        if (file.owner.toString() !== userId)
            return "Only the owner can share this file.";
        const alreadyShared = file.sharedWith.some((id) => id.toString() === targetUser._id.toString());
        if (alreadyShared)
            return `File is already shared with ${email}.`;
        file.sharedWith.push(targetUser._id);
        await file.save();
        return `Successfully shared "${file.filename}" with ${email}.`;
    }
    catch (e) {
        return `Error sharing file: ${e.message}`;
    }
}, {
    name: "share_file",
    description: "Share a file with another user by their email address.",
    schema: zod_1.z.object({
        fileId: zod_1.z.string().describe("The file's _id to share"),
        email: zod_1.z.string().describe("The email of the user to share with"),
        userId: zod_1.z.string().describe("The authenticated user ID (file owner)"),
    }),
});
const summarizeFileTool = (0, tools_1.tool)(async ({ fileId, userId }) => {
    try {
        const file = await fileService.getFileById(fileId, userId);
        return JSON.stringify({
            filename: file.filename,
            type: file.mimeType,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            created: file.createdAt,
            lastModified: file.updatedAt,
            starred: file.starred ?? false,
            sharedWithCount: file.sharedWith?.length || 0,
            sharedWith: file.sharedWith?.map((u) => u.email || u) || [],
        });
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "summarize_file",
    description: "Get a detailed summary of a file including its metadata, sharing status, and activity.",
    schema: zod_1.z.object({
        fileId: zod_1.z.string().describe("The file's _id to summarize"),
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
const listFilesTool = (0, tools_1.tool)(async ({ userId, filter, }) => {
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
        if (files.length === 0)
            return `No files found in ${filter}.`;
        return files
            .map((f) => `• ${f.filename} (${(f.size / 1024).toFixed(1)} KB, ${f.mimeType}, id: ${f._id})`)
            .join("\n");
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "list_files",
    description: "List the user's files. Use filter to get all, recent, starred, shared, or trash files.",
    schema: zod_1.z.object({
        userId: zod_1.z.string().describe("The authenticated user ID"),
        filter: zod_1.z
            .enum(["all", "recent", "starred", "shared", "trash"])
            .describe("Which file list to retrieve"),
    }),
});
const getStorageStatsTool = (0, tools_1.tool)(async ({ userId }) => {
    try {
        const stats = await fileService.getStorageStats(userId);
        const usedGB = (stats.usedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const totalGB = (stats.totalBytes / (1024 * 1024 * 1024)).toFixed(0);
        const percent = ((stats.usedBytes / stats.totalBytes) * 100).toFixed(1);
        return `Storage: ${usedGB} GB used of ${totalGB} GB (${percent}%). ${stats.fileCount} files stored.`;
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "get_storage_stats",
    description: "Get the user's current storage usage (used GB, total GB, percentage, file count).",
    schema: zod_1.z.object({
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
const trashFileTool = (0, tools_1.tool)(async ({ fileId, userId }) => {
    try {
        const file = await fileService.trashFile(fileId, userId);
        return `"${file.filename}" has been moved to trash.`;
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "trash_file",
    description: "Move a file to trash (soft delete). The file can be restored later.",
    schema: zod_1.z.object({
        fileId: zod_1.z.string().describe("The file's _id to trash"),
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
const toggleStarTool = (0, tools_1.tool)(async ({ fileId, userId }) => {
    try {
        const file = await fileService.toggleStar(fileId, userId);
        const action = file.starred ? "starred" : "unstarred";
        return `"${file.filename}" has been ${action}.`;
    }
    catch (e) {
        return `Error: ${e.message}`;
    }
}, {
    name: "toggle_star",
    description: "Star or unstar a file to mark it as important.",
    schema: zod_1.z.object({
        fileId: zod_1.z.string().describe("The file's _id to star/unstar"),
        userId: zod_1.z.string().describe("The authenticated user ID"),
    }),
});
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
    async function agentNode(state) {
        const response = await llmWithTools.invoke(state.messages);
        return { messages: [response] };
    }
    // Router: should we call tools or end?
    function shouldContinue(state) {
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return "tools";
        }
        return langgraph_1.END;
    }
    const graph = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode("agent", agentNode)
        .addNode("tools", toolNode)
        .addEdge(langgraph_1.START, "agent")
        .addConditionalEdges("agent", shouldContinue, ["tools", langgraph_1.END])
        .addEdge("tools", "agent")
        .compile();
    return graph;
}
// Singleton graph
let graphInstance = null;
function getGraph() {
    if (!graphInstance) {
        graphInstance = buildGraph();
    }
    return graphInstance;
}
async function chat(userId, userMessage, conversationHistory = []) {
    if (!env_1.default.groqApiKey) {
        throw new Error("GROQ_API_KEY is not configured. Please add it to your .env file.");
    }
    const graph = getGraph();
    // Build message history
    const messages = [
        new messages_1.SystemMessage(SYSTEM_PROMPT +
            `\n\nIMPORTANT: The currently authenticated userId is "${userId}". Always pass this as the userId parameter to any tool call.`),
    ];
    // Add conversation history
    for (const msg of conversationHistory) {
        if (msg.role === "user") {
            messages.push(new messages_1.HumanMessage(msg.content));
        }
        else {
            messages.push(new messages_1.AIMessage(msg.content));
        }
    }
    // Add current message
    messages.push(new messages_1.HumanMessage(userMessage));
    try {
        const result = await graph.invoke({ messages });
        // Get the last AI message
        const responseMessages = result.messages;
        for (let i = responseMessages.length - 1; i >= 0; i--) {
            const msg = responseMessages[i];
            if (msg instanceof messages_1.AIMessage && typeof msg.content === "string" && msg.content.trim()) {
                return msg.content;
            }
        }
        return "I processed your request but have nothing to add.";
    }
    catch (error) {
        logger_1.default.error("AI Agent error:", error);
        throw new Error(`AI processing failed: ${error.message}`);
    }
}
//# sourceMappingURL=aiService.js.map