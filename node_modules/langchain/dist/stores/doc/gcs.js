import { Storage } from "@google-cloud/storage";
import { Document } from "../../document.js";
import { Docstore } from "../../schema/index.js";
export class GoogleCloudStorageDocstore extends Docstore {
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
        this.storage = new Storage();
    }
    async search(search) {
        const file = this.getFile(search);
        const [fileMetadata] = await file.getMetadata();
        const metadata = fileMetadata?.metadata;
        const [dataBuffer] = await file.download();
        const pageContent = dataBuffer.toString();
        const ret = new Document({
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
