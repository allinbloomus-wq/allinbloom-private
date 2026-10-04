"""Google Business Profile rating, fetched from the Places API (New).

The storefront shows the public Google star rating and review count. They
change slowly, so one lookup a day is enough: the result is cached in process
memory and the last good value is kept when Google is unreachable.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

PLACES_URL = "https://places.googleapis.com/v1"
# Used to find the profile when GOOGLE_PLACE_ID is not configured.
PLACE_QUERY = "All in Bloom, 224 S Milwaukee Ave, Wheeling, IL 60090"
FIELDS = "id,rating,userRatingCount,googleMapsUri"
CACHE_SECONDS = 24 * 60 * 60
RETRY_SECONDS = 60 * 60


@dataclass(frozen=True)
class GoogleRating:
    rating: float
    review_count: int
    maps_url: str | None


_cached: GoogleRating | None = None
_place_id: str | None = None
_next_refresh = 0.0


def _parse(place: dict) -> GoogleRating | None:
    rating = place.get("rating")
    count = place.get("userRatingCount")
    if rating is None or not count:
        return None
    return GoogleRating(
        rating=round(float(rating), 1),
        review_count=int(count),
        maps_url=place.get("googleMapsUri"),
    )


async def _fetch(api_key: str) -> GoogleRating | None:
    global _place_id
    headers = {"X-Goog-Api-Key": api_key}
    place_id = settings.google_place_id or _place_id
    async with httpx.AsyncClient(timeout=10) as client:
        if place_id:
            response = await client.get(
                f"{PLACES_URL}/places/{place_id}",
                headers={**headers, "X-Goog-FieldMask": FIELDS},
            )
            response.raise_for_status()
            place = response.json()
        else:
            response = await client.post(
                f"{PLACES_URL}/places:searchText",
                headers={
                    **headers,
                    "X-Goog-FieldMask": ",".join(f"places.{f}" for f in FIELDS.split(",")),
                },
                json={"textQuery": PLACE_QUERY, "pageSize": 1},
            )
            response.raise_for_status()
            places = response.json().get("places") or []
            if not places:
                return None
            place = places[0]
            _place_id = place.get("id")
    return _parse(place)


async def get_google_rating() -> GoogleRating | None:
    """Cached rating, or None when the API is not configured or never answered."""
    global _cached, _next_refresh
    api_key = settings.google_maps_api_key
    if not api_key:
        return None
    now = time.monotonic()
    if now < _next_refresh:
        return _cached
    try:
        fresh = await _fetch(api_key)
    except (httpx.HTTPError, ValueError) as error:
        logger.warning("Google rating lookup failed: %s", error)
        fresh = None
    if fresh:
        _cached = fresh
        _next_refresh = now + CACHE_SECONDS
    else:
        _next_refresh = now + RETRY_SECONDS
    return _cached
