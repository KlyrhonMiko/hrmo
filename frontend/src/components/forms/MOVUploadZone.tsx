"use client";

import React, { useCallback, useState } from 'react';
import type { DocumentMOV } from '@/types';

interface MOVUploadZoneProps {
    onUploadSuccess: (document: Partial<DocumentMOV>) => void;
}

export function MOVUploadZone({ onUploadSuccess }: MOVUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState<DocumentMOV['documentType']>('Certificate');
    const [serialNum, setSerialNum] = useState('');

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                await uploadFile(files[0]);
            }
        },
        [docType, serialNum]
    );

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        if (!serialNum) {
            alert('Please provide a serial number before uploading.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', docType);
        formData.append('serialNumber', serialNum);

        try {
            const response = await fetch('/api/upload-mov', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            onUploadSuccess({
                documentType: docType,
                serialNumber: serialNum,
                fileUrl: data.url,
            });

            // Reset after success
            setSerialNum('');
            setUploading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Method of Verification (MOV)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as DocumentMOV["documentType"])}
                    >
                        <option value="Certificate">Certificate</option>
                        <option value="Diploma">Diploma</option>
                        <option value="ID">ID</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial/Control Number</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. CERT-2023-001"
                        value={serialNum}
                        onChange={(e) => setSerialNum(e.target.value)}
                    />
                </div>
            </div>

            <div
                className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-900/25'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                        >
                            <span>Upload a file</span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG up to 10MB</p>
                    {uploading && <p className="mt-2 text-sm text-indigo-600 font-medium animate-pulse">Uploading...</p>}
                </div>
            </div>
        </div>
    );
}
