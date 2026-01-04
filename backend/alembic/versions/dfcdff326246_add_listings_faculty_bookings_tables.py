"""add_listings_faculty_bookings_tables

Revision ID: dfcdff326246
Revises: 5edfd9cc1692
Create Date: 2026-01-03 01:19:22.530941

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfcdff326246'
down_revision: Union[str, None] = '5edfd9cc1692'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create listings table
    op.create_table(
        'listings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.Column('features', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )

    # Create faculty table
    op.create_table(
        'faculty',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('listings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('subject', sa.String(255), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
    )

    # Create bookings table
    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('listing_id', sa.Integer(), sa.ForeignKey('listings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(50), server_default='pending', nullable=False),
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('bookings')
    op.drop_table('faculty')
    op.drop_table('listings')
