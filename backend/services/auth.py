

from uuid import UUID

from core.config import setting
from datetime import datetime, timedelta, timezone
from loguru import logger
import jwt
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

# Required, call the from_client_secrets_file method to retrieve the client ID from a
# client_secret.json file. The client ID (from that file) and access scopes are required. (You can
# also use the from_client_config method, which passes the client configuration as it originally
# appeared in a client secrets file but doesn't access the file itself.)

def create_google_flow(state: str | None = None, code_verifier: str | None = None) -> Flow:
    logger.debug(f"Creating Google OAuth flow with state={state}")
    try:
        client_config = {
            "web": {
                "client_id": setting.google_client_id,
                "client_secret": setting.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [setting.google_redirect_uri],
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=[
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ],
            state=state,
            code_verifier=code_verifier
        )
        flow.redirect_uri = setting.google_redirect_uri
        logger.debug("Google OAuth flow created successfully")
        return flow
    except Exception as e:
        logger.exception(f"Failed to create Google OAuth flow: {e}")
        raise


def check_granted_scopes(credentials):
    features = {}
    if 'https://www.googleapis.com/auth/userinfo.email' in credentials.granted_scopes:
        features['email'] = True
    else:
        features['email'] = False
        logger.warning("Email scope was NOT granted by the user")

    if 'https://www.googleapis.com/auth/userinfo.profile' in credentials.granted_scopes:
        features['profile'] = True
    else:
        features['profile'] = False
        logger.warning("Profile scope was NOT granted by the user")

    return features

# def get_user_info(credentials:google.oauth2.credentials.Credentials,features:dict):
    
#     drive = build('drive', 'v2', credentials=credentials)
    



def create_access_token(user_id:UUID,name: str, email: str, sub: str) -> str:
    logger.debug(f"Creating access token for sub={sub}")
    try:
        payload = {
            "user_id":user_id,
            "name": name,
            "email": email,
            "sub": sub,
            "exp": datetime.now(timezone.utc) + timedelta(days=7),
        }
        token = jwt.encode(payload, setting.jwt_secret_key, algorithm="HS256")
        logger.info(f"Access token created for email={email}")
        return token
    except Exception as e:
        logger.exception(f"Failed to create access token for sub={sub}: {e}")
        raise