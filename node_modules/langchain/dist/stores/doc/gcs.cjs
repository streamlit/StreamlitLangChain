"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCloudStorageDocstore = void 0;
const storage_1 = require("@google-cloud/storage");
const document_js_1 = require("../../document.cjs");
const index_js_1 = require("../../schema/index.cjs");
class GoogleCloudStorageDocstore extends index_js_1.Docstore {
    constructor(config) {
        super();
        Object.defineProperty(this, "bucket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "prefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "storage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.bucket = config.bucket;
        this.prefix = config.prefix ?? this.prefix;
        this.storage = new storage_1.Storage();
    }
    async search(search) {
        const file = this.getFile(search);
        const [fileMetadata] = await file.getMetadata();
        const metadata = fileMetadata?.metadata;
        const [dataBuffer] = await file.download();
        const pageContent = dataBuffer.toString();
        const ret = new document_js_1.Document({
            pageContent,
            metadata,
        });
        return ret;
    }
    async add(texts) {
        await Promise.all(Object.keys(texts).map((key) => this.addDocument(key, texts[key])));
    }
    async addDocument(name, document) {
        const file = this.getFile(name);
        await file.save(document.pageContent);
        await file.setMetadata({ metadata: document.metadata });
    }
    getFile(name) {
        const filename = this.prefix + name;
        const file = this.storage.bucket(this.bucket).file(filename);
        return file;
    }
}
exports.GoogleCloudStorageDocstore = GoogleCloudStorageDocstore;
