"""add_profile_image_to_users

Revision ID: fa3913369356
Revises: 2433ff02c97d
Create Date: 2026-01-04 23:08:23.696479

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa3913369356'
down_revision: Union[str, None] = '2433ff02c97d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add profile_image column to users table
    op.add_column('users', sa.Column('profile_image', sa.String(500), nullable=True))


def downgrade() -> None:
    # Remove profile_image column from users table
    op.drop_column('users', 'profile_image')
