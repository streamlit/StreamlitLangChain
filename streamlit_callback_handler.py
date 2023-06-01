"""Callback Handler that prints to streamlit."""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
from streamlit.delta_generator import DeltaGenerator


def _convert_newlines(text: str) -> str:
    """Convert newline characters to markdown newline sequences (space, space, newline)"""
    return text.replace("\n", "  \n")


class LLMThoughtState(Enum):
    # The LLM is thinking about what to do next. We don't know which tool we'll run.
    THINKING = "THINKING"
    # The LLM has decided to run a tool. We don't have results from the tool yet.
    RUNNING_TOOL = "RUNNING_TOOL"
    # We have results from the tool.
    COMPLETE = "COMPLETE"


class LLMThought:
    def __init__(self, parent_container: DeltaGenerator, expanded: bool):
        self._container_cursor = parent_container.empty()
        self._state = LLMThoughtState.THINKING
        self._container = self._container_cursor.expander(
            ":thinking_face: **Thinking...**", expanded=expanded
        )
        self._llm_token_stream = ""
        self._llm_token_writer: Optional[DeltaGenerator] = None

    def _reset_llm_token_stream(self) -> None:
        self._llm_token_stream = ""
        self._llm_token_writer = None

    def on_llm_start(self, serialized: dict[str, Any], prompts: list[str]) -> None:
        self._reset_llm_token_stream()

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        # This is only called when the LLM is initialized with `streaming=True`
        self._llm_token_stream += _convert_newlines(token)

        if self._llm_token_writer is None:
            # Create a new Markdown element for our token stream at the next location
            # in our container
            self._llm_token_writer = self._container.markdown(self._llm_token_stream)
        else:
            # Update our existing Markdown element with the token stream
            self._llm_token_writer.markdown(self._llm_token_stream)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        # `response` is the concatenation of all the tokens received by the LLM.
        # If we're receiving streaming tokens from `on_llm_new_token`, this response
        # data is redundant
        self._reset_llm_token_stream()

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self._container.markdown("**LLM encountered an error...**")
        self._container.exception(error)

    def on_tool_start(
        self, serialized: dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        # Called with the name of the tool we're about to run (in `serialized[name]`),
        # and its input. We don't output this, because it's redundant: the LLM will
        # have just printed the name of the tool and its input before calling the tool.
        pass

    def on_tool_end(
        self,
        output: str,
        color: Optional[str] = None,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        self._container.markdown(f"**{output}**")

    def on_tool_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        self._container.markdown("**Tool encountered an error...**")
        self._container.exception(error)

    def on_agent_action(
        self, action: AgentAction, color: Optional[str] = None, **kwargs: Any
    ) -> Any:
        # Called when we're about to kick off a new tool. The `action` data
        # tells us the tool we're about to use, and the input we'll give it.
        # We don't output anything here, because we'll receive this same data
        # when `on_tool_start` is called immediately after.
        pass


class StreamlitCallbackHandler(BaseCallbackHandler):
    def __init__(self, container: DeltaGenerator, expand_new_thoughts: bool = True):
        """Initialize callback handler."""
        self._container = container
        self._current_thought: Optional[LLMThought] = None
        self._expand_new_thoughts = expand_new_thoughts

    def _require_current_thought(self) -> LLMThought:
        if self._current_thought is None:
            raise RuntimeError("Current LLMThought is unexpectedly None!")
        return self._current_thought

    def on_llm_start(
        self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any
    ) -> None:
        if self._current_thought is None:
            self._current_thought = LLMThought(
                self._container, self._expand_new_thoughts
            )
        self._current_thought.on_llm_start(serialized, prompts)

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self._require_current_thought().on_llm_new_token(token, **kwargs)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        self._require_current_thought().on_llm_end(response, **kwargs)

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self._require_current_thought().on_llm_error(error, **kwargs)

    def on_tool_start(
        self, serialized: dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        self._require_current_thought().on_tool_start(serialized, input_str, **kwargs)

    def on_tool_end(
        self,
        output: str,
        color: Optional[str] = None,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        self._require_current_thought().on_tool_end(
            output, color, observation_prefix, llm_prefix, **kwargs
        )
        # Each thought is comprised of a single tool action, so close our
        # current thought whenever a tool ends.
        self._current_thought = None

    def on_tool_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        self._require_current_thought().on_tool_error(error, **kwargs)

    def on_text(
        self,
        text: str,
        color: Optional[str] = None,
        end: str = "",
        **kwargs: Any,
    ) -> None:
        pass

    def on_chain_start(
        self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any
    ) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_chain_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_agent_action(
        self, action: AgentAction, color: Optional[str] = None, **kwargs: Any
    ) -> Any:
        self._require_current_thought().on_agent_action(action, color, **kwargs)

    def on_agent_finish(
        self, finish: AgentFinish, color: Optional[str] = None, **kwargs: Any
    ) -> None:
        # we already show the output so no need to do anything here
        if "output" in finish.return_values:
            self._container.markdown(finish.return_values["output"])
        else:
            self._container.write(finish.return_values)
