from pathlib import Path

import streamlit as st
from langchain.callbacks import StdOutCallbackHandler

from capturing_callback_handler import playback_callbacks
from streamlit_callback_handler import StreamlitCallbackHandler

# Build our sidebar
selected_run = st.sidebar.selectbox(
    "Saved Query", ["hilton.pickle", "alanis.pickle", "leo.pickle"]
)
max_pause_time = st.sidebar.number_input(
    "Max Pause Time", min_value=0.0, value=2.0, step=1.0
)
expand_new_thoughts = st.sidebar.checkbox("Expand New Thoughts by Default", value=True)

RUN_PATH = Path(__file__).parent / "runs" / selected_run

streamlit_handler = StreamlitCallbackHandler(
    container=st.container(),
    expand_new_thoughts=expand_new_thoughts,
)
playback_callbacks(
    [streamlit_handler, StdOutCallbackHandler()],
    str(RUN_PATH),
    max_pause_time=max_pause_time,
)
