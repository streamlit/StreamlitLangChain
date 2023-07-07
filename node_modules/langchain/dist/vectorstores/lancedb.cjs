"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanceDB = void 0;
const base_js_1 = require("./base.cjs");
const document_js_1 = require("../document.cjs");
class LanceDB extends base_js_1.VectorStore {
    constructor(embeddings, args) {
        super(embeddings, args);
        Object.defineProperty(this, "table", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.table = args.table;
        this.embeddings = embeddings;
        this.textKey = args.textKey || "text";
    }
    async addDocuments(documents) {
        const texts = documents.map(({ pageContent }) => pageContent);
        return this.addVectors(await this.embeddings.embedDocuments(texts), documents);
    }
    async addVectors(vectors, documents) {
        if (vectors.length === 0) {
            return;
        }
        if (vectors.length !== documents.length) {
            throw new Error(`Vectors and documents must have the same length`);
        }
        const data = [];
        for (let i = 0; i < documents.length; i += 1) {
            const record = {
                vector: vectors[i],
                [this.textKey]: documents[i].pageContent,
            };
            Object.keys(documents[i].metadata).forEach((metaKey) => {
                record[metaKey] = documents[i].metadata[metaKey];
            });
            data.push(record);
        }
        await this.table.add(data);
    }
    async similaritySearchVectorWithScore(query, k) {
        const results = await this.table.search(query).limit(k).execute();
        const docsAndScore = [];
        results.forEach((item) => {
            const metadata = {};
            Object.keys(item).forEach((key) => {
                if (key !== "vector" && key !== "score" && key !== this.textKey) {
                    metadata[key] = item[key];
                }
            });
            docsAndScore.push([
                new document_js_1.Document({
                    pageContent: item[this.textKey],
                    metadata,
                }),
                item.score,
            ]);
        });
        return docsAndScore;
    }
    static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new document_js_1.Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return LanceDB.fromDocuments(docs, embeddings, dbConfig);
    }
    static async fromDocuments(docs, embeddings, dbConfig) {
        const instance = new this(embeddings, dbConfig);
        await instance.addDocuments(docs);
        return instance;
    }
}
exports.LanceDB = LanceDB;
