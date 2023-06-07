# StreamlitLangChain

Repository for experimenting with Streamlit <> LangChain integrations. Current projects:

- **StreamlitCallbackHandler:** Show LangChain agent steps and tool usage natively in Streamlit via LangChain Callbacks.
- **MRKL Demo:** Demo the LangChain MRKL agent as a Streamlit app.

## Setup

Create Python environment:

```shell
$ pipenv install
$ pipenv shell
```

Install pre-commit hook:

```shell
$ pre-commit install
```

Create `.streamlit/secrets.toml`:

```toml
openai_api_key = "[YOUR_KEY]"
serpapi_api_key = "[YOUR_KEY]"
```

## Run

```shell
$ streamlit run mrkl_demo.py
```

## Relevant Source Files

- `mrkl_demo.py` - Replicates the [MRKL Agent demo notebook](https://python.langchain.com/en/latest/modules/agents/agents/examples/mrkl.html) as a Streamlit app, using the callback handler.

### `callbacks/`

- `streamlit_callback_handler.py` - LangChain callback handler that displays LangChain output in a Streamlit-y fashion
- `mutable_expander.py` - used by the callback handler to create "dynamic" expander UIs
- `capturing_callback_handler.py` - LangChain callback handler that captures and stores LangChain queries for offline replay. (This is a developer tool, and is not required by `streamlit_callback_handler`!)
