from pathlib import Path

import streamlit as st
from langchain.callbacks import StdOutCallbackHandler

from capturing_callback_handler import playback_callbacks
from streamlit_callback_handler import StreamlitCallbackHandler
from langchain.callbacks.streamlit import (
    StreamlitCallbackHandler as OrigStreamlitCallbackHandler,
)

RUN_PATH = Path(__file__).parent / "runs" / "mrkl.pickle"

# streamlit_handler = StreamlitCallbackHandler(st.container())
streamlit_handler = OrigStreamlitCallbackHandler()
playback_callbacks(
    [streamlit_handler, StdOutCallbackHandler()], str(RUN_PATH), with_pauses=True
)
