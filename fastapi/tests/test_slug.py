from __future__ import annotations

import os
import unittest

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.core.database import Base
import app.models  # noqa: F401  (registers every table on Base.metadata)
from app.models.bouquet import Bouquet
from app.models.enums import FlowerType
from app.utils.slug import slugify, unique_slug


class SlugTests(unittest.TestCase):
    def test_slugify_builds_kebab_case_ascii(self):
        self.assertEqual(slugify("Pink Peony & Rose Mix"), "pink-peony-rose-mix")
        self.assertEqual(slugify("  Designer’s Choice!! "), "designers-choice")
        self.assertEqual(slugify("Café Crème"), "cafe-creme")

    def test_slugify_falls_back_for_non_latin_or_empty_names(self):
        self.assertEqual(slugify("Букет"), "item")
        self.assertEqual(slugify(""), "item")
        self.assertEqual(slugify(None), "item")

    def test_slugify_trims_long_names_without_trailing_dash(self):
        slug = slugify("rose " * 40)
        self.assertLessEqual(len(slug), 80)
        self.assertFalse(slug.endswith("-"))

    def test_unique_slug_appends_the_next_free_number(self):
        self.assertEqual(unique_slug("red-roses", []), "red-roses")
        self.assertEqual(unique_slug("red-roses", ["red-roses"]), "red-roses-2")
        self.assertEqual(
            unique_slug("red-roses", ["red-roses", "red-roses-2"]), "red-roses-3"
        )


def _product(name: str, catalog_type: str = "FLOWERS", **extra) -> Bouquet:
    return Bouquet(
        name=name,
        catalog_type=catalog_type,
        description="",
        price_cents=1000,
        flower_type=FlowerType.ROSE,
        style="ROSE",
        colors="",
        discount_percent=0,
        image="/images/a.webp",
        **extra,
    )


class SlugAssignmentTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite+pysqlite:///:memory:")
        Base.metadata.create_all(self.engine)

    def test_every_insert_gets_a_unique_slug_per_catalog(self):
        with Session(self.engine) as session:
            session.add_all(
                [
                    _product("Red Roses"),
                    _product("Red Roses"),
                    _product("Red Roses", catalog_type="BALOONS"),
                ]
            )
            session.commit()
            slugs = sorted(
                (row.catalog_type, row.slug) for row in session.query(Bouquet)
            )
        self.assertEqual(
            slugs,
            [("BALOONS", "red-roses"), ("FLOWERS", "red-roses"), ("FLOWERS", "red-roses-2")],
        )

    def test_renaming_keeps_the_original_slug(self):
        with Session(self.engine) as session:
            product = _product("Peony Muse")
            session.add(product)
            session.commit()
            product.name = "Peony Muse Deluxe"
            session.commit()
            self.assertEqual(product.slug, "peony-muse")


if __name__ == "__main__":
    unittest.main()
