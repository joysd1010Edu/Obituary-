"use client";

import type { MemorialSubmission } from "./types";
import { formatDate, getStatusMeta } from "./data";
import { Button } from "../../../components/ui/button";
import { HeartHandshake, PencilLine, Sparkles, Trash2 } from "lucide-react";

/**
 * Renders the memorial submissions table.
 *
 * @param {object} props - Component props.
 * @param {MemorialSubmission[]} props.submissions - Current memorial submissions.
 * @param {(submission: MemorialSubmission) => void} props.onEdit - Opens the edit dialog.
 * @param {(submission: MemorialSubmission) => void} props.onRequestDelete - Opens the delete confirmation.
 * @returns {JSX.Element} The responsive submissions table.
 */
export default function MemorialSubmissionsTable({
  submissions,
  onEdit,
  onRequestDelete,
  showAdminColumns = false,
}: {
  submissions: MemorialSubmission[];
  onEdit: (submission: MemorialSubmission) => void;
  onRequestDelete: (submission: MemorialSubmission) => void;
  showAdminColumns?: boolean;
}) {
  return (
    <section className="overflow-x-auto rounded-md border border-[#e5dfd7] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[#eee7df] px-5 py-4">
        <h3 className="font-heading text-[1.1rem] tracking-[-0.02em] text-[#2b2621]">
          Memorial Submissions
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: showAdminColumns ? 1180 : 1040 }}>
          <thead className="bg-[#faf7f3] text-left text-[0.78rem] uppercase tracking-[0.18em] text-[#7a736c]">
            <tr>
              <th className="px-5 py-4 font-medium">Memorial</th>
              <th className="px-5 py-4 font-medium">Submission Date</th>
              <th className="px-5 py-4 font-medium">Status</th>
              {showAdminColumns && (
                <>
                  <th className="px-5 py-4 font-medium">Donation</th>
                  <th className="px-5 py-4 font-medium">Home Highlight</th>
                </>
              )}
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => {
              const statusMeta = getStatusMeta(submission.status);

              return (
                <tr key={submission.id} className="border-t border-[#eee7df]">
                  <td className="px-5 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#ddd4ca] bg-[#f4f0ea]">
                          <img
                            src={submission.memorialImage}
                            alt={`${submission.deceasedFirstName} ${submission.deceasedLastName}`.trim()}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-[#2b2621]">
                            {submission.deceasedFirstName}{" "}
                            {submission.deceasedLastName}
                          </p>
                          {submission.status === "rejected" &&
                            submission.rejectionReason ? (
                            <p className="mt-1 text-sm text-[#b32424]">
                              {submission.rejectionReason}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6e675f]">
                    <p>{formatDate(submission.submittedAt)}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#6e675f]">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.icon}
                      {statusMeta.label}
                    </span>
                  </td>
                  {showAdminColumns && (
                    <>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                            submission.donationsEnabled !== false
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          <HeartHandshake className="h-3.5 w-3.5" />
                          {submission.donationsEnabled !== false ? "Receiving" : "Paused"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                            submission.showInLivesRememberedForever
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {submission.showInLivesRememberedForever ? "Shown" : "Hidden"}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="border-[#d9d2ca] text-[#2b2621]"
                        onClick={() => onEdit(submission)}
                        aria-label={`Edit ${submission.deceasedFirstName} ${submission.deceasedLastName}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="border-[#efc2bf]"
                        onClick={() => onRequestDelete(submission)}
                        aria-label={`Delete ${submission.deceasedFirstName} ${submission.deceasedLastName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
