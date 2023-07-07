import { BaseFileStore } from "../../schema/index.js";
export declare class NodeFileStore extends BaseFileStore {
    basePath: string;
    lc_namespace: string[];
    constructor(basePath?: string);
    readFile(path: string): Promise<string>;
    writeFile(path: string, contents: string): Promise<void>;
}
