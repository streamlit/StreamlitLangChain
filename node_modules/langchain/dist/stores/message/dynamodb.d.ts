import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { BaseMessage, BaseListChatMessageHistory } from "../../schema/index.js";
export interface DynamoDBChatMessageHistoryFields {
    tableName: string;
    sessionId: string;
    partitionKey?: string;
    sortKey?: string;
    messageAttributeName?: string;
    config?: DynamoDBClientConfig;
}
export declare class DynamoDBChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    private tableName;
    private sessionId;
    private client;
    private partitionKey;
    private sortKey?;
    private messageAttributeName;
    private dynamoKey;
    constructor({ tableName, sessionId, partitionKey, sortKey, messageAttributeName, config, }: DynamoDBChatMessageHistoryFields);
    getMessages(): Promise<BaseMessage[]>;
    clear(): Promise<void>;
    protected addMessage(message: BaseMessage): Promise<void>;
}
