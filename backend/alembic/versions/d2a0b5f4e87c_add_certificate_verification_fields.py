"""Add certificate verification fields.

Revision ID: d2a0b5f4e87c
Revises: 9d4b2c6f1a10
Create Date: 2026-04-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "d2a0b5f4e87c"
down_revision = "9d4b2c6f1a10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("certificate_records", sa.Column("verified_by", sa.String(length=100), nullable=True))
    op.add_column("certificate_records", sa.Column("verified_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("certificate_records", "verified_at")
    op.drop_column("certificate_records", "verified_by")
