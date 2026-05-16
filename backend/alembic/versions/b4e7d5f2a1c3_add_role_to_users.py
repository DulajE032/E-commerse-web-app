"""add role to users

Revision ID: b4e7d5f2a1c3
Revises: 7b1b3001f720
Create Date: 2026-05-15 22:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b4e7d5f2a1c3"
down_revision: Union[str, Sequence[str], None] = "7b1b3001f720"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role", sa.String(length=20), nullable=False, server_default="user"),
    )


def downgrade() -> None:
    op.drop_column("users", "role")
