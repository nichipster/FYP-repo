from typing import Annotated, Generator

from fastapi import Depends
from sqlmodel import Session, create_engine

from app.config import settings

engine = create_engine(settings.database_url)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


db_dependency = Annotated[Session, Depends(get_session)]
