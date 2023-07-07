import { Tool, ToolParams } from "./base.js";
export interface SfnConfig {
    stateMachineArn: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
}
export declare class StartExecutionAWSSfnTool extends Tool {
    private sfnConfig;
    name: string;
    description: string;
    constructor({ name, description, ...rest }: SfnConfig & {
        name: string;
        description: string;
    });
    static formatDescription(name: string, description: string): string;
    /** @ignore */
    _call(input: string): Promise<string>;
}
export declare class DescribeExecutionAWSSfnTool extends Tool {
    name: string;
    description: string;
    sfnConfig: Omit<SfnConfig, "stateMachineArn">;
    constructor(config: Omit<SfnConfig, "stateMachineArn"> & ToolParams);
    /** @ignore */
    _call(input: string): Promise<string>;
}
export declare class SendTaskSuccessAWSSfnTool extends Tool {
    name: string;
    description: string;
    sfnConfig: Omit<SfnConfig, "stateMachineArn">;
    constructor(config: Omit<SfnConfig, "stateMachineArn"> & ToolParams);
    /** @ignore */
    _call(input: string): Promise<string>;
}
