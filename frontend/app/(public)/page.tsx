import type { Metadata } from "next";

import HomeContainer from "../../Component/public/home/HomeContainer";
import { defaultDescription, defaultTitle } from "../seo";

export const metadata: Metadata = {
  title: {
    absolute: defaultTitle,
  },
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
};

/**
 * Wrapper for the public homepage.
 *
 * @returns {JSX.Element} The homepage container.
 */
export default function HomePage() {
  return <HomeContainer />;
}
