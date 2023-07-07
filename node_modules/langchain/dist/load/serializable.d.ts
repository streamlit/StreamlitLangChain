import { SerializedFields } from "./map_keys.js";
export interface BaseSerialized<T extends string> {
    lc: number;
    type: T;
    id: string[];
}
export interface SerializedConstructor extends BaseSerialized<"constructor"> {
    kwargs: SerializedFields;
}
export interface SerializedSecret extends BaseSerialized<"secret"> {
}
export interface SerializedNotImplemented extends BaseSerialized<"not_implemented"> {
}
export type Serialized = SerializedConstructor | SerializedSecret | SerializedNotImplemented;
export declare abstract class Serializable {
    lc_serializable: boolean;
    lc_kwargs: SerializedFields;
    /**
     * A path to the module that contains the class, eg. ["langchain", "llms"]
     * Usually should be the same as the entrypoint the class is exported from.
     */
    abstract lc_namespace: string[];
    /**
     * A map of secrets, which will be omitted from serialization.
     * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
     * Values are the secret ids, which will be used when deserializing.
     */
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    /**
     * A map of additional attributes to merge with constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the attribute values, which will be serialized.
     * These attributes need to be accepted by the constructor as arguments.
     */
    get lc_attributes(): SerializedFields | undefined;
    /**
     * A map of aliases for constructor args.
     * Keys are the attribute names, e.g. "foo".
     * Values are the alias that will replace the key in serialization.
     * This is used to eg. make argument names match Python.
     */
    get lc_aliases(): {
        [key: string]: string;
    } | undefined;
    constructor(kwargs?: SerializedFields, ..._args: never[]);
    toJSON(): Serialized;
    toJSONNotImplemented(): SerializedNotImplemented;
}
