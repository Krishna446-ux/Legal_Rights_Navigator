from fastapi import Request
import logging
from fastapi.responses import RedirectResponse
import jwt
from core.config import setting
from jwt import InvalidTokenError

SECRET_KEY = setting.jwt_secret_key

ALGORITHM = "HS256"
def verify_token(token: str|None) -> dict | None:

    try:
        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM],

        )

        return payload

    except Exception as e:
        logging.error("Invalid token %s",e)
        
        return None

async def auth_middleware(request: Request, call_next):
    logging.info("Before request")
    print(f"Cookies: {request.cookies}")
    token=request.cookies.get("jwt_token")
    if(token is None):
        logging.warning("No token found in request")
        request.state.user_info=None
        response = await call_next(request)
        return response
    payload=verify_token(token)
    request.state.user_info=payload
    response = await call_next(request)
    logging.info("After request")

    return response