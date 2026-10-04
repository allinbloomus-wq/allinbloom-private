"""Add a permanent public slug to catalog products.

Revision ID: 0029_bouquet_slug
Revises: 0028_order_recipient
"""

from alembic import op
import sqlalchemy as sa

from app.utils.slug import slugify, unique_slug


revision = "0029_bouquet_slug"
down_revision = "0028_order_recipient"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("Bouquet", sa.Column("slug", sa.String(), nullable=True))

    # Backfill existing products once, oldest first, so the earliest item of a
    # repeated name keeps the clean slug and later ones get -2, -3...
    connection = op.get_bind()
    rows = connection.execute(
        sa.text(
            'SELECT "id", "name", "catalogType" FROM "Bouquet" '
            'ORDER BY "createdAt" ASC, "id" ASC'
        )
    ).fetchall()
    taken: dict[str, set[str]] = {}
    for row in rows:
        used = taken.setdefault(row.catalogType, set())
        slug = unique_slug(slugify(row.name), used)
        used.add(slug)
        connection.execute(
            sa.text('UPDATE "Bouquet" SET "slug" = :slug WHERE "id" = :id'),
            {"slug": slug, "id": row.id},
        )

    op.create_unique_constraint(
        "uq_Bouquet_catalogType_slug", "Bouquet", ["catalogType", "slug"]
    )


def downgrade():
    op.drop_constraint("uq_Bouquet_catalogType_slug", "Bouquet", type_="unique")
    op.drop_column("Bouquet", "slug")
