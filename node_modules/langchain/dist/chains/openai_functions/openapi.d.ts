import type { OpenAPIV3_1 } from "openapi-types";
import { BaseChain } from "../base.js";
import { LLMChainInput } from "../llm_chain.js";
import { ChatOpenAI } from "../../chat_models/openai.js";
import { BasePromptTemplate } from "../../prompts/base.js";
import { SequentialChain } from "../sequential_chain.js";
export type OpenAPIChainOptions = {
    llm?: ChatOpenAI;
    prompt?: BasePromptTemplate;
    requestChain?: BaseChain;
    llmChainInputs?: LLMChainInput;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    verbose?: boolean;
};
/**
 * Create a chain for querying an API from a OpenAPI spec.
 * @param spec OpenAPISpec or url/file/text string corresponding to one.
 * @param options Custom options passed into the chain
 * @returns OpenAPIChain
 */
export declare function createOpenAPIChain(spec: OpenAPIV3_1.Document | string, options?: OpenAPIChainOptions): Promise<SequentialChain>;
