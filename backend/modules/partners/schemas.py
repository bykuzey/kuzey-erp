from pydantic import BaseModel


class PartnerCreate(BaseModel):
    name: str
    type: str = "customer"
    tax_no: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None


class PartnerOut(BaseModel):
    id: int
    name: str
    type: str
    tax_no: str | None
    phone: str | None
    email: str | None
    address: str | None

    class Config:
        from_attributes = True
