import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy'); // e.g., 'department' or 'status'

    if (!groupBy) {
      return NextResponse.json(
        { error: 'Missing groupBy parameter' },
        { status: 400 }
      );
    }

    // Mock query logic checking the database grouping by department/status
    // const counts = await prisma.employee.groupBy({
    //   by: [groupBy],
    //   _count: {
    //     _all: true,
    //   },
    // });

    // Mocked response for demo purposes
    let data = [];
    if (groupBy === 'department') {
      data = [
        { group: 'CCS', value: 45 },
        { group: 'CIHM', value: 33 },
        { group: 'COED', value: 42 },
        { group: 'Business Administration', value: 65 },
        { group: 'HRMO', value: 5 },
      ];
    } else if (groupBy === 'status') {
      data = [
        { group: 'Teaching', value: 244 },
        { group: 'Non-Teaching', value: 103 },
        { group: 'COS', value: 34 },
      ];
    } else if (groupBy === 'degree') {
      data = [
        { group: 'Bachelors', value: 156 },
        { group: 'Masters', value: 180 },
        { group: 'Doctorate', value: 45 },
      ];
    } else {
      return NextResponse.json({ error: 'Invalid groupBy parameter' }, { status: 400 });
    }

    return NextResponse.json(
      { data },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error in /api/reports/dynamic:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
