"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import CouponStatusCard from "./profile-dashboard/CouponStatusCard";
import DashboardStatsGrid from "./profile-dashboard/DashboardStatsGrid";
import DeleteSubmissionDialog from "./profile-dashboard/DeleteSubmissionDialog";
import MemorialSubmissionsTable from "./profile-dashboard/MemorialSubmissionsTable";
import ProfileHeaderCard from "./profile-dashboard/ProfileHeaderCard";
import ProfileFuneralHomeSection from "./profile-dashboard/ProfileFuneralHomeSection";
import SubmissionEditDialog from "./profile-dashboard/SubmissionEditDialog";
import { fallbackUser, initialSubmissions } from "./profile-dashboard/data";
import type {
  MemorialSubmission,
  SubmissionDraft,
} from "./profile-dashboard/types";
import useAuth from "../../hooks/useAuth";
import { useAxios } from "../../context/AxiosProvider";

/**
 * Renders the protected profile dashboard.
 *
 * @returns {JSX.Element} The dashboard composition.
 */
export default function ProfileContainer() {
  const { user } = useAuth();
  const displayUser = user ?? fallbackUser;
  const api = useAxios();
  const [submissions, setSubmissions] = useState<MemorialSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<MemorialSubmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemorialSubmission | null>(
    null,
  );

  useEffect(() => {
    const fetchMemorials = async () => {
      try {
        const res = await api.get("/memorials/user");
        const mapped = res.data.memorials.map((m: any) => ({
          id: m._id,
          obituaryId: m._id,
          memorialImage: m.deadPersonPhoto?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
          deceasedFirstName: m.name ? m.name.split(" ")[0] : "",
          deceasedLastName: m.name ? m.name.split(" ").slice(1).join(" ") : "",
          rejectionReason: m.rejectionReason || m.rejectedReason || "",
          dateOfBirth: m.birthdate || "",
          dateOfDeath: m.deathDate || "",
          biography: m.memorialDetails || "",
          status: m.status || "approved",
          paymentMethod: m.paymentMethod || "stripe",
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
          submittedAt: m.submittedAt || m.createdAt || m.updatedAt || new Date().toISOString(),
          
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
        }));
        setSubmissions(mapped);
      } catch (err) {
        toast.error("Failed to fetch memorials");
      }
    };
    fetchMemorials();
  }, [api]);

  const stats = useMemo(
    () => ({
      total: submissions.length,
      approved: submissions.filter(
        (submission) => submission.status === "approved",
      ).length,
      pending: submissions.filter(
        (submission) => submission.status === "pending",
      ).length,
      rejected: submissions.filter(
        (submission) => submission.status === "rejected",
      ).length,
    }),
    [submissions],
  );

  /**
   * Opens the memorial editor.
   *
   * @param {MemorialSubmission} submission - The submission to edit.
   * @returns {void}
   */
  const openEditor = (submission: MemorialSubmission) => {
    setSelectedSubmission(submission);
  };

  /**
   * Closes the memorial editor.
   *
   * @returns {void}
   */
  const closeEditor = () => {
    setSelectedSubmission(null);
  };

  /**
   * Saves an edited submission back into the dashboard list.
   *
   * @param {SubmissionDraft} draft - The updated form data.
   * @returns {void}
   */
  const saveDraft = async (draft: SubmissionDraft) => {
    if (!selectedSubmission) {
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(draft).forEach(key => {
        if (["deceasedFirstName", "deceasedLastName", "biography", "memorialImage"].includes(key)) return;
        formData.append(key, (draft as any)[key]);
      });

      await api.put(`/memorials/${selectedSubmission.id}`, formData, {
         headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === selectedSubmission.id
            ? {
                ...submission,
                ...draft,
                deceasedFirstName: draft.name ? draft.name.split(" ")[0] : "",
                deceasedLastName: draft.name ? draft.name.split(" ").slice(1).join(" ") : "",
                biography: draft.memorialDetails,
                updatedAt: new Date().toISOString(),
              }
            : submission,
        ),
      );

      toast.success("Memorial submission updated successfully.");
      closeEditor();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update memorial");
    }
  };

  /**
   * Opens the delete confirmation dialog.
   *
   * @param {MemorialSubmission} submission - The submission to delete.
   * @returns {void}
   */
  const requestDeleteSubmission = (submission: MemorialSubmission) => {
    setDeleteTarget(submission);
  };

  /**
   * Deletes the selected submission after user confirmation.
   *
   * @returns {void}
   */
  const confirmDeleteSubmission = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await api.delete(`/memorials/${deleteTarget.id}`);
      setSubmissions((current) =>
        current.filter((submission) => submission.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Memorial submission deleted.");
    } catch (err) {
      toast.error("Failed to delete memorial");
    }
  };

  return (
    <main
      className=" w-full flex flex-col gap-6 px-4 pb-6 sm:px-6 lg:px-8"
     
    >
      <ProfileHeaderCard user={displayUser} />
      <ProfileFuneralHomeSection />
      <CouponStatusCard />
      <DashboardStatsGrid
        total={stats.total}
        approved={stats.approved}
        pending={stats.pending}
        rejected={stats.rejected}
      />
      <MemorialSubmissionsTable
        submissions={submissions}
        onEdit={openEditor}
        onRequestDelete={requestDeleteSubmission}
      />
      <SubmissionEditDialog
        submission={selectedSubmission}
        onSave={saveDraft}
        onClose={closeEditor}
      />
      <DeleteSubmissionDialog
        submission={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteSubmission}
      />
    </main>
  );
}
