export type BackendUserRole = "admin" | "president" | "hr" | "hr-assistant" | "employee";
export type Role = 'HR Head' | 'HR Record Asst' | 'President' | 'Employee';

export interface BackendUser {
    id: string;
    user_no: string;
    surname: string;
    first_name: string;
    middle_name?: string | null;
    email: string;
    phone_number?: string | null;
    username: string;
    role: BackendUserRole;
    employee_id?: string | null;
    created_at?: string;
    updated_at?: string;

    is_deleted?: boolean;
}

export interface EmployeeBasicInfo {
    id: string;
    surname: string;
    first_name: string;
    middle_name?: string | null;
    name_extension?: string | null;
    full_name: string;
}

export interface EmployeeContactInfo {
    telephone_no?: string | null;
    mobile_no: string;
    email_address: string;
}

export interface EmployeeProfile {
    id: string;
    employee_no: string;
    office_department: string;
    position_title: string;
    employment_status: string;
    date_hired: string;
    created_at: string;
    updated_at: string;
    basic_information: EmployeeBasicInfo | null;
    contact_information: EmployeeContactInfo | null;
}



/* ═══════════════════════════════════════════════════════════
   PDS — CSC Form 212 (Personal Data Sheet)
   ═══════════════════════════════════════════════════════════ */

export interface PDSPersonalInfo {
    surname: string;
    firstName: string;
    middleName: string;
    nameExtension: string;
    dateOfBirth: string;
    placeOfBirth: string;
    sex: 'Male' | 'Female';
    civilStatus: 'Single' | 'Married' | 'Widowed' | 'Separated' | 'Other';
    height: string;
    weight: string;
    bloodType: string;
    gsisIdNo: string;
    pagIbigIdNo: string;
    philhealthNo: string;
    sssNo: string;
    tinNo: string;
    agencyEmployeeNo: string;
    citizenship: string;
    dualCitizenshipType?: 'by birth' | 'by naturalization';
    dualCitizenshipCountry?: string;
    residentialAddress: PDSAddress;
    permanentAddress: PDSAddress;
    telephoneNo: string;
    mobileNo: string;
    email: string;
}

export interface PDSAddress {
    houseBlockLot: string;
    street: string;
    subdivision: string;
    barangay: string;
    cityMunicipality: string;
    province: string;
    zipCode: string;
}

export interface PDSFamilyBackground {
    spouseSurname: string;
    spouseFirstName: string;
    spouseMiddleName: string;
    spouseNameExtension: string;
    spouseOccupation: string;
    spouseEmployerBusinessName: string;
    spouseBusinessAddress: string;
    spouseTelephoneNo: string;
    fatherSurname: string;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherNameExtension: string;
    motherMaidenSurname: string;
    motherFirstName: string;
    motherMiddleName: string;
    children: PDSChild[];
}

export interface PDSChild {
    fullName: string;
    surname?: string;
    firstName?: string;
    middleName?: string;
    nameExtension?: string;
    dateOfBirth: string;
}

export interface PDSEducation {
    level: 'Elementary' | 'Secondary' | 'Vocational/Trade' | 'College' | 'Graduate Studies';
    schoolName: string;
    basicEducationDegreeCourse: string;
    periodFrom: string;
    periodTo: string;
    highestLevelUnitsEarned: string;
    yearGraduated: string;
    scholarshipAcademicHonorsReceived: string;
}

export interface PDSCivilServiceEligibility {
    careerService: string;
    rating: string;
    dateOfExamination: string;
    placeOfExamination: string;
    licenseNumber: string;
    dateOfValidity: string;
}

export interface PDSWorkExperience {
    dateFrom: string;
    dateTo: string;
    positionTitle: string;
    department: string;
    monthlySalary: string;
    salaryGrade: string;
    statusOfAppointment: string;
    isGovernmentService: boolean;
}

export interface PDSVoluntaryWork {
    organizationName: string;
    organizationAddress: string;
    dateFrom: string;
    dateTo: string;
    numberOfHours: string;
    positionNatureOfWork: string;
}

export interface PDSLearningDevelopment {
    title: string;
    dateFrom: string;
    dateTo: string;
    numberOfHours: string;
    type: string;
    conductedSponsoredBy: string;
}

export interface PDSOtherInfo {
    specialSkillsHobbies: string[];
    nonAcademicDistinctions: string[];
    membershipInAssociations: string[];
}

export interface PDSReference {
    name: string;
    address: string;
    telephoneNo: string;
}

export interface PDSGovernmentIssuedID {
    idType: string;
    idNumber: string;
    dateOfIssuance: string;
    placeOfIssuance: string;
}

/* ───────────────────────── Dashboard Types ───────────────────────── */

export interface EmployeeDashboardData {
    profile: {
        full_name: string;
        position: string;
        department: string;
        employee_no: string;
    };
    stats: {
        years_service: number;
        total_trainings: number;
        total_documents: number;
        annual_training_hours: number;
        training_target: number;
        pending_requests_count: number;
        verified_docs_count: number;
        pending_docs_count: number;
        pds_status: string;
        last_pds_update: string;
    };
    upcoming_trainings: {
        title: string;
        date: string;
        venue: string;
        type: string;
    }[];
    recent_documents: {
        name: string;
        date: string;
        status: "verified" | "pending";
    }[];
    training_progress: {
        category: string;
        completed: number;
        target: number;
    }[];
    action_items: {
        text: string;
        priority: "high" | "medium" | "low";
        icon: string; // Icon name string for mapping
    }[];
}

