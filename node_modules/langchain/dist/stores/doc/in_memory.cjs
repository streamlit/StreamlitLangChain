"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronousInMemoryDocstore = exports.InMemoryDocstore = void 0;
const index_js_1 = require("../../schema/index.cjs");
class InMemoryDocstore extends index_js_1.Docstore {
    constructor(docs) {
        super();
        Object.defineProperty(this, "_docs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._docs = docs ?? new Map();
    }
    async search(search) {
        const result = this._docs.get(search);
        if (!result) {
            throw new Error(`ID ${search} not found.`);
        }
        else {
            return result;
        }
    }
    async add(texts) {
        const keys = [...this._docs.keys()];
        const overlapping = Object.keys(texts).filter((x) => keys.includes(x));
        if (overlapping.length > 0) {
            throw new Error(`Tried to add ids that already exist: ${overlapping}`);
        }
        for (const [key, value] of Object.entries(texts)) {
            this._docs.set(key, value);
        }
    }
}
exports.InMemoryDocstore = InMemoryDocstore;
class SynchronousInMemoryDocstore {
    constructor(docs) {
        Object.defineProperty(this, "_docs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this._docs = docs ?? new Map();
    }
    search(search) {
        const result = this._docs.get(search);
        if (!result) {
            throw new Error(`ID ${search} not found.`);
        }
        else {
            return result;
        }
    }
    add(texts) {
        const keys = [...this._docs.keys()];
        const overlapping = Object.keys(texts).filter((x) => keys.includes(x));
        if (overlapping.length > 0) {
            throw new Error(`Tried to add ids that already exist: ${overlapping}`);
        }
        for (const [key, value] of Object.entries(texts)) {
            this._docs.set(key, value);
        }
    }
}
exports.SynchronousInMemoryDocstore = SynchronousInMemoryDocstore;
