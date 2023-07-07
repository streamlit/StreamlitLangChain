"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisChatMessageHistory = void 0;
const redis_1 = require("redis");
const index_js_1 = require("../../schema/index.cjs");
const utils_js_1 = require("./utils.cjs");
class RedisChatMessageHistory extends index_js_1.BaseListChatMessageHistory {
    get lc_secrets() {
        return {
            "config.url": "REDIS_URL",
            "config.username": "REDIS_USERNAME",
            "config.password": "REDIS_PASSWORD",
        };
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "redis"]
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionTTL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { sessionId, sessionTTL, config, client } = fields;
        this.client = (client ?? (0, redis_1.createClient)(config ?? {}));
        this.sessionId = sessionId;
        this.sessionTTL = sessionTTL;
    }
    async ensureReadiness() {
        if (!this.client.isReady) {
            await this.client.connect();
        }
        return true;
    }
    async getMessages() {
        await this.ensureReadiness();
        const rawStoredMessages = await this.client.lRange(this.sessionId, 0, -1);
        const orderedMessages = rawStoredMessages
            .reverse()
            .map((message) => JSON.parse(message));
        return (0, utils_js_1.mapStoredMessagesToChatMessages)(orderedMessages);
    }
    async addMessage(message) {
        await this.ensureReadiness();
        const messageToAdd = (0, utils_js_1.mapChatMessagesToStoredMessages)([message]);
        await this.client.lPush(this.sessionId, JSON.stringify(messageToAdd[0]));
        if (this.sessionTTL) {
            await this.client.expire(this.sessionId, this.sessionTTL);
        }
    }
    async clear() {
        await this.ensureReadiness();
        await this.client.del(this.sessionId);
    }
}
exports.RedisChatMessageHistory = RedisChatMessageHistory;
