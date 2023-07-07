import { Document } from "../../document.js";
import { Docstore } from "../../schema/index.js";
export declare class InMemoryDocstore extends Docstore {
    _docs: Map<string, Document>;
    constructor(docs?: Map<string, Document>);
    search(search: string): Promise<Document>;
    add(texts: Record<string, Document>): Promise<void>;
}
export declare class SynchronousInMemoryDocstore {
    _docs: Map<string, Document>;
    constructor(docs?: Map<string, Document>);
    search(search: string): Document;
    add(texts: Record<string, Document>): void;
}
