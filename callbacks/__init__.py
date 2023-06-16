from __future__ import annotations

from langchain.callbacks.base import BaseCallbackHandler
from streamlit.delta_generator import DeltaGenerator

from callbacks.streamlit_callback_handler import (
    StreamlitCallbackHandler as _InternalStreamlitCallbackHandler,
    LLMThoughtLabeler as LLMThoughtLabeler,
)
from callbacks.capturing_callback_handler import (
    CapturingCallbackHandler as CapturingCallbackHandler,
    playback_callbacks as playback_callbacks,
    load_records_from_file as load_records_from_file,
)


def StreamlitCallbackHandler(
    parent_container: DeltaGenerator,
    *,
    max_thought_containers: int = 3,
    expand_new_thoughts: bool = True,
    collapse_completed_thoughts: bool = True,
    thought_labeler: LLMThoughtLabeler | None = None,
) -> BaseCallbackHandler:
    """Construct a new StreamlitCallbackHandler. This CallbackHandler is geared towards
    use with a LangChain Agent; it displays the Agent's LLM and tool-usage "thoughts"
    inside a series of Streamlit expanders.

    Parameters
    ----------
    parent_container
        The `st.container` that will contain all the Streamlit elements that the
        Handler creates.
    max_thought_containers
        The max number of completed LLM thought containers to show at once. When this
        threshold is reached, a new thought will cause the oldest thoughts to be
        collapsed into a "History" expander. Defaults to 3.
    expand_new_thoughts
        Each LLM "thought" gets its own `st.expander`. This param controls whether that
        expander is expanded by default. Defaults to True.
    collapse_completed_thoughts
        If True, LLM thought expanders will be collapsed when completed.
        Defaults to True.
    thought_labeler
        An optional custom LLMThoughtLabeler instance. If unspecified, the handler
        will use the default thought labeling logic. Defaults to None.

    Returns
    -------
    A new StreamlitCallbackHandler instance.

    Note that this is an "auto-updating" API: if the installed version of Streamlit
    has a more recent StreamlitCallbackHandler implementation, an instance of that class
    will be used.

    """
    # If we're using a version of Streamlit that implements StreamlitCallbackHandler,
    # delegate to it instead of using our built-in handler. The official handler is
    # guaranteed to support the same set of kwargs.
    try:
        from streamlit.external.langchain import StreamlitCallbackHandler as OfficialStreamlitCallbackHandler  # type: ignore

        return OfficialStreamlitCallbackHandler(
            parent_container,
            max_thought_containers=max_thought_containers,
            expand_new_thoughts=expand_new_thoughts,
            contract_on_done=collapse_completed_thoughts,
            thought_labeler=thought_labeler,
        )
    except ImportError:
        return _InternalStreamlitCallbackHandler(
            parent_container,
            max_thought_containers=max_thought_containers,
            expand_new_thoughts=expand_new_thoughts,
            collapse_completed_thoughts=collapse_completed_thoughts,
            thought_labeler=thought_labeler,
        )
