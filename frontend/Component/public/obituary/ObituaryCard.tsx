import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import {
  fallbackMemorableQuotes,
  type ObituaryMock,
} from "../../../lib/mockData";

interface ObituaryCardProps {
  item: ObituaryMock;
  variant?: "default" | "memorable";
}

/**
 * Renders a single obituary card.
 *
 * @param {ObituaryCardProps} props - Component props.
 * @returns {JSX.Element} The obituary card.
 */
export default function ObituaryCard({
  item,
  variant = "default",
}: ObituaryCardProps) {
  const heroImage = item.images?.[0] ?? "/placeholders/home-hero.svg";
  const formatCalendarDate = (date?: string) => {
    if (!date) return "Unknown";
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "Unknown";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  };
  const deathDate = formatCalendarDate(item.dateOfDeath);
  const locationLabel = [
    item.location.city,
    item.location.state,
    item.location.country,
  ]
    .filter(Boolean)
    .join(", ");
  const ageLabel = item.age ?? undefined;
  const detailHref = `/obituary/${item.id}`;

  if (variant === "memorable") {
    const fallbackQuote =
      fallbackMemorableQuotes[
        item.fallbackQuoteIndex ??
          Number(item.id) % fallbackMemorableQuotes.length
      ];
    const quoteText = item.memorialQuote ?? fallbackQuote.text;
    const quoteAuthor = item.memorialQuote ? null : fallbackQuote.author;

    return (
      <article className="h-full overflow-hidden rounded-md border border-[#d6d1c6] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
        <div className="grid h-full grid-cols-1 md:grid-cols-[1.08fr_0.92fr]">
          <div className="order-2 flex flex-col justify-center px-6 py-7 text-center md:order-1 md:px-8 md:py-8 md:text-left lg:px-10 lg:py-10">
            <div className="space-y-3 md:space-y-4">
              <Link href={detailHref} className="inline-block transition hover:text-[#16345a]">
                <h3 className="font-heading text-[1.95rem] font-semibold leading-tight tracking-[-0.035em] text-[#274877] sm:text-[2.3rem] lg:text-[2.55rem]">
                  {item.deceasedFirstName} {item.deceasedLastName}
                </h3>
              </Link>
              <p className="font-heading text-[1.25rem] tracking-[-0.02em] text-[#274877] sm:text-[1.45rem]">
                {deathDate}
              </p>
            </div>

            <blockquote className="mx-auto mt-7 max-w-md md:mx-0 md:mt-8">
              <p className="font-sans text-[1.08rem] leading-[1.48] text-[#34363b] sm:text-[1.18rem] lg:text-[1.22rem]">
                &quot;{quoteText}&quot;
              </p>
              {quoteAuthor ? (
                <footer className="mt-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#7d8794]">
                  — {quoteAuthor}
                </footer>
              ) : null}
            </blockquote>
          </div>

          <Link href={detailHref} className="order-1 relative block min-h-72 md:order-2 md:min-h-full" aria-label={`View memorial for ${item.deceasedFirstName} ${item.deceasedLastName}`}>
            <Image
              src={heroImage}
              alt={`${item.deceasedFirstName} ${item.deceasedLastName}`}
              fill
              className="object-cover object-center"
            />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group h-full overflow-hidden rounded-md border border-black/5 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.09)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,23,42,0.13)]">
      <Link href={detailHref} className="relative block aspect-square overflow-hidden bg-linear-to-br from-[#e7e3dc] via-white to-[#f0ece5]" aria-label={`View memorial for ${item.deceasedFirstName} ${item.deceasedLastName}`}>
        <Image
          src={heroImage}
          alt={`${item.deceasedFirstName} ${item.deceasedLastName}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.02)_0%,rgba(15,23,42,0)_50%,rgba(15,23,42,0.08)_100%)]" />
      </Link>

      <div className="space-y-3 border-t border-[#e8e0d4] p-5 text-left">
        <div className="space-y-1">
          <Link href={detailHref} className="inline-block transition hover:text-[#0f2743]">
            <h3 className="font-heading text-xl font-bold tracking-tight text-[#16345a]">
              {item.deceasedFirstName} {item.deceasedLastName}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {deathDate}
            </span>
          </div>
        </div>
          <div className="inline-flex items-center gap-1.5 text-base text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabel}
          </div>
       
        <p className="font-sans text-sm leading-6 text-slate-700">
          {item.biography?.length && item.biography.length > 50
            ? `${item.biography?.slice(0, 50)}...`
            : item.biography}
        </p>

        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-[#16345a] transition hover:text-[#0f2743]"
        >
          View Memorial
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
