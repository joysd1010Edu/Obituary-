"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaFacebookF,
  FaFacebookMessenger,
  FaEnvelope,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRedditAlien,
  FaTelegramPlane,
  FaWhatsapp,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6";
import { FiCopy } from "react-icons/fi";
import { Info, MailPlus, Send } from "lucide-react";

import { useAxios } from "../../../context/AxiosProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

import CondolenceSection from "./CondolenceSection";

const AUTO_DELAY = 2200;
const VISIBLE_SLIDES = 3;
const INFO_UPDATE_EMAIL = "info@orbelofyfuneralcare.com";
const TRIBUTE_IMAGES = {
  candle: "https://pngimg.com/uploads/candle/candle_PNG7305.png",
  flower:
    "https://www.pngmart.com/files/17/Wreath-Funeral-Flowers-Transparent-Background.png",
} as const;

type TributeType = keyof typeof TRIBUTE_IMAGES;

type TributeItem = {
  id: string;
  type: TributeType;
  text: string;
};

interface MemorialData {
  _id: string;
  name: string;
  deathDate?: string;
  birthdate?: string;
  location?: string;
  country?: string;
  memorialDetails?: string;
  memorialDetailVisibilityStatus?: boolean;
  familyDetails?: string;
  familyDetailVisibilityStatus?: boolean;
  lifeStory?: string;
  lifeStoryVisibilityStatus?: boolean;
  rememberForEverQuote?: string;
  rememberForEverQuoteVisibilityStatus?: boolean;
  favouriteQuote?: string;
  favouriteQuoteVisibilityStatus?: boolean;
  careerSummery?: string;
  careerSummeryVisibilityStatus?: boolean;
  donationsEnabled?: boolean;
  funeralHomeLogo?: string;
  deadPersonPhoto?: string[];
  familyTreeDiagram?: string;
  relationToDeceased?: string;
  funeralHomeDetails?: {
    name?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    mapLink?: string;
  };
  funeralNotice?: {
    serviceDate?: string;
    serviceLocation?: string;
    serviceName?: string;
    serviceMapLink?: string;
    ReceptionDate?: string;
    ReceptionLocation?: string;
    ReceptionName?: string;
    ReceptionMapLink?: string;
  };
  funeralHomeAdvertisement?: { adImage: string; link: string }[];
}

