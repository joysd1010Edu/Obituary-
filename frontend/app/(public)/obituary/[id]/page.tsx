import type { Metadata } from "next";

import ObituaryDetailContainer from "../../../../Component/public/obituary_detail/ObituaryDetailContainer";
import {
  absoluteUrl,
  apiUrl,
  siteName,
  truncateDescription,
} from "../../../seo";

interface ObituaryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type Memorial = {
  name?: string;
  deathDate?: string;
  birthdate?: string;
  location?: string;
  memorialDetails?: string;
  lifeStory?: string;
  rememberForEverQuote?: string;
  deadPersonPhoto?: string[];
  publicationDate?: string;
  submittedAt?: string;
};

async function getMemorial(id: string): Promise<Memorial | null> {
  try {
    const response = await fetch(`${apiUrl}/memorials/${id}`, {
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { memorial?: Memorial };
    return data.memorial ?? null;
  } catch {
    return null;
  }
}

function getYear(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.getFullYear();
}

export async function generateMetadata({
  params,
}: ObituaryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const memorial = await getMemorial(id);
  const canonical = `/obituary/${id}`;

  if (!memorial?.name) {
    return {
      title: "Memorial",
      description: "Read an online memorial and obituary page on Orbelofy.",
      alternates: {
        canonical,
      },
    };
  }

  const birthYear = getYear(memorial.birthdate);
  const deathYear = getYear(memorial.deathDate);
  const years =
    birthYear || deathYear
      ? ` (${birthYear ?? ""}${birthYear && deathYear ? " - " : ""}${deathYear ?? ""})`
      : "";
  const title = `${memorial.name}${years} Obituary`;
  const description = truncateDescription(
    memorial.memorialDetails ||
      memorial.lifeStory ||
      memorial.rememberForEverQuote ||
      `Remembering ${memorial.name}${memorial.location ? ` of ${memorial.location}` : ""}. View their obituary, memorial details, photos, and tributes on Orbelofy.`,
  );
  const image = memorial.deadPersonPhoto?.[0] || absoluteUrl("/logo.png");

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonical,
      type: "article",
      publishedTime: memorial.publicationDate ?? memorial.submittedAt,
      images: [
        {
          url: image,
          alt: `${memorial.name} memorial photo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [image],
    },
  };
}

/**
 * Wrapper for the obituary detail page.
 *
 * @param {ObituaryDetailPageProps} props - Route props.
 * @returns {JSX.Element} The obituary detail container.
 */
export default async function ObituaryDetailPage({
  params,
}: ObituaryDetailPageProps) {
  const { id } = await params;

  return <ObituaryDetailContainer id={id} />;
}
