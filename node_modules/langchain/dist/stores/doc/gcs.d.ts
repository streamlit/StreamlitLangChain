import { Storage } from "@google-cloud/storage";
import { Document } from "../../document.js";
import { Docstore } from "../../schema/index.js";
export interface GoogleCloudStorageDocstoreConfiguration {
    /** The identifier for the GCS bucket */
    bucket: string;
    /**
     * An optional prefix to prepend to each object name.
     * Often used to create a pseudo-hierarchy.
     */
    prefix?: string;
}
export declare class GoogleCloudStorageDocstore extends Docstore {
    bucket: string;
    prefix: string;
    storage: Storage;
    constructor(config: GoogleCloudStorageDocstoreConfiguration);
    search(search: string): Promise<Document>;
    add(texts: Record<string, Document>): Promise<void>;
    addDocument(name: string, document: Document): Promise<void>;
    private getFile;
}
