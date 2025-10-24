from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str | None = None
    email: str | None = None


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    email: str | None = None
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