export interface FullPDS {
    id?: string;
    personalInfo: PDSPersonalInfo;
    familyBackground: PDSFamilyBackground;
    education: PDSEducation[];
    civilServiceEligibility: PDSCivilServiceEligibility[];
    workExperience: PDSWorkExperience[];
    voluntaryWork: PDSVoluntaryWork[];
    learningDevelopment: PDSLearningDevelopment[];
    otherInfo: PDSOtherInfo;
    references: PDSReference[];
    governmentIssuedId: PDSGovernmentIssuedID;
    photoUrl?: string;
    dateAccomplished?: string;
    office: string;
    employmentStatus: 'Teaching' | 'Non-Teaching' | 'COS';
    createdAt?: string;
    updatedAt?: string;
}

/* ═══════════════════════════════════════════════════════════
   DOCUMENTS / MOV / CERTIFICATES
   ═══════════════════════════════════════════════════════════ */

export interface DocumentMOV {
    id?: string;
    documentType: string;
    serialNumber: string;
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
    uploadedAt?: string;
    uploadedBy?: string;
    employeeId?: string;
    category: 'Certificate' | 'Diploma' | 'Transcript' | 'License' | 'Training Certificate' | 'Service Record' | 'Appointment' | 'Other';
    description?: string;
    status?: 'Pending' | 'Verified' | 'Rejected';
}

export interface CertificateRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    title: string;
    issuingBody: string;
    dateIssued: string;
    expiryDate?: string;
    certificateNumber: string;
    category: 'Training' | 'Eligibility' | 'Academic' | 'Professional' | 'Other';
    fileUrl: string;
    fileName: string;
    status: 'Active' | 'Expired' | 'Pending Verification';
    verifiedBy?: string;
    verifiedAt?: string;
}

/* ═══════════════════════════════════════════════════════════
   EMPLOYEE 201 FILE
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   EMPLOYEE 201 FILE
   ═══════════════════════════════════════════════════════════ */

export interface TimelineRecord {
    schoolYear: string;
    semester: '1st Semester' | '2nd Semester' | 'Midyear / Summer Term';
    status: 'Active' | 'Inactive';
    remarks?: string;
}

export interface Employee201 {
    id: string;
    employeeNo: string;
    fullName: string;
    surname: string;
    firstName: string;
    middleName: string;
    office: string;
    position: string;
    salaryGrade?: string;
    stepIncrement?: string;
    employmentStatus: 'Teaching' | 'Non-Teaching' | 'COS';
    dateHired: string;
    email: string;
    mobileNo: string;
    pds?: FullPDS;
    documents: DocumentMOV[];
    certificates: CertificateRecord[];
    trainingsAttended: TrainingRecord[];
    timeline?: TimelineRecord[];
    profilePhoto?: string;
    isActive: boolean;
}

/* ═══════════════════════════════════════════════════════════
   TRAINING
   ═══════════════════════════════════════════════════════════ */

export interface TrainingRecord {
    id: string;
    training_title?: string;
    training_type?: string;
    date_from?: string;
    date_to?: string;
    number_of_hours?: string;
    conducted_by?: string;
    basic_information_id?: string;

    // Common aliases/extensions used in routes and components
    title?: string;
    type?: string;
    status?: string;
    venue?: string;
    numberOfHours?: number;
    conductedBy?: string;
    dateFrom?: string;
    dateTo?: string;
}

export type TrainingRequestStatus = "pending" | "approved" | "rejected" | "completed";

export interface TrainingRequest {
    id: string;
    employee_id: string;
    title: string;
    training_type: string;
    provider: string;
    venue: string;
    date_from: string;
    date_to: string;
    estimated_cost: number;
    justification: string;
    status: TrainingRequestStatus;
    submitted_at: string;
    remarks?: string | null;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    training_event_id?: string | null;
    // Extensions for HRMO management view
    employee_name?: string;
    employee_no?: string;
    office?: string;
    number_of_hours?: number;
}

export interface EmpTrainingStats {
    attended: number;
    hours: number;
    pending: number;
    approved: number;
}

export interface TrainingEvent {
    id: string;
    training_title: string;
    training_type: string;
    status: string;
    conducted_by: string;
    venue: string;
    date_from: string;
    date_to: string;
    hours: number;
    participant_count: number;
}

/* ═══════════════════════════════════════════════════════════
   BUDGETS / ANALYTICS
   ═══════════════════════════════════════════════════════════ */

export interface TrainingBudget {
    department: string;
    allocated: number;
    utilized: number;
    balance: number;
}

/* ═══════════════════════════════════════════════════════════
   REPORTS
   ═══════════════════════════════════════════════════════════ */

export interface ReportResult {
    group: string;
    value: number;
}

export interface SavedReport {
    id: string;
    title: string;
    description: string;
    groupBy: 'department' | 'status' | 'degree' | 'office' | 'training';
    createdAt: string;
    createdBy: string;
    results: ReportResult[];
}

/* ═══════════════════════════════════════════════════════════
   LEGACY — kept for backward compat
   ═══════════════════════════════════════════════════════════ */

export interface EmployeePDS {
    firstName: string;
    lastName: string;
    email: string;
    status: 'Teaching' | 'Non-Teaching' | 'COS';
    documents: DocumentMOV[];
}

export interface PaginationMeta {
    skip: number;
    limit: number;
    current_page: number;
    total_pages: number;
    total_records: number;
    has_previous: boolean;
    has_next: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
