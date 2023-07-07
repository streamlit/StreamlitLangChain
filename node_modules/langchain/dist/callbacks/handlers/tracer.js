import { BaseCallbackHandler, } from "../base.js";
export class BaseTracer extends BaseCallbackHandler {
    constructor(_fields) {
        super(...arguments);
        Object.defineProperty(this, "runMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    copy() {
        return this;
    }
    _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
    }
    _startTrace(run) {
        if (run.parent_run_id !== undefined) {
            const parentRun = this.runMap.get(run.parent_run_id);
            if (parentRun) {
                this._addChildRun(parentRun, run);
            }
        }
        this.runMap.set(run.id, run);
    }
    async _endTrace(run) {
        const parentRun = run.parent_run_id !== undefined && this.runMap.get(run.parent_run_id);
        if (parentRun) {
            parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        }
        else {
            await this.persistRun(run);
        }
        this.runMap.delete(run.id);
    }
    _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== undefined && this.runMap.get(parentRunId);
        // If a run has no parent then execution order is 1
        if (!parentRun) {
            return 1;
        }
        return parentRun.child_execution_order + 1;
    }
    async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata
            ? { ...extraParams, metadata }
            : extraParams;
        const run = {
            id: runId,
            name: llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: start_time,
                },
            ],
            inputs: { prompts },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || [],
        };
        this._startTrace(run);
        await this.onLLMStart?.(run);
    }
    async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata
            ? { ...extraParams, metadata }
            : extraParams;
        const run = {
            id: runId,
            name: llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: start_time,
                },
            ],
            inputs: { messages },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || [],
        };
        this._startTrace(run);
        await this.onLLMStart?.(run);
    }
    async handleLLMEnd(output, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
            name: "end",
            time: run.end_time,
        });
        await this.onLLMEnd?.(run);
        await this._endTrace(run);
    }
    async handleLLMError(error, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.error = error.message;
        run.events.push({
            name: "error",
            time: run.end_time,
        });
        await this.onLLMError?.(run);
        await this._endTrace(run);
    }
    async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: chain.id[chain.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: chain,
            events: [
                {
                    name: "start",
                    time: start_time,
                },
            ],
            inputs,
            execution_order,
            child_execution_order: execution_order,
            run_type: "chain",
            child_runs: [],
            extra: metadata ? { metadata } : {},
            tags: tags || [],
        };
        this._startTrace(run);
        await this.onChainStart?.(run);
    }
    async handleChainEnd(outputs, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.outputs = outputs;
        run.events.push({
            name: "end",
            time: run.end_time,
        });
        await this.onChainEnd?.(run);
        await this._endTrace(run);
    }
    async handleChainError(error, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.error = error.message;
        run.events.push({
            name: "error",
            time: run.end_time,
        });
        await this.onChainError?.(run);
        await this._endTrace(run);
    }
    async handleToolStart(tool, input, runId, parentRunId, tags, metadata) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: tool.id[tool.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: tool,
            events: [
                {
                    name: "start",
                    time: start_time,
                },
            ],
            inputs: { input },
            execution_order,
            child_execution_order: execution_order,
            run_type: "tool",
            child_runs: [],
            extra: metadata ? { metadata } : {},
            tags: tags || [],
        };
        this._startTrace(run);
        await this.onToolStart?.(run);
    }
    async handleToolEnd(output, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "tool") {
            throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.outputs = { output };
        run.events.push({
            name: "end",
            time: run.end_time,
        });
        await this.onToolEnd?.(run);
        await this._endTrace(run);
    }
    async handleToolError(error, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "tool") {
            throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.error = error.message;
        run.events.push({
            name: "error",
            time: run.end_time,
        });
        await this.onToolError?.(run);
        await this._endTrace(run);
    }
    async handleAgentAction(action, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
            name: "agent_action",
            time: Date.now(),
            kwargs: { action },
        });
        await this.onAgentAction?.(run);
    }
    async handleAgentEnd(action, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        run.events.push({
            name: "agent_end",
            time: Date.now(),
            kwargs: { action },
        });
        await this.onAgentEnd?.(run);
    }
    async handleText(text, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        run.events.push({
            name: "text",
            time: Date.now(),
            kwargs: { text },
        });
        await this.onText?.(run);
    }
    async handleLLMNewToken(token, idx, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            return;
        }
        run.events.push({
            name: "new_token",
            time: Date.now(),
            kwargs: { token, idx },
        });
        await this.onLLMNewToken?.(run);
    }
}
