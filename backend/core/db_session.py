from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from core.config import setting
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

db_url = setting.database_url

if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

parsed = urlparse(db_url)
query = dict(parse_qsl(parsed.query))

# Remove libpq-only options
ssl_mode = query.pop("sslmode", None)
query.pop("channel_binding", None)

db_url = urlunparse(parsed._replace(query=urlencode(query)))

# Set up connection arguments
connect_args = {}
if ssl_mode:
    # Pass sslmode as ssl to asyncpg
    connect_args["ssl"] = ssl_mode

engine = create_async_engine(
    db_url,
    echo=False,
    poolclass=NullPool,   # prevents "Future attached to a different loop" in async contexts
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)