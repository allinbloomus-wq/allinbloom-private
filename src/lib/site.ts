export const SITE_NAME = "All in Bloom Floral Studio";
export const SITE_TAGLINE = "Same-day flower delivery in Wheeling, IL and nearby suburbs.";
export const SITE_DESCRIPTION =
  "Same-day flower delivery in Wheeling, IL and nearby suburbs: Buffalo Grove, Arlington Heights, Northbrook and more. Fresh bouquets, balloons and gift boxes.";
export const SITE_KEYWORDS = [
  "flower delivery Wheeling IL",
  "same-day flower delivery",
  "flower delivery near me",
  "florist Wheeling IL",
  "flower shop near me",
  "balloons Wheeling IL",
  "Buffalo Grove florist",
  "Arlington Heights flower delivery",
  "Buffalo Grove flower delivery",
  "Northbrook flower delivery",
  "Northwest suburbs florist",
  "gift boxes",
  "All in Bloom Floral Studio",
  "All in Bloom",
  "All in Bloom flowers",
  "allinbloom",
  "allinbloom flowers",
  "All in Bloom Wheeling",
];

// Spellings people search for the brand. Used as schema.org alternateName so
// Google treats them as the same entity and site name.
export const SITE_ALTERNATE_NAMES = [
  "All in Bloom",
  "All in Bloom Flowers",
  "AllinBloom",
  "All inBloom",
  "allinbloom.us",
];

export const SITE_EMAIL = "allinbloom.us@gmail.com";
export const SITE_PHONE = "+1-224-213-3823";
export const SITE_PHONE_DISPLAY = "(224) 213-3823";
export const SITE_ADDRESS_LINE_1 = "224 S Milwaukee Ave";
export const SITE_CITY = "Wheeling";
export const SITE_REGION = "IL";
export const SITE_POSTAL_CODE = "60090";
export const SITE_COUNTRY = "US";
export const SITE_HOURS = [
  { label: "Monday–Friday", hours: "8:30 AM–5:00 PM" },
  { label: "Saturday", hours: "10:00 AM–6:00 PM" },
  { label: "Sunday", hours: "Closed" },
] as const;
export const SITE_INSTAGRAM =
  "https://www.instagram.com/all_in_bloom_studio";
// Google Business Profile, addressed by its stable CID.
export const SITE_GOOGLE_PROFILE =
  "https://maps.google.com/?cid=7000307934662495619";
// Replace with the "Ask for reviews" link from the Business Profile to open
// the review form directly; the profile link works as a fallback.
export const SITE_GOOGLE_REVIEW_URL = SITE_GOOGLE_PROFILE;
export const SITE_YELP =
  "https://www.yelp.com/biz/all-in-bloom-floral-studio-wheeling-2";
// Official third-party listings of the same business (schema.org sameAs).
export const SITE_PROFILES = [
  SITE_INSTAGRAM,
  SITE_GOOGLE_PROFILE,
  SITE_YELP,
  "https://www.doordash.com/store/all-in-bloom-floral-studio-wheeling-46831931/",
];
export const SITE_GEO = {
  latitude: 42.136281087564285,
  longitude: -87.9050852153543,
} as const;
export const SITE_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE_ADDRESS_LINE_1}, ${SITE_CITY}, ${SITE_REGION} ${SITE_POSTAL_CODE}`
)}`;
export const SITE_DELIVERY_AREAS = [
  "Wheeling",
  "Buffalo Grove",
  "Arlington Heights",
  "Prospect Heights",
  "Rolling Meadows",
  "Mount Prospect",
  "Palatine",
  "Northbrook",
  "Glenview",
  "Lincolnshire",
  "Deerfield",
  "Vernon Hills",
  "Mundelein",
  "Lake Zurich",
  "Barrington",
  "Schaumburg",
  "Hoffman Estates",
  "Elk Grove Village",
  "Des Plaines",
  "Park Ridge",
  "Niles",
  "Morton Grove",
  "Skokie",
  "Evanston",
] as const;

const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://allinbloom.us";

export const SITE_ORIGIN = RAW_SITE_URL.startsWith("http")
  ? RAW_SITE_URL
  : `https://${RAW_SITE_URL}`;
