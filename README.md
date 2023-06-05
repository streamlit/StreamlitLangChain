# StreamlitLangChain

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

- `streamlit_callback_handler.py` - LangChain callback handler that displays LangChain output in a Streamlit-y fashion
- `mutable_expander.py` - used by the callback handler to create "dynamic" expander UIs
- `capturing_callback_handler.py` - LangChain callback handler that captures and stores LangChain queries for offline replay. (This is a developer tool, and is not required by `streamlit_callback_handler`!)
