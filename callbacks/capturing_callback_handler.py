"""Callback Handler captures all callbacks in a session for future offline playback."""

from __future__ import annotations

import pickle
import time
from typing import Any, TypedDict

from langchain.callbacks.base import BaseCallbackHandler


# This is intentionally not an enum so that we avoid serializing a
# custom class with pickle.
class CallbackType:
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


# We use TypedDict, rather than NamedTuple, so that we avoid serializing a
# custom class with pickle. All of this class's members should be basic Python types.
class CallbackRecord(TypedDict):
    callback_type: str
    args: tuple[Any, ...]
    kwargs: dict[str, Any]
    time_delta: float  # Number of seconds between this record and the previous one


def load_records_from_file(path: str) -> list[CallbackRecord]:
    """Load the list of CallbackRecords from a pickle file at the given path."""
    with open(path, "rb") as file:
        records = pickle.load(file)

    if not isinstance(records, list):
        raise RuntimeError(f"Bad CallbackRecord data in {path}")
    return records


def playback_callbacks(
    handlers: list[BaseCallbackHandler],
    records_or_filename: list[CallbackRecord] | str,
    max_pause_time: float,
) -> None:
    if isinstance(records_or_filename, list):
        records = records_or_filename
    else:
        records = load_records_from_file(records_or_filename)

    for record in records:
        pause_time = min(record["time_delta"], max_pause_time)
        if pause_time > 0:
            time.sleep(pause_time)

        for handler in handlers:
            if record["callback_type"] == CallbackType.ON_LLM_START:
                handler.on_llm_start(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_LLM_NEW_TOKEN:
                handler.on_llm_new_token(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_LLM_END:
                handler.on_llm_end(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_LLM_ERROR:
                handler.on_llm_error(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_TOOL_START:
                handler.on_tool_start(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_TOOL_END:
                handler.on_tool_end(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_TOOL_ERROR:
                handler.on_tool_error(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_TEXT:
                handler.on_text(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_CHAIN_START:
                handler.on_chain_start(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_CHAIN_END:
                handler.on_chain_end(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_CHAIN_ERROR:
                handler.on_chain_error(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_AGENT_ACTION:
                handler.on_agent_action(*record["args"], **record["kwargs"])
            elif record["callback_type"] == CallbackType.ON_AGENT_FINISH:
                handler.on_agent_finish(*record["args"], **record["kwargs"])


class CapturingCallbackHandler(BaseCallbackHandler):
    def __init__(self) -> None:
        self._records: list[CallbackRecord] = []
        self._last_time: float | None = None

    def dump_records_to_file(self, path: str) -> None:
        """Write the list of CallbackRecords to a pickle file at the given path."""
        with open(path, "wb") as file:
            pickle.dump(self._records, file)

    def _append_record(
        self, type: str, args: tuple[Any, ...], kwargs: dict[str, Any]
    ) -> None:
        time_now = time.time()
        time_delta = time_now - self._last_time if self._last_time is not None else 0
        self._last_time = time_now
        self._records.append(
            CallbackRecord(
                callback_type=type, args=args, kwargs=kwargs, time_delta=time_delta
            )
        )

    def on_llm_start(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_LLM_START, args, kwargs)

    def on_llm_new_token(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_LLM_NEW_TOKEN, args, kwargs)

    def on_llm_end(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_LLM_END, args, kwargs)

    def on_llm_error(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_LLM_ERROR, args, kwargs)

    def on_tool_start(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_TOOL_START, args, kwargs)

    def on_tool_end(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_TOOL_END, args, kwargs)

    def on_tool_error(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_TOOL_ERROR, args, kwargs)

    def on_text(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_TEXT, args, kwargs)

    def on_chain_start(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_CHAIN_START, args, kwargs)

    def on_chain_end(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_CHAIN_END, args, kwargs)

    def on_chain_error(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_CHAIN_ERROR, args, kwargs)

    def on_agent_action(self, *args: Any, **kwargs: Any) -> Any:
        self._append_record(CallbackType.ON_AGENT_ACTION, args, kwargs)

    def on_agent_finish(self, *args: Any, **kwargs: Any) -> None:
        self._append_record(CallbackType.ON_AGENT_FINISH, args, kwargs)
