"""Callback Handler that prints to streamlit."""

from __future__ import annotations

from typing import Any, Optional

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
from streamlit.delta_generator import DeltaGenerator


class LLMThought:
    def __init__(
        self,
        parent_container: DeltaGenerator,
        serialized: dict[str, Any],
        prompts: list[str],
        **kwargs: Any,
    ):
        self._container = parent_container.expander(
            f"Thought: {serialized}...", expanded=True
        )
        self._llm_token_stream = ""
        self._llm_token_writer: Optional[DeltaGenerator] = None

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        # This is only called when the LLM is initialized with `streaming=True`
        self._llm_token_stream += token

        if self._llm_token_writer is None:
            # Create a new Markdown element for our token stream at the next location
            # in our container
            self._llm_token_writer = self._container.markdown(self._llm_token_stream)
        else:
            # Update our existing Markdown element with the token stream
            self._llm_token_writer.markdown(self._llm_token_stream)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        self._container.markdown(f"**on_llm_end**:\n{response.generations[0][0].text}")
        # self._llm_writer.markdown(response.generations[0][0].text)

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self._container.write("**LLM encountered an error...**")
        self._container.exception(error)

    def on_tool_start(
        self, serialized: dict[str, Any], input_str: str, **kwargs: Any
    ) -> None:
        self._container.markdown(f"**on_tool_start `{serialized['name']}`**")
        self._container.markdown(f"**Input:** `{input_str}`")

    def on_tool_end(
        self,
        output: str,
        color: Optional[str] = None,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        self._container.markdown(f"**on_tool_end**\n`{output}`")

    def on_tool_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        self._container.write("**Tool encountered an error...**")
        self._container.exception(error)

    def on_agent_action(
        self, action: AgentAction, color: Optional[str] = None, **kwargs: Any
    ) -> Any:
        self._container.markdown(f"**on_agent_action**: `{action}`")


class StreamlitCallbackHandler(BaseCallbackHandler):
    def __init__(self, container: DeltaGenerator):
        """Initialize callback handler."""
        self._container = container
        self._current_thought: Optional[LLMThought] = None

    def _require_current_thought(self) -> LLMThought:
        if self._current_thought is None:
            raise RuntimeError("Current LLMThought is unexpectedly None!")
        return self._current_thought

    def on_llm_start(
        self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any
    ) -> None:
        # Create a new LLMThought every time an LLM starts
        self._current_thought = LLMThought(
            self._container, serialized, prompts, **kwargs
        )

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
