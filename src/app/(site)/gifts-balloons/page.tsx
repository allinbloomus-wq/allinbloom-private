import { permanentRedirect } from "next/navigation";

/** Retain old links while sending visitors straight to the gifts catalog. */
export default function GiftsAndBalloonsPage() {
  permanentRedirect("/gifts");
}
