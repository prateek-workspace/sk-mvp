"""add_user_profile_fields

Revision ID: 6480c7703485
Revises: 263bcff8d323
Create Date: 2026-01-03 15:21:30.782731

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6480c7703485'
down_revision: Union[str, None] = '263bcff8d323'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new profile fields to users table
    op.add_column('users', sa.Column('phone_number', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('state', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('pincode', sa.String(length=10), nullable=True))


def downgrade() -> None:
    # Remove profile fields from users table
    op.drop_column('users', 'pincode')
    op.drop_column('users', 'state')
    op.drop_column('users', 'city')
    op.drop_column('users', 'address')
    op.drop_column('users', 'phone_number')
