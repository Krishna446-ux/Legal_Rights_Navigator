"""replace document_chunk with legal_chunk

Revision ID: 57723bdc0e49
Revises: 2e76f1ae36a3
Create Date: 2026-07-13 01:03:34.026822

"""
from typing import Sequence, Union

from alembic import op
from pgvector.sqlalchemy import Vector
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '57723bdc0e49'
down_revision: Union[str, Sequence[str], None] = '2e76f1ae36a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Remove old table
    op.drop_table("document_chunks")



def downgrade() -> None:
    # Remove new index/table
    

    # Recreate old table
    op.create_table(
    "document_chunks",
    sa.Column("id", sa.UUID(), nullable=False),
    sa.Column("domain", sa.String(), nullable=False),
    sa.Column("source", sa.String(), nullable=True),
    sa.Column("content", sa.Text(), nullable=False),
    sa.Column("embedding", Vector(1024), nullable=False),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    sa.PrimaryKeyConstraint("id"),
    sa.UniqueConstraint("domain", "source", "content", name="uq_document_chunk"),
)
