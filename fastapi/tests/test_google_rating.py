from __future__ import annotations

import asyncio
import os
import unittest
from unittest import mock

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import httpx

from app.services import google_rating
from app.services.google_rating import GoogleRating, _parse, get_google_rating

SAMPLE = GoogleRating(rating=5.0, review_count=76, maps_url="https://maps.google.com/?cid=1")


class GoogleRatingTests(unittest.TestCase):
    def setUp(self):
        google_rating._cached = None
        google_rating._place_id = None
        google_rating._next_refresh = 0.0
        patcher = mock.patch.object(google_rating.settings, "google_maps_api_key", "key")
        patcher.start()
        self.addCleanup(patcher.stop)

    def run_lookup(self):
        return asyncio.run(get_google_rating())

    def test_parse_reads_places_fields(self):
        place = {"rating": 4.96, "userRatingCount": 76, "googleMapsUri": "u"}
        self.assertEqual(_parse(place), GoogleRating(5.0, 76, "u"))
        self.assertIsNone(_parse({"rating": 5}))

    def test_result_is_cached_between_calls(self):
        fetch = mock.AsyncMock(return_value=SAMPLE)
        with mock.patch.object(google_rating, "_fetch", fetch):
            self.assertEqual(self.run_lookup(), SAMPLE)
            self.assertEqual(self.run_lookup(), SAMPLE)
        fetch.assert_awaited_once()

    def test_last_good_value_survives_an_outage(self):
        with mock.patch.object(google_rating, "_fetch", mock.AsyncMock(return_value=SAMPLE)):
            self.run_lookup()
        google_rating._next_refresh = 0.0
        failing = mock.AsyncMock(side_effect=httpx.ConnectError("down"))
        with mock.patch.object(google_rating, "_fetch", failing):
            self.assertEqual(self.run_lookup(), SAMPLE)

    def test_without_api_key_nothing_is_requested(self):
        fetch = mock.AsyncMock()
        with mock.patch.object(google_rating.settings, "google_maps_api_key", None), \
                mock.patch.object(google_rating, "_fetch", fetch):
            self.assertIsNone(self.run_lookup())
        fetch.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
