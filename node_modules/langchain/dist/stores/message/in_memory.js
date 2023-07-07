import { BaseListChatMessageHistory } from "../../schema/index.js";
export class ChatMessageHistory extends BaseListChatMessageHistory {
    constructor(messages) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "in_memory"]
        });
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.messages = messages ?? [];
    }
    async getMessages() {
        return this.messages;
    }
    async addMessage(message) {
        this.messages.push(message);
    }
    async clear() {
        this.messages = [];
    }
}
