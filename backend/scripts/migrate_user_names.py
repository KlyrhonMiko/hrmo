import asyncio
import sys
import os

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, and_
from core.database import AsyncSessionLocal
from models.users import User
from models.personal_information import BasicInformation
from services.users import UserService

async def migrate_users():
    async with AsyncSessionLocal() as session:
        # Find all users linked to employees
        stmt = (
            select(User, BasicInformation)
            .join(BasicInformation, User.employee_id == BasicInformation.employee_id)
            .where(
                and_(
                    User.employee_id.isnot(None),
                    User.is_deleted.is_(False),
                    BasicInformation.is_deleted.is_(False)
                )
            )
        )
        
        result = await session.execute(stmt)
        records = result.all()
        
        print(f"Found {len(records)} linked users to check/sync.")
        
        user_service = UserService(session)
        count = 0
        
        for user, basic_info in records:
            # Only sync if there's an actual mismatch to save on DB writes
            has_mismatch = (
                user.surname != basic_info.surname or
                user.first_name != basic_info.first_name or
                (user.middle_name or "") != (basic_info.middle_name or "")
            )
            
            if has_mismatch:
                print(f"Syncing User '{user.username}': {user.surname} -> {basic_info.surname}")
                await user_service.sync_profile_from_pds(user, basic_info)
                count += 1
        
        if count > 0:
            await session.commit()
            print(f"Successfully synchronized {count} users.")
        else:
            print("All active users are already in sync.")

if __name__ == "__main__":
    asyncio.run(migrate_users())
