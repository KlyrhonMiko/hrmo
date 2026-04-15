import { NextResponse } from "next/server";

import type { TrainingRecord } from "@/types";
import { backendEnvelopeRequest, backendRequest, BackendApiError } from "@/lib/backend-api";

type BackendEmployee = {
    id: string;
    employee_no: string;
    office_department: string;
    basic_information?: {
        full_name?: string | null;
        surname?: string | null;
        first_name?: string | null;
        middle_name?: string | null;
    } | null;
};

type BackendTrainingParticipant = {
    employee_id: string;
    employee_no: string;
    name: string;
    office_department: string;
};

type BackendTrainingEvent = {
    id: string;
    training_title: string;
    training_type: string;
    status: string;
    conducted_by: string;
    venue: string;
    date_from: string;
    date_to: string;
    hours: number;
    participants: BackendTrainingParticipant[];
};

type TrainingTrackingEmployeeOption = {
    id: string;
    employeeNo: string;
    name: string;
    office: string;
};

type TrainingTrackingRecord = TrainingRecord & {
    participants: { id: string; employeeNo: string; name: string; office: string }[];
};

type CreateTrainingTrackingPayload = {
    id?: string;
    title: string;
    type: TrainingRecord["type"];
    status: TrainingRecord["status"];
    conductedBy: string;
    venue: string;
    dateFrom: string;
    dateTo: string;
    numberOfHours: number;
    participantIds: string[];
};

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

function clean(value?: string | null): string {
    return (value || "").trim();
}

function hasValue(value?: string | null): boolean {
    return clean(value).length > 0;
}

function normalizeTrainingType(value: string): TrainingRecord["type"] {
    const normalized = value.trim().toLowerCase();
    const match = TRAINING_TYPES.find((item) => item.toLowerCase() === normalized);
    return match || "Other";
}

function normalizeStatus(value: string): TrainingRecord["status"] {
    const normalized = value.trim().toLowerCase();
    const match = STATUSES.find((item) => item.toLowerCase() === normalized);
    return match || "Upcoming";
}

function buildEmployeeName(employee: BackendEmployee): string {
    const fullName = clean(employee.basic_information?.full_name);
    if (fullName) {
        return fullName;
    }

    const surname = clean(employee.basic_information?.surname);
    const firstName = clean(employee.basic_information?.first_name);
    const middleName = clean(employee.basic_information?.middle_name);
    const middleInitial = middleName ? `${middleName.charAt(0)}.` : "";
    const fallback = `${surname}, ${firstName} ${middleInitial}`.trim().replace(/\s+/g, " ");

    return fallback || employee.employee_no;
}

function mapTrainingEvent(trainingEvent: BackendTrainingEvent): TrainingTrackingRecord {
    return {
        id: trainingEvent.id,
        title: trainingEvent.training_title,
        type: normalizeTrainingType(trainingEvent.training_type),
        conductedBy: trainingEvent.conducted_by,
        venue: trainingEvent.venue,
        dateFrom: trainingEvent.date_from,
        dateTo: trainingEvent.date_to,
        numberOfHours: Number(trainingEvent.hours) || 0,
        status: normalizeStatus(trainingEvent.status),
        participants: (trainingEvent.participants || []).map((participant) => ({
            id: participant.employee_id,
            employeeNo: participant.employee_no,
            name: participant.name,
            office: participant.office_department,
        })),
    };
}

async function loadEmployees(): Promise<TrainingTrackingEmployeeOption[]> {
    const response = await backendEnvelopeRequest<BackendEmployee[]>("/api/employees/all?skip=0&limit=500");
    const employees = response.data || [];

    return employees.map((employee) => ({
        id: employee.id,
        employeeNo: employee.employee_no,
        name: buildEmployeeName(employee),
        office: employee.office_department,
    }));
}

async function loadTrainingEvents(): Promise<TrainingTrackingRecord[]> {
    const response = await backendEnvelopeRequest<BackendTrainingEvent[]>("/api/training-tracking/events?skip=0&limit=500");
    return (response.data || []).map(mapTrainingEvent);
}

