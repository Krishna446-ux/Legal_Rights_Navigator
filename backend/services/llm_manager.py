from loguru import logger
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_mistralai import ChatMistralAI
from langchain_openai import ChatOpenAI
from core.config import setting


class LLMManager:

    def __init__(self):
        try:
            self.groq = ChatGroq(
                model="llama-3.3-70b-versatile",
                api_key=setting.GROQ_API_KEY,
                temperature=0,
                max_retries=2,
                max_tokens=200,
            )
            logger.info("Groq LLM initialised")
        except Exception as e:
            logger.exception(f"Failed to initialise Groq LLM: {e}")
            raise

        try:
            self.gemini = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=setting.GOOGLE_API_KEY,
                temperature=0,
                max_retries=2,
                max_tokens=200,
            )
            logger.info("Gemini LLM initialised")
        except Exception as e:
            logger.exception(f"Failed to initialise Gemini LLM: {e}")
            raise

        try:
            self.mistral = ChatMistralAI(
                model_name="mistral-small-latest",
                api_key=setting.MISTRAL_API_KEY,
                temperature=0,
                max_retries=2,
                max_tokens=200,
            )
            logger.info("Mistral LLM initialised")
        except Exception as e:
            logger.exception(f"Failed to initialise Mistral LLM: {e}")
            raise

        try:
            self.openrouter = ChatOpenAI(
                model="deepseek/deepseek-r1-0528:free",
                api_key=setting.OPENAI_API_KEY,
                base_url="https://openrouter.ai/api/v1",
                temperature=0,
                max_retries=2,
            )
            logger.info("OpenRouter LLM initialised")
        except Exception as e:
            logger.exception(f"Failed to initialise OpenRouter LLM: {e}")
            raise
