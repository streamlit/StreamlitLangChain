/// <reference types="node" resolution-mode="require"/>
import * as fsDefault from "node:fs";
import { S3ClientConfig } from "@aws-sdk/client-s3";
import { BaseDocumentLoader } from "../base.js";
import { UnstructuredLoader as UnstructuredLoaderDefault } from "../fs/unstructured.js";
export type S3Config = S3ClientConfig & {
    /** @deprecated Use the credentials object instead */
    accessKeyId?: string;
    /** @deprecated Use the credentials object instead */
    secretAccessKey?: string;
};
export interface S3LoaderParams {
    bucket: string;
    key: string;
    unstructuredAPIURL: string;
    unstructuredAPIKey: string;
    s3Config?: S3Config & {
        /** @deprecated Use the credentials object instead */
        accessKeyId?: string;
        /** @deprecated Use the credentials object instead */
        secretAccessKey?: string;
    };
    fs?: typeof fsDefault;
    UnstructuredLoader?: typeof UnstructuredLoaderDefault;
}
export declare class S3Loader extends BaseDocumentLoader {
    private bucket;
    private key;
    private unstructuredAPIURL;
    private unstructuredAPIKey;
    private s3Config;
    private _fs;
    private _UnstructuredLoader;
    constructor({ bucket, key, unstructuredAPIURL, unstructuredAPIKey, s3Config, fs, UnstructuredLoader, }: S3LoaderParams);
    load(): Promise<import("../../document.js").Document<Record<string, any>>[]>;
}
