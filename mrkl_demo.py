from pathlib import Path

import streamlit as st
from langchain import (
    LLMMathChain,
    OpenAI,
    SerpAPIWrapper,
    SQLDatabase,
    SQLDatabaseChain,
)
from langchain.agents import AgentType
from langchain.agents import initialize_agent, Tool

from callbacks import StreamlitCallbackHandler

DB_PATH = (Path(__file__).parent / "Chinook.db").absolute()

llm = OpenAI(temperature=0, openai_api_key=st.secrets["openai_api_key"], streaming=True)
search = SerpAPIWrapper(serpapi_api_key=st.secrets["serpapi_api_key"])
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

mrkl = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

# Streamlit starts here!

prefilled = st.sidebar.selectbox(
    "Sample questions",
    [
        "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
        "What is the full name of the artist who recently released an album called 'The Storm Before the Calm' and "
        "are they in the FooBar database? If so, what albums of theirs are in the FooBar database?",
    ],
)

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

with st.form(key="form", clear_on_submit=False):
    mrkl_input = st.text_input("Question", value=prefilled)
    submit_clicked = st.form_submit_button("Submit Question")

# Create our StreamlitCallbackHandler
streamlit_handler = StreamlitCallbackHandler(
    parent_container=st.container(),
    expand_new_thoughts=expand_new_thoughts,
    max_completed_thoughts=3,
)

if submit_clicked:
    mrkl.run(mrkl_input, callbacks=[streamlit_handler])
