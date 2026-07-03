#remove these parts after development is done
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
################################################
from loguru import logger
from fastapi import APIRouter, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.authRoute import router as auth_router
from core.config import setting
from middlewares.auth_middleware import auth_middleware

app = FastAPI()
router = APIRouter()
app.include_router(auth_router)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

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
    return {"message": "Hello World"}

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
