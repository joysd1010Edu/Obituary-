import { Suspense } from "react";
import type { Metadata } from "next";

import ObituaryListContainer from "../../../Component/public/obituary/ObituaryListContainer";

export const metadata: Metadata = {
  title: "Obituaries & Lives Remembered",
  description:
    "Browse Orbelofy obituary pages and online memorials with life stories, photos, funeral notices, condolences, and tribute details.",
  alternates: {
    canonical: "/obituary",
  },
  openGraph: {
    title: "Obituaries & Lives Remembered | Orbelofy",
    description:
      "Browse online memorials and obituary pages shared by families and friends on Orbelofy.",
    url: "/obituary",
  },
};

/**
 * Wrapper for the obituary listing page.
 *
 * @returns {JSX.Element} The obituary list container.
 */
export default function ObituaryListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading obituaries...</div>}>
      <ObituaryListContainer />
    </Suspense>
  );
}
