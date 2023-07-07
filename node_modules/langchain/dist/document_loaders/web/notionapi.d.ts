import { Client } from "@notionhq/client";
import { BaseDocumentLoader } from "../base.js";
import { Document } from "../../document.js";
export type NotionAPIType = "database" | "page";
export type NotionAPILoaderOptions = {
    clientOptions: ConstructorParameters<typeof Client>[0];
    id: string;
    type: NotionAPIType;
};
export declare class NotionAPILoader extends BaseDocumentLoader {
    private notionClient;
    private n2mClient;
    private id;
    private type;
    constructor(options: NotionAPILoaderOptions);
    private parsePageProperties;
    private parsePageDetails;
    private loadPage;
    private loadDatabase;
    load(): Promise<Document[]>;
}
