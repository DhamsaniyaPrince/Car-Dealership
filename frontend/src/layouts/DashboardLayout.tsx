import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES'] },
    { name: 'Manage Vehicles', path: '/dashboard/vehicles', icon: Car, roles: ['ADMIN', 'SALES'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-obsidian-900 overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-obsidian-950/80 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-premium md:translate-x-0 md:static md:h-full ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0d0f14 0%, #08090d 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-gold-sm">
              <Car className="w-4 h-4 text-obsidian-900" />
            </div>
            <span className="font-display font-black text-base text-white tracking-widest">
              DRIVE<span className="text-gradient-gold">ELITE</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-silver-500 hover:bg-white/8 md:hidden cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-white/4">
          <span className="text-[10px] text-gold-500 font-bold uppercase tracking-[0.2em]">Admin Portal</span>
        </div>

        {/* Nav */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                    active
                      ? 'text-obsidian-900 shadow-gold-sm'
                      : 'text-silver-500 hover:text-white hover:bg-white/5'
                  }`}
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, #c9a84c, #b8922d)',
                        }
                      : {}
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  {item.name}
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/3 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center font-black text-obsidian-900 text-sm shadow-gold-sm shrink-0">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white leading-tight truncate">{user?.name}</span>
              <span className="text-[10px] text-gold-500 font-bold uppercase tracking-widest">{user?.role} Portal</span>
            </div>
          </div>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/8 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-obsidian-850 border-b border-white/5 flex items-center justify-between px-6 z-10 shrink-0"
          style={{ background: 'rgba(13,15,20,0.9)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-silver-500 hover:bg-white/8 hover:text-white md:hidden cursor-pointer transition-colors border border-white/8"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-silver-600 hover:text-gold-400 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Catalog
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-silver-600">System Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow p-6 overflow-y-auto" style={{ background: 'rgba(8,9,13,0.5)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
