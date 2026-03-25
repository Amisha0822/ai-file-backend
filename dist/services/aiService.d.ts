export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}
export declare function chat(userId: string, userMessage: string, conversationHistory?: ChatMessage[]): Promise<string>;
//# sourceMappingURL=aiService.d.ts.map