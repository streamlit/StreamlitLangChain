import { Tool, ToolParams } from "./base.js";
import { Serializable } from "../load/serializable.js";
export type Json = string | number | boolean | null | {
    [key: string]: Json;
} | Json[];
export type JsonObject = {
    [key: string]: Json;
};
export declare class JsonSpec extends Serializable {
    lc_namespace: string[];
    obj: JsonObject;
    maxValueLength: number;
    constructor(obj: JsonObject, max_value_length?: number);
    getKeys(input: string): string;
    getValue(input: string): string;
}
export interface JsonToolFields extends ToolParams {
    jsonSpec: JsonSpec;
}
export declare class JsonListKeysTool extends Tool {
    name: string;
    jsonSpec: JsonSpec;
    constructor(jsonSpec: JsonSpec);
    constructor(fields: JsonToolFields);
    /** @ignore */
    _call(input: string): Promise<string>;
    description: string;
}
export declare class JsonGetValueTool extends Tool {
    jsonSpec: JsonSpec;
    name: string;
    constructor(jsonSpec: JsonSpec);
    /** @ignore */
    _call(input: string): Promise<string>;
    description: string;
}
