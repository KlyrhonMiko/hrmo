"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { Role } from "@/types";
import type { CertificateRecord, PaginationMeta } from "@/types";
import {
    ScanLine,
    Upload,
    FileCheck,
    AlertCircle,
    CheckCircle,
    Download,
    Eye,
    Search,
    Filter,
    Clock,
    ChevronDown,
    X,
    FileText,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const MOCK_EMPLOYEES = [
    { id: "EMP-001", name: "Maria Santos Cruz" },
    { id: "EMP-002", name: "Juan Dela Cruz" },
    { id: "EMP-003", name: "Ana Reyes Bautista" },
    { id: "EMP-004", name: "Carlos Garcia Lopez" },
    { id: "EMP-005", name: "Elena Fernandez" },
    { id: "EMP-006", name: "Roberto Villanueva" },
    { id: "EMP-007", name: "Patricia Aquino" },
    { id: "EMP-008", name: "Miguel Ramos" },
];

const DOCUMENT_TYPES = [
    "Training Certificate",
    "Eligibility Certificate",
    "Academic Diploma",
    "Professional License",
    "Service Record",
    "Appointment Paper",
    "Other",
] as const;

const CATEGORY_MAP: Record<string, CertificateRecord["category"]> = {
    "Training Certificate": "Training",
    "Eligibility Certificate": "Eligibility",
    "Academic Diploma": "Academic",
    "Professional License": "Professional",
    "Service Record": "Other",
    "Appointment Paper": "Other",
    Other: "Other",
};

const MOCK_CERTIFICATES: CertificateRecord[] = [
    {
        id: "CERT-001",
        employeeId: "EMP-001",
        employeeName: "Maria Santos Cruz",
        title: "Career Service Professional Eligibility",
        issuingBody: "Civil Service Commission",
        dateIssued: "2022-06-15",
        certificateNumber: "CSC-PRO-2022-14523",
        category: "Eligibility",
        fileUrl: "/files/cert-001.pdf",
        fileName: "csc-eligibility-santos.pdf",
        status: "Active",
        verifiedBy: "HR Head",
        verifiedAt: "2022-07-01",
    },
    {
        id: "CERT-002",
        employeeId: "EMP-002",
        employeeName: "Juan Dela Cruz",
        title: "Leadership and Management Training",
        issuingBody: "Development Academy of the Philippines",
        dateIssued: "2024-11-20",
        certificateNumber: "DAP-LMT-2024-0892",
        category: "Training",
        fileUrl: "/files/cert-002.pdf",
        fileName: "leadership-training-delacruz.pdf",
        status: "Active",
        verifiedBy: "HR Head",
        verifiedAt: "2024-12-05",
    },
    {
        id: "CERT-003",
        employeeId: "EMP-003",
        employeeName: "Ana Reyes Bautista",
        title: "Bachelor of Science in Public Administration",
        issuingBody: "University of the Philippines",
        dateIssued: "2018-04-28",
        certificateNumber: "UP-BSPA-2018-3471",
        category: "Academic",
        fileUrl: "/files/cert-003.pdf",
        fileName: "diploma-bautista.pdf",
        status: "Active",
    },
    {
        id: "CERT-004",
        employeeId: "EMP-004",
        employeeName: "Carlos Garcia Lopez",
        title: "Licensed Professional Teacher",
        issuingBody: "Professional Regulation Commission",
        dateIssued: "2020-03-12",
        expiryDate: "2025-03-12",
        certificateNumber: "PRC-LPT-2020-78234",
        category: "Professional",
        fileUrl: "/files/cert-004.pdf",
        fileName: "prc-license-garcia.pdf",
        status: "Expired",
    },
    {
        id: "CERT-005",
        employeeId: "EMP-005",
        employeeName: "Elena Fernandez",
        title: "Public Financial Management Training",
        issuingBody: "Bureau of Local Government Finance",
        dateIssued: "2025-01-10",
        certificateNumber: "BLGF-PFM-2025-0156",
        category: "Training",
        fileUrl: "/files/cert-005.pdf",
        fileName: "pfm-training-fernandez.pdf",
        status: "Pending Verification",
    },
    {
        id: "CERT-006",
        employeeId: "EMP-006",
        employeeName: "Roberto Villanueva",
        title: "Certified Public Accountant License",
        issuingBody: "Professional Regulation Commission",
        dateIssued: "2021-09-05",
        expiryDate: "2026-09-05",
        certificateNumber: "PRC-CPA-2021-45612",
        category: "Professional",
        fileUrl: "/files/cert-006.pdf",
        fileName: "cpa-license-villanueva.pdf",
        status: "Active",
        verifiedBy: "HR Head",
        verifiedAt: "2021-10-01",
    },
    {
        id: "CERT-007",
        employeeId: "EMP-007",
        employeeName: "Patricia Aquino",
        title: "Gender and Development Sensitivity Training",
        issuingBody: "Philippine Commission on Women",
        dateIssued: "2025-02-14",
        certificateNumber: "PCW-GAD-2025-0341",
        category: "Training",
        fileUrl: "/files/cert-007.pdf",
        fileName: "gad-training-aquino.pdf",
        status: "Pending Verification",
    },
    {
        id: "CERT-008",
        employeeId: "EMP-001",
        employeeName: "Maria Santos Cruz",
        title: "Master of Public Administration",
        issuingBody: "Polytechnic University of the Philippines",
        dateIssued: "2023-05-20",
        certificateNumber: "PUP-MPA-2023-1287",
        category: "Academic",
        fileUrl: "/files/cert-008.pdf",
        fileName: "mpa-diploma-santos.pdf",
        status: "Active",
        verifiedBy: "HR Head",
        verifiedAt: "2023-06-10",
    },
    {
        id: "CERT-009",
        employeeId: "EMP-008",
        employeeName: "Miguel Ramos",
        title: "Data Privacy Act Compliance Seminar",
        issuingBody: "National Privacy Commission",
        dateIssued: "2024-08-22",
        certificateNumber: "NPC-DPA-2024-0567",
        category: "Training",
        fileUrl: "/files/cert-009.pdf",
        fileName: "dpa-seminar-ramos.pdf",
        status: "Active",
        verifiedBy: "HR Head",
        verifiedAt: "2024-09-01",
    },
    {
        id: "CERT-010",
        employeeId: "EMP-003",
        employeeName: "Ana Reyes Bautista",
        title: "Civil Service Sub-Professional Eligibility",
        issuingBody: "Civil Service Commission",
        dateIssued: "2016-11-10",
        expiryDate: "2024-11-10",
        certificateNumber: "CSC-SUB-2016-09832",
        category: "Eligibility",
        fileUrl: "/files/cert-010.pdf",
        fileName: "csc-sub-bautista.pdf",
        status: "Expired",
    },
];

const STATUS_STYLES: Record<CertificateRecord["status"], string> = {
    Active: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
    Expired: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    "Pending Verification": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
};

const STATUS_ICONS: Record<CertificateRecord["status"], React.ReactNode> = {
    Active: <CheckCircle className="w-3.5 h-3.5" />,
    Expired: <AlertCircle className="w-3.5 h-3.5" />,
    "Pending Verification": <Clock className="w-3.5 h-3.5" />,
};

interface CertificatesPageProps {
    userRole?: Role;
}

export default function CertificatesPage({ userRole = "HR Head" }: CertificatesPageProps) {
    const PAGE_SIZE = 10;
    const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
    const [employeeOptions, setEmployeeOptions] = useState<Array<{ employeeNo: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("All");
    const [filterStatus, setFilterStatus] = useState<string>("All");
    const [filterEmployee, setFilterEmployee] = useState<string>("All");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");

    // Upload form state
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
    const [issuingBody, setIssuingBody] = useState("");
    const [certNumber, setCertNumber] = useState("");
    const [dateIssued, setDateIssued] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [description, setDescription] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState<CertificateRecord | null>(null);
    const [verifyingCertificateId, setVerifyingCertificateId] = useState<string | null>(null);

    const loadCertificates = useCallback(async () => {
        setLoading(true);
        setLoadError(null);

        try {
            const response = await fetch(`/api/certificates?page=${page}&limit=${PAGE_SIZE}`, { cache: "no-store" });
            const payload = (await response.json()) as {
                success?: boolean;
                message?: string;
                data?: {
                    employees?: Array<{ employeeNo: string; name: string }>;
                    certificates?: CertificateRecord[];
                };
                meta?: PaginationMeta;
            };

            if (!response.ok || !payload.success) {
                throw new Error(payload.message || "Failed to load certificates.");
            }

            setEmployeeOptions(payload.data?.employees || []);
            setCertificates(payload.data?.certificates || []);
            setMeta(payload.meta || null);
        } catch (error) {
            setLoadError(error instanceof Error ? error.message : "Failed to load certificates.");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        void loadCertificates();
    }, [loadCertificates]);

    const stats = {
        total: certificates.length,
        pending: certificates.filter((c) => c.status === "Pending Verification").length,
        verified: certificates.filter((c) => c.status === "Active").length,
        expired: certificates.filter((c) => c.status === "Expired").length,
    };

    const filteredCertificates = certificates.filter((cert) => {
        const matchesSearch =
            !searchQuery ||
            cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cert.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "All" || cert.category === filterCategory;
        const matchesStatus = filterStatus === "All" || cert.status === filterStatus;
        const matchesEmployee = filterEmployee === "All" || cert.employeeId === filterEmployee;
        
        const matchesDateRange = 
            (!filterDateFrom || new Date(cert.dateIssued) >= new Date(filterDateFrom)) &&
            (!filterDateTo || new Date(cert.dateIssued) <= new Date(filterDateTo));
        
        return matchesSearch && matchesCategory && matchesStatus && matchesEmployee && matchesDateRange;
    });

    useEffect(() => {
        setPage(1);
    }, [searchQuery, filterCategory, filterStatus, filterEmployee, filterDateFrom, filterDateTo]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) setSelectedFile(file);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (validateFile(file)) setSelectedFile(file);
        }
    };

    const validateFile = (file: File): boolean => {
        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, PNG, and JPG files are allowed.");
            return false;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be under 10MB.");
            return false;
        }
        return true;
    };

    const handleUpload = async () => {
        if (!selectedEmployee || !certNumber || !dateIssued || !selectedFile) {
            alert("Please fill in all required fields and select a file.");
            return;
        }

        setUploading(true);

        try {
            const uploadPayload = new FormData();
            uploadPayload.set("employeeNo", selectedEmployee);
            uploadPayload.set("certificateType", documentType);
            uploadPayload.set("issuingBody", issuingBody);
            uploadPayload.set("certificateNo", certNumber);
            uploadPayload.set("dateIssued", dateIssued);
            uploadPayload.set("expiryDate", expiryDate);
            uploadPayload.set("description", description);
            uploadPayload.set("file", selectedFile, selectedFile.name);

            const response = await fetch("/api/certificates", {
                method: "POST",
                body: uploadPayload,
            });

            const payload = (await response.json()) as {
                success?: boolean;
                message?: string;
                data?: CertificateRecord;
            };

            if (!response.ok || !payload.success || !payload.data) {
                throw new Error(payload.message || "Failed to upload certificate.");
            }

            setCertificates((prev) => [payload.data as CertificateRecord, ...prev]);
            resetForm();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to upload certificate.");
        } finally {
            setUploading(false);
        }
    };

    const openCertificate = (certificate: CertificateRecord) => {
        setSelectedCertificate(certificate);
    };

    const closeCertificate = () => {
        setSelectedCertificate(null);
    };

    const handleDownload = (certificate: CertificateRecord) => {
        if (!certificate.fileUrl) {
            alert("No certificate file is available for download.");
            return;
        }

        void (async () => {
            try {
                const response = await fetch(certificate.fileUrl, { method: "GET", cache: "no-store" });
                if (!response.ok) {
                    throw new Error("Failed to download certificate file.");
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = objectUrl;
                link.download = certificate.fileName || "certificate-file";
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(objectUrl);
            } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to download certificate file.");
            }
        })();
    };

    const handleVerify = async (certificate: CertificateRecord) => {
        if (certificate.status === "Expired") {
            alert("Expired certificates cannot be verified.");
            return;
        }

        setVerifyingCertificateId(certificate.id);

        try {
            const verificationForm = new FormData();
            verificationForm.set("employeeNo", certificate.employeeId);
            verificationForm.set("certificateId", certificate.id);
            verificationForm.set("verifiedBy", "HR Head");
            verificationForm.set("verifiedAt", new Date().toISOString());

            const response = await fetch("/api/certificates", {
                method: "PATCH",
                body: verificationForm,
            });

            const payload = (await response.json()) as {
                success?: boolean;
                message?: string;
                data?: CertificateRecord;
            };

            if (!response.ok || !payload.success || !payload.data) {
                throw new Error(payload.message || "Failed to verify certificate.");
            }

            setCertificates((prev) =>
                prev.map((item) => (item.id === certificate.id ? (payload.data as CertificateRecord) : item))
            );

            setSelectedCertificate((prev) =>
                prev && prev.id === certificate.id ? (payload.data as CertificateRecord) : prev
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to verify certificate.");
        } finally {
            setVerifyingCertificateId(null);
        }
    };

    const downloadFilteredAsCSV = () => {
        if (filteredCertificates.length === 0) {
            alert("No certificates to download.");
            return;
        }

        // Prepare CSV content
        const headers = ["Employee Name", "Employee ID", "Certificate Title", "Category", "Issuing Body", "Date Issued", "Expiry Date", "Status"];
        const rows = filteredCertificates.map((cert) => [
            cert.employeeName,
            cert.employeeId,
            cert.title,
            cert.category,
            cert.issuingBody,
            formatDate(cert.dateIssued),
            cert.expiryDate ? formatDate(cert.expiryDate) : "—",
            cert.status,
        ]);

        // Create CSV string with proper escaping
        const csvContent = [
            headers.map((h) => `"${h}"`).join(","),
            ...rows.map((row) =>
                row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        // Create and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `certificates_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const resetForm = () => {
        setSelectedEmployee("");
        setDocumentType(DOCUMENT_TYPES[0]);
        setIssuingBody("");
        setCertNumber("");
        setDateIssued("");
        setExpiryDate("");
        setDescription("");
        setSelectedFile(null);
        setShowUploadForm(false);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const inputClass =
        "w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm";
    const labelClass = "block text-xs font-medium text-stone-600 mb-1";

    return (
        <div className="space-y-6 pb-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <ScanLine className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-stone-900">
                                Certificates &amp; MOV Documents
                            </h1>
                            <p className="text-[13px] text-stone-400">
                                Upload, scan, and manage employee certificates and means of verification
                            </p>
                        </div>
                    </div>
                    {userRole !== "President" && (
                        <button
                            onClick={() => setShowUploadForm(!showUploadForm)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all"
                        >
                            <Upload className="w-4 h-4" />
                            {showUploadForm ? "Hide Upload Form" : "Upload Certificate"}
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Certificates"
                        value={stats.total}
                        icon={<FileCheck className="w-5 h-5 text-green-700" />}
                        accent="bg-green-50"
                    />
                    <StatsCard
                        label="Pending Verification"
                        value={stats.pending}
                        icon={<Clock className="w-5 h-5 text-amber-600" />}
                        accent="bg-amber-50"
                    />
                    <StatsCard
                        label="Verified"
                        value={stats.verified}
                        icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                        accent="bg-emerald-50"
                    />
                    <StatsCard
                        label="Expired"
                        value={stats.expired}
                        icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                        accent="bg-red-50"
                    />
                </div>

                {/* Upload Form */}
                {showUploadForm && (
                    <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-green-700" />
                                <h2 className="text-sm font-semibold text-stone-800">
                                    Upload New Certificate / MOV
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowUploadForm(false)}
                                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className={labelClass}>Employee *</label>
                                <select
                                    className={inputClass}
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Select employee...</option>
                                    {employeeOptions.map((emp) => (
                                        <option key={emp.employeeNo} value={emp.employeeNo}>
                                            {emp.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Certificate / Document Type *</label>
                                <select
                                    className={inputClass}
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                >
                                    {DOCUMENT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Issuing Body</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. Civil Service Commission"
                                    value={issuingBody}
                                    onChange={(e) => setIssuingBody(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Certificate Number *</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="e.g. CSC-PRO-2024-00123"
                                    value={certNumber}
                                    onChange={(e) => setCertNumber(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Date Issued *</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={dateIssued}
                                    onChange={(e) => setDateIssued(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Expiry Date (optional)</label>
                                <input
                                    type="date"
                                    className={inputClass}
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className={labelClass}>Description</label>
                            <textarea
                                className={`${inputClass} resize-none`}
                                rows={2}
                                placeholder="Brief description of the certificate or document..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Drag & Drop Zone */}
                        <div
                            className={`relative border-dashed border-2 rounded-xl p-8 transition-all text-center ${isDragging
                                    ? "border-green-500 bg-green-50"
                                    : "border-stone-300 bg-stone-50 hover:border-stone-400"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-8 h-8 text-green-600" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-stone-800">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-stone-400">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="ml-4 p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                                    <div className="flex items-center justify-center gap-1 text-sm text-stone-500">
                                        <label
                                            htmlFor="cert-file-upload"
                                            className="font-semibold text-green-700 cursor-pointer hover:text-green-800 transition-colors"
                                        >
                                            Click to upload
                                        </label>
                                        <span>or drag and drop</span>
                                    </div>
                                    <p className="text-xs text-stone-400 mt-1">
                                        PDF, PNG, JPG up to 10MB
                                    </p>
                                    <input
                                        id="cert-file-upload"
                                        type="file"
                                        className="sr-only"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                    />
                                </>
                            )}
                        </div>

                        {/* Upload Button */}
                        <div className="flex items-center justify-end gap-3 mt-5">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-[13px] font-medium text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-[13px] font-medium rounded-lg hover:bg-green-800 active:scale-[0.98] shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {uploading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Upload Certificate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Certificates Table */}
                <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm">
                    {/* Table Header / Filters */}
                    <div className="p-5 border-b border-stone-100">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <h2 className="text-sm font-semibold text-stone-800">
                                All Certificates
                                <span className="ml-2 text-xs font-normal text-stone-400">
                                    ({filteredCertificates.length} records)
                                </span>
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        className="pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all w-56"
                                        placeholder="Search certificates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <select
                                        className="pl-8 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all appearance-none"
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Training">Training</option>
                                        <option value="Eligibility">Eligibility</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <select
                                        className="pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all appearance-none"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Expired">Expired</option>
                                        <option value="Pending Verification">Pending</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Employee Filter */}
                                <div className="relative">
                                    <select
                                        className="pl-3 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all appearance-none"
                                        value={filterEmployee}
                                        onChange={(e) => setFilterEmployee(e.target.value)}
                                    >
                                        <option value="All">All Employees</option>
                                        {employeeOptions.map((emp) => (
                                            <option key={emp.employeeNo} value={emp.employeeNo}>
                                                {emp.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>

                                {/* Date Range Filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-stone-600">Date Issued:</span>
                                    <input
                                        type="date"
                                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all"
                                        value={filterDateFrom}
                                        onChange={(e) => setFilterDateFrom(e.target.value)}
                                    />
                                    <span className="text-stone-400">to</span>
                                    <input
                                        type="date"
                                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-500 transition-all"
                                        value={filterDateTo}
                                        onChange={(e) => setFilterDateTo(e.target.value)}
                                    />
                                </div>

                                {/* Download Button */}
                                {filteredCertificates.length > 0 && (
                                    <button
                                        onClick={downloadFilteredAsCSV}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                                        title="Download filtered certificates as CSV"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download ({filteredCertificates.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-stone-50/60">
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Employee
                                    </th>
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Certificate Title
                                    </th>
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Category
                                    </th>
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Issuing Body
                                    </th>
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Date Issued
                                    </th>
                                    <th className="text-left text-xs font-medium text-stone-500 px-5 py-3">
                                        Status
                                    </th>
                                    <th className="text-right text-xs font-medium text-stone-500 px-5 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-stone-400 text-sm"
                                        >
                                            Loading certificates...
                                        </td>
                                    </tr>
                                ) : loadError ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-red-500 text-sm"
                                        >
                                            {loadError}
                                        </td>
                                    </tr>
                                ) : filteredCertificates.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-stone-400 text-sm"
                                        >
                                            No certificates found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCertificates.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className="hover:bg-stone-50/50 transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-stone-800 text-[13px]">
                                                    {cert.employeeName}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {cert.employeeId}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-[13px] text-stone-700 max-w-[220px] truncate">
                                                    {cert.title}
                                                </p>
                                                <p className="text-xs text-stone-400 font-mono">
                                                    {cert.certificateNumber}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-stone-100 text-stone-600">
                                                    {cert.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-stone-600 max-w-[180px] truncate">
                                                {cert.issuingBody}
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-stone-600">
                                                {formatDate(cert.dateIssued)}
                                                {cert.expiryDate && (
                                                    <p className="text-xs text-stone-400">
                                                        Exp: {formatDate(cert.expiryDate)}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[cert.status]}`}
                                                >
                                                    {STATUS_ICONS[cert.status]}
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        title="View"
                                                        onClick={() => openCertificate(cert)}
                                                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        title="Download"
                                                        onClick={() => handleDownload(cert)}
                                                        disabled={!cert.fileUrl}
                                                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
                        <p className="text-[12px] text-stone-400">
                            {meta ? (
                                <>
                                    Showing{" "}
                                    <span className="font-medium text-stone-600">{meta.total_records === 0 ? 0 : meta.skip + 1}</span>
                                    -
                                    <span className="font-medium text-stone-600">{Math.min(meta.skip + certificates.length, meta.total_records)}</span>
                                    {" "}of{" "}
                                    <span className="font-medium text-stone-600">{meta.total_records}</span> certificates
                                </>
                            ) : (
                                <>
                                    Showing <span className="font-medium text-stone-600">{certificates.length}</span> certificates
                                </>
                            )}
                        </p>
                        {meta && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={!meta.has_previous || loading}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                                </button>
                                <span className="text-[12px] text-stone-500">Page {meta.current_page} of {Math.max(meta.total_pages, 1)}</span>
                                <button
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={!meta.has_next || loading}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {selectedCertificate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={closeCertificate} />
                        <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
                            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-stone-100 bg-white px-6 py-4">
                                <div>
                                    <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                        Certificate Details
                                    </p>
                                    <h3 className="text-[16px] font-bold text-stone-800">
                                        {selectedCertificate.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={closeCertificate}
                                    className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                                >
                                    <X className="w-4 h-4 text-stone-500" />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-5">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Employee
                                        </p>
                                        <p className="font-medium text-stone-800">{selectedCertificate.employeeName}</p>
                                        <p className="text-xs text-stone-500">{selectedCertificate.employeeId}</p>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Status
                                        </p>
                                        <div
                                            className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[selectedCertificate.status]}`}
                                        >
                                            {STATUS_ICONS[selectedCertificate.status]}
                                            {selectedCertificate.status}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Issuing Body
                                        </p>
                                        <p className="font-medium text-stone-800">{selectedCertificate.issuingBody}</p>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Certificate Number
                                        </p>
                                        <p className="font-medium text-stone-800">{selectedCertificate.certificateNumber}</p>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Date Issued
                                        </p>
                                        <p className="font-medium text-stone-800">{formatDate(selectedCertificate.dateIssued)}</p>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                                            Expiry Date
                                        </p>
                                        <p className="font-medium text-stone-800">
                                            {selectedCertificate.expiryDate ? formatDate(selectedCertificate.expiryDate) : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-xl border border-stone-200 p-4">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400 mb-2">
                                            Verification
                                        </p>
                                        <p className="font-medium text-stone-800">
                                            {selectedCertificate.verifiedBy || "Not verified yet"}
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            {selectedCertificate.verifiedAt ? formatDate(selectedCertificate.verifiedAt) : "No verification date"}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-stone-200 p-4">
                                        <p className="text-[11px] uppercase tracking-wide text-stone-400 mb-2">
                                            File
                                        </p>
                                        <p className="font-medium text-stone-800 truncate">
                                            {selectedCertificate.fileName || "No file attached"}
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            {selectedCertificate.fileUrl ? "File ready for download" : "No file available"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(selectedCertificate)}
                                        disabled={!selectedCertificate.fileUrl}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

function StatsCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-stone-200/80 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-stone-900">{value}</p>
                <p className="text-xs text-stone-400">{label}</p>
            </div>
        </div>
    );
}
