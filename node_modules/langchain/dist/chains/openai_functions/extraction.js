import { zodToJsonSchema } from "zod-to-json-schema";
import { PromptTemplate } from "../../prompts/prompt.js";
import { JsonKeyOutputFunctionsParser, } from "../../output_parsers/openai_functions.js";
import { LLMChain } from "../llm_chain.js";
function getExtractionFunctions(schema) {
    return [
        {
            name: "information_extraction",
            description: "Extracts the relevant information from the passage.",
            parameters: {
                type: "object",
                properties: {
                    info: {
                        type: "array",
                        items: {
                            type: schema.type,
                            properties: schema.properties,
                            required: schema.required,
                        },
                    },
                },
                required: ["info"],
            },
        },
    ];
}
const _EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following passage together with their properties.

Passage:
{input}
`;
export function createExtractionChain(schema, llm) {
    const functions = getExtractionFunctions(schema);
    const prompt = PromptTemplate.fromTemplate(_EXTRACTION_TEMPLATE);
    const outputParser = new JsonKeyOutputFunctionsParser({ attrName: "info" });
    return new LLMChain({
        llm,
        prompt,
        llmKwargs: { functions },
        outputParser,
        tags: ["openai_functions", "extraction"],
    });
}
export function createExtractionChainFromZod(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
schema, llm) {
    return createExtractionChain(zodToJsonSchema(schema), llm);
}
