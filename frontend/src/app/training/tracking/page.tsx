"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RoleLayout } from "@/components/layout/RoleLayout";
import type { TrainingRecord } from "@/types";
import {
    GraduationCap,
    CheckCircle,
    Clock,
    Calendar,
    Plus,
    Search,
    Filter,
    Eye,
    Pencil,
    Award,
    X,
    MapPin,
    Users,
    Building2,
    ChevronDown,
} from "lucide-react";

interface TrainingParticipant {
    id: string;
    employeeNo: string;
    name: string;
    office: string;
}

interface TrainingWithParticipants extends TrainingRecord {
    participants: TrainingParticipant[];
}

interface TrainingEmployeeOption {
    id: string;
    employeeNo: string;
    name: string;
    office: string;
}

interface TrainingTrackingPayload {
    employees: TrainingEmployeeOption[];
    trainings: TrainingWithParticipants[];
}

type TrainingFormMode = "create" | "edit";

interface CertificateFormState {
    employeeNo: string;
    certificateType: string;
    issuingBody: string;
    certificateNo: string;
    dateIssued: string;
    expiryDate: string;
    description: string;
    file: File | null;
}

const TRAINING_TYPES: TrainingRecord["type"][] = [
    "Seminar",
    "Workshop",
    "Conference",
    "Webinar",
    "Certification",
    "Other",
];

