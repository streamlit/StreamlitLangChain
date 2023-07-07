import { z } from "zod";
import { BaseOutputParser, FormatInstructionsOptions } from "../schema/output_parser.js";
export type JsonMarkdownStructuredOutputParserInput = {
    interpolationDepth?: number;
};
export interface JsonMarkdownFormatInstructionsOptions extends FormatInstructionsOptions {
    interpolationDepth?: number;
}
export declare class StructuredOutputParser<T extends z.ZodTypeAny> extends BaseOutputParser<z.infer<T>> {
    schema: T;
    lc_namespace: string[];
    toJSON(): import("../load/serializable.js").SerializedNotImplemented;
    constructor(schema: T);
    static fromZodSchema<T extends z.ZodTypeAny>(schema: T): StructuredOutputParser<T>;
    static fromNamesAndDescriptions<S extends {
        [key: string]: string;
    }>(schemas: S): StructuredOutputParser<z.ZodObject<{
        [k: string]: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        [x: string]: string;
    }, {
        [x: string]: string;
    }>>;
    getFormatInstructions(): string;
    parse(text: string): Promise<z.infer<T>>;
}
export declare class JsonMarkdownStructuredOutputParser<T extends z.ZodTypeAny> extends StructuredOutputParser<T> {
    getFormatInstructions(options?: JsonMarkdownFormatInstructionsOptions): string;
    private _schemaToInstruction;
    static fromZodSchema<T extends z.ZodTypeAny>(schema: T): JsonMarkdownStructuredOutputParser<T>;
    static fromNamesAndDescriptions<S extends {
        [key: string]: string;
    }>(schemas: S): JsonMarkdownStructuredOutputParser<z.ZodObject<{
        [k: string]: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        [x: string]: string;
    }, {
        [x: string]: string;
    }>>;
}
export interface AsymmetricStructuredOutputParserFields<T extends z.ZodTypeAny> {
    inputSchema: T;
}
export declare abstract class AsymmetricStructuredOutputParser<T extends z.ZodTypeAny, Y = unknown> extends BaseOutputParser<Y> {
    private structuredInputParser;
    constructor({ inputSchema }: AsymmetricStructuredOutputParserFields<T>);
    abstract outputProcessor(input: z.infer<T>): Promise<Y>;
    parse(text: string): Promise<Y>;
    getFormatInstructions(): string;
}
