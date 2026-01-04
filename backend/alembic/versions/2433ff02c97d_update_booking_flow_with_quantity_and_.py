"""update_booking_flow_with_quantity_and_payment_verification

Revision ID: 2433ff02c97d
Revises: a1ed16e7a052
Create Date: 2026-01-04 19:00:35.720142

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2433ff02c97d'
down_revision: Union[str, None] = 'a1ed16e7a052'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add quantity field to bookings
    op.add_column('bookings', sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'))
    
    # Add payment verification field
    op.add_column('bookings', sa.Column('payment_verified', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add payment verification date
    op.add_column('bookings', sa.Column('payment_verified_at', sa.DateTime(), nullable=True))
    
    # Update status column to include waitlist
    # status can now be: pending, waitlist, accepted, rejected
    
    # Create admin_settings table for QR code
    op.create_table(
        'admin_settings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('payment_qr_code', sa.Text(), nullable=True),
        sa.Column('payment_upi_id', sa.String(255), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True)
    )


def downgrade() -> None:
    op.drop_table('admin_settings')
    op.drop_column('bookings', 'payment_verified_at')
    op.drop_column('bookings', 'payment_verified')
    op.drop_column('bookings', 'quantity')
