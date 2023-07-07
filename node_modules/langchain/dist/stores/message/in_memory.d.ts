import { BaseMessage, BaseListChatMessageHistory } from "../../schema/index.js";
export declare class ChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    private messages;
    constructor(messages?: BaseMessage[]);
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    clear(): Promise<void>;
}
