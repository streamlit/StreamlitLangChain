from pathlib import Path

import streamlit as st

SAVED_SESSIONS = {
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?": "leo.pickle",
    "What is the full name of the artist who recently released an album called "
    "'The Storm Before the Calm' and are they in the FooBar database? If so, what albums of theirs "
    "are in the FooBar database?": "alanis.pickle",
}

st.set_page_config(page_title="MRKL", page_icon="🦜", layout="wide")

"# 🦜🔗 MRKL"

"""
This Streamlit app showcases using a LangChain agent to replicate the MRKL chain.
Some sample questions are provided in the sidebar, or you can try entering your own!

This uses the [example Chinook database](https://github.com/lerocha/chinook-database).
To set it up follow the instructions [here](https://database.guide/2-sample-databases-sqlite/),
placing the .db file in the same directory as this app.

"""

# Setup credentials in Streamlit
user_openai_api_key = st.sidebar.text_input(
    "OpenAI API Key",
    type="password",
    help="Set this to run your own custom questions.")
user_serpapi_api_key = st.sidebar.text_input(
    "SerpAPI API Key",
    type="password",
    help="Set this to run your own custom questions. Get yours at https://serpapi.com/manage-api-key.",
)

if user_openai_api_key and user_serpapi_api_key:
    openai_api_key = user_openai_api_key
    serpapi_api_key = user_serpapi_api_key
    enable_custom = True
else:
    openai_api_key = st.secrets["openai_api_key"]
    serpapi_api_key = st.secrets["serpapi_api_key"]
    enable_custom = False

with st.expander("👀 View the source code"), st.echo():
    # LangChain imports
    from langchain import (
        LLMMathChain,
        OpenAI,
        SerpAPIWrapper,
        SQLDatabase,
        SQLDatabaseChain,
    )
    from langchain.agents import AgentType
    from langchain.agents import initialize_agent, Tool

    from callbacks import StreamlitCallbackHandler, playback_callbacks

    # Tools setup
    DB_PATH = (Path(__file__).parent / "Chinook.db").absolute()

    llm = OpenAI(temperature=0, openai_api_key=openai_api_key, streaming=True)
    search = SerpAPIWrapper(serpapi_api_key=serpapi_api_key)
    llm_math_chain = LLMMathChain(llm=llm, verbose=True)
    db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")
    db_chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)
    tools = [
        Tool(
            name="Search",
            func=search.run,
            description="useful for when you need to answer questions about current events. You should ask targeted questions",
        ),
        Tool(
            name="Calculator",
            func=llm_math_chain.run,
            description="useful for when you need to answer questions about math",
        ),
        Tool(
            name="FooBar DB",
            func=db_chain.run,
            description="useful for when you need to answer questions about FooBar. Input should be in the form of a question containing full context",
        ),
    ]

    # Initialize agent
    mrkl = initialize_agent(
        tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
    )
    # To run the agent, use `mrkl.run(mrkl_input)`

# More Streamlit here!

expand_new_thoughts = st.sidebar.checkbox(
    "Expand New Thoughts",
    value=True,
    help="True if LLM thoughts should be expanded by default",
)

max_completed_thoughts = st.sidebar.number_input(
    "Max Completed Thoughts",
    value=3,
    min_value=1,
    help="Max number of completed thoughts to show. When exceeded, older thoughts will be moved into a 'History' expander.",
)

if not enable_custom:
    "Ask a sample question, or enter API Keys in the sidebar to ask your own custom questions."
prefilled = st.selectbox("Sample questions", sorted(SAVED_SESSIONS.keys()))

if enable_custom:
    mrkl_input = st.text_input("Ask your own question", value=prefilled)
else:
    mrkl_input = prefilled
submit_clicked = st.button("Submit Question")

results_container = st.empty()

# A hack to "clear" the previous result when submitting a new prompt.
from clear_results import with_clear_container

if with_clear_container(submit_clicked):
    # Create our StreamlitCallbackHandler
    streamlit_handler = StreamlitCallbackHandler(
        parent_container=results_container.container(),
        expand_new_thoughts=expand_new_thoughts,
        max_completed_thoughts=max_completed_thoughts,
    )

    # If we've saved this question, play it back instead of actually running LangChain
    # (so that we don't exhaust our API calls unnecessarily)
    if mrkl_input in SAVED_SESSIONS:
        session_name = SAVED_SESSIONS[mrkl_input]
        session_path = Path(__file__).parent / "runs" / session_name
        print(f"Playing saved session: {session_path}")
        playback_callbacks([streamlit_handler], str(session_path), max_pause_time=3)
    else:
        mrkl.run(mrkl_input, callbacks=[streamlit_handler])
