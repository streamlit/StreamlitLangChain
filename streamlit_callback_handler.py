"""Callback Handler that prints to streamlit."""

from __future__ import annotations

from typing import Any, Optional

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
from streamlit.delta_generator import DeltaGenerator


class StreamlitCallbackHandler(BaseCallbackHandler):
    def __init__(self, container: DeltaGenerator):
        """Initialize callback handler."""
        self._container = container
        self._llm_stream = ""

    def on_llm_start(
        self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any
    ) -> None:
        """Print out the prompts."""
        self._container.markdown(f"**on_llm_start:**: `{serialized}`")
        self._llm_writer = self._container.empty()
        self._llm_stream = ""

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        # This is never called. Is it a modal thing?
        self._container.markdown(f"**on_llm_new_token**: `{token}`")
        self._llm_stream += token
        self._llm_writer.markdown(self._llm_stream)

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

    def on_text(
        self,
        text: str,
        color: Optional[str] = None,
        end: str = "",
        **kwargs: Any,
    ) -> None:
        pass
        # self._container.write(f"**on_text**: `{text}`")

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
        self._container.markdown(f"**on_agent_action**: `{action}`")

    def on_agent_finish(
        self, finish: AgentFinish, color: Optional[str] = None, **kwargs: Any
    ) -> None:
        # we already show the output so no need to do anything here
        self._container.markdown(f"**on_agent_finish**: `{finish}`")
