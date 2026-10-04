from __future__ import annotations

import re
import unicodedata
from collections.abc import Iterable

MAX_SLUG_LENGTH = 80
FALLBACK_SLUG = "item"


def slugify(value: str | None) -> str:
    """Kebab-case ASCII slug: "Pink Peony & Rose Mix" -> "pink-peony-rose-mix"."""
    ascii_value = (
        unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode()
    )
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")
    slug = slug[:MAX_SLUG_LENGTH].rstrip("-")
    return slug or FALLBACK_SLUG


def unique_slug(base: str, taken: Iterable[str]) -> str:
    """Return ``base``, or ``base-2``, ``base-3``... when it is already taken."""
    used = set(taken)
    if base not in used:
        return base
    suffix = 2
    while f"{base}-{suffix}" in used:
        suffix += 1
    return f"{base}-{suffix}"
