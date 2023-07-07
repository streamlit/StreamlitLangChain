import { BaseFileStore } from "../../schema/index.js";
export declare class InMemoryFileStore extends BaseFileStore {
    lc_namespace: string[];
    private files;
    readFile(path: string): Promise<string>;
    writeFile(path: string, contents: string): Promise<void>;
}
