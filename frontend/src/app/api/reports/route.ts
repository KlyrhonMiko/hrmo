import { NextResponse } from 'next/server';
import type { SavedReport, ReportResult } from '@/types';

// In-memory store for demo — replace with DB in production
let savedReports: SavedReport[] = [
    {
        id: '1',
        title: 'Q1 2026 Department Headcount',
        description: 'Personnel distribution across all academic departments for the first quarter.',
        groupBy: 'department',
        createdAt: '2026-02-15T08:30:00Z',
        createdBy: 'HR Head',
        results: [
            { group: 'CCS', value: 45 },
            { group: 'CIHM', value: 33 },
            { group: 'COED', value: 42 },
            { group: 'CBA', value: 65 },
            { group: 'CAS', value: 38 },
            { group: 'COE', value: 29 },
            { group: 'CON', value: 18 },
        ],
    },
    {
        id: '2',
        title: 'Employment Status Breakdown',
        description: 'Overview of employee types: teaching, non-teaching, and COS personnel.',
        groupBy: 'status',
        createdAt: '2026-03-01T10:15:00Z',
        createdBy: 'HR Head',
        results: [
            { group: 'Teaching', value: 244 },
            { group: 'Non-Teaching', value: 103 },
            { group: 'COS', value: 34 },
        ],
    },
];

function generateMockResults(groupBy: string): ReportResult[] {
    if (groupBy === 'department') {
        return [
            { group: 'CCS', value: 45 },
            { group: 'CIHM', value: 33 },
            { group: 'COED', value: 42 },
            { group: 'CBA', value: 65 },
            { group: 'CAS', value: 38 },
            { group: 'COE', value: 29 },
            { group: 'CON', value: 18 },
        ];
    } else if (groupBy === 'status') {
        return [
            { group: 'Teaching', value: 244 },
            { group: 'Non-Teaching', value: 103 },
            { group: 'COS', value: 34 },
        ];
    } else if (groupBy === 'degree') {
        return [
            { group: 'Bachelors', value: 156 },
            { group: 'Masters', value: 180 },
            { group: 'Doctorate', value: 45 },
        ];
    }
    return [];
}

let nextId = 3;

export async function GET() {
    return NextResponse.json({ data: savedReports }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, groupBy } = body;

        if (!title || !groupBy) {
            return NextResponse.json(
                { error: 'Missing required fields: title, groupBy' },
                { status: 400 }
            );
        }

        const newReport: SavedReport = {
            id: String(nextId++),
            title,
            description: description || '',
            groupBy,
            createdAt: new Date().toISOString(),
            createdBy: 'HR Head',
            results: generateMockResults(groupBy),
        };

        savedReports.unshift(newReport);
        return NextResponse.json({ data: newReport }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        const index = savedReports.findIndex((r) => r.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        savedReports.splice(index, 1);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
