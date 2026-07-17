"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../../../lib/stripe";
import { useAxios } from "../../../context/AxiosProvider";
import StripeDonationForm from "./StripeDonationForm";
import { Heart, ArrowLeft, ShieldCheck } from "lucide-react";

interface DonatePageContainerProps {
  memorialId: string;
}

export default function DonatePageContainer({ memorialId }: DonatePageContainerProps) {
  const api = useAxios();
  const router = useRouter();

  // Memorial info
  const [memorialName, setMemorialName] = useState("");
  const [memorialImage, setMemorialImage] = useState("");
  const [donationsEnabled, setDonationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Form state
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationAmount, setDonationAmount] = useState<number | "">(25);
  const [donationMessage, setDonationMessage] = useState("");

  // Stripe state
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch memorial details for header context
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/memorials/${memorialId}`);
        const m = res.data.memorial;
        setMemorialName(m?.name || "");
        setMemorialImage(m?.deadPersonPhoto?.[0] || "");
        setDonationsEnabled(m?.donationsEnabled !== false);
      } catch {
        // Silently handle — we can still accept donations
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [memorialId, api]);

  const handleContinueToPayment = async () => {
    if (!donationsEnabled) {
      alert("Donations are currently turned off for this memorial.");
      return;
    }
    if (!donorName.trim() || !donorEmail.trim() || !donationAmount || Number(donationAmount) < 1) {
      alert("Please fill in your name, email, and an amount of at least $1.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())) {
      alert("Please enter a valid email address.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await api.post(`/donations/${memorialId}/create-payment-intent`, {
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        amount: Number(donationAmount),
        message: donationMessage.trim(),
      });
      setClientSecret(res.data.clientSecret);
      setPaymentIntentId(res.data.paymentIntentId);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not initialize payment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const nameParts = memorialName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#274877]" />
      </div>
    );
  }

  if (!donationsEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f5f1eb] via-white to-[#f5f1eb]">
        <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
            <Link href={`/obituary/${memorialId}`}
              className="inline-flex items-center gap-2 text-sm text-[#274877] transition hover:text-[#1f3a60]">
              <ArrowLeft className="h-4 w-4" /> Back to Memorial
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-3xl px-4 py-16 sm:px-6">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-7 w-7 text-slate-500" />
            </div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Donations paused
            </span>
            <h1 className="mt-4 font-serif text-3xl font-semibold text-[#1f1630]">
              Donations are currently turned off
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              The administrator has paused donation receiving for {memorialName || "this memorial"}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f1eb] via-white to-[#f5f1eb]">
      {/* TOP BAR */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-6">
          <Link href={`/obituary/${memorialId}`}
            className="inline-flex items-center gap-2 text-sm text-[#274877] transition hover:text-[#1f3a60]">
            <ArrowLeft className="h-4 w-4" /> Back to Memorial
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl">💚</span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-[#1f1630]">Thank You!</h1>
            <p className="mt-4 text-slate-600 leading-7">
              Your generous donation of <strong className="text-[#274877]">${Number(donationAmount).toFixed(2)}</strong> in
              memory of <strong>{memorialName}</strong> has been received.
            </p>
            <p className="mt-2 text-sm text-slate-500">A receipt has been sent to <strong>{donorEmail}</strong>.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={`/obituary/${memorialId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#274877] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1f3a60]">
                <ArrowLeft className="h-4 w-4" /> Return to Memorial
              </Link>
            </div>
          </div>
        )}

        {/* FORM + PAYMENT STEPS */}
        {step !== "success" && (
          <>
            {/* HEADER */}
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#274877]/10">
                <Heart className="h-7 w-7 text-[#274877]" />
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#1f1630] sm:text-4xl">
                Donate in Memory of {memorialName || "Loved One"}
              </h1>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Your contribution will be directed to charitable causes chosen to honor their memory and bring comfort to others.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">

              {/* LEFT: FORM / PAYMENT */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl bg-white p-6 shadow-lg sm:p-8">

                  {step === "form" && (
                    <>
                      <h2 className="font-serif text-xl font-semibold text-[#1f1630]">Choose Amount</h2>

                      {/* Preset amounts */}
                      <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                        {[10, 25, 50, 100, 250, 500].map((preset) => (
                          <button key={preset} type="button"
                            onClick={() => setDonationAmount(preset)}
                            className={`rounded-xl border-2 px-3 py-3.5 text-base font-bold transition ${
                              donationAmount === preset
                                ? "border-[#274877] bg-[#274877] text-white shadow-md"
                                : "border-slate-200 text-slate-800 hover:border-[#274877]/40 hover:bg-[#f5f8fc]"
                            }`}>
                            ${preset}
                          </button>
                        ))}
                      </div>

                      {/* Custom amount */}
                      <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Or enter a custom amount</label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">$</span>
                          <input type="number" min="1" step="any" placeholder="0.00"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                            className="h-13 w-full rounded-xl border-2 border-slate-200 pl-9 pr-4 text-lg font-semibold outline-none transition focus:border-[#274877]" />
                        </div>
                      </div>

                      <hr className="my-6 border-slate-100" />

                      <h2 className="font-serif text-xl font-semibold text-[#1f1630]">Your Details</h2>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name *</label>
                          <input type="text" placeholder="John Doe" value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="h-12 w-full rounded-xl border-2 border-slate-200 px-4 outline-none transition focus:border-[#274877]" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email *</label>
                          <input type="email" placeholder="john@example.com" value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            className="h-12 w-full rounded-xl border-2 border-slate-200 px-4 outline-none transition focus:border-[#274877]" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Personal message (optional)</label>
                        <textarea rows={3} placeholder="Share a kind word or cherished memory..."
                          value={donationMessage}
                          onChange={(e) => setDonationMessage(e.target.value)}
                          className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#274877] resize-none" />
                      </div>

                      <button type="button" disabled={isCreating}
                        onClick={handleContinueToPayment}
                        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#274877] text-lg font-semibold text-white shadow-md transition hover:bg-[#1f3a60] disabled:opacity-60">
                        {isCreating ? (
                          <>
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Preparing payment...
                          </>
                        ) : (
                          `Continue to Payment — $${donationAmount || "0"}`
                        )}
                      </button>
                    </>
                  )}

                  {step === "payment" && clientSecret && (
                    <>
                      <div className="mb-6 flex items-center justify-between">
                        <h2 className="font-serif text-xl font-semibold text-[#1f1630]">Payment Details</h2>
                        <button type="button" onClick={() => setStep("form")}
                          className="text-xs text-[#274877] hover:underline">
                          ← Edit details
                        </button>
                      </div>

                      {stripePromise ? (
                        <Elements stripe={stripePromise} options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              borderRadius: "12px",
                              fontFamily: "inherit",
                            },
                          },
                        }}>
                          <StripeDonationForm
                            amount={Number(donationAmount)}
                            donorName={donorName}
                            donorEmail={donorEmail}
                            message={donationMessage}
                            memorialId={memorialId}
                            paymentIntentId={paymentIntentId}
                            onSuccess={() => setStep("success")}
                            onError={(msg) => console.error("Stripe error:", msg)}
                          />
                        </Elements>
                      ) : (
                        <div className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
                          Stripe payment is not configured. Please contact the site administrator.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT: SUMMARY SIDEBAR */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-5">
                  {/* Summary card */}
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Donation Summary</h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        {memorialImage ? (
                          <img src={memorialImage} alt={memorialName} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#274877]/10 text-lg font-bold text-[#274877]">
                            {firstName.charAt(0)}{lastName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#1f1630]">{memorialName || "Memorial"}</p>
                          <p className="text-xs text-slate-500">Memorial Donation</p>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {donorName && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">From</span>
                          <span className="font-medium text-slate-800">{donorName}</span>
                        </div>
                      )}
                      {donorEmail && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium text-slate-800 text-xs">{donorEmail}</span>
                        </div>
                      )}
                      {donationMessage && (
                        <div>
                          <span className="text-slate-500 text-xs">Message</span>
                          <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 italic line-clamp-3">
                            &ldquo;{donationMessage}&rdquo;
                          </p>
                        </div>
                      )}

                      <hr className="border-slate-100" />

                      <div className="flex items-end justify-between">
                        <span className="text-slate-500">Total</span>
                        <span className="text-3xl font-bold text-[#274877]">
                          ${Number(donationAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="rounded-2xl border border-slate-200 bg-white/60 p-5 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                      <span>SSL encrypted & PCI-compliant</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Heart className="h-5 w-5 shrink-0 text-pink-500" />
                      <span>100% goes to charitable causes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <svg className="h-5 w-5 shrink-0 text-[#635bff]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                      </svg>
                      <span>Powered by Stripe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
