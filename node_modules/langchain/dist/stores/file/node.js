import * as fs from "node:fs/promises";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { BaseFileStore } from "../../schema/index.js";
export class NodeFileStore extends BaseFileStore {
    constructor(basePath = mkdtempSync("langchain-")) {
        super();
        Object.defineProperty(this, "basePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: basePath
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "file", "node"]
        });
    }
    async readFile(path) {
        return await fs.readFile(join(this.basePath, path), "utf8");
    }
    async writeFile(path, contents) {
        await fs.writeFile(join(this.basePath, path), contents, "utf8");
    }
}
