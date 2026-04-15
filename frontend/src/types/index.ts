/* ═══════════════════════════════════════════════════════════
   ROLES
   ═══════════════════════════════════════════════════════════ */

export type Role = 'HR Head' | 'HR Record Asst' | 'President' | 'Employee';

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

export interface Employee201 {
    id: string;
    employeeNo: string;
    fullName: string;
    surname: string;
    firstName: string;
    middleName: string;
    office: string;
    position: string;
    employmentStatus: 'Teaching' | 'Non-Teaching' | 'COS';
    dateHired: string;
    email: string;
    mobileNo: string;
    pds?: FullPDS;
    documents: DocumentMOV[];
    certificates: CertificateRecord[];
    trainingsAttended: TrainingRecord[];
    profilePhoto?: string;
    isActive: boolean;
}

/* ═══════════════════════════════════════════════════════════
   TRAINING
   ═══════════════════════════════════════════════════════════ */

export interface TrainingRecord {
    id: string;
    title: string;
    type: 'Seminar' | 'Workshop' | 'Conference' | 'Webinar' | 'Certification' | 'Other';
    conductedBy: string;
    venue: string;
    dateFrom: string;
    dateTo: string;
    numberOfHours: number;
    status: 'Completed' | 'Ongoing' | 'Upcoming' | 'Cancelled';
    certificateUrl?: string;
    employeeId?: string;
    employeeName?: string;
    office?: string;
}

export interface TrainingRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    trainingTitle: string;
    trainingType: 'Seminar' | 'Workshop' | 'Conference' | 'Webinar' | 'Certification' | 'Other';
    provider: string;
    venue: string;
    dateFrom: string;
    dateTo: string;
    estimatedCost: number;
    justification: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
    submittedAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
    remarks?: string;
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
