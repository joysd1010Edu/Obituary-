import type { Metadata } from "next";

import MemorialFlow from "../../../Component/public/memorial/MemorialFlow"

export const metadata: Metadata = {
  title: "Create an Online Memorial",
  description:
    "Create a thoughtful online memorial or obituary page with photos, life stories, funeral details, family tributes, and donation options.",
  alternates: {
    canonical: "/memorial",
  },
  openGraph: {
    title: "Create an Online Memorial | Orbelofy",
    description:
      "Build and share a meaningful online memorial page for a loved one with Orbelofy.",
    url: "/memorial",
  },
};

const page = () => {
  return <MemorialFlow />
}

export default page
