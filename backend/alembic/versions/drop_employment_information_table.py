"""Drop employment_information table - merged into employees table.

Revision ID: drop_employment_info
Revises: 0357b31ed0fa
Create Date: 2026-04-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'drop_employment_info'
down_revision = '0357b31ed0fa'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Drop the employment_information table."""
    op.drop_table('employment_information')


def downgrade() -> None:
    """Restore the employment_information table."""
    op.create_table(
        'employment_information',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('basic_information_id', sa.String(36), nullable=False),
        sa.Column('office_department', sa.String(100), nullable=False),
        sa.Column('position_title', sa.String(100), nullable=False),
        sa.Column('employment_status', sa.String(50), nullable=False),
        sa.Column('date_hired', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.ForeignKeyConstraint(['basic_information_id'], ['basic_information.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('basic_information_id')
    )
