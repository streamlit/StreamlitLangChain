from pathlib import Path 

import streamlit as st
from langchain.callbacks import StdOutCallbackHandler

from callbacks import StreamlitCallbackHandler
from callbacks.capturing_callback_handler import playback_callbacks

# Build our sidebar
selected_run = st.sidebar.selectbox("Saved Query", ["alanis.pickle", "leo.pickle"])
max_pause_time = st.sidebar.number_input(
    "Max Pause Time", min_value=0.0, value=2.0, step=1.0
)
max_thought_containers = st.sidebar.number_input(
    "Max Thought Containers",
    min_value=0,
    value=3,
    step=1,
)
expand_new_thoughts = st.sidebar.checkbox("Expand New Thoughts by Default", value=True)

RUN_PATH = Path(__file__).parent / "runs" / str(selected_run)

streamlit_handler = StreamlitCallbackHandler(
    parent_container=st.container(),
    expand_new_thoughts=expand_new_thoughts,
    max_thought_containers=int(max_thought_containers),
    collapse_completed_thoughts=True,
)

playback_callbacks(
    [streamlit_handler, StdOutCallbackHandler()],
    str(RUN_PATH),
    max_pause_time=max_pause_time,
)
