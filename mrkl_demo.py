import pickle
from pathlib import Path

from langchain import (
    LLMMathChain,
    OpenAI,
    SerpAPIWrapper,
    SQLDatabase,
    SQLDatabaseChain,
)
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

import streamlit as st

from capturing_callback_handler import CapturingCallbackHandler
from streamlit_callback_handler import StreamlitCallbackHandler

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

# Streamlit starts here
streamlit_handler = StreamlitCallbackHandler(st.container())
capturing_handler = CapturingCallbackHandler()

mrkl = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)

mrkl.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=[streamlit_handler, capturing_handler],
)

# with open("runs/leo_streaming.pickle", "wb") as file:
#     pickle.dump(capturing_handler.records, file)
