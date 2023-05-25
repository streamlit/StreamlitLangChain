"""Callback Handler that prints to streamlit."""

from __future__ import annotations

from enum import Enum
from typing import Any, NamedTuple

from langchain.callbacks.base import BaseCallbackHandler


class CallbackType(Enum):
    ON_LLM_START = "on_llm_start"
    ON_LLM_NEW_TOKEN = "on_llm_new_token"
    ON_LLM_END = "on_llm_end"
    ON_LLM_ERROR = "on_llm_error"
    ON_TOOL_START = "on_tool_start"
    ON_TOOL_END = "on_tool_end"
    ON_TOOL_ERROR = "on_tool_error"
    ON_TEXT = "on_text"
    ON_CHAIN_START = "on_chain_start"
    ON_CHAIN_END = "on_chain_end"
    ON_CHAIN_ERROR = "on_chain_error"
    ON_AGENT_ACTION = "on_agent_action"
    ON_AGENT_FINISH = "on_agent_finish"


class CallbackRecord(NamedTuple):
    callback_type: CallbackType
    kwargs: dict[str, Any]


class CapturingCallbackHandler(BaseCallbackHandler):
    def __init__(self):
        self._records: list[CallbackRecord] = []

    @property
    def records(self) -> list[CallbackRecord]:
        return self._records

    def on_llm_start(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_LLM_START, kwargs))

    def on_llm_new_token(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_LLM_NEW_TOKEN, kwargs))

    def on_llm_end(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_LLM_END, kwargs))

    def on_llm_error(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_LLM_ERROR, kwargs))

    def on_tool_start(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_TOOL_START, kwargs))

    def on_tool_end(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_TOOL_END, kwargs))

    def on_tool_error(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_TOOL_ERROR, kwargs))

    def on_text(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_TEXT, kwargs))

    def on_chain_start(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_CHAIN_START, kwargs))

    def on_chain_end(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_CHAIN_END, kwargs))

    def on_chain_error(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_CHAIN_ERROR, kwargs))

    def on_agent_action(self, **kwargs: Any) -> Any:
        self._records.append(CallbackRecord(CallbackType.ON_AGENT_ACTION, kwargs))

    def on_agent_finish(self, **kwargs: Any) -> None:
        self._records.append(CallbackRecord(CallbackType.ON_AGENT_FINISH, kwargs))
