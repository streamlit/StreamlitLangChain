from __future__ import annotations

from typing import Any, Optional

from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentAction, AgentFinish, LLMResult
from streamlit.delta_generator import DeltaGenerator

_TEXT_COLOR_MAPPING = {
    "blue": "blue",
    "yellow": "orange",
    "pink": "violet",
    "green": "green",
    "red": "red",
}


def _convert_newlines(text: str) -> str:
    """Convert newline characters to markdown newline sequences (space, space, newline)"""
    return text.replace("\n", "  \n")


def _colorize(text: str, color: str | None) -> str:
    if color in _TEXT_COLOR_MAPPING:
        # Syntax: `:color[text to be colored]`
        return f":{_TEXT_COLOR_MAPPING[color]}[{text}]"

    return text


class StreamlitDebugCallbackHandler(BaseCallbackHandler):
    """Callback Handler that prints to std out."""

    def __init__(self, container: DeltaGenerator) -> None:
        """Initialize callback handler."""
        self._text_element: DeltaGenerator | None = None
        self._text = ""
        self._container_stack: list[DeltaGenerator] = [container]
        self._chain_stack: list[str] = []
        self._tool_stack: list[str] = []

    @property
    def _container(self) -> DeltaGenerator:
        return self._container_stack[len(self._container_stack) - 1]

    def _push_container(self, container: DeltaGenerator) -> None:
        self._container_stack.append(container)
        self._close_text_element()

    def _push_expander(self, label: str) -> None:
        self._push_container(self._container.expander(label))

    def _pop_container(self) -> None:
        assert len(self._container_stack) > 1, "Can't pop final container!"
        self._container_stack.pop()
        self._close_text_element()

    def _print_text(self, text: str, color: str | None = None, end: str = "\n") -> None:
        if end != "\n":
            text += end

        text = _colorize(text, color)
        text = _convert_newlines(text)

        self._text += text
        if self._text_element is not None:
            self._text_element.markdown(self._text)
        else:
            self._text_element = self._container.markdown(self._text)

        if end == "\n":
            self._close_text_element()

    def _close_text_element(self) -> None:
        self._text_element = None
        self._text = ""

    def on_llm_start(
        self, serialized: dict[str, Any], prompts: list[str], **kwargs: Any
    ) -> None:
        """Print out the prompts."""
        pass

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Do nothing."""
        pass

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """Do nothing."""
        pass

    def on_llm_error(self, error: Exception | KeyboardInterrupt, **kwargs: Any) -> None:
        """Do nothing."""
        pass

    def on_chain_start(
        self, serialized: dict[str, Any], inputs: dict[str, Any], **kwargs: Any
    ) -> None:
        """Print out that we are entering a chain."""
        class_name = serialized["name"]
        self._print_text(f"\n\n**> Entering new {class_name} chain...**")
        self._chain_stack.append(class_name)

    def on_chain_end(self, outputs: dict[str, Any], **kwargs: Any) -> None:
        """Print out that we finished a chain."""
        class_name = self._chain_stack.pop()
        self._print_text(f"\n**> Finished {class_name} chain.**")

    def on_chain_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        """Do nothing."""
        pass

    def on_tool_start(
        self,
        serialized: dict[str, Any],
        input_str: str,
        **kwargs: Any,
    ) -> None:
        """Do nothing."""
        tool_name = serialized["name"]
        self._tool_stack.append(tool_name)
        self._print_text(f"**on_tool_start: {tool_name}**")

    def on_agent_action(
        self, action: AgentAction, color: Optional[str] = None, **kwargs: Any
    ) -> Any:
        """Run on agent action."""
        self._push_expander(f"**on_agent_action**: {action.tool}")
        self._print_text(action.log, color=color)
        self._pop_container()

    def on_tool_end(
        self,
        output: str,
        color: Optional[str] = None,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        """If not the final action, print out observation."""
        tool_name = self._tool_stack.pop()
        self._push_expander(f"**on_tool_end**: {tool_name}")
        if observation_prefix is not None:
            self._print_text(f"\n{observation_prefix}")
        self._print_text(output, color=color)
        if llm_prefix is not None:
            self._print_text(f"\n{llm_prefix}")
        self._pop_container()

    def on_tool_error(
        self, error: Exception | KeyboardInterrupt, **kwargs: Any
    ) -> None:
        """Do nothing."""
        pass

    def on_text(
        self,
        text: str,
        color: Optional[str] = None,
        end: str = "",
        **kwargs: Any,
    ) -> None:
        """Run when agent ends."""
        self._push_expander("on_text")
        # This text contains a lot of ANSI control characters
        self._print_text(text, color=color, end=end)
        self._pop_container()

    def on_agent_finish(
        self, finish: AgentFinish, color: Optional[str] = None, **kwargs: Any
    ) -> None:
        """Run on agent end."""
        self._print_text(finish.log, color=color)
