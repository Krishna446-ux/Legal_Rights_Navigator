#remove these parts after development is done
from contextlib import asynccontextmanager
import os
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from graph.graph import LangGraph
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
################################################
from loguru import logger
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.chatRoute import router as chat_router
from api.apiRoutes import api_router
from api.authRoute import router as auth_router
from core.config import setting
from middlewares.auth_middleware import auth_middleware

router = APIRouter()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Bug 7 fix: use async context manager to avoid blocking the event loop during startup
    async with AsyncPostgresSaver.from_conn_string(setting.checkpoint_database_url) as checkpointer:
        await checkpointer.setup()

        app.state.graph = LangGraph(checkpointer)

        yield

app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register auth_middleware AFTER CORSMiddleware so it runs after CORS headers are set
# (Starlette applies middleware in reverse-registration order)
app.middleware("http")(auth_middleware)

@app.get("/")
async def root():
    return {"message": "Server Is Running"}
    
@app.get("/me")
async def get_user_info(request: Request):
    try:
        user_info = request.state.user_info
        logger.info(f"User info requested: {user_info}")
        if user_info is None:
            logger.warning("Unauthenticated request to /me")
            return {"error": "User not authenticated"}
        return {"user_info": user_info}
    except Exception as e:
        logger.exception(f"Unexpected error in /me endpoint: {e}")
        return {"error": "Internal server error"}
