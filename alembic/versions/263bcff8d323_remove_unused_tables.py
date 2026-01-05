"""remove_unused_tables

Revision ID: 263bcff8d323
Revises: e1734b45aba8
Create Date: 2026-01-03 02:48:46.517405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '263bcff8d323'
down_revision: Union[str, None] = 'e1734b45aba8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop unused tables if they exist
    # Order matters due to foreign keys
    op.execute("DROP TABLE IF EXISTS cart_items CASCADE")
    op.execute("DROP TABLE IF EXISTS order_items CASCADE")
    op.execute("DROP TABLE IF EXISTS payments CASCADE")
    op.execute("DROP TABLE IF EXISTS product_attributes CASCADE")
    op.execute("DROP TABLE IF EXISTS product_images CASCADE")
    op.execute("DROP TABLE IF EXISTS product_variant_attributes CASCADE")
    op.execute("DROP TABLE IF EXISTS product_variants CASCADE")
    op.execute("DROP TABLE IF EXISTS carts CASCADE")
    op.execute("DROP TABLE IF EXISTS orders CASCADE")
    op.execute("DROP TABLE IF EXISTS products CASCADE")
    op.execute("DROP TABLE IF EXISTS attributes CASCADE")
    op.execute("DROP TABLE IF EXISTS addresses CASCADE")


def downgrade() -> None:
    # Cannot restore dropped tables
    pass
