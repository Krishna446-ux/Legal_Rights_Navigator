from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_mistralai import ChatMistralAI
from langchain_openai import ChatOpenAI
from core.config import Settings
class LLMManager:

    def __init__(self):
        self.groq = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=Settings.GROQ_API_KEY,
            temperature=0,
            max_retries=2,
            max_tokens=200,
        )

        self.gemini = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=Settings.GOOGLE_API_KEY,
            temperature=0,
            max_retries=2,
            max_tokens=200,
        )

        self.mistral = ChatMistralAI(
            model_name="mistral-small-latest",
            api_key=Settings.MISTRAL_API_KEY,
            temperature=0,
            max_retries=2,
            max_tokens=200,
        )

        self.openrouter = ChatOpenAI(
            model="deepseek/deepseek-r1-0528:free",
            api_key=Settings.OPENAI_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0,
            max_retries=2,
        )
