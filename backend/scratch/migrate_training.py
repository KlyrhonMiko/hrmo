import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Database URL from .env.local
DATABASE_URL = "postgresql+asyncpg://postgres.zxnslwselakqjtdlnqjk:xn1nQRWrTK4bWz2P@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def migrate():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Running migration...")
        
        # Add number_of_hours
        try:
            await conn.execute(text("ALTER TABLE training_requests ADD COLUMN number_of_hours INTEGER DEFAULT 0"))
            print("Added number_of_hours column.")
        except Exception as e:
            print(f"number_of_hours already exists or error: {e}")

        # Add training_event_id
        try:
            await conn.execute(text("ALTER TABLE training_requests ADD COLUMN training_event_id VARCHAR"))
            print("Added training_event_id column.")
        except Exception as e:
            print(f"training_event_id already exists or error: {e}")

    await engine.dispose()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
