"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, HeartHandshake, Sparkles, Upload, X, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useAxios } from "../../../context/AxiosProvider";
import type { MemorialSubmission } from "../profile-dashboard/types";

type Tab = "status" | "basic" | "content" | "images" | "funeral" | "visibility";

const TABS: { id: Tab; label: string }[] = [
  { id: "status", label: "Status" },
  { id: "basic", label: "Basic Info" },
  { id: "content", label: "Content" },
  { id: "images", label: "Images" },
  { id: "funeral", label: "Funeral Details" },
  { id: "visibility", label: "Visibility" },
];

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

interface Props {
  submission: MemorialSubmission;
  onSaved: (updatedRaw: any) => void;
  onClose: () => void;
}

export default function AdminEditDialog({ submission, onSaved, onClose }: Props) {
  const api = useAxios();
  const [tab, setTab] = useState<Tab>("status");
  const [saving, setSaving] = useState(false);

  // --- Text fields ---
  const [status, setStatus] = useState(submission.status);
  const [rejectionReason, setRejectionReason] = useState(submission.rejectionReason || "");
  const [name, setName] = useState(submission.name || "");
  const [location, setLocation] = useState(submission.location || "");
  const [country, setCountry] = useState(submission.country || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    submission.dateOfBirth ? submission.dateOfBirth.substring(0, 10) : ""
  );
  const [dateOfDeath, setDateOfDeath] = useState(
    submission.dateOfDeath ? submission.dateOfDeath.substring(0, 10) : ""
  );
  const [relationToDeceased, setRelationToDeceased] = useState(submission.relationToDeceased || "");
  const [memorialDetails, setMemorialDetails] = useState(submission.memorialDetails || "");
  const [familyDetails, setFamilyDetails] = useState(submission.familyDetails || "");
  const [lifeStory, setLifeStory] = useState(submission.lifeStory || "");
  const [careerSummery, setCareerSummery] = useState(submission.careerSummery || "");
  const [favouriteQuote, setFavouriteQuote] = useState(submission.favouriteQuote || "");
  const [rememberForEverQuote, setRememberForEverQuote] = useState(submission.rememberForEverQuote || "");

  // --- Images ---
  const [existingPhotos, setExistingPhotos] = useState<string[]>(submission.deadPersonPhoto || []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [funeralHomeLogo, setFuneralHomeLogo] = useState(submission.funeralHomeLogo || "");
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [familyTreeDiagram, setFamilyTreeDiagram] = useState(submission.familyTreeDiagram || "");
  const [newTreeFile, setNewTreeFile] = useState<File | null>(null);

  // --- Funeral Home Details ---
  const [fhDetails, setFhDetails] = useState(submission.funeralHomeDetails || {});

  // --- Funeral Notice ---
  const [funeralNotice, setFuneralNotice] = useState(submission.funeralNotice || {});

  // --- Visibility ---
  const [memorialDetailVis, setMemorialDetailVis] = useState(submission.memorialDetailVisibilityStatus ?? true);
  const [familyDetailVis, setFamilyDetailVis] = useState(submission.familyDetailVisibilityStatus ?? true);
  const [lifeStoryVis, setLifeStoryVis] = useState(submission.lifeStoryVisibilityStatus ?? true);
  const [rememberVis, setRememberVis] = useState(submission.rememberForEverQuoteVisibilityStatus ?? true);
  const [quoteVis, setQuoteVis] = useState(submission.favouriteQuoteVisibilityStatus ?? true);
  const [careerVis, setCareerVis] = useState(submission.careerSummeryVisibilityStatus ?? true);
  const [donationsEnabled, setDonationsEnabled] = useState(submission.donationsEnabled ?? true);
  const [showInLivesRememberedForever, setShowInLivesRememberedForever] = useState(
    submission.showInLivesRememberedForever ?? false
  );

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const treeInputRef = useRef<HTMLInputElement>(null);

  const isValidImageFile = (file: File) => {
    if (file.size <= MAX_IMAGE_SIZE_BYTES) {
      return true;
    }

    toast.error(`${file.name} is larger than 10MB.`);
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();

      // Status
      formData.append("status", status);
      formData.append("rejectionReason", rejectionReason);

      // Basic
      formData.append("name", name);
      formData.append("location", location);
      formData.append("country", country);
      if (dateOfBirth) formData.append("birthdate", dateOfBirth);
      if (dateOfDeath) formData.append("deathDate", dateOfDeath);
      formData.append("relationToDeceased", relationToDeceased);

      // Content
      formData.append("memorialDetails", memorialDetails);
      formData.append("familyDetails", familyDetails);
      formData.append("lifeStory", lifeStory);
      formData.append("careerSummery", careerSummery);
      formData.append("favouriteQuote", favouriteQuote);
      formData.append("rememberForEverQuote", rememberForEverQuote);

      // Images
      formData.append("existingDeadPersonPhotos", JSON.stringify(existingPhotos));
      for (const file of newPhotos) {
        formData.append("deadPersonPhoto", file);
      }
      if (newLogoFile) {
        formData.append("funeralHomeLogo", newLogoFile);
      } else if (funeralHomeLogo) {
        formData.append("existingFuneralHomeLogo", funeralHomeLogo);
      }
      if (newTreeFile) {
        formData.append("familyTreeDiagram", newTreeFile);
      } else if (familyTreeDiagram) {
        formData.append("existingFamilyTreeDiagram", familyTreeDiagram);
      }

      // Funeral details
      formData.append("funeralHomeDetails", JSON.stringify(fhDetails));
      formData.append("funeralNotice", JSON.stringify(funeralNotice));

      // Visibility
      formData.append("memorialDetailVisibilityStatus", String(memorialDetailVis));
      formData.append("familyDetailVisibilityStatus", String(familyDetailVis));
      formData.append("lifeStoryVisibilityStatus", String(lifeStoryVis));
      formData.append("rememberForEverQuoteVisibilityStatus", String(rememberVis));
      formData.append("favouriteQuoteVisibilityStatus", String(quoteVis));
      formData.append("careerSummeryVisibilityStatus", String(careerVis));
      formData.append("donationsEnabled", String(donationsEnabled));
      formData.append("showInLivesRememberedForever", String(showInLivesRememberedForever));

      const res = await api.put(`/admin/memorials/${submission.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSaved(res.data.memorial);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update memorial");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:border-[#1e3a5f] transition";
  const textareaCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#1e3a5f] transition resize-none min-h-[100px]";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-5xl p-0 sm:max-w-5xl overflow-x-auto">
        <div className="flex flex-col max-h-[92vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <DialogTitle className="text-lg font-bold text-[#1e3a5f]">
              Admin Edit — {submission.name || "Memorial"}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-slate-100 bg-slate-50 flex-shrink-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? "border-b-2 border-[#1e3a5f] text-[#1e3a5f] bg-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ---- STATUS ---- */}
            {tab === "status" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelCls}>Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={inputCls}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Rejection / Internal Note</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason shown to the submitter when rejected..."
                    className={textareaCls}
                  />
                </div>
              </div>
            )}

            {/* ---- BASIC INFO ---- */}
            {tab === "basic" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Location / City</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Death</label>
                  <input type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Relation to Deceased</label>
                  <input value={relationToDeceased} onChange={(e) => setRelationToDeceased(e.target.value)} className={inputCls} />
                </div>
              </div>
            )}

            {/* ---- CONTENT ---- */}
            {tab === "content" && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Memorial Details (Obituary)</label>
                  <textarea value={memorialDetails} onChange={(e) => setMemorialDetails(e.target.value)} className={textareaCls} rows={5} />
                </div>
                <div>
                  <label className={labelCls}>Life Story</label>
                  <textarea value={lifeStory} onChange={(e) => setLifeStory(e.target.value)} className={textareaCls} rows={4} />
                </div>
                <div>
                  <label className={labelCls}>Family Details</label>
                  <textarea value={familyDetails} onChange={(e) => setFamilyDetails(e.target.value)} className={textareaCls} rows={3} />
                </div>
                <div>
                  <label className={labelCls}>Career Summary</label>
                  <textarea value={careerSummery} onChange={(e) => setCareerSummery(e.target.value)} className={textareaCls} rows={3} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Favourite Quote</label>
                    <input value={favouriteQuote} onChange={(e) => setFavouriteQuote(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Remember Forever Quote</label>
                    <input value={rememberForEverQuote} onChange={(e) => setRememberForEverQuote(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ---- IMAGES ---- */}
            {tab === "images" && (
              <div className="space-y-6">
                {/* Funeral Home Logo */}
                <div>
                  <label className={labelCls}>Funeral Home Logo</label>
                  <div className="flex items-center gap-4">
                    {(newLogoFile ? URL.createObjectURL(newLogoFile) : funeralHomeLogo) && (
                      <img
                        src={newLogoFile ? URL.createObjectURL(newLogoFile) : funeralHomeLogo}
                        alt="Logo"
                        className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition"
                    >
                      <Upload className="h-4 w-4" />
                      {newLogoFile ? "Change logo" : "Upload new logo"}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && isValidImageFile(file)) {
                          setNewLogoFile(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    {newLogoFile && (
                      <button onClick={() => setNewLogoFile(null)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Family Tree Diagram */}
                <div>
                  <label className={labelCls}>Family Tree Diagram</label>
                  <div className="flex items-center gap-4">
                    {(newTreeFile ? URL.createObjectURL(newTreeFile) : familyTreeDiagram) && (
                      <img
                        src={newTreeFile ? URL.createObjectURL(newTreeFile) : familyTreeDiagram}
                        alt="Family tree"
                        className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => treeInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition"
                    >
                      <Upload className="h-4 w-4" />
                      {newTreeFile ? "Change diagram" : "Upload diagram"}
                    </button>
                    <input
                      ref={treeInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && isValidImageFile(file)) {
                          setNewTreeFile(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    {newTreeFile && (
                      <button onClick={() => setNewTreeFile(null)} className="text-red-400 hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Deceased person photos */}
                <div>
                  <label className={labelCls}>Deceased Person Photos ({existingPhotos.length + newPhotos.length}/30)</label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {existingPhotos.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover border border-slate-200" />
                        <button
                          onClick={() => setExistingPhotos((p) => p.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {newPhotos.map((file, i) => (
                      <div key={`new-${i}`} className="relative group">
                        <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`} className="h-20 w-20 rounded-lg object-cover border-2 border-blue-300" />
                        <button
                          onClick={() => setNewPhotos((p) => p.filter((_, idx) => idx !== i))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {existingPhotos.length + newPhotos.length < 30 && (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition"
                      >
                        <Plus className="h-6 w-6" />
                        <span className="text-xs mt-1">Add</span>
                      </button>
                    )}
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).filter(isValidImageFile);
                        const remaining = 30 - existingPhotos.length - newPhotos.length;
                        setNewPhotos((p) => [...p, ...files.slice(0, remaining)]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ---- FUNERAL DETAILS ---- */}
            {tab === "funeral" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">Funeral Home Details</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {["name", "phone", "email", "address", "website", "mapLink"].map((field) => (
                      <div key={field} className={field === "address" || field === "mapLink" ? "md:col-span-2" : ""}>
                        <label className={labelCls}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                        <input
                          value={fhDetails[field] || ""}
                          onChange={(e) => setFhDetails((p: any) => ({ ...p, [field]: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">Service Notice</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { key: "serviceDate", label: "Service Date", type: "date" },
                      { key: "serviceName", label: "Service Name", type: "text" },
                      { key: "serviceLocation", label: "Service Location", type: "text" },
                      { key: "serviceMapLink", label: "Service Map Link", type: "text" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input
                          type={type}
                          value={type === "date" ? (funeralNotice[key] ? funeralNotice[key].substring(0, 10) : "") : (funeralNotice[key] || "")}
                          onChange={(e) => setFuneralNotice((p: any) => ({ ...p, [key]: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#1e3a5f] mb-3 text-sm uppercase tracking-wide">Reception Notice</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { key: "ReceptionDate", label: "Reception Date", type: "date" },
                      { key: "ReceptionName", label: "Reception Name", type: "text" },
                      { key: "ReceptionLocation", label: "Reception Location", type: "text" },
                      { key: "ReceptionMapLink", label: "Reception Map Link", type: "text" },
                    ].map(({ key, label, type }) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input
                          type={type}
                          value={type === "date" ? (funeralNotice[key] ? funeralNotice[key].substring(0, 10) : "") : (funeralNotice[key] || "")}
                          onChange={(e) => setFuneralNotice((p: any) => ({ ...p, [key]: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---- VISIBILITY ---- */}
            {tab === "visibility" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500 mb-4">Toggle which sections are publicly visible on the memorial page.</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDonationsEnabled((value) => !value)}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      donationsEnabled
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          donationsEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                        }`}>
                          <HeartHandshake className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Donation Receiving</p>
                          <p className="text-xs text-slate-500">Controls the public donation button and payment intent.</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        donationsEnabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                      }`}>
                        {donationsEnabled ? "On" : "Off"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInLivesRememberedForever((value) => !value)}
                    className={`rounded-xl border px-4 py-4 text-left transition ${
                      showInLivesRememberedForever
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          showInLivesRememberedForever ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-500"
                        }`}>
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Lives Remembered Forever</p>
                          <p className="text-xs text-slate-500">Shows this memorial in the homepage highlight section.</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        showInLivesRememberedForever ? "bg-amber-600 text-white" : "bg-slate-300 text-slate-700"
                      }`}>
                        {showInLivesRememberedForever ? "Shown" : "Hidden"}
                      </span>
                    </div>
                  </button>
                </div>
                {[
                  { label: "Memorial Details (Obituary Text)", value: memorialDetailVis, set: setMemorialDetailVis },
                  { label: "Family Details", value: familyDetailVis, set: setFamilyDetailVis },
                  { label: "Life Story", value: lifeStoryVis, set: setLifeStoryVis },
                  { label: "Remember Forever Quote", value: rememberVis, set: setRememberVis },
                  { label: "Favourite Quote", value: quoteVis, set: setQuoteVis },
                  { label: "Career Summary", value: careerVis, set: setCareerVis },
                ].map(({ label, value, set }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 cursor-pointer transition ${
                      value ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                    onClick={() => set((v) => !v)}
                  >
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <div className={`flex items-center gap-2 text-sm font-semibold ${value ? "text-green-600" : "text-red-500"}`}>
                      {value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {value ? "Visible" : "Hidden"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
            <div className="flex w-full items-center justify-end gap-3">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#1e3a5f] hover:bg-[#16304f] text-white">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
