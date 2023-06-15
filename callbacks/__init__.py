from langchain.callbacks.base import BaseCallbackHandler
from streamlit.delta_generator import DeltaGenerator

from callbacks.streamlit_callback_handler import (
    StreamlitCallbackHandler as _InternalStreamlitCallbackHandler,
)
from callbacks.capturing_callback_handler import (
    CapturingCallbackHandler as CapturingCallbackHandler,
    playback_callbacks as playback_callbacks,
    load_records_from_file as load_records_from_file,
)


def StreamlitCallbackHandler(
    parent_container: DeltaGenerator,
    *,
    max_completed_thoughts: int,
    expand_new_thoughts: bool,
    contract_on_done: bool,
    update_tool_label: bool,
) -> BaseCallbackHandler:
    # If we're using a version of Streamlit that implements StreamlitCallbackHandler,
    # delegate to it instead of using our built-in handler. The official handler is
    # guaranteed to support the same set of kwargs.
    try:
        from streamlit.ml.langchain import StreamlitCallbackHandler as OfficialStreamlitCallbackHandler  # type: ignore

        return OfficialStreamlitCallbackHandler(
            parent_container,
            max_completed_thoughts=max_completed_thoughts,
            expand_new_thoughts=expand_new_thoughts,
            contract_on_done=contract_on_done,
            update_tool_label=update_tool_label,
        )
    except ImportError:
        return _InternalStreamlitCallbackHandler(
            parent_container,
            max_completed_thoughts=max_completed_thoughts,
            expand_new_thoughts=expand_new_thoughts,
            contract_on_done=contract_on_done,
            update_tool_label=update_tool_label,
        )
