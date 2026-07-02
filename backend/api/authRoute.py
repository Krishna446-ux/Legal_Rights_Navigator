import logging
from repositories.user import insert_user_entry
from core.config import setting
from google.oauth2 import id_token
from google.auth.transport import requests
#from repositories.user import insert_user_entry 
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from services.auth import create_google_flow,check_granted_scopes,create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)
@router.get('/')
async def google_login()->RedirectResponse:
    logger.info("Initiating Google OAuth login flow")
    flow=create_google_flow()
    authorization_url, state = flow.authorization_url(
    # Recommended, enable offline access so that you can refresh an access token without
    # re-prompting the user for permission. Recommended for web server apps.
    access_type='offline',
    # Optional, enable incremental authorization. Recommended as a best practice.
    include_granted_scopes='true',
    # Optional, if your application knows which user is trying to authenticate, it can use this
    # parameter to provide a hint to the Google Authentication Server.
    login_hint='hint@example.com',
    # Optional, set prompt to 'consent' will prompt the user for consent
    prompt='consent')
    response= RedirectResponse(
        url=authorization_url,
        status_code=302
    )
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,  # Blocks client-side scripts (like JavaScript) from accessing the cookie.
        secure=False,      # Use False only for local HTTP development
        max_age=60 * 60,
        samesite="lax"
    )
    response.set_cookie(
        key="code_verifier",
        value=flow.code_verifier,
        httponly=True,  # Blocks client-side scripts (like JavaScript) from accessing the cookie.
        secure=False,      # Use False only for local HTTP development
        max_age=60 * 60,
        samesite="lax"
    )
    return response

@router.get('/callback')
async def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    request: Request = None,
) -> RedirectResponse:
    logger.info("Google OAuth callback received")

    try:
        prev_state = request.cookies.get("oauth_state") if request else None
        prev_code_verifier = request.cookies.get("code_verifier") if request else None
        if error:
            logger.warning("Google OAuth callback returned error: %s", error)
            return RedirectResponse(
                url=setting.frontend_url + "/login?error=" + error,
                status_code=500,
            )

        if prev_state != state:
            logger.warning("OAuth state mismatch during Google callback")
            return RedirectResponse(
                url=setting.frontend_url + "/login?error=state_mismatch",
                status_code=500,
            )
        #requires the state and code_verifier used when asking for the authorization code, to be passed again when exchanging the code for tokens
        flow = create_google_flow(prev_state,code_verifier=prev_code_verifier)
        
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        #for extracting user info from id_token, OCID stuff
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            requests.Request(),
            setting.google_client_id,)
        
        #print("ID Info:", id_info)
        features=check_granted_scopes(credentials)
        #inserting the user inside the database if not already present
        await insert_user_entry(
            name=id_info["name"],
            email=id_info["email"],
            sub=id_info["sub"]
        )
        logger.info("Google OAuth flow created successfully")
        jwt_token = create_access_token(name=id_info["name"],
            email=id_info["email"],
            sub=id_info["sub"])
        response = RedirectResponse(
            url=setting.frontend_url + "/login?token=" + jwt_token,
            status_code=302,
        )
        response.set_cookie(
            key="jwt_token",
            value=jwt_token,
            httponly=True,  # Blocks client-side scripts (like JavaScript) from accessing the cookie.
            secure=False,      # Use False only for local HTTP development
            max_age=7 * 24 * 60 * 60,
            samesite="lax"
        )
        return response
    except Exception as exc:
        logger.exception("Google OAuth callback failed: %s", exc)
        return RedirectResponse(
            url=setting.frontend_url + "/login?error=Internal server error",
            status_code=500,
        )
    finally:
        logger.debug("Google OAuth callback processing completed")
    