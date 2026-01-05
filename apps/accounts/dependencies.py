from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from apps.accounts.services.token import TokenService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="accounts/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    return await TokenService.fetch_user(token)


def require_superuser(user=Depends(get_current_user)):
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user
