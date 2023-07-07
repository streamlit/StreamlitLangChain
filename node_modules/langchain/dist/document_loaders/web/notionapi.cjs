"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionAPILoader = void 0;
const client_1 = require("@notionhq/client");
const notion_to_md_1 = require("notion-to-md");
const notion_js_1 = require("notion-to-md/build/utils/notion.js");
const base_js_1 = require("../base.cjs");
const document_js_1 = require("../../document.cjs");
class NotionAPILoader extends base_js_1.BaseDocumentLoader {
    constructor(options) {
        super();
        Object.defineProperty(this, "notionClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "n2mClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.notionClient = new client_1.Client(options.clientOptions);
        this.n2mClient = new notion_to_md_1.NotionToMarkdown({
            notionClient: this.notionClient,
            config: { parseChildPages: false, convertImagesToBase64: false },
        });
        this.id = options.id;
        this.type = options.type;
    }
    parsePageProperties(page) {
        return Object.fromEntries(Object.entries(page.properties).map(([_, prop]) => {
            switch (prop.type) {
                case "number":
                    return [prop.type, prop[prop.type]];
                case "url":
                    return [prop.type, prop[prop.type]];
                case "select":
                    return [prop.type, prop[prop.type]?.name ?? ""];
                case "multi_select":
                    return [
                        prop.type,
                        prop[prop.type].map((select) => select.name).join(", "),
                    ];
                case "status":
                    return [prop.type, prop[prop.type]?.name ?? ""];
                case "date":
                    return [
                        prop.type,
                        `${prop[prop.type]?.start ?? ""}${prop[prop.type]?.end ? `-  ${prop[prop.type]?.end}` : ""}`,
                    ];
                case "email":
                    return [prop.type, prop[prop.type]];
                case "phone_number":
                    return [prop.type, prop[prop.type]];
                case "checkbox":
                    return [prop.type, prop[prop.type].toString()];
                // case "files":
                case "created_by":
                    return [prop.type, prop[prop.type]];
                case "created_time":
                    return [prop.type, prop[prop.type]];
                case "last_edited_by":
                    return [prop.type, prop[prop.type]];
                case "last_edited_time":
                    return [prop.type, prop[prop.type]];
                // case "formula":
                case "title":
                    return [
                        prop.type,
                        prop[prop.type].map((v) => v.plain_text).join(""),
                    ];
                case "rich_text":
                    return [
                        prop.type,
                        prop[prop.type].map((v) => v.plain_text).join(""),
                    ];
                case "people":
                    return [prop.type, prop[prop.type]];
                // case "relation":
                // case "rollup":
                default:
                    return [prop.type, "Unsupported type"];
            }
        }));
    }
    parsePageDetails(page) {
        if (!(0, client_1.isFullPage)(page))
            return;
        const metadata = Object.fromEntries(Object.entries(page).filter(([key, _]) => key !== "id"));
        return {
            ...metadata,
            notionId: page.id,
            properties: this.parsePageProperties(page),
        };
    }
    async loadPage(page) {
        // Check page is a page ID or a GetPageResponse
        const [pageData, pageId] = typeof page === "string"
            ? [this.notionClient.pages.retrieve({ page_id: page }), page]
            : [page, page.id];
        const [pageDetails, pageBlocks] = await Promise.all([
            pageData,
            (0, notion_js_1.getBlockChildren)(this.notionClient, pageId, null),
        ]);
        const [childPageDocuments, childDatabaseDocuments, mdBlocks] = await Promise.all([
            Promise.all(pageBlocks
                .filter((block) => "type" in block && block.type.includes("child_page"))
                .map((block) => this.loadPage(block.id))),
            Promise.all(pageBlocks
                .filter((block) => "type" in block && block.type.includes("child_database"))
                .map((block) => this.loadDatabase(block.id))),
            this.n2mClient.blocksToMarkdown(pageBlocks),
        ]);
        const mdStringObject = this.n2mClient.toMarkdownString(mdBlocks);
        const pageDocuments = Object.entries(mdStringObject).map(([_, pageContent]) => new document_js_1.Document({
            pageContent,
            metadata: this.parsePageDetails(pageDetails),
        }));
        return [
            ...pageDocuments,
            ...childPageDocuments.flat(),
            ...childDatabaseDocuments.flat(),
        ];
    }
    async loadDatabase(id) {
        const documents = [];
        try {
            for await (const page of (0, client_1.iteratePaginatedAPI)(this.notionClient.databases.query, {
                database_id: id,
            })) {
                if (!(0, client_1.isFullPage)(page))
                    continue;
                documents.push(...(await this.loadPage(page)));
            }
        }
        catch (e) {
            console.log(e);
            // TODO: Catch and report api request errors
        }
        return documents;
    }
    async load() {
        const documents = [];
        switch (this.type) {
            case "page":
                documents.push(...(await this.loadPage(this.id)));
                break;
            case "database":
                documents.push(...(await this.loadDatabase(this.id)));
                break;
            default:
        }
        return documents;
    }
}
exports.NotionAPILoader = NotionAPILoader;
