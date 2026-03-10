import React from 'react';
import Link from 'next/link';

export default function Home() {
  const roles = [
    {
      name: 'HR Head',
      path: '/dashboard/hrmo',
      description: 'Manage employees, training, and overall HR operations.',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    },
    {
      name: 'Lifelong Head',
      path: '/dashboard/lifelong-head',
      description: 'Oversee training budgets and lifelong learning programs.',
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
    },
    {
      name: 'President',
      path: '/dashboard/president',
      description: 'View high-level reports and analytics.',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
    },
    {
      name: 'Employee',
      path: '/dashboard/employee',
      description: 'Manage Personal Data Sheet (PDS) and training requests.',
      color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">HRMO System</h1>
          <p className="text-gray-600 text-lg">Personnel Digitization and Lifelong Training System</p>
          <p className="text-gray-500 mt-2 text-sm">Select your role to access the relevant dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <Link key={role.path} href={role.path} className={`block p-8 rounded-xl border transition-all ${role.color}`}>
              <h2 className="text-2xl font-semibold mb-3">{role.name}</h2>
              <p className="opacity-90 leading-relaxed">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
