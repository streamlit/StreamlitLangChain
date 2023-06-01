from pathlib import Path

import streamlit as st
from langchain.callbacks import StdOutCallbackHandler

from capturing_callback_handler import playback_callbacks
from streamlit_callback_handler import StreamlitCallbackHandler

# from streamlit_debug_callback_handler import StreamlitDebugCallbackHandler

RUN_PATH = Path(__file__).parent / "runs" / "leo_streaming.pickle"

streamlit_handler = StreamlitCallbackHandler(st.container(), expand_new_thoughts=True)
# streamlit_handler = StreamlitDebugCallbackHandler(st.container())
playback_callbacks(
    [streamlit_handler, StdOutCallbackHandler()], str(RUN_PATH), with_pauses=True
)
