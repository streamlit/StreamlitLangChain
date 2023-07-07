import { Table } from "vectordb";
import { VectorStore } from "./base.js";
import { Embeddings } from "../embeddings/base.js";
import { Document } from "../document.js";
export type LanceDBArgs = {
    table: Table;
    textKey?: string;
};
export declare class LanceDB extends VectorStore {
    private table;
    private textKey;
    constructor(embeddings: Embeddings, args: LanceDBArgs);
    addDocuments(documents: Document[]): Promise<void>;
    addVectors(vectors: number[][], documents: Document[]): Promise<void>;
    similaritySearchVectorWithScore(query: number[], k: number): Promise<[Document, number][]>;
    static fromTexts(texts: string[], metadatas: object[] | object, embeddings: Embeddings, dbConfig: LanceDBArgs): Promise<LanceDB>;
    static fromDocuments(docs: Document[], embeddings: Embeddings, dbConfig: LanceDBArgs): Promise<LanceDB>;
}
