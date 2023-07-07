/**
 * Consume a promise, either adding it to the queue or waiting for it to resolve
 * @param promise Promise to consume
 * @param wait Whether to wait for the promise to resolve or resolve immediately
 */
export declare function consumeCallback<T>(promiseFn: () => Promise<T> | T | void, wait: boolean): Promise<void>;
export declare function awaitAllCallbacks(): Promise<void>;
