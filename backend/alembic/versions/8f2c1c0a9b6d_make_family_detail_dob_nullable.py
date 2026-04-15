"""Make family_details.date_of_birth nullable.

Revision ID: 8f2c1c0a9b6d
Revises: 4f6da471d36f
Create Date: 2026-04-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8f2c1c0a9b6d"
down_revision = "4f6da471d36f"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("family_details") as batch_op:
        batch_op.alter_column(
            "date_of_birth",
            existing_type=sa.Date(),
            nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("family_details") as batch_op:
        batch_op.alter_column(
            "date_of_birth",
            existing_type=sa.Date(),
            nullable=False,
        )
