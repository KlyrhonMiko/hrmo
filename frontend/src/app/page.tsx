import React from 'react';
import Link from 'next/link';
import { Shield, UserCog, Eye, User, ChevronRight, Briefcase, GraduationCap, FileBarChart } from 'lucide-react';

export default function Home() {
  const roles = [
    {
      name: 'HR Head',
      path: '/dashboard/hrmo',
      description: 'Full administrative control over employee records, PDS entries, and full organizational analytics.',
      icon: Shield,
      pill: 'Full Access',
      color: 'from-emerald-500/20 to-emerald-600/5 hover:to-emerald-600/10',
      borderColor: 'border-emerald-200/50 hover:border-emerald-300',
      iconColor: 'bg-emerald-100 text-emerald-700',
      tagColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      name: 'HR Record Asst',
      path: '/dashboard/hr-record-asst',
      description: 'Streamlined tools for PDS data entry, certificate scanning, and daily record maintenance.',
      icon: UserCog,
      pill: 'Management',
      color: 'from-cyan-500/20 to-cyan-600/5 hover:to-cyan-600/10',
      borderColor: 'border-cyan-200/50 hover:border-cyan-300',
      iconColor: 'bg-cyan-100 text-cyan-700',
      tagColor: 'bg-cyan-100 text-cyan-700'
    },
    {
      name: 'President',
      path: '/dashboard/president',
      description: 'Executive oversight with high-level analytics, tracking reports, and organizational metrics.',
      icon: Eye,
      pill: 'Executive View',
      color: 'from-indigo-500/20 to-indigo-600/5 hover:to-indigo-600/10',
      borderColor: 'border-indigo-200/50 hover:border-indigo-300',
      iconColor: 'bg-indigo-100 text-indigo-700',
      tagColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      name: 'Employee',
      path: '/dashboard/employee',
      description: 'Personal portal to manage your PDS, track training progress, and access your 201 file.',
      icon: User,
      pill: 'Personal Portal',
      color: 'from-amber-500/20 to-amber-600/5 hover:to-amber-600/10',
      borderColor: 'border-amber-200/50 hover:border-amber-300',
      iconColor: 'bg-amber-100 text-amber-700',
      tagColor: 'bg-amber-100 text-amber-700'
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full" />

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-stone-200 rounded-full shadow-sm mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Digital Records System</span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-2 animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-xl shadow-green-900/10">
              <Briefcase className="text-white w-8 h-8" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            HRMO <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-teal-600">Portal</span>
          </h1>

          <p className="text-stone-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            Empowering Pasig City with a unified, secure, and modern
            <span className="font-semibold text-stone-800"> Personnel Digitization & Records Management </span>
            solution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.path}
                href={role.path}
                className={`group relative p-8 rounded-3xl border bg-gradient-to-br ${role.color} ${role.borderColor} transition-all duration-300 hover:shadow-2xl hover:shadow-stone-200 hover:-translate-y-1 block`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${role.iconColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${role.tagColor} border border-white/50 shadow-sm`}>
                      {role.pill}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-stone-900 mb-3 flex items-center gap-2">
                    {role.name}
                    <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-stone-400" />
                  </h2>

                  <p className="text-stone-600 text-[15px] leading-relaxed mb-6">
                    {role.description}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-stone-400 group-hover:text-stone-600 transition-colors uppercase tracking-widest">
                    Get Started
                    <div className="h-px w-0 bg-stone-300 transition-all duration-500 group-hover:w-8 ml-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 pt-8 border-t border-stone-200/60 text-center animate-in fade-in duration-1000 delay-1000">
          <div className="flex items-center justify-center gap-8 mb-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-tighter">Academic Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-tighter">Instant Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-tighter">Secure 201 Files</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-stone-400 uppercase tracking-[0.2em]">
            &copy; 2026 Pasig City Human Resource Management Office
          </p>
        </div>
      </div>
    </div>
  );
}
