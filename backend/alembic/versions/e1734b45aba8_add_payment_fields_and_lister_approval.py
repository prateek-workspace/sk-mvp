"""add_payment_fields_and_lister_approval

Revision ID: e1734b45aba8
Revises: 0b51f3443451
Create Date: 2026-01-03 02:39:55.264034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1734b45aba8'
down_revision: Union[str, None] = '0b51f3443451'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add payment fields to bookings table
    op.add_column('bookings', sa.Column('payment_id', sa.String(255), nullable=True))
    op.add_column('bookings', sa.Column('payment_screenshot', sa.Text(), nullable=True))
    
    # Add lister approval field to users table
    op.add_column('users', sa.Column('is_approved_lister', sa.Boolean(), default=False, nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove fields in reverse order
    op.drop_column('users', 'is_approved_lister')
    op.drop_column('bookings', 'payment_screenshot')
    op.drop_column('bookings', 'payment_id')
