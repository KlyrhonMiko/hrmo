import React from 'react';
import Link from 'next/link';
import { Shield, UserCog, Eye, User } from 'lucide-react';

export default function Home() {
  const roles = [
    {
      name: 'HR Head',
      path: '/dashboard/hrmo',
      description: 'Full access to employee records, PDS data entry, certificates, training management, reports, and analytics.',
      icon: Shield,
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      iconBg: 'bg-green-100',
    },
    {
      name: 'HR Record Asst',
      path: '/dashboard/hr-record-asst',
      description: 'Manage employee 201 files, PDS data entry, certificate scanning, and training records.',
      icon: UserCog,
      color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
      iconBg: 'bg-teal-100',
    },
    {
      name: 'President',
      path: '/dashboard/president',
      description: 'View high-level dashboards, data analytics, and downloadable reports.',
      icon: Eye,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      iconBg: 'bg-purple-100',
    },
    {
      name: 'Employee',
      path: '/dashboard/employee',
      description: 'View and update your Personal Data Sheet (201 file) and training records.',
      icon: User,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      iconBg: 'bg-amber-100',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-green-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">HR</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">HRMO System</h1>
          <p className="text-stone-500 text-base">Personnel Digitization &amp; Records Management</p>
          <p className="text-stone-400 mt-1 text-sm">Select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.path}
                href={role.path}
                className={`group block p-6 rounded-xl border transition-all duration-200 ${role.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${role.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-1">{role.name}</h2>
                    <p className="text-sm opacity-80 leading-relaxed">{role.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
