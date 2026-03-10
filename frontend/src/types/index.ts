export interface DocumentMOV {
    documentType: string;
    serialNumber: string;
    fileUrl: string;
}

export interface EmployeePDS {
    firstName: string;
    lastName: string;
    email: string;
    status: 'Teaching' | 'Non-Teaching' | 'COS';
    documents: DocumentMOV[];
}

export interface TrainingBudget {
    department: string;
    allocated: number;
    utilized: number;
    balance: number;
}

export type Role = 'HR Head' | 'Lifelong Head' | 'President' | 'Employee';

export interface ReportResult {
    group: string;
    value: number;
}
