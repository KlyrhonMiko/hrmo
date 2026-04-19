"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Users, 
    UserPlus, 
    Search, 
    MoreVertical, 
    Mail, 
    Phone, 
    Shield, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    RotateCcw, 
    Trash2, 
    Edit2,
    X,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    Key
} from "lucide-react";
import type { BackendUser, BackendUserRole, PaginatedResult } from "@/types";
import { fetchUsers, createUser, updateUser, deleteUser, restoreUser } from "@/lib/api/users";
import { ROLE_HOME } from "@/lib/auth";

// --- Components ---

function StatusBadge({ isDeleted }: { isDeleted: boolean }) {
    if (isDeleted) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                Inactive
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Active
        </span>
    );
}

function RoleBadge({ role }: { role: BackendUserRole }) {
    const labels: Record<BackendUserRole, string> = {
        admin: "Administrator",
        hr: "HR Head",
        "hr-assistant": "HR Asst",
        president: "President",
        employee: "Employee"
    };

    const colors: Record<BackendUserRole, string> = {
        admin: "bg-purple-50 text-purple-700 border-purple-100",
        hr: "bg-green-50 text-green-700 border-green-100",
        "hr-assistant": "bg-blue-50 text-blue-700 border-blue-100",
        president: "bg-amber-50 text-amber-700 border-amber-100",
        employee: "bg-stone-50 text-stone-600 border-stone-100"
    };

    return (
        <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium ${colors[role] || colors.employee}`}>
            {labels[role] || role}
        </span>
    );
}

// --- Main Page ---

export default function UserManagementPage() {
    // State
    const [users, setUsers] = useState<BackendUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [limit] = useState(10);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        surname: "",
        first_name: "",
        middle_name: "",
        email: "",
        phone_number: "",
        username: "",
        password: "",
        role: "employee" as BackendUserRole
    });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const result = await fetchUsers(skip, limit);
            setUsers(result.data);
            setTotalRecords(result.meta.total_records);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleOpenCreate = () => {
        setEditingUser(null);
        setFormData({
            surname: "",
            first_name: "",
            middle_name: "",
            email: "",
            phone_number: "",
            username: "",
            password: "",
            role: "employee"
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (user: BackendUser) => {
        setEditingUser(user);
        setFormData({
            surname: user.surname,
            first_name: user.first_name,
            middle_name: user.middle_name || "",
            email: user.email,
            phone_number: user.phone_number || "",
            username: user.username,
            password: "", // password field is optional on edit
            role: user.role
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (editingUser) {
                // Remove password from payload if empty
                const payload: Omit<typeof formData, "password"> & { password?: string } = { ...formData };
                if (!payload.password) delete payload.password;
                
                await updateUser(editingUser.user_no, payload);
            } else {
                await createUser(formData);
            }
            setModalOpen(false);
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userNo: string) => {
        if (!confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await deleteUser(userNo);
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Delete failed");
        }
    };

    const handleRestore = async (userNo: string) => {
        try {
            await restoreUser(userNo);
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Restore failed");
        }
    };

    const filteredUsers = searchQuery 
        ? users.filter(u => 
            u.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.user_no.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : users;

    const totalPages = Math.ceil(totalRecords / limit);

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-bold text-stone-900 leading-tight">User Management</h1>
                        <p className="text-[13px] text-stone-500 mt-0.5">Manage system access and account roles</p>
                    </div>
                </div>
                <button 
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-semibold hover:bg-green-800 transition-all active:scale-95 shadow-sm shadow-green-700/10"
                >
                    <UserPlus className="w-4 h-4" />
                    Create New User
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content Table */}
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by name, user #, or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
                        Showing {filteredUsers.length} of {totalRecords} users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50/30 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 border-b border-stone-100">User Details</th>
                                <th className="px-6 py-4 border-b border-stone-100">System Role</th>
                                <th className="px-6 py-4 border-b border-stone-100">Status</th>
                                <th className="px-6 py-4 border-b border-stone-100">Contact</th>
                                <th className="px-6 py-4 border-b border-stone-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-sm">
                                        <div className="animate-spin w-8 h-8 border-2 border-stone-200 border-t-green-600 rounded-full mx-auto mb-3" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-stone-400 text-sm italic">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-stone-50/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center font-bold text-stone-500">
                                                    {user.surname[0]}{user.first_name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-stone-900 leading-none">
                                                        {user.surname}, {user.first_name}
                                                    </div>
                                                    <div className="text-xs text-stone-400 mt-1 font-medium">
                                                        {user.user_no} · <span className="text-stone-300">@</span>{user.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <StatusBadge isDeleted={!!user.is_deleted} />
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                                                    <Mail className="w-3 h-3 text-stone-300" />
                                                    {user.email}
                                                </div>
                                                {user.phone_number && (
                                                    <div className="flex items-center gap-1.5 text-xs text-stone-500 italic">
                                                        <Phone className="w-3 h-3 text-stone-300" />
                                                        {user.phone_number}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                {user.is_deleted ? (
                                                    <button 
                                                        onClick={() => handleRestore(user.user_no)}
                                                        className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Restore User"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleDelete(user.user_no)}
                                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Deactivate User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/30 flex items-center justify-between">
                    <p className="text-xs text-stone-400">
                        Page <span className="text-stone-700 font-bold">{page}</span> of <span className="text-stone-700 font-bold">{totalPages || 1}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
                                    {editingUser ? <Edit2 className="w-5 h-5 text-green-700" /> : <UserPlus className="w-5 h-5 text-green-700" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-800">
                                        {editingUser ? "Edit User Account" : "Create New Account"}
                                    </h2>
                                    <p className="text-xs text-stone-400 mt-0.5">
                                        {editingUser ? `Updating account for ${editingUser.username}` : "Fill in the details to register a new system user"}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setModalOpen(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">Surname</label>
                                        <input
                                            required
                                            value={formData.surname}
                                            onChange={(e) => setFormData(p => ({ ...p, surname: e.target.value }))}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">First Name</label>
                                        <input
                                            required
                                            value={formData.first_name}
                                            onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">Phone Number (Optional)</label>
                                        <input
                                            value={formData.phone_number}
                                            onChange={(e) => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-stone-100" />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">Username</label>
                                        <input
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">
                                            {editingUser ? "Change Password (Optional)" : "Password"}
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                                            <input
                                                required={!editingUser}
                                                type="password"
                                                value={formData.password}
                                                autoComplete="new-password"
                                                onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-600 transition-all font-medium"
                                                placeholder={editingUser ? "••••••••" : "Min. 8 characters"}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1">System Access Role</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {(["admin", "hr", "hr-assistant", "president", "employee"] as BackendUserRole[]).map((r) => (
                                            <label key={r} className={`
                                                relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                                ${formData.role === r 
                                                    ? "bg-green-50 border-green-600 shadow-sm" 
                                                    : "bg-white border-stone-100 hover:border-stone-200"}
                                            `}>
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={r}
                                                    checked={formData.role === r}
                                                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as BackendUserRole }))}
                                                    className="sr-only"
                                                />
                                                <div className="flex flex-col items-center text-center">
                                                    <Shield className={`w-5 h-5 mb-2 ${formData.role === r ? "text-green-600" : "text-stone-300"}`} />
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${formData.role === r ? "text-green-900" : "text-stone-500"}`}>
                                                        {r.replace("-", " ")}
                                                    </span>
                                                </div>
                                                {formData.role === r && (
                                                    <div className="absolute top-2 right-2">
                                                        <UserCheck className="w-3.5 h-3.5 text-green-600" />
                                                    </div>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-stone-50/50 border-t border-stone-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-stone-900 text-white rounded-2xl text-sm font-semibold hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isSubmitting ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        editingUser ? "Save Changes" : "Create Account"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
