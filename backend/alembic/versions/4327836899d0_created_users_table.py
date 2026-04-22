"""Alembic migration script template.

Revision ID: 4327836899d0
Revises: d2a0b5f4e87c
Create Date: 2026-04-19 13:09:33.786524

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4327836899d0'
down_revision = 'd2a0b5f4e87c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("surname", sa.String(length=100), nullable=False),
            sa.Column("first_name", sa.String(length=100), nullable=False),
            sa.Column("middle_name", sa.String(length=100), nullable=True),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("phone_number", sa.String(length=20), nullable=True),
            sa.Column("username", sa.String(length=50), nullable=False),
            sa.Column("password", sa.String(length=255), nullable=False),
            sa.Column(
                "role",
                sa.Enum("admin", "president", "hr", "hr-assistant", "employee", name="user_role"),
                nullable=False,
                server_default="employee",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
            sa.UniqueConstraint("username"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "users" in existing_tables:
        op.drop_table("users")
