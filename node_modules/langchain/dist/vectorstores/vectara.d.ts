import { Document } from "../document.js";
import { Embeddings } from "../embeddings/base.js";
import { VectorStore } from "./base.js";
export interface VectaraLibArgs {
    customerId: number;
    corpusId: number;
    apiKey: string;
    verbose?: boolean;
}
interface VectaraCallHeader {
    headers: {
        "x-api-key": string;
        "Content-Type": string;
        "customer-id": string;
    };
}
export interface VectaraFilter {
    filter?: string;
    lambda?: number;
}
export declare class VectaraStore extends VectorStore {
    FilterType: VectaraFilter;
    private apiEndpoint;
    private apiKey;
    private corpusId;
    private customerId;
    private verbose;
    constructor(args: VectaraLibArgs);
    getJsonHeader(): Promise<VectaraCallHeader>;
    addVectors(_vectors: number[][], _documents: Document[]): Promise<void>;
    addDocuments(documents: Document[]): Promise<void>;
    similaritySearchWithScore(query: string, k?: number, filter?: VectaraFilter | undefined): Promise<[Document, number][]>;
    similaritySearch(query: string, k?: number, filter?: VectaraFilter | undefined): Promise<Document[]>;
    similaritySearchVectorWithScore(_query: number[], _k: number, _filter?: VectaraFilter | undefined): Promise<[Document, number][]>;
    static fromTexts(texts: string[], metadatas: object | object[], _embeddings: Embeddings, args: VectaraLibArgs): Promise<VectaraStore>;
    static fromDocuments(docs: Document[], _embeddings: Embeddings, args: VectaraLibArgs): Promise<VectaraStore>;
}
export {};
