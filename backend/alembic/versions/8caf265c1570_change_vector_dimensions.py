"""change_vector_dimensions

Revision ID: 8caf265c1570
Revises: e9d1c0dfcc44
Create Date: 2026-06-06 18:23:15.655833

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = '8caf265c1570'
down_revision: Union[str, Sequence[str], None] = 'e9d1c0dfcc44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Truncate table to ensure no conversion issues
    op.execute("TRUNCATE TABLE document_chunks;")
    
    # Drop old 1536-dim column
    op.drop_column('document_chunks', 'embedding')
    
    # Create new 384-dim column
    op.add_column('document_chunks', sa.Column('embedding', Vector(dim=384), nullable=False))


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("TRUNCATE TABLE document_chunks;")
    
    # Drop 384-dim column
    op.drop_column('document_chunks', 'embedding')
    
    # Recreate 1536-dim column
    op.add_column('document_chunks', sa.Column('embedding', Vector(dim=1536), nullable=False))

