from pathlib import Path
import requests
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM

from langchain.utilities import ArxivAPIWrapper, BingSearchAPIWrapper, WikipediaAPIWrapper, WolframAlphaAPIWrapper, DuckDuckGoSearchAPIWrapper
from langchain.agents import Tool, load_tools  
import streamlit as st 
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain import (
        LLMMathChain,
        OpenAI,
        SerpAPIWrapper,
        SQLDatabase,
        SQLDatabaseChain,
    )
from langchain.utilities import (
        BingSearchAPIWrapper, 
    )
from langchain.tools import (
        GooglePlacesTool, 
        Tool,
        AIPluginTool,
        PubmedQueryRun,
        HumanInputRun,
)
from langchain.agents import (
        initialize_agent,
        AgentType,
        Tool,
        load_tools,
)

from callbacks import StreamlitCallbackHandler
from callbacks.capturing_callback_handler import playback_callbacks


# Streamlit Setup
st.set_page_config(
    page_title="JeepersGLM", 
    page_icon="🤵", 
    layout="wide",
    menu_items=None)
 
"# 🤵 JeepersGLM" 
 
"""
con_text - 03a_shard_chain

"""

tab1, tab2, tab3 = st.tabs(["Chat", "Settings", "About"])

# variables
openai_api_key = st.secrets["openai_api_key"]
serpapi_api_key = st.secrets["serpapi_api_key"]
model = st.secrets["MODEL_NAME"]

DB_PATH = (Path(__file__).parent / "Chinook.db").absolute()

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


llm = ChatOpenAI(temperature=1, openai_api_key=openai_api_key, model=model, streaming=True)
search = SerpAPIWrapper(serpapi_api_key=serpapi_api_key)
llm_math_chain = LLMMathChain(llm=llm, verbose=True)
pubmed = PubmedQueryRun()
bing = BingSearchAPIWrapper()
wikipedia = WikipediaAPIWrapper()
wolfram = WolframAlphaAPIWrapper()
arxiv = ArxivAPIWrapper()
duck = DuckDuckGoSearchAPIWrapper()

db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")
db_chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)

 
tools = [ 
        Tool(
            name="Arxiv",
            func=arxiv.run,
            description="Open source research and datasets across many topic areas. If you use this, use another tool too. Provide APA-formattedcitations in your final answer.",
        ),
        Tool(
            name="Wikipedia",
            func=wikipedia.run,
            description="An open source encyclopedia. If you use this, use another tool too. Provide APA-formatted citations in your final answer"
        ),
        Tool(
            name="Bing Search",
            func=bing.run,
            description="A robust search engine from Microsoft based on GPT-4"
        ),
        Tool( 
            name="Crawler",
            func=search.run,
            description="General internet search. Useful for specific questions; when in doubt, try this first",
        ),
        Tool(
            name="DuckDuckGo",
            func=duck.run,
            description="An open source search engine that can help when Bing and Crawler are not enough",
        ),
        Tool(
            name="Calculator",
            func=llm_math_chain.run,
            description="Useful for when you need to answer questions about math",
        ),
        # Tool(
        #     name="FooBar DB",
        #     func=db_chain.run,
        #     description="useful for when you need to answer questions about FooBar. Input should be in the form of a question containing full context",
        # ),
    ]
 

jeepers = initialize_agent(
        tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True, memory=memory,
)


with tab2:
    expand_new_thoughts = st.sidebar.checkbox(
        "Expand New Thoughts",
        value=True,
        help="True if LLM thoughts should be expanded by default",
    )
    collapse_completed_thoughts = st.sidebar.checkbox(
        "Collapse Completed",
        value=True,
        help="True if LLM thoughts should be collapsed when they complete",
    )
    collapse_thoughts_delay = st.number_input(
        "Collapse Thoughts Delay",
        value=1.0,
        min_value=0.0,
        step=0.5,
        help="If Collapse Completed Thoughts is true, delay the collapse animation for this many seconds.",
    )
    max_thought_containers = st.number_input(
        "Max Thought Containers",
        value=20,
        min_value=1,
        help="Max number of completed thoughts to show. When exceeded, older thoughts will be moved into a 'History' expander.",
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
with tab1:
    form_container= st.empty()
    question_container = st.empty()
    thought_container = st.empty()
        
    st.write("") 
    with form_container:
            with st.form(key="form"):
                mrkl_input = st.text_area("What question do you want answered?", key=shadow_key)
                st.session_state[key] = mrkl_input
                submit_clicked = st.form_submit_button("Submit Question", type="primary")


    results_container = st.empty()

    # A hack to "clear" the previous result when submitting a new prompt.
    from clear_results import with_clear_container

    if with_clear_container(submit_clicked):
        # Create our StreamlitCallbackHandler
        # form_container.empty()
        res = results_container.container()
        streamlit_handler = StreamlitCallbackHandler( 
            parent_container=res,
            max_thought_containers=int(max_thought_containers),
            expand_new_thoughts=expand_new_thoughts,
            collapse_completed_thoughts=collapse_completed_thoughts,
            collapse_thoughts_delay=collapse_thoughts_delay,
        ) 
        # with question_container:
        #     st.markdown(f"> **Question:** {mrkl_input}")

        # If we've saved this question, play it back instead of actually running LangChain
        # (so that we don't exhaust our API calls unnecessarily)
        if mrkl_input in SAVED_SESSIONS:
            session_name = SAVED_SESSIONS[mrkl_input]
            session_path = Path(__file__).parent / "runs" / session_name
            print(f"Playing saved session: {session_path}")
            answer = playback_callbacks(
                [streamlit_handler], str(session_path), max_pause_time=3
            )
            thought_container.write(f"{answer}")
        else:
            answer = jeepers.run(mrkl_input, callbacks=[streamlit_handler])
            thought_container.write(f"{answer}")
