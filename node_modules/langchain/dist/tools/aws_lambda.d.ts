import { DynamicTool, DynamicToolInput } from "./dynamic.js";
interface LambdaConfig {
    functionName: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
}
declare class AWSLambda extends DynamicTool {
    get lc_namespace(): string[];
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    private lambdaConfig;
    constructor({ name, description, ...rest }: LambdaConfig & Omit<DynamicToolInput, "func">);
    /** @ignore */
    _func(input: string): Promise<string>;
}
export { AWSLambda };
