import { zodToJsonSchema } from "zod-to-json-schema";
export function formatToOpenAIFunction(tool) {
    return {
        name: tool.name,
        description: tool.description,
        parameters: zodToJsonSchema(tool.schema),
    };
}
