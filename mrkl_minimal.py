from pathlib import Path

from langchain import (
    LLMMathChain,
    OpenAI,
    SerpAPIWrapper,
    SQLDatabase,
    SQLDatabaseChain,
)
from langchain.agents import AgentType, initialize_agent, Tool
from langchain.callbacks import StreamlitCallbackHandler
import streamlit as st

from callbacks import playback_callbacks

st.set_page_config(page_title="MRKL", page_icon="🦜", layout="wide", initial_sidebar_state="collapsed")
DB_PATH = (Path(__file__).parent / "Chinook.db").absolute()

"## 🦜🔗 MRKL"

# Setup credentials in Streamlit
user_openai_api_key = st.sidebar.text_input(
    "OpenAI API Key", type="password", help="Set this to run your own custom questions."
)
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

SAVED_SESSIONS = {
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?": "leo.pickle",
    "What is the full name of the artist who recently released an album called "
    "'The Storm Before the Calm' and are they in the FooBar database? If so, what albums of theirs "
    "are in the FooBar database?": "alanis.pickle",
}

key = "input"
shadow_key = "_input"

if key in st.session_state and shadow_key not in st.session_state:
    st.session_state[shadow_key] = st.session_state[key]

with st.form(key="form"):
    if not enable_custom:
        "Ask one of the sample questions, or enter your API Keys in the sidebar to ask your own custom questions."
    prefilled = st.selectbox("Sample questions", sorted(SAVED_SESSIONS.keys())) or ""
    mrkl_input = ""

    if enable_custom:
        mrkl_input = st.text_input("Or, ask your own question", key=shadow_key)
        st.session_state[key] = mrkl_input
    if not mrkl_input:
        mrkl_input = prefilled
    submit_clicked = st.form_submit_button("Submit Question")

question_container = st.empty()
results_container = st.empty()

# A hack to "clear" the previous result when submitting a new prompt.
from clear_results import with_clear_container

if with_clear_container(submit_clicked):
    # Create our StreamlitCallbackHandler
    res = results_container.container()
    streamlit_handler = StreamlitCallbackHandler(parent_container=res)

    question_container.write(f"**Question:** {mrkl_input}")

    # If we've saved this question, play it back instead of actually running LangChain
    # (so that we don't exhaust our API calls unnecessarily)
    if mrkl_input in SAVED_SESSIONS:
        session_name = SAVED_SESSIONS[mrkl_input]
        session_path = Path(__file__).parent / "runs" / session_name
        print(f"Playing saved session: {session_path}")
        answer = playback_callbacks(
            [streamlit_handler], str(session_path), max_pause_time=3
        )
        res.write(f"**Answer:** {answer}")
    else:
        answer = mrkl.run(mrkl_input, callbacks=[streamlit_handler])
        res.write(f"**Answer:** {answer}")