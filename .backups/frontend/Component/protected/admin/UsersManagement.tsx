"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAxios } from "../../../context/AxiosProvider";
import { Trash2, CheckCircle, Eye, X } from "lucide-react";
import AdminPagination from "./AdminPagination";

const PAGE_SIZE = 10;

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tokenApproveStatus: boolean;
  tokenApplied: boolean;
  token?: string;
  createdAt: string;
  funeralHome?: {
    name?: string;
    phone?: string;
    email?: string;
    logoImageUrl?: string;
  };
}

export default function UsersManagement() {
  const api = useAxios();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [api]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name} and all their memorials? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (selectedUser?._id === id) setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleApproveToken = async (user: User) => {
    try {
      await api.post(`/admin/users/${user._id}/approve-coupon`);
      toast.success("Coupon approved");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to approve coupon");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading users...</div>;

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-[#1e3a5f]">User Management</h1>
        <p className="text-sm text-slate-500">{users.length} user{users.length !== 1 ? "s" : ""}</p>
      </div>
      

      <div className="flex gap-6">
        {/* TABLE */}
        <div className={`flex-1 overflow-hidden rounded-xl border border-[#ece6dd] bg-white shadow-sm transition-all ${selectedUser ? "hidden lg:block" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f3ec] text-[#7b6a58]">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                  <th className="px-5 py-4 font-medium">Coupon</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece6dd]">
                {paginatedUsers.map((user) => (
                  <tr key={user._id}
                    className={`transition hover:bg-slate-50 cursor-pointer ${selectedUser?._id === user._id ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedUser(user)}>
                    <td className="px-5 py-4 font-medium text-[#1e3a5f]">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-5 py-4 text-[#626262] text-xs">{user.email}</td>
                    <td className="px-5 py-4 capitalize">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#626262] text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {user.tokenApproveStatus ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      ) : user.tokenApplied ? (
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">Pending</span>
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">Not Applied</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedUser(user)}
                          className="rounded-md bg-slate-100 p-1.5 text-slate-600 transition hover:bg-slate-200" title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {user.tokenApplied && !user.tokenApproveStatus && (
                          <button onClick={() => handleApproveToken(user)}
                            className="rounded-md bg-[#1e3a5f] px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-[#16314f]">
                            Approve Coupon
                          </button>
                        )}
                        <button onClick={() => handleDelete(user._id, `${user.firstName} ${user.lastName}`)}
                          className="rounded-md border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100" title="Delete user">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination
            currentPage={safePage}
            pageSize={PAGE_SIZE}
            totalItems={users.length}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* USER DETAIL PANEL */}
        {selectedUser && (
          <div className="w-full lg:w-80 flex-none">
            <div className="rounded-xl border border-[#ece6dd] bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#ece6dd] px-5 py-4">
                <h2 className="font-semibold text-[#1e3a5f]">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a5f] text-lg font-bold text-white">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1e3a5f]">{selectedUser.firstName} {selectedUser.lastName}</p>
                    <p className="text-xs text-slate-500 capitalize">{selectedUser.role}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</p>
                    <p className="text-slate-700 break-all">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Joined</p>
                    <p className="text-slate-700">{new Date(selectedUser.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coupon Status</p>
                    <p className="text-slate-700">
                      {selectedUser.tokenApproveStatus ? "✅ Approved" : selectedUser.tokenApplied ? "⏳ Pending Approval" : "Not Applied"}
                    </p>
                  </div>
                  {selectedUser.token && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coupon Code</p>
                      <p className="font-mono text-slate-700">{selectedUser.token}</p>
                    </div>
                  )}
                </div>

                {/* Funeral Home Info */}
                {selectedUser.funeralHome?.name && (
                  <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Funeral Home</p>
                    <p className="text-sm font-medium text-slate-800">{selectedUser.funeralHome.name}</p>
                    {selectedUser.funeralHome.phone && <p className="text-xs text-slate-600">📞 {selectedUser.funeralHome.phone}</p>}
                    {selectedUser.funeralHome.email && <p className="text-xs text-slate-600">✉️ {selectedUser.funeralHome.email}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {selectedUser.tokenApplied && !selectedUser.tokenApproveStatus && (
                    <button onClick={() => handleApproveToken(selectedUser)}
                      className="w-full rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#16314f]">
                      ✅ Approve Coupon Request
                    </button>
                  )}
                  <button onClick={() => handleDelete(selectedUser._id, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                    🗑️ Delete User & Memorials
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
