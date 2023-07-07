import type { Pool, PoolOptions } from "mysql2/promise";
import { VectorStore } from "./base.js";
import { Embeddings } from "../embeddings/base.js";
import { Document } from "../document.js";
export type Metadata = Record<string, any>;
export type DistanceMetrics = "DOT_PRODUCT" | "EUCLIDEAN_DISTANCE";
export interface ConnectionOptions extends PoolOptions {
}
type ConnectionWithUri = {
    connectionOptions?: never;
    connectionURI: string;
};
type ConnectionWithOptions = {
    connectionURI?: never;
    connectionOptions: ConnectionOptions;
};
type ConnectionConfig = ConnectionWithUri | ConnectionWithOptions;
export type SingleStoreVectorStoreConfig = ConnectionConfig & {
    tableName?: string;
    contentColumnName?: string;
    vectorColumnName?: string;
    metadataColumnName?: string;
    distanceMetric?: DistanceMetrics;
};
export declare class SingleStoreVectorStore extends VectorStore {
    connectionPool: Pool;
    tableName: string;
    contentColumnName: string;
    vectorColumnName: string;
    metadataColumnName: string;
    distanceMetric: DistanceMetrics;
    constructor(embeddings: Embeddings, config: SingleStoreVectorStoreConfig);
    createTableIfNotExists(): Promise<void>;
    end(): Promise<void>;
    addDocuments(documents: Document[]): Promise<void>;
    addVectors(vectors: number[][], documents: Document[]): Promise<void>;
    similaritySearchVectorWithScore(query: number[], k: number, filter?: Metadata): Promise<[Document, number][]>;
    static fromTexts(texts: string[], metadatas: object[], embeddings: Embeddings, dbConfig: SingleStoreVectorStoreConfig): Promise<SingleStoreVectorStore>;
    static fromDocuments(docs: Document[], embeddings: Embeddings, dbConfig: SingleStoreVectorStoreConfig): Promise<SingleStoreVectorStore>;
}
export {};
