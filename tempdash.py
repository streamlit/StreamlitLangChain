from pathlib import Path

from langchain.utilities import ArxivAPIWrapper, BingSearchAPIWrapper, WikipediaAPIWrapper, WolframAlphaAPIWrapper, DuckDuckGoSearchAPIWrapper
from langchain.agents import Tool  
import streamlit as st 
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain import (
        LLMMathChain,
        SerpAPIWrapper,
        SQLDatabase,
        SQLDatabaseChain,
    )
from langchain.utilities import (
        BingSearchAPIWrapper, 
    )
from langchain.tools import (
        Tool,
        PubmedQueryRun,
        GooglePlacesTool,
)
from langchain.agents import (
        initialize_agent,
        AgentType,
        Tool,
)

from callbacks import StreamlitCallbackHandler
from callbacks.capturing_callback_handler import playback_callbacks


# Streamlit Setup
st.set_page_config(
    page_title="Dreamwalker", 
    page_icon="💭", 
    layout="wide",
    menu_items=None)
 
"# 💭 Dreamwalker" 
"### con|text - 03a_shard_chain. luke@lukesteuber.com. \n"

"A grounded rather than generative language model (not GPT, but GLM). Built atop Llama, Bison (PAlM), langchain, and other tools. Experimental."

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
places = GooglePlacesTool()

db = SQLDatabase.from_uri(f"sqlite:///{DB_PATH}")
db_chain = SQLDatabaseChain.from_llm(llm, db, verbose=True)
 
tools = [ 
        Tool(
            name="PubMed",
            func=pubmed.run,
            description="Medical journals and articles. If you use this, use another tool too. Provide APA-formatted citations in your final answer.",
        ),
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
        Tool(
            name="Places",
            func=places.run,
            description="Google Places, geography and location search. Useful for when you need to answer questions about places",
        ),
    ]


jeepers = initialize_agent(
        tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True, memory=memory,
)

with tab3:
    st.markdown("https://www.linkedin.com/in/lukesteuber/")
    st.markdown("bluesky: @coolhand")
with tab2:
    expand_new_thoughts = st.checkbox(
        "Expand New Thoughts",
        value=True,
        help="True if LLM thoughts should be expanded by default",
    )
    collapse_completed_thoughts = st.checkbox(
        "Collapse Completed",
        value=True,
        help="True if LLM thoughts should be collapsed when they complete",
    )
    collapse_thoughts_delay = st.number_input(
        "Collapse Thoughts Delay",
        value=3.0,
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
                "Write a detailed question for me to research and comprehensively answer. Use the question below or replace it with your own. Be as specific as possible and include any web links I should start with. Please be patient as I respond and reload if there is an error."
                mrkl_input = st.text_area("How can I help?", key=shadow_key, value="What are the key themes, emotions, topics, people, and news being discussed both on, and related to, Bluesky social media today over the past eight hours. Comprehensively detail them with links. Also comprehensively collect news and affect around these other social media sites and related personalities: Twitter, Threads, Instagram, Mastadon, Spill, Reddit, Facebook. Include links to primary sources and specific profiles. Then provide an interpretation of current events and recommendations where relevant.")
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
        
        answer = jeepers.run(mrkl_input, callbacks=[streamlit_handler])
        thought_container.write(f"{answer}")
