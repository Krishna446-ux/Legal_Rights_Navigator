from fastapi import Request
from fastapi.responses import RedirectResponse
from loguru import logger
import jwt
from core.config import setting
from jwt import ExpiredSignatureError, InvalidTokenError

SECRET_KEY = setting.jwt_secret_key
ALGORITHM = "HS256"

def verify_token(token: str | None) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        logger.warning("JWT token has expired")
        return None
    except InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        return None
    except Exception as e:
        logger.exception(f"Unexpected error verifying token: {e}")
        return None

async def auth_middleware(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        token = request.cookies.get("jwt_token")
        if token is None:
            logger.debug("No jwt_token cookie found in request")
            request.state.user_info = None
            response = await call_next(request)
            return response

        payload = verify_token(token)
        if payload is None:
            logger.warning(f"Token verification failed for path: {request.url.path}")
        request.state.user_info = payload

        response = await call_next(request)
        logger.info(f"Completed request: {request.method} {request.url.path} -> {response.status_code}")
        return response

    except Exception as e:
        logger.exception(f"auth_middleware crashed: {e}")
        raise