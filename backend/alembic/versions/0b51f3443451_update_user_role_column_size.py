"""update_user_role_column_size

Revision ID: 0b51f3443451
Revises: dfcdff326246
Create Date: 2026-01-03 01:39:10.847261

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b51f3443451'
down_revision: Union[str, None] = 'dfcdff326246'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alter the role column to support longer role names
    op.alter_column('users', 'role',
                   existing_type=sa.String(5),
                   type_=sa.String(20),
                   existing_nullable=True)


def downgrade() -> None:
    # Revert the role column back to original size
    op.alter_column('users', 'role',
                   existing_type=sa.String(20),
                   type_=sa.String(5),
                   existing_nullable=True)
