"""Callback Handler that prints to streamlit."""

from __future__ import annotations

from typing import Any, Optional

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
import streamlit as st


# TODO: TO BE FIXED, agent thoughts gone missing after state changed, need to look into _llm_stream initialization
class StreamlitCallBackHandler(BaseCallbackHandler):
    """Callback Handler that prints to std out."""

    def __init__(self, retry_attempt) -> None:
        """Initialize callback handler."""
        self.last_action = None
        self.retry = retry_attempt
        self.container = st.session_state.thoughts_space

    def show_agent_thought(self, thought: str):
        if not st.session_state.show_agent_thoughts:
            return
        self.container.markdown(thought)

    def on_llm_start(self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any) -> None:
        """Print out the prompts."""
        self.container.markdown("**Agent Next Step:**")
        self._llm_writer = self.container.empty()
        self._llm_stream = ""

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self._llm_stream += token
        self._llm_writer.markdown(self._llm_stream)

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        self._llm_writer.markdown(response.generations[0][0].text)

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self.container.write("**LLM encountered an error...**")
        self.container.exception(error)

    def on_tool_start(self, serialized: dict[str, Any], input_str: str, **kwargs: Any) -> None:
        self.container.markdown(f"**Executing tool `{serialized['name']}`**")
        self.container.markdown(f"**Input:** `{input_str}`")

    def on_tool_end(
            self, output: str,
            color: Optional[str] = None,
            observation_prefix: Optional[str] = None,
            llm_prefix: Optional[str] = None,
            **kwargs: Any,
    ) -> None:
        self.container.markdown(f"**Output:**\n\n{output}")

    def on_tool_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        self.container.write("**Tool encountered an error...**")
        self.container.exception(error)

    def on_text(
            self,
            text: str,
            color: Optional[str] = None,
            end: str = "",
            **kwargs: Any,
    ) -> None:
        # Honestly not sure what this does but it creates lots of extra output
        pass

    def on_chain_start(self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_chain_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        # chain is redundant with tool + LLM
        pass

    def on_agent_action(self, action: AgentAction, color: Optional[str] = None, **kwargs: Any) -> Any:
        """Run on agent action."""
        self.last_action = action

    def on_agent_finish(self, finish: AgentFinish, color: Optional[str] = None, **kwargs: Any) -> None:
        # we already show the output so no need to do anything here
        pass