function hasRequiredTrainingFields(payload: Partial<CreateTrainingTrackingPayload>): boolean {
    return (
        hasValue(payload.title) &&
        hasValue(payload.type) &&
        hasValue(payload.status) &&
        hasValue(payload.conductedBy) &&
        hasValue(payload.venue) &&
        hasValue(payload.dateFrom) &&
        hasValue(payload.dateTo)
    );
}

export async function GET() {
    try {
        const [employees, trainings] = await Promise.all([
            loadEmployees(),
            loadTrainingEvents(),
        ]);

        return NextResponse.json(
            {
                success: true,
                data: {
                    employees,
                    trainings,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to load training tracking data.";

        return NextResponse.json(
            {
                success: false,
                message,
                details: error instanceof BackendApiError ? error.details : undefined,
            },
            { status }
        );
    }
}

export async function POST(request: Request) {
    try {
        const payload = (await request.json()) as Partial<CreateTrainingTrackingPayload>;

        if (!hasRequiredTrainingFields(payload)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields for training event.",
                },
                { status: 400 }
            );
        }

        const created = await backendRequest<BackendTrainingEvent>("/api/training-tracking/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                training_title: payload.title,
                training_type: payload.type,
                status: payload.status,
                conducted_by: payload.conductedBy,
                venue: payload.venue,
                date_from: payload.dateFrom,
                date_to: payload.dateTo,
                hours: Number(payload.numberOfHours || 0),
                participant_employee_ids: payload.participantIds || [],
            }),
        });

        return NextResponse.json(
            {
                success: true,
                data: mapTrainingEvent(created),
            },
            { status: 201 }
        );
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to create training event.";

        return NextResponse.json(
            {
                success: false,
                message,
                details: error instanceof BackendApiError ? error.details : undefined,
            },
            { status }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const payload = (await request.json()) as Partial<CreateTrainingTrackingPayload>;
        const eventId = clean(payload.id);

        if (!eventId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Training event ID is required for update.",
                },
                { status: 400 }
            );
        }

        if (!hasRequiredTrainingFields(payload)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields for training event.",
                },
                { status: 400 }
            );
        }
        const requestedParticipantIds = Array.from(new Set(payload.participantIds || []));

        const currentEvent = await backendEnvelopeRequest<BackendTrainingEvent>(
            `/api/training-tracking/events/${encodeURIComponent(eventId)}`
        );
        const currentParticipants = currentEvent.data?.participants || [];
        const currentParticipantIds = new Set(currentParticipants.map((participant) => participant.employee_id));
        const requestedParticipantSet = new Set(requestedParticipantIds);

        const participantIdsToAdd = requestedParticipantIds.filter((participantId) => !currentParticipantIds.has(participantId));
        const participantIdsToRemove = Array.from(currentParticipantIds).filter((participantId) => !requestedParticipantSet.has(participantId));

        await backendRequest(`/api/training-tracking/events/${encodeURIComponent(eventId)}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                training_title: payload.title,
                training_type: payload.type,
                status: payload.status,
                conducted_by: payload.conductedBy,
                venue: payload.venue,
                date_from: payload.dateFrom,
                date_to: payload.dateTo,
                hours: Number(payload.numberOfHours || 0),
            }),
        });

        if (participantIdsToAdd.length > 0) {
            await backendRequest(`/api/training-tracking/events/${encodeURIComponent(eventId)}/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employee_ids: participantIdsToAdd,
                }),
            });
        }

        await Promise.all(
            participantIdsToRemove.map((participantId) =>
                backendRequest(
                    `/api/training-tracking/events/${encodeURIComponent(eventId)}/participants/${encodeURIComponent(participantId)}`,
                    {
                        method: "DELETE",
                    }
                )
            )
        );

        const updatedEvent = await backendEnvelopeRequest<BackendTrainingEvent>(
            `/api/training-tracking/events/${encodeURIComponent(eventId)}`
        );

        return NextResponse.json(
            {
                success: true,
                data: updatedEvent.data ? mapTrainingEvent(updatedEvent.data) : null,
            },
            { status: 200 }
        );
    } catch (error) {
        const status = error instanceof BackendApiError ? error.status : 500;
        const message = error instanceof Error ? error.message : "Failed to update training event.";

        return NextResponse.json(
            {
                success: false,
                message,
                details: error instanceof BackendApiError ? error.details : undefined,
            },
            { status }
        );
    }
}
