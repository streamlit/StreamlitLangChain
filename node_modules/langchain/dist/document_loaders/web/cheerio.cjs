"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheerioWebBaseLoader = void 0;
const document_js_1 = require("../../document.cjs");
const base_js_1 = require("../base.cjs");
const async_caller_js_1 = require("../../util/async_caller.cjs");
class CheerioWebBaseLoader extends base_js_1.BaseDocumentLoader {
    constructor(webPath, fields) {
        super();
        Object.defineProperty(this, "webPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: webPath
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "caller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "selector", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textDecoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { timeout, selector, textDecoder, ...rest } = fields ?? {};
        this.timeout = timeout ?? 10000;
        this.caller = new async_caller_js_1.AsyncCaller(rest);
        this.selector = selector ?? "body";
        this.textDecoder = textDecoder;
    }
    static async _scrape(url, caller, timeout, textDecoder) {
        const { load } = await CheerioWebBaseLoader.imports();
        const response = await caller.call(fetch, url, {
            signal: timeout ? AbortSignal.timeout(timeout) : undefined,
        });
        const html = textDecoder?.decode(await response.arrayBuffer()) ??
            (await response.text());
        return load(html);
    }
    async scrape() {
        return CheerioWebBaseLoader._scrape(this.webPath, this.caller, this.timeout, this.textDecoder);
    }
    async load() {
        const $ = await this.scrape();
        const text = $(this.selector).text();
        const metadata = { source: this.webPath };
        return [new document_js_1.Document({ pageContent: text, metadata })];
    }
    static async imports() {
        try {
            const { load } = await import("cheerio");
            return { load };
        }
        catch (e) {
            console.error(e);
            throw new Error("Please install cheerio as a dependency with, e.g. `yarn add cheerio`");
        }
    }
}
exports.CheerioWebBaseLoader = CheerioWebBaseLoader;
