import asyncio
from uuid import uuid4
from core.db_session import AsyncSessionLocal
from graph.graph import LangGraph
import httpx
from datetime import datetime

async def test():
    class DummyCheckpointer:
        async def aget_tuple(self, *args, **kwargs): return None
        async def aput(self, *args, **kwargs): pass
        def get_tuple(self, *args, **kwargs): return None
        def put(self, *args, **kwargs): pass
        
    # Just invoke it locally if it doesn't need DB checkpointer
    # Wait, it might be easier to just hit the API endpoint
    async with httpx.AsyncClient() as client:
        # Assuming backend is running on 8000
        try:
            resp = await client.get("http://127.0.0.1:8000/chat/graph_health?query=Can a woman work night shifts?")
            print(resp.json())
        except Exception as e:
            print("API failed:", e)

asyncio.run(test())