const STATUSES: TrainingRecord["status"][] = [
    "Completed",
    "Ongoing",
    "Upcoming",
    "Cancelled",
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function statusColor(s: TrainingRecord["status"]) {
    switch (s) {
        case "Completed":
            return "bg-green-50 text-green-700 border-green-200";
        case "Ongoing":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "Upcoming":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "Cancelled":
            return "bg-red-50 text-red-700 border-red-200";
    }
}

function typeColor(t: TrainingRecord["type"]) {
    switch (t) {
        case "Seminar":
            return "bg-violet-50 text-violet-700";
        case "Workshop":
            return "bg-sky-50 text-sky-700";
        case "Conference":
            return "bg-rose-50 text-rose-700";
        case "Webinar":
            return "bg-teal-50 text-teal-700";
        case "Certification":
            return "bg-orange-50 text-orange-700";
        case "Other":
            return "bg-stone-100 text-stone-600";
    }
}

const EMPTY_FORM = {
    title: "",
    type: "Seminar" as TrainingRecord["type"],
    conductedBy: "",
    venue: "",
    dateFrom: "",
    dateTo: "",
    numberOfHours: 0,
    status: "Upcoming" as TrainingRecord["status"],
    participantIds: [] as string[],
};

const EMPTY_CERTIFICATE_FORM: CertificateFormState = {
    employeeNo: "",
    certificateType: "",
    issuingBody: "",
    certificateNo: "",
    dateIssued: "",
    expiryDate: "",
    description: "",
    file: null,
};

export default function TrainingTrackingPage() {
    const [trainings, setTrainings] = useState<TrainingWithParticipants[]>([]);
    const [employees, setEmployees] = useState<TrainingEmployeeOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterOffice, setFilterOffice] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formMode, setFormMode] = useState<TrainingFormMode>("create");
    const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [detailRecord, setDetailRecord] = useState<TrainingWithParticipants | null>(null);
    const [certificateTraining, setCertificateTraining] = useState<TrainingWithParticipants | null>(null);
    const [certificateForm, setCertificateForm] = useState<CertificateFormState>(EMPTY_CERTIFICATE_FORM);

    useEffect(() => {
        let isCancelled = false;

        async function loadData() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const response = await fetch("/api/training/tracking", {
                    cache: "no-store",
                });
                const payload = (await response.json()) as {
                    success?: boolean;
                    data?: TrainingTrackingPayload;
                    message?: string;
                };

                if (!response.ok || !payload.success || !payload.data) {
                    throw new Error(payload.message || "Failed to load training tracking data.");
                }

                if (!isCancelled) {
                    setEmployees(payload.data.employees || []);
                    setTrainings(payload.data.trainings || []);
                }
            } catch (error) {
                if (!isCancelled) {
                    setErrorMessage(error instanceof Error ? error.message : "Failed to load training tracking data.");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            isCancelled = true;
        };
    }, []);

    const officeOptions = useMemo(
        () => Array.from(new Set(employees.map((employee) => employee.office).filter(Boolean))).sort(),
        [employees]
    );

    const stats = useMemo(() => {
        const total = trainings.length;
        const completed = trainings.filter((t) => t.status === "Completed").length;
        const ongoing = trainings.filter((t) => t.status === "Ongoing").length;
        const upcoming = trainings.filter((t) => t.status === "Upcoming").length;
        return { total, completed, ongoing, upcoming };
    }, [trainings]);

    const filtered = useMemo(() => {
        return trainings.filter((t) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                t.title.toLowerCase().includes(q) ||
                t.participants.some((p) => p.name.toLowerCase().includes(q));
            const matchType = !filterType || t.type === filterType;
            const matchStatus = !filterStatus || t.status === filterStatus;
            const matchOffice =
                !filterOffice || t.participants.some((p) => p.office === filterOffice);
            return matchSearch && matchType && matchStatus && matchOffice;
        });
    }, [trainings, search, filterType, filterStatus, filterOffice]);

    function openAddModal() {
        setFormMode("create");
        setEditingTrainingId(null);
        setForm({ ...EMPTY_FORM, participantIds: [] });
        setShowModal(true);
    }

    function openEditModal(training: TrainingWithParticipants) {
        setFormMode("edit");
        setEditingTrainingId(training.id);
        setForm({
            title: training.title,
            type: training.type,
            conductedBy: training.conductedBy,
            venue: training.venue,
            dateFrom: training.dateFrom,
            dateTo: training.dateTo,
            numberOfHours: training.numberOfHours,
            status: training.status,
            participantIds: training.participants.map((participant) => participant.id),
        });
        setShowModal(true);
    }

    function openCertificateModal(training: TrainingWithParticipants) {
        if (training.participants.length === 0) {
            setErrorMessage("Cannot upload certificate because this training has no assigned participants.");
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const firstParticipant = training.participants[0];

        setCertificateTraining(training);
        setCertificateForm({
            employeeNo: firstParticipant.employeeNo,
            certificateType: training.title,
            issuingBody: training.conductedBy,
            certificateNo: "",
            dateIssued: training.dateTo || today,
            expiryDate: "",
            description: `Certificate for ${training.title}`,
            file: null,
        });
    }

    function closeCertificateModal() {
        setCertificateTraining(null);
        setCertificateForm(EMPTY_CERTIFICATE_FORM);
    }

    function toggleParticipant(empId: string) {
        setForm((prev) => ({
            ...prev,
            participantIds: prev.participantIds.includes(empId)
                ? prev.participantIds.filter((id) => id !== empId)
                : [...prev.participantIds, empId],
        }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (form.dateTo < form.dateFrom) {
            setErrorMessage("Date To must be on or after Date From.");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/training/tracking", {
                method: formMode === "create" ? "POST" : "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    formMode === "create"
                        ? form
                        : {
                            id: editingTrainingId,
                            ...form,
                        }
                ),
            });

            const payload = (await response.json()) as {
                success?: boolean;
                data?: TrainingWithParticipants;
                message?: string;
            };

            if (!response.ok || !payload.success || !payload.data) {
                throw new Error(
                    payload.message ||
                        (formMode === "create"
                            ? "Failed to create training event."
                            : "Failed to update training event.")
                );
            }

            if (formMode === "create") {
                setTrainings((prev) => [payload.data as TrainingWithParticipants, ...prev]);
                setSuccessMessage("Training event created successfully.");
            } else {
                setTrainings((prev) =>
                    prev.map((training) =>
                        training.id === payload.data?.id
                            ? (payload.data as TrainingWithParticipants)
                            : training
                    )
                );
                setDetailRecord((prev) =>
                    prev && prev.id === payload.data?.id
                        ? (payload.data as TrainingWithParticipants)
                        : prev
                );
                setSuccessMessage("Training event updated successfully.");
            }

            setShowModal(false);
            setFormMode("create");
            setEditingTrainingId(null);
            setForm({ ...EMPTY_FORM, participantIds: [] });
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : formMode === "create"
                        ? "Failed to create training event."
                        : "Failed to update training event."
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCertificateSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!certificateTraining) {
            return;
        }

        if (!certificateForm.employeeNo || !certificateForm.certificateType || !certificateForm.certificateNo || !certificateForm.dateIssued) {
            setErrorMessage("Please fill in required certificate fields.");
            return;
        }

        const body = new FormData();
        body.set("employeeNo", certificateForm.employeeNo);
        body.set("certificateType", certificateForm.certificateType);
        body.set("issuingBody", certificateForm.issuingBody || "N/A");
        body.set("certificateNo", certificateForm.certificateNo);
        body.set("dateIssued", certificateForm.dateIssued);
        if (certificateForm.expiryDate) {
            body.set("expiryDate", certificateForm.expiryDate);
        }
        if (certificateForm.description) {
            body.set("description", certificateForm.description);
        }
        if (certificateForm.file) {
            body.set("file", certificateForm.file, certificateForm.file.name);
        }

        setIsUploadingCertificate(true);
        try {
            const response = await fetch("/api/certificates", {
                method: "POST",
                body,
            });

            const payload = (await response.json()) as {
                success?: boolean;
                message?: string;
            };

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "Failed to upload certificate.");
            }

            setSuccessMessage("Certificate uploaded successfully.");
            closeCertificateModal();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to upload certificate.");
        } finally {
            setIsUploadingCertificate(false);
        }
    }

    const STAT_CARDS = [
        { label: "Total Trainings", value: stats.total, icon: GraduationCap, iconBg: "bg-green-50", iconColor: "text-green-600" },
        { label: "Completed", value: stats.completed, icon: CheckCircle, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Ongoing", value: stats.ongoing, icon: Clock, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Upcoming", value: stats.upcoming, icon: Calendar, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    ];

    const inputClass =
        "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm";
    const labelClass = "block text-xs font-medium text-stone-600 mb-1";

    return (
        <RoleLayout userRole="HR Head">
            <div className="space-y-6 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-bold text-stone-900">
                                Training Tracking
                            </h1>
                            <p className="text-[13px] text-stone-400">
                                Track and manage employee training records
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Training Record
                    </button>
                </div>

                {errorMessage && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STAT_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 flex items-center gap-4"
                            >
                                <div
                                    className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
                                >
                                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-[12px] font-medium text-stone-400 uppercase tracking-wide">
                                        {card.label}
                                    </p>
                                    <p className="text-2xl font-bold text-stone-800 leading-tight mt-0.5">
                                        {card.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="relative flex-1 min-w-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Search by training title or employee name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="appearance-none pl-8 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm cursor-pointer"
                                >
                                    <option value="">All Types</option>
                                    {TRAINING_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="appearance-none pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    {STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                                <select
                                    value={filterOffice}
                                    onChange={(e) => setFilterOffice(e.target.value)}
                                    className="appearance-none pl-8 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm cursor-pointer"
                                >
                                    <option value="">All Offices</option>
                                    {officeOptions.map((o) => (
                                        <option key={o} value={o}>
                                            {o}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-12 text-center">
                        <p className="text-sm text-stone-500">Loading training records...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-12 text-center">
                        <GraduationCap className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                        <p className="text-sm text-stone-500">No training records found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((tr) => (
                            <div
                                key={tr.id}
                                className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-[15px] font-semibold text-stone-800">
                                                {tr.title}
                                            </h3>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${typeColor(tr.type)}`}
                                            >
                                                {tr.type}
                                            </span>
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusColor(tr.status)}`}
                                            >
                                                {tr.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-stone-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5" />
                                                {tr.conductedBy}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {tr.venue}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(tr.dateFrom)}
                                                {tr.dateFrom !== tr.dateTo &&
                                                    ` - ${formatDate(tr.dateTo)}`}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {tr.numberOfHours} hrs
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-2.5 text-[12px] text-stone-400">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="font-medium text-stone-500">
                                                {tr.participants.length} participant
                                                {tr.participants.length !== 1 && "s"}
                                            </span>
                                            <span className="text-stone-300 mx-1">·</span>
                                            <span className="truncate">
                                                {tr.participants
                                                    .slice(0, 3)
                                                    .map((p) => p.name)
                                                    .join(", ")}
                                                {tr.participants.length > 3 &&
                                                    `, +${tr.participants.length - 3} more`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setDetailRecord(tr)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => openEditModal(tr)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-stone-600 bg-stone-50 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openCertificateModal(tr)}
                                            disabled={tr.status !== "Completed"}
                                            title={
                                                tr.status !== "Completed"
                                                    ? "Certificates can be uploaded only for completed trainings"
                                                    : "Upload participant certificate"
                                            }
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Award className="w-3.5 h-3.5" />
                                            Certificate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {detailRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setDetailRecord(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-[16px] font-bold text-stone-800">
                                Training Details
                            </h2>
                            <button
                                onClick={() => setDetailRecord(null)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-stone-500" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <h3 className="text-[15px] font-semibold text-stone-800 mb-1">
                                    {detailRecord.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${typeColor(detailRecord.type)}`}
                                    >
                                        {detailRecord.type}
                                    </span>
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusColor(detailRecord.status)}`}
                                    >
                                        {detailRecord.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">
                                        Conducted By
                                    </p>
                                    <p className="text-stone-700 font-medium">
                                        {detailRecord.conductedBy}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">
                                        Venue
                                    </p>
                                    <p className="text-stone-700 font-medium">
                                        {detailRecord.venue}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">
                                        Date
                                    </p>
                                    <p className="text-stone-700 font-medium">
                                        {formatDate(detailRecord.dateFrom)}
                                        {detailRecord.dateFrom !== detailRecord.dateTo &&
                                            ` - ${formatDate(detailRecord.dateTo)}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-0.5">
                                        Hours
                                    </p>
                                    <p className="text-stone-700 font-medium">
                                        {detailRecord.numberOfHours} hours
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[11px] text-stone-400 uppercase tracking-wide mb-2">
                                    Participants ({detailRecord.participants.length})
                                </p>
                                <div className="space-y-1.5">
                                    {detailRecord.participants.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2"
                                        >
                                            <span className="text-sm font-medium text-stone-700">
                                                {p.name}
                                            </span>
                                            <span className="text-[11px] text-stone-400">
                                                {p.office}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {certificateTraining && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={closeCertificateModal}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-[16px] font-bold text-stone-800">
                                Upload Training Certificate
                            </h2>
                            <button
                                onClick={closeCertificateModal}
                                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-stone-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCertificateSubmit} className="px-6 py-5 space-y-4">
                            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                                <p className="text-xs text-stone-500">Training Event</p>
                                <p className="text-sm font-medium text-stone-800">
                                    {certificateTraining.title}
                                </p>
                            </div>

                            <div>
                                <label className={labelClass}>Participant</label>
                                <select
                                    required
                                    value={certificateForm.employeeNo}
                                    onChange={(e) =>
                                        setCertificateForm((prev) => ({
                                            ...prev,
                                            employeeNo: e.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                >
                                    {certificateTraining.participants.map((participant) => (
                                        <option key={participant.id} value={participant.employeeNo}>
                                            {participant.name} ({participant.employeeNo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Certificate Type</label>
                                <input
                                    required
                                    type="text"
                                    value={certificateForm.certificateType}
                                    onChange={(e) =>
                                        setCertificateForm((prev) => ({
                                            ...prev,
                                            certificateType: e.target.value,
                                        }))
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Issuing Body</label>
                                    <input
                                        type="text"
                                        value={certificateForm.issuingBody}
                                        onChange={(e) =>
                                            setCertificateForm((prev) => ({
                                                ...prev,
                                                issuingBody: e.target.value,
                                            }))
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Certificate Number</label>
                                    <input
                                        required
                                        type="text"
                                        value={certificateForm.certificateNo}
                                        onChange={(e) =>
                                            setCertificateForm((prev) => ({
                                                ...prev,
                                                certificateNo: e.target.value,
                                            }))
                                        }
                                        className={inputClass}
                                        placeholder="e.g. HRMO-2026-001"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Date Issued</label>
                                    <input
                                        required
                                        type="date"
                                        value={certificateForm.dateIssued}
                                        onChange={(e) =>
                                            setCertificateForm((prev) => ({
                                                ...prev,
                                                dateIssued: e.target.value,
                                            }))
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Expiry Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={certificateForm.expiryDate}
                                        onChange={(e) =>
                                            setCertificateForm((prev) => ({
                                                ...prev,
                                                expiryDate: e.target.value,
                                            }))
                                        }
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description (Optional)</label>
                                <textarea
                                    value={certificateForm.description}
                                    onChange={(e) =>
                                        setCertificateForm((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    className={`${inputClass} min-h-20`}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Certificate File (Optional)</label>
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) =>
                                        setCertificateForm((prev) => ({
                                            ...prev,
                                            file: e.target.files?.[0] || null,
                                        }))
                                    }
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeCertificateModal}
                                    className="px-4 py-2 text-[13px] font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploadingCertificate}
                                    className="px-5 py-2 text-[13px] font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isUploadingCertificate ? "Uploading..." : "Upload Certificate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => {
                            setShowModal(false);
                            setFormMode("create");
                            setEditingTrainingId(null);
                        }}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-[16px] font-bold text-stone-800">
                                {formMode === "create" ? "Add Training Record" : "Edit Training Record"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setFormMode("create");
                                    setEditingTrainingId(null);
                                }}
                                className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-stone-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            <div>
                                <label className={labelClass}>Training Title</label>
                                <input
                                    required
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, title: e.target.value }))
                                    }
                                    className={inputClass}
                                    placeholder="e.g. Leadership Excellence Program"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                type: e.target.value as TrainingRecord["type"],
                                            }))
                                        }
                                        className={inputClass}
                                    >
                                        {TRAINING_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                status: e.target.value as TrainingRecord["status"],
                                            }))
                                        }
                                        className={inputClass}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Conducted By</label>
                                <input
                                    required
                                    type="text"
                                    value={form.conductedBy}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, conductedBy: e.target.value }))
                                    }
                                    className={inputClass}
                                    placeholder="Organization or trainer name"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Venue</label>
                                <input
                                    required
                                    type="text"
                                    value={form.venue}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, venue: e.target.value }))
                                    }
                                    className={inputClass}
                                    placeholder="Location or online platform"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className={labelClass}>Date From</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.dateFrom}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, dateFrom: e.target.value }))
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Date To</label>
                                    <input
                                        required
                                        type="date"
                                        value={form.dateTo}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, dateTo: e.target.value }))
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Hours</label>
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        value={form.numberOfHours || ""}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                numberOfHours: Number(e.target.value),
                                            }))
                                        }
                                        className={inputClass}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Assign Participants ({form.participantIds.length} selected)
                                </label>
                                <div className="border border-stone-200 rounded-lg max-h-44 overflow-y-auto">
                                    {employees.length === 0 ? (
                                        <div className="px-3 py-4 text-sm text-stone-500">
                                            No employees available for assignment.
                                        </div>
                                    ) : (
                                        employees.map((emp) => {
                                            const selected = form.participantIds.includes(emp.id);
                                            return (
                                                <label
                                                    key={emp.id}
                                                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                                                        selected
                                                            ? "bg-green-50"
                                                            : "hover:bg-stone-50"
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() => toggleParticipant(emp.id)}
                                                        className="w-3.5 h-3.5 rounded border-stone-300 text-green-600 focus:ring-green-500"
                                                    />
                                                    <span className="text-sm text-stone-700 font-medium">
                                                        {emp.name}
                                                    </span>
                                                    <span className="text-[11px] text-stone-400 ml-auto">
                                                        {emp.office}
                                                    </span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormMode("create");
                                        setEditingTrainingId(null);
                                    }}
                                    className="px-4 py-2 text-[13px] font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 text-[13px] font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSaving
                                        ? "Saving..."
                                        : formMode === "create"
                                            ? "Save Training Record"
                                            : "Update Training Record"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </RoleLayout>
    );
}
