"""Add training tracking tables.

Revision ID: 9d4b2c6f1a10
Revises: 8f2c1c0a9b6d
Create Date: 2026-04-16

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "9d4b2c6f1a10"
down_revision = "8f2c1c0a9b6d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Tables may already exist if autogenerate created them before this migration.
    # Check if training_events table exists before creating.
    inspector = sa.inspect(op.get_context().bind)
    existing_tables = inspector.get_table_names()

    if "training_events" not in existing_tables:
        op.create_table(
            "training_events",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("training_title", sa.String(length=150), nullable=False),
            sa.Column("training_type", sa.String(length=100), nullable=False),
            sa.Column("status", sa.String(length=50), nullable=False),
            sa.Column("conducted_by", sa.String(length=150), nullable=False),
            sa.Column("venue", sa.String(length=150), nullable=False),
            sa.Column("date_from", sa.Date(), nullable=False),
            sa.Column("date_to", sa.Date(), nullable=False),
            sa.Column("hours", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "training_event_participants" not in existing_tables:
        op.create_table(
            "training_event_participants",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("training_event_id", sa.String(), nullable=False),
            sa.Column("employee_id", sa.String(), nullable=False),
            sa.Column("assignment_status", sa.String(length=50), nullable=False),
            sa.Column("completion_status", sa.String(length=50), nullable=False),
            sa.Column("remarks", sa.String(length=255), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.ForeignKeyConstraint(["employee_id"], ["employees.id"]),
            sa.ForeignKeyConstraint(["training_event_id"], ["training_events.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "training_event_id",
                "employee_id",
                name="uq_training_event_participant_employee",
            ),
        )


def downgrade() -> None:
    op.drop_table("training_event_participants")
    op.drop_table("training_events")
