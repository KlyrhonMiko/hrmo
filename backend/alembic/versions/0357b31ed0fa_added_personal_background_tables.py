"""Alembic migration script template.

Revision ID: 0357b31ed0fa
Revises: 283e0203248d
Create Date: 2026-04-15 22:45:01.943323

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0357b31ed0fa'
down_revision = '283e0203248d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "family_details" not in existing_tables:
        op.create_table(
            "family_details",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("surname", sa.String(length=100), nullable=False),
            sa.Column("first_name", sa.String(length=100), nullable=False),
            sa.Column("middle_name", sa.String(length=100), nullable=True),
            sa.Column("name_extension", sa.String(length=100), nullable=True),
            sa.Column("date_of_birth", sa.Date(), nullable=False),
            sa.Column("occupation", sa.String(length=100), nullable=True),
            sa.Column("employee_business_name", sa.String(length=100), nullable=True),
            sa.Column("business_address", sa.String(length=100), nullable=True),
            sa.Column("telephone_no", sa.String(length=20), nullable=True),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "educational_backgrounds" not in existing_tables:
        op.create_table(
            "educational_backgrounds",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("level", sa.String(length=100), nullable=False),
            sa.Column("school_name", sa.String(length=100), nullable=False),
            sa.Column("degree_course", sa.String(length=100), nullable=True),
            sa.Column("period_from", sa.Date(), nullable=False),
            sa.Column("period_to", sa.Date(), nullable=True),
            sa.Column("highest_level_attained", sa.String(length=100), nullable=True),
            sa.Column("year_graduated", sa.String(length=10), nullable=True),
            sa.Column("academic_awards", sa.String(length=100), nullable=True),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "other_information" not in existing_tables:
        op.create_table(
            "other_information",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("info_type", sa.String(length=50), nullable=False),
            sa.Column("information", sa.String(length=250), nullable=False),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "reference_records" not in existing_tables:
        op.create_table(
            "reference_records",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("address", sa.String(length=100), nullable=False),
            sa.Column("telephone_no", sa.String(length=20), nullable=False),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if "primary_government_ids" not in existing_tables:
        op.create_table(
            "primary_government_ids",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("id_type", sa.String(length=100), nullable=False),
            sa.Column("id_number", sa.String(length=100), nullable=False),
            sa.Column("date_of_issuance", sa.Date(), nullable=False),
            sa.Column("place_of_issuance", sa.String(length=100), nullable=False),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("basic_information_id"),
        )

    if "record_completions" not in existing_tables:
        op.create_table(
            "record_completions",
            sa.Column("id", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("is_deleted", sa.Boolean(), nullable=False),
            sa.Column("basic_information_id", sa.String(), nullable=False),
            sa.Column("date_of_accomplishment", sa.Date(), nullable=False),
            sa.ForeignKeyConstraint(["basic_information_id"], ["basic_information.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("basic_information_id"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    for table_name in [
        "record_completions",
        "primary_government_ids",
        "reference_records",
        "other_information",
        "educational_backgrounds",
        "family_details",
    ]:
        if table_name in existing_tables:
            op.drop_table(table_name)
