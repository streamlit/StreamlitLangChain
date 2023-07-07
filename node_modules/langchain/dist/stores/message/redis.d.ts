import { RedisClientOptions, RedisClientType, RedisModules, RedisFunctions, RedisScripts } from "redis";
import { BaseMessage, BaseListChatMessageHistory } from "../../schema/index.js";
export type RedisChatMessageHistoryInput = {
    sessionId: string;
    sessionTTL?: number;
    config?: RedisClientOptions;
    client?: any;
};
export declare class RedisChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    get lc_secrets(): {
        "config.url": string;
        "config.username": string;
        "config.password": string;
    };
    client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;
    private sessionId;
    private sessionTTL?;
    constructor(fields: RedisChatMessageHistoryInput);
    ensureReadiness(): Promise<boolean>;
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    clear(): Promise<void>;
}
