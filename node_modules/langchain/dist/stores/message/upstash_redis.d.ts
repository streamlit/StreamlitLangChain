import { Redis, type RedisConfigNodejs } from "@upstash/redis";
import { BaseMessage, BaseListChatMessageHistory } from "../../schema/index.js";
export type UpstashRedisChatMessageHistoryInput = {
    sessionId: string;
    sessionTTL?: number;
    config?: RedisConfigNodejs;
    client?: Redis;
};
export declare class UpstashRedisChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    get lc_secrets(): {
        "config.url": string;
        "config.token": string;
    };
    client: Redis;
    private sessionId;
    private sessionTTL?;
    constructor(fields: UpstashRedisChatMessageHistoryInput);
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    clear(): Promise<void>;
}
