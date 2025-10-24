from pydantic import BaseModel


class ProductCreate(BaseModel):
  sku: str
  name: str
  barcode: str | None = None
  unit: str = "adet"
  price_sale: float = 0
  price_cost: float = 0


class ProductOut(BaseModel):
  id: int
  sku: str
  name: str
  barcode: str | None
  unit: str
  price_sale: float
  price_cost: float

  class Config:
    from_attributes = True


class StockLocationCreate(BaseModel):
  code: str
  name: str
  type: str = "warehouse"


class StockLocationOut(BaseModel):
  id: int
  code: str
  name: str
  type: str

  class Config:
    from_attributes = True


class StockMoveCreate(BaseModel):
  product_id: int
  qty: float
  from_location_id: int | None = None
  to_location_id: int | None = None
  reference: str | None = None


class StockMoveOut(BaseModel):
  id: int
  product_id: int
  qty: float
  from_location_id: int | None
  to_location_id: int | None
  reference: str | None

  class Config:
    from_attributes = True
