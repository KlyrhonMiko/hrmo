import { NextResponse } from 'next/server';
import type { TrainingBudget } from '@/types';

export async function GET(request: Request) {
  try {
    // TODO: Fetch department training budgets from the databases

    // Mocked overall training budget and per-department data
    const budgetData: {
      overall: TrainingBudget;
      departments: TrainingBudget[];
    } = {
      overall: {
        department: 'All Departments',
        allocated: 1500000, // 1.5 million php
        utilized: 350000,
        balance: 1150000,
      },
      departments: [
        {
          department: 'Computer Studies',
          allocated: 300000,
          utilized: 120000,
          balance: 180000,
        },
        {
          department: 'Education',
          allocated: 400000,
          utilized: 150000,
          balance: 250000,
        },
        {
          department: 'Business Administration',
          allocated: 350000,
          utilized: 50000,
          balance: 300000,
        },
      ]
    };

    return NextResponse.json(
      { ...budgetData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/dashboard/training-budget:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
