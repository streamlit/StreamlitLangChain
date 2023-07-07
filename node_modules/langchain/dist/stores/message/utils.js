import { AIMessage, ChatMessage, HumanMessage, SystemMessage, } from "../../schema/index.js";
export function mapV1MessageToStoredMessage(message) {
    // TODO: Remove this mapper when we deprecate the old message format.
    if (message.data !== undefined) {
        return message;
    }
    else {
        const v1Message = message;
        return {
            type: v1Message.type,
            data: {
                content: v1Message.text,
                role: v1Message.role,
                name: undefined,
            },
        };
    }
}
export function mapStoredMessagesToChatMessages(messages) {
    return messages.map((message) => {
        const storedMessage = mapV1MessageToStoredMessage(message);
        switch (storedMessage.type) {
            case "human":
                return new HumanMessage(storedMessage.data);
            case "ai":
                return new AIMessage(storedMessage.data);
            case "system":
                return new SystemMessage(storedMessage.data);
            case "chat": {
                if (storedMessage.data.role === undefined) {
                    throw new Error("Role must be defined for chat messages");
                }
                return new ChatMessage(storedMessage.data);
            }
            default:
                throw new Error(`Got unexpected type: ${storedMessage.type}`);
        }
    });
}
export function mapChatMessagesToStoredMessages(messages) {
    return messages.map((message) => message.toDict());
}
