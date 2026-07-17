"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAxios } from "../../../context/AxiosProvider";
import MemorialSubmissionsTable from "../profile-dashboard/MemorialSubmissionsTable";
import DeleteSubmissionDialog from "../profile-dashboard/DeleteSubmissionDialog";
import AdminEditDialog from "./AdminEditDialog";
import type { MemorialSubmission } from "../profile-dashboard/types";
import AdminPagination from "./AdminPagination";

const PAGE_SIZE = 10;

export default function MemorialsManagement() {
  const api = useAxios();
  const [submissions, setSubmissions] = useState<MemorialSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<MemorialSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemorialSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const mapMemorial = (m: any): MemorialSubmission => ({
    id: m._id,
    obituaryId: m._id,
    memorialImage: m.deadPersonPhoto?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
    deceasedFirstName: m.name ? m.name.split(" ")[0] : "",
    deceasedLastName: m.name ? m.name.split(" ").slice(1).join(" ") : "",
    rejectionReason: m.rejectionReason || m.rejectedReason || "",
    dateOfBirth: m.birthdate || "",
    dateOfDeath: m.deathDate || "",
    biography: m.memorialDetails || "",
    status: m.status || "pending",
    paymentMethod: m.paymentMethod || "stripe",
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    submittedAt: m.submittedAt || m.createdAt,

    name: m.name || "",
    location: m.location || "",
    country: m.country || "",
    memorialDetails: m.memorialDetails || "",
    familyDetails: m.familyDetails || "",
    lifeStory: m.lifeStory || "",
    rememberForEverQuote: m.rememberForEverQuote || "",
    favouriteQuote: m.favouriteQuote || "",
    careerSummery: m.careerSummery || "",
    relationToDeceased: m.relationToDeceased || "",
    funeralNotice: m.funeralNotice,

    // Images & raw data
    funeralHomeLogo: m.funeralHomeLogo || "",
    deadPersonPhoto: m.deadPersonPhoto || [],
    familyTreeDiagram: m.familyTreeDiagram || "",
    funeralHomeDetails: m.funeralHomeDetails || {},
    funeralHomeAdvertisement: m.funeralHomeAdvertisement || [],

    // Visibility flags
    memorialDetailVisibilityStatus: m.memorialDetailVisibilityStatus ?? true,
    familyDetailVisibilityStatus: m.familyDetailVisibilityStatus ?? true,
    lifeStoryVisibilityStatus: m.lifeStoryVisibilityStatus ?? true,
    rememberForEverQuoteVisibilityStatus: m.rememberForEverQuoteVisibilityStatus ?? true,
    favouriteQuoteVisibilityStatus: m.favouriteQuoteVisibilityStatus ?? true,
    careerSummeryVisibilityStatus: m.careerSummeryVisibilityStatus ?? true,
    donationsEnabled: m.donationsEnabled ?? true,
    showInLivesRememberedForever: m.showInLivesRememberedForever ?? false,
  });

  const fetchMemorials = async () => {
    try {
      const res = await api.get("/admin/memorials");
      setSubmissions(res.data.memorials.map(mapMemorial));
    } catch {
      toast.error("Failed to fetch memorials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemorials();
  }, [api]);

  const handleSaved = (updatedRaw: any) => {
    const updated = mapMemorial(updatedRaw);
    setSubmissions((current) =>
      current.map((s) => (s.id === updated.id ? updated : s))
    );
    setSelectedSubmission(null);
    toast.success("Memorial updated successfully.");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await api.delete(`/admin/memorials/${deleteTarget.id}`);
      setSubmissions((current) =>
        current.filter((submission) => submission.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
      toast.success("Memorial deleted successfully.");
    } catch {
      toast.error("Failed to delete memorial");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading memorials...</div>;

  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSubmissions = submissions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-3xl font-semibold text-[#1e3a5f]">
        Memorials Management
      </h1>

      <MemorialSubmissionsTable
        submissions={paginatedSubmissions}
        onEdit={setSelectedSubmission}
        onRequestDelete={setDeleteTarget}
        showAdminColumns
      />
      <AdminPagination
        currentPage={safePage}
        pageSize={PAGE_SIZE}
        totalItems={submissions.length}
        onPageChange={setCurrentPage}
      />

      {selectedSubmission && (
        <AdminEditDialog
          submission={selectedSubmission}
          onSaved={handleSaved}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      <DeleteSubmissionDialog
        submission={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      
    </div>
  );
}
