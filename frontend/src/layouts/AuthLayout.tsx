import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-tr from-brand-950 via-slate-900 to-brand-900 relative overflow-hidden">
      {/* Dynamic graphic backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Car className="w-10 h-10 text-accent-500" />
            <span className="font-extrabold text-2xl text-white tracking-wider">DriveElite</span>
          </Link>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            Dealership Administration
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
