"use client";

import React, { useState } from 'react';
import { MOVUploadZone } from './MOVUploadZone';
import type { EmployeePDS, DocumentMOV } from '@/types';

export function EmployeePDSForm() {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<EmployeePDS>>({
        status: 'Teaching',
        documents: [],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: Partial<EmployeePDS>) => ({ ...prev, [name]: value }));
    };

    const handleDocumentUpload = (document: Partial<DocumentMOV>) => {
        setFormData((prev: Partial<EmployeePDS>) => ({
            ...prev,
            documents: [...(prev.documents || []), document as DocumentMOV],
        }));
    };

    const submitForm = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/employees/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Submission failed');
            alert('PDS submitted successfully!');
            // Reset form
            setStep(1);
            setFormData({ status: 'Teaching', documents: [] });
        } catch (error) {
            alert('Failed to submit PDS');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Employee PDS Onboarding</h2>
                    <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
                </div>
                <div className="flex space-x-2">
                    <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                    <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                </div>
            </div>

            <div className="p-8">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                                <select
                                    name="status"
                                    value={formData.status || 'Teaching'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                >
                                    <option value="Teaching">Teaching</option>
                                    <option value="Non-Teaching">Non-Teaching</option>
                                    <option value="COS">Contract of Service (COS)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
                            >
                                Next Step: Documents
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-semibold text-gray-700">Credentials & Documents</h3>
                        <p className="text-sm text-gray-500 mb-4">Please upload any required Method of Verification (MOV) files.</p>

                        <MOVUploadZone onUploadSuccess={handleDocumentUpload} />

                        {formData.documents && formData.documents.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents:</h4>
                                <ul className="space-y-2">
                                    {formData.documents.map((doc: DocumentMOV, idx: number) => (
                                        <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center">
                                                <span className="text-indigo-600 mr-3">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                </span>
                                                <span className="text-sm font-medium text-gray-800">{doc.documentType}</span>
                                                <span className="text-xs text-gray-500 ml-2">({doc.serialNumber})</span>
                                            </div>
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                                View
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-between pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={submitForm}
                                disabled={submitting}
                                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-md shadow-green-200 transition-all disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Complete Onboarding'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
