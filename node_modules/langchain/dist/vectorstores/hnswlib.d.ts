import type { HierarchicalNSW as HierarchicalNSWT, SpaceName } from "hnswlib-node";
import { Embeddings } from "../embeddings/base.js";
import { SaveableVectorStore } from "./base.js";
import { Document } from "../document.js";
import { SynchronousInMemoryDocstore } from "../stores/doc/in_memory.js";
export interface HNSWLibBase {
    space: SpaceName;
    numDimensions?: number;
}
export interface HNSWLibArgs extends HNSWLibBase {
    docstore?: SynchronousInMemoryDocstore;
    index?: HierarchicalNSWT;
}
export declare class HNSWLib extends SaveableVectorStore {
    FilterType: (doc: Document) => boolean;
    _index?: HierarchicalNSWT;
    docstore: SynchronousInMemoryDocstore;
    args: HNSWLibBase;
    constructor(embeddings: Embeddings, args: HNSWLibArgs);
    addDocuments(documents: Document[]): Promise<void>;
    private static getHierarchicalNSW;
    private initIndex;
    get index(): HierarchicalNSWT;
    private set index(value);
    addVectors(vectors: number[][], documents: Document[]): Promise<void>;
    similaritySearchVectorWithScore(query: number[], k: number, filter?: this["FilterType"]): Promise<[Document<Record<string, any>>, number][]>;
    save(directory: string): Promise<void>;
    static load(directory: string, embeddings: Embeddings): Promise<HNSWLib>;
    static fromTexts(texts: string[], metadatas: object[] | object, embeddings: Embeddings, dbConfig?: {
        docstore?: SynchronousInMemoryDocstore;
    }): Promise<HNSWLib>;
    static fromDocuments(docs: Document[], embeddings: Embeddings, dbConfig?: {
        docstore?: SynchronousInMemoryDocstore;
    }): Promise<HNSWLib>;
    static imports(): Promise<{
        HierarchicalNSW: typeof HierarchicalNSWT;
    }>;
}