interface ObituaryDetailContainerProps {
  id: string;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Ensure a URL has a proper scheme so it opens externally */
function normalizeUrl(url?: string): string {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function getTributeLabel(type: TributeType): string {
  return type === "candle" ? "Candle" : "Flower";
}

function buildSlides(images: string[]): string[] {
  if (images.length === 0) return [];
  if (images.length >= VISIBLE_SLIDES) return images;
  const slides = [...images];
  while (slides.length < VISIBLE_SLIDES) {
    slides.push(images[slides.length % images.length]);
  }
  return slides;
}

function ObituaryImageCarousel({ images }: { images: string[] }) {
  const slides = useMemo(() => buildSlides(images), [images]);
  const [current, setCurrent] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  if (!slides.length) return null;

  const showControls = images.length > 1;

  return (
    <>
      {/* DESKTOP SLIDER */}
      <div className="relative mx-auto hidden w-full max-w-7xl overflow-hidden py-14 md:block">
        {showControls && (
          <>
            <button type="button" onClick={prevSlide}
              className="absolute left-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">‹</button>
            <button type="button" onClick={nextSlide}
              className="absolute right-4 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-5xl text-slate-700 transition-all duration-300 hover:scale-105 hover:bg-neutral-300">›</button>
          </>
        )}
        <div className="relative h-160 overflow-hidden">
          <div className="flex h-full items-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(calc(50% - ${current * 33.333 + 16.666}%))` }}>
            {slides.map((image, index) => {
              const isActive = index === current;
              return (
                <div key={`${image}-${index}`}
                  className={`w-1/3 shrink-0 transition-all duration-700 ${isActive ? "z-30 scale-100 opacity-100" : "z-10 scale-[0.72] opacity-55"}`}>
                  <div className={`relative mx-auto overflow-hidden rounded-[34px] transition-all duration-700 ${isActive ? "h-155 w-107.5" : "h-125 w-85"}`}>
                    <Image src={image} alt={`Slide ${index + 1}`} fill priority={isActive} className="object-cover" sizes="33vw" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE SLIDER */}
      <div className="relative mx-auto block w-full overflow-hidden py-8 md:hidden">
        {showControls && (
          <>
            <button type="button" onClick={prevSlide}
              className="absolute left-1/2 top-4 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">‹</button>
            <button type="button" onClick={nextSlide}
              className="absolute bottom-4 left-1/2 z-50 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-200/90 text-3xl text-slate-700">›</button>
          </>
        )}
        <div className="relative h-130 overflow-hidden">
          {slides.map((image, index) => {
            const isActive = index === current;
            return (
              <div key={`${image}-${index}`}
                className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isActive ? "translate-y-0 opacity-100 z-30" : index < current ? "-translate-y-full opacity-0 z-10" : "translate-y-full opacity-0 z-10"}`}>
                <div className="relative mx-auto h-full w-[92%] overflow-hidden rounded-[30px]">
                  <Image src={image} alt={`Slide ${index + 1}`} fill className="object-cover" priority={isActive} sizes="100vw" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function ObituaryDetailContainer({ id }: ObituaryDetailContainerProps) {
  const [memorial, setMemorial] = useState<MemorialData | null>(null);
  const [isFamilyTreeOpen, setIsFamilyTreeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAddInfoOpen, setIsAddInfoOpen] = useState(false);
  const [isTributeOpen, setIsTributeOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [tributes, setTributes] = useState<TributeItem[]>([]);
  const [tributeType, setTributeType] = useState<TributeType>("candle");
  const [tributeText, setTributeText] = useState("");
  const [tributeName, setTributeName] = useState("");
  const [tributeEmail, setTributeEmail] = useState("");
  const [isSubmittingTribute, setIsSubmittingTribute] = useState(false);

  const api = useAxios();

  useEffect(() => {
    const fetchMemorial = async () => {
      try {
        const res = await api.get(`/memorials/${id}`);
        const m = res.data.memorial;
        if (m) setMemorial(m);
      } catch (err) {
        console.error("Failed to fetch memorial:", err);
      }
    };
    fetchMemorial();
  }, [id, api]);

  useEffect(() => {
    const fetchCondolences = async () => {
      try {
        const res = await api.get(`/condolences/${id}`);
        const data = res.data.condolences || [];
        setTributes(data.map((c: any) => ({ id: c._id, type: c.type, text: c.message })));
      } catch (err) {
        console.error("Failed to fetch condolences:", err);
      }
    };
    fetchCondolences();
  }, [id, api]);

  useEffect(() => { setShareUrl(window.location.href); }, []);

  const nameParts = memorial?.name ? memorial.name.split(" ") : [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const cityPart = memorial?.location ? memorial.location.split(",")[0]?.trim() : "";

  const photos = memorial?.deadPersonPhoto || [];
  const detailImages = useMemo(() => buildSlides(photos).slice(0, 3), [photos]);

  const shareTitle = memorial ? `${firstName} ${lastName}` : "Memorial page";
  const shareText = `View the memorial page for ${shareTitle}`;
  const encodedShareUrl = encodeURIComponent(shareUrl || "");
  const encodedShareText = encodeURIComponent(shareText);
  const infoUpdateSubject = encodeURIComponent(`Information update for ${shareTitle}`);
  const infoUpdateBody = encodeURIComponent(
    [
      `Hello Orbelofy Funeral Care team,`,
      "",
      `I would like to request an information update for the memorial page of ${shareTitle}.`,
      "",
      `Memorial page: ${shareUrl || ""}`,
      "",
      "Requested update:",
      "",
      "Your name:",
      "Your relationship to the deceased:",
      "Your contact number:",
    ].join("\n"),
  );
  const infoUpdateMailto = `mailto:${INFO_UPDATE_EMAIL}?subject=${infoUpdateSubject}&body=${infoUpdateBody}`;

  const openShareUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  const handleNativeShare = async () => {
    if (navigator.share && shareUrl) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        return;
      }
    }

    openShareUrl(shareUrl || window.location.href);
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleAddTribute = async () => {
    const text = tributeText.trim();
    if (!text || !tributeName.trim() || !tributeEmail.trim()) { alert("Please fill in all fields."); return; }
    setIsSubmittingTribute(true);
    try {
      const res = await api.post(`/condolences/${id}`, { submitterEmail: tributeEmail, submitterName: tributeName, message: text, type: tributeType });
      setTributes((current) => [{ id: res.data.condolence._id, type: tributeType, text }, ...current]);
      setTributeText(""); setTributeName(""); setTributeEmail(""); setTributeType("candle");
      setIsTributeOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit tribute. Please try again.");
    } finally {
      setIsSubmittingTribute(false);
    }
  };

  if (!memorial) {
    return <div className="rounded-2xl border border-black/5 bg-white p-6 text-slate-600">Loading memorial details...</div>;
  }

  const fhd = memorial.funeralHomeDetails || {};
  const fn = memorial.funeralNotice || {};
  const funeralAds = (memorial.funeralHomeAdvertisement || []).filter(ad => ad.adImage && ad.link);

  // Visibility checks
  const showMemorialDetails = memorial.memorialDetailVisibilityStatus !== false;
  const showFamilyDetails = memorial.familyDetailVisibilityStatus !== false;
  const showLifeStory = memorial.lifeStoryVisibilityStatus !== false;
  const showRememberQuote = memorial.rememberForEverQuoteVisibilityStatus !== false;
  const showFavouriteQuote = memorial.favouriteQuoteVisibilityStatus !== false;
  const showCareerSummery = memorial.careerSummeryVisibilityStatus !== false;
  const donationsEnabled = memorial.donationsEnabled !== false;

  return (
    <main className="min-h-screen text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto lg:space-y-10">
        <section className="space-y-5 text-center">
          {/* FUNERAL HOME LOGO */}
          {memorial.funeralHomeLogo && (
            <div className="flex justify-center">
              <Image
                src={memorial.funeralHomeLogo}
                alt="Funeral home logo"
                width={333}
                height={67}
                priority
                className="h-auto w-full max-w-xs object-contain sm:max-w-sm"
              />
            </div>
          )}

          {/* DECEASED PHOTOS CAROUSEL */}
          <ObituaryImageCarousel images={photos} />

          <div className="space-y-2 pt-1">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#304d7a] sm:text-4xl">
              {firstName} {lastName}
            </h1>
            <p className="text-sm text-slate-500 sm:text-base">
              {formatDate(memorial.deathDate)}
            </p>
            {(cityPart || memorial.country) && (
              <p className="text-sm text-slate-500 sm:text-base">
                {[cityPart, memorial.country].filter(Boolean).join(", ")}
              </p>
            )}
            {/* Quote — respect visibility */}
            {showRememberQuote && memorial.rememberForEverQuote && (
              <p className="mx-auto max-w-2xl px-4 font-serif text-base italic leading-7 text-slate-600 sm:text-lg">
                &ldquo;{memorial.rememberForEverQuote}&rdquo;
              </p>
            )}
            {!showRememberQuote && showFavouriteQuote && memorial.favouriteQuote && (
              <p className="mx-auto max-w-2xl px-4 font-serif text-base italic leading-7 text-slate-600 sm:text-lg">
                &ldquo;{memorial.favouriteQuote}&rdquo;
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {memorial.familyTreeDiagram && (
              <button type="button" onClick={() => setIsFamilyTreeOpen(true)}
                className="inline-flex min-w-36 items-center justify-center rounded-lg bg-[#274877] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1f3a60]">
                Family Tree
              </button>
            )}
            <button type="button" onClick={() => setIsShareOpen(true)}
              className="inline-flex min-w-36 items-center justify-center rounded-lg border border-[#274877] bg-white px-5 py-3 text-sm font-semibold text-[#274877] shadow-sm transition hover:bg-[#f4f7fb]">
              Share
            </button>
            <button type="button" onClick={() => setIsAddInfoOpen(true)}
              className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg border border-[#274877] bg-white px-5 py-3 text-sm font-semibold text-[#274877] shadow-sm transition hover:bg-[#f4f7fb]">
              <MailPlus className="h-4 w-4" />
              Add Info
            </button>
          </div>
        </section>

        <section className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">

            {/* MEMORIAL DETAILS / OBITUARY */}
            {showMemorialDetails && memorial.memorialDetails && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[2rem]">Obituary</h2>
                <p className="mt-4 max-w-none text-[15px] leading-8 tracking-[0.01em] text-slate-600 sm:text-[16px]">
                  {memorial.memorialDetails}
                </p>
              </div>
            )}

            {/* LIFE STORY */}
            {showLifeStory && memorial.lifeStory && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[2rem]">Life Story</h2>
                <p className="mt-4 text-[15px] leading-8 text-slate-600 sm:text-[16px]">{memorial.lifeStory}</p>
              </div>
            )}

            {/* FAMILY DETAILS */}
            {showFamilyDetails && memorial.familyDetails && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[2rem]">Family</h2>
                <p className="mt-4 text-[15px] leading-8 text-slate-600 sm:text-[16px]">{memorial.familyDetails}</p>
              </div>
            )}

            {/* CAREER SUMMARY */}
            {showCareerSummery && memorial.careerSummery && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[2rem]">Career</h2>
                <p className="mt-4 text-[15px] leading-8 text-slate-600 sm:text-[16px]">{memorial.careerSummery}</p>
              </div>
            )}

            {/* FAVOURITE QUOTE */}
            {showFavouriteQuote && memorial.favouriteQuote && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[2rem]">Favourite Quote</h2>
                <p className="mt-4 font-serif text-lg italic text-slate-600">&ldquo;{memorial.favouriteQuote}&rdquo;</p>
              </div>
            )}

            {/* FUNERAL HOME DETAILS */}
            {(fhd.name || fhd.address || fhd.email || fhd.phone || fhd.website) && (
              <div className="rounded-[14px] border border-black/10 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-8">
                <h2 className="font-serif text-2xl tracking-tight text-slate-900 sm:text-[1.9rem]">
                  {fhd.name || "Funeral Home"}
                </h2>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  <div className="space-y-4 text-[15px] leading-7 text-[#cc5f0b]">
                    {fhd.address && <p>{fhd.address}</p>}
                  </div>
                  <div className="space-y-4 text-[15px] leading-7 text-[#cc5f0b]">
                    {fhd.website && (
                      <p className="flex items-center gap-3">
                        <FaGlobeAmericas className="h-4 w-4 shrink-0" />
                        <a href={normalizeUrl(fhd.website)} target="_blank" rel="noreferrer noopener" className="hover:underline">{fhd.website}</a>
                      </p>
                    )}
                    {fhd.email && (
                      <p className="flex items-center gap-3">
                        <FaEnvelope className="h-4 w-4 shrink-0" />
                        <span>{fhd.email}</span>
                      </p>
                    )}
                    {fhd.phone && (
                      <p className="flex items-center gap-3">
                        <FaPhoneAlt className="h-4 w-4 shrink-0" />
                        <span>{fhd.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
                {fhd.mapLink && (
                  <a href={normalizeUrl(fhd.mapLink)} target="_blank" rel="noreferrer noopener"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#cc5f0b] px-6 py-3 text-sm font-semibold text-[#cc5f0b] transition hover:bg-[#fff4eb]">
                    View Funeral Home Map <FaMapMarkerAlt className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR — funeral home ads only */}
          {funeralAds.length > 0 && (
            <div className="grid gap-4 lg:w-60 lg:flex-none">
              {funeralAds.map((ad, index) => (
                <a key={`ad-${index}`} href={normalizeUrl(ad.link)} target="_blank" rel="noreferrer noopener"
                  className="group block overflow-hidden rounded-[14px] border border-black/5 bg-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
                  <div className="relative aspect-4/3 w-full">
                    <Image src={ad.adImage} alt={`Ad ${index + 1}`} fill className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* FUNERAL NOTICE SECTION */}
        {(fn.serviceName || fn.serviceDate || fn.ReceptionName || fn.ReceptionDate) && (
          <section className="mx-auto max-w-6xl rounded-[22px] py-6 sm:py-7">
            <h2 className="font-serif text-3xl text-[#1f1630] sm:text-4xl">
              Funeral notice of {firstName} {lastName}
            </h2>

            <div className="mt-8 rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      donationsEnabled
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {donationsEnabled ? "Donations receiving" : "Donations paused"}
                  </span>
                  <p className="mt-3 font-serif text-lg leading-7 text-[#2b2137]">
                    {donationsEnabled
                      ? `In memory of ${firstName}, donations will be directed to trusted charitable causes that reflect their values and bring comfort to others.`
                      : `Donation receiving is currently turned off for ${firstName}.`}
                  </p>
                </div>
                {donationsEnabled && (
                  <Link href={`/obituary/${id}/donate`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#cf142b] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b81125]">
                    <span className="text-base">♡</span> Donate
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* SERVICE */}
              {(fn.serviceName || fn.serviceDate || fn.serviceLocation) && (
                <div className="rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-5">
                  <h3 className="font-serif text-xl font-semibold text-[#2b2137]">{fn.serviceName || "Service"}</h3>
                  <div className="mt-7 space-y-5 text-[#2b2137]">
                    {fn.serviceDate && (
                      <div className="flex items-start gap-3">
                        <FaCalendarAlt className="mt-0.5 h-5 w-5 text-[#2b2137]" />
                        <p className="text-sm">{formatDate(fn.serviceDate)}</p>
                      </div>
                    )}
                    {fn.serviceLocation && (
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="mt-0.5 h-5 w-5 text-[#2b2137]" />
                        <p className="text-sm leading-6">{fn.serviceLocation}</p>
                      </div>
                    )}
                  </div>
                  {fn.serviceMapLink && (
                    <a href={normalizeUrl(fn.serviceMapLink)} target="_blank" rel="noreferrer noopener"
                      className="mt-6 text-sm font-semibold text-[#a46a3d] transition hover:text-[#8a562c]">
                      Get directions
                    </a>
                  )}
                </div>
              )}

              {/* RECEPTION */}
              {(fn.ReceptionName || fn.ReceptionDate || fn.ReceptionLocation) && (
                <div className="rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.06)] sm:p-5">
                  <h3 className="font-serif text-xl font-semibold text-[#2b2137]">{fn.ReceptionName || "Reception"}</h3>
                  <div className="mt-7 space-y-5 text-[#2b2137]">
                    {fn.ReceptionDate && (
                      <div className="flex items-start gap-3">
                        <FaCalendarAlt className="mt-0.5 h-5 w-5 text-[#2b2137]" />
                        <p className="text-sm">{formatDate(fn.ReceptionDate)}</p>
                      </div>
                    )}
                    {fn.ReceptionLocation && (
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="mt-0.5 h-5 w-5 text-[#2b2137]" />
                        <p className="text-sm leading-6">{fn.ReceptionLocation}</p>
                      </div>
                    )}
                  </div>
                  {fn.ReceptionMapLink && (
                    <a href={normalizeUrl(fn.ReceptionMapLink)} target="_blank" rel="noreferrer noopener"
                      className="mt-8 text-lg font-semibold text-[#a46a3d] transition hover:text-[#8a562c]">
                      Get directions
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}



        {/* TRIBUTES */}
        <section className="mx-auto max-w-6xl rounded-[26px] bg-[#fbf7f1] px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button type="button" onClick={() => setIsTributeOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#274877] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f3a60]">
              <span className="inline-block text-lg leading-none">◌</span> Leave a Tribute
            </button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-10">
            {tributes.map((tribute) => (
              <article key={tribute.id} className="w-full max-w-60 sm:w-[46%] lg:w-[30%]">
                <div className="group max-w-40 mx-auto relative overflow-hidden rounded-[12px]">
                  <div className="relative aspect-3/3 w-full overflow-hidden rounded-[12px]">
                    <Image src={TRIBUTE_IMAGES[tribute.type]} alt={`${getTributeLabel(tribute.type)} tribute`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0" />
                    <img src="https://png.pngtree.com/png-clipart/20230428/original/pngtree-watercolor-white-flower-bouquet-transparent-png-image_9118510.png" alt="" className="pointer-events-none absolute bottom-0 left-0 w-28 opacity-45" />
                    <img src="https://pngimg.com/d/candle_PNG50074.png" alt="" className="pointer-events-none absolute bottom-2 right-2 w-16 opacity-40" />
                  </div>
                </div>
                <p className="mt-3 text-center font-serif text-[19px] leading-6 tracking-tight text-slate-900">{tribute.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* FAMILY TREE DIALOG */}
      <Dialog open={isFamilyTreeOpen} onOpenChange={setIsFamilyTreeOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-5xl p-0 sm:max-w-5xl">
          <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <DialogHeader>
              <DialogTitle>Family Tree of {firstName} {lastName}</DialogTitle>
              <DialogDescription>Visual family tree image for {firstName} {lastName}.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-[#f8f2e8] p-4 shadow-inner">
              {memorial.familyTreeDiagram ? (
                <img src={memorial.familyTreeDiagram} alt={`Family tree of ${firstName} ${lastName}`} className="h-auto w-full rounded-2xl" />
              ) : (
                <p className="text-center text-slate-500 py-12">No family tree diagram available.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ADD INFO DIALOG */}
      <Dialog open={isAddInfoOpen} onOpenChange={setIsAddInfoOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-xl p-0 sm:max-w-xl">
          <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white px-5 py-5 sm:px-6 sm:py-6">
            <DialogHeader className="items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8ead0] text-[#9f7427] shadow-sm transition duration-300 hover:scale-105 hover:bg-[#f2dfb9] hover:shadow-md">
                <Info className="h-6 w-6" />
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                Add or update missing memorial information/photos
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-slate-600">
                If you would like to add missing details, correct an existing detail, or provide additional context for this memorial, please contact our care team by email.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-xl border border-[#ead9b8] bg-[#fffaf0] p-4 text-sm leading-6 text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-[#d8bd84] hover:shadow-md">
              <p className="font-semibold text-slate-950">Please include:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>The memorial name and page link</li>
                <li>The information or photos you would like added or corrected</li>
                <li>Your name and relationship to the deceased</li>
              </ul>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#274877]/30 hover:bg-white hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact email</p>
              <p className="mt-1 break-all text-base font-semibold text-[#274877]">{INFO_UPDATE_EMAIL}</p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setIsAddInfoOpen(false)}>
                Close
              </Button>
              <a
                href={infoUpdateMailto}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#274877] px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#1f3a60] hover:shadow-lg"
              >
                <Send className="h-4 w-4" />
                Compose Update Email
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SHARE DIALOG */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-135 p-0 sm:max-w-135">
          <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white px-5 py-4 sm:px-6 sm:py-5">
            <DialogHeader className="flex-row items-center justify-between gap-4">
              <DialogTitle className="text-xl font-semibold text-slate-900">Share</DialogTitle>
            </DialogHeader>
            <div className="mt-4 border-t border-slate-200 pt-5">
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: "X", icon: FaXTwitter, bg: "bg-slate-100 text-slate-950", onClick: () => openShareUrl(`https://x.com/intent/tweet?text=${encodedShareText}&url=${encodedShareUrl}`) },
                  { label: "Facebook", icon: FaFacebookF, bg: "bg-blue-50 text-[#1877f2]", onClick: () => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`) },
                  { label: "Reddit", icon: FaRedditAlien, bg: "bg-orange-100 text-[#ff4500]", onClick: () => openShareUrl(`https://www.reddit.com/submit?url=${encodedShareUrl}&title=${encodedShareText}`) },
                  { label: "Instagram", icon: FaInstagram, bg: "bg-pink-100 text-[#c13584]", onClick: handleNativeShare },
                  { label: "Whatsapp", icon: FaWhatsapp, bg: "bg-emerald-100 text-[#25d366]", onClick: () => openShareUrl(`https://wa.me/?text=${encodedShareText}%20${encodedShareUrl}`) },
                  { label: "Messenger", icon: FaFacebookMessenger, bg: "bg-indigo-100 text-[#006aff]", onClick: () => openShareUrl(`https://www.messenger.com/`) },
                  { label: "Telegram", icon: FaTelegramPlane, bg: "bg-sky-100 text-[#229ed9]", onClick: () => openShareUrl(`https://t.me/share/url?url=${encodedShareUrl}&text=${encodedShareText}`) },
                  { label: "TikTok", icon: FaTiktok, bg: "bg-zinc-100 text-zinc-950", onClick: handleNativeShare },
                ].map(({ label, icon: Icon, bg, onClick }) => (
                  <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-2">
                    <span className={`flex h-16 w-16 items-center justify-center rounded-full ${bg}`}><Icon className="h-7 w-7" /></span>
                    <span className="text-sm text-slate-700">{label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Page Link</p>
                  <span className="text-xs font-semibold text-[#ff5a1f]">{copied ? "link copied" : ""}</span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-[#ece7e6] px-4 py-2">
                  <input readOnly value={shareUrl} className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none" />
                  <button type="button" onClick={handleCopyLink} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-700 transition hover:bg-white" aria-label="Copy link">
                    <FiCopy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={() => setIsShareOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* TRIBUTE DIALOG */}
      <Dialog open={isTributeOpen} onOpenChange={setIsTributeOpen}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-xl p-0 sm:max-w-xl">
          <div className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white px-5 py-5 sm:px-6 sm:py-6">
            <DialogHeader>
              <DialogTitle>Add Tribute</DialogTitle>
              <DialogDescription>Choose a candle or flower tribute and write a condolence note.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Your Name</label>
                <input type="text" value={tributeName} onChange={(e) => setTributeName(e.target.value)} placeholder="John Doe" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Your Email</label>
                <input type="email" value={tributeEmail} onChange={(e) => setTributeEmail(e.target.value)} placeholder="john@example.com" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Tribute type</label>
                <select value={tributeType} onChange={(e) => setTributeType(e.target.value as TributeType)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400">
                  <option value="candle">Candle</option>
                  <option value="flower">Flower</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Condolence text</label>
                <textarea value={tributeText} onChange={(e) => setTributeText(e.target.value)} placeholder="Write your condolence message" className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsTributeOpen(false)} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="button" disabled={isSubmittingTribute} onClick={handleAddTribute} className="rounded-full bg-[#274877] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f3a60] disabled:opacity-50">
                  {isSubmittingTribute ? "Adding..." : "Add Tribute"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
