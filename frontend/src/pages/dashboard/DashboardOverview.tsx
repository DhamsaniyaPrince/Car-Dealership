import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button, Badge, Modal, TableContainer, TableHead, TableRow, SectionLabel, Skeleton } from '../../components/UI';
import {
  Car,
  AlertTriangle,
  Box,
  ShieldAlert,
  TrendingUp,
  Users,
  Layers,
  ArrowUpRight,
  Download,
  Upload,
  BarChart3,
  ListTodo,
  Activity,
  DollarSign,
  Clock,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

// Animated KPI card
const KpiCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  trend?: string;
  delay?: number;
}> = ({ label, value, icon, colorClass, bgClass, trend, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="flex items-center justify-between p-5 rounded-2xl border border-white/8 bg-obsidian-800/80 relative overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      {/* Background glow accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${bgClass}`} />

      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-silver-600">{label}</span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.3 }}
          className="text-2xl font-display font-black text-white"
        >
          {value}
        </motion.span>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center border border-white/10 relative z-10`}>
        {icon}
      </div>
    </motion.div>
  );
};

export const DashboardOverview: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'logs'>('overview');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvData, setImportCsvData] = useState('');

  // 1. Query database catalog
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['adminOverviewCatalog'],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { limit: 100 } });
      return res.data.data.vehicles;
    },
  });

  // 2. Computed Analytics from database state
  const metrics = useMemo(() => {
    if (!vehicles) return { totalTypes: 0, totalUnits: 0, lowStock: [], revenue: 0, salesCount: 0 };

    const totalTypes = vehicles.length;
    const totalUnits = vehicles.reduce((acc: number, v: any) => acc + v.quantity, 0);
    const lowStock = vehicles.filter((v: any) => v.quantity <= 2);

    // Simulate revenue and orders based on seeded IDs
    let revenue = 184500;
    let salesCount = 4;
    vehicles.forEach((v: any) => {
      const price = Number(v.price);
      const soldUnits = Math.abs(v.id.charCodeAt(0) % 3) + 1;
      revenue += price * soldUnits;
      salesCount += soldUnits;
    });

    return { totalTypes, totalUnits, lowStock, revenue, salesCount };
  }, [vehicles]);

  // 3. Mock Activity Logs & Orders derived from database listings
  const recentOrders = useMemo(() => {
    if (!vehicles) return [];
    const customerEmails = ['client1@gmail.com', 'buyer@yahoo.com', 'finance.manager@dealership.com', 'pete.r@tesla.com'];
    return vehicles.slice(0, 4).map((v: any, idx: number) => {
      const price = Number(v.price);
      return {
        id: `ord-${idx + 101}`,
        vehicle: `${v.make} ${v.model}`,
        customer: customerEmails[idx % customerEmails.length],
        amount: price,
        status: 'Delivered',
        date: `2026-07-12`,
      };
    });
  }, [vehicles]);

  const recentUsers = [
    { name: 'Admin Manager', email: 'admin@dealership.com', role: 'ADMIN', date: '2026-07-11' },
    { name: 'Standard Client', email: 'user@dealership.com', role: 'CUSTOMER', date: '2026-07-12' },
  ];

  const recentActivityLogs = useMemo(() => {
    if (!vehicles) return [];
    return [
      { action: 'STOCK_RESTOCKED', desc: `Admin restocked 10 units of ${vehicles[0]?.make || 'Tesla'} ${vehicles[0]?.model || 'Model Y'}`, time: '10 mins ago' },
      { action: 'VEHICLE_PURCHASED', desc: `Customer purchased 1 unit of ${vehicles[1]?.make || 'Porsche'} ${vehicles[1]?.model || 'Taycan'}`, time: '1 hour ago' },
      { action: 'CATALOG_CREATED', desc: `Admin created listing for ${vehicles[2]?.make || 'BMW'} ${vehicles[2]?.model || 'i4'}`, time: '2 hours ago' },
    ];
  }, [vehicles]);

  // Group by category for bar chart visualization
  const categoryChartData = useMemo(() => {
    if (!vehicles) return [];
    const groups: Record<string, number> = {};
    vehicles.forEach((v: any) => {
      const cat = v.category.split(' ')[0];
      groups[cat] = (groups[cat] || 0) + v.quantity;
    });
    return Object.entries(groups).map(([cat, count]) => ({ cat, count }));
  }, [vehicles]);

  // Bulk CSV Export Trigger
  const handleExportCSV = () => {
    if (!vehicles) return;
    const headers = 'ID,Make,Model,Category,Price,Quantity\n';
    const rows = vehicles.map((v: any) => `${v.id},"${v.make}","${v.model}","${v.category}",${v.price},${v.quantity}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DriveElite_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Inventory CSV exported successfully.');
  };

  const handleExportPDF = () => window.print();

  const handleImportCSV = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCsvData || !importCsvData.includes(',')) {
      toast.error('Invalid CSV format. Please include headers and comma-separated records.');
      return;
    }
    toast.success('Bulk import simulation complete. 3 records created successfully.');
    setShowImportModal(false);
    setImportCsvData('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} className="h-24 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !vehicles) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        Failed to fetch inventory analytics. Database connection offline.
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Revenue', value: `$${Math.floor(metrics.revenue / 1000)}K`, icon: <DollarSign className="w-5 h-5" />, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/15', trend: '+12.4% MoM' },
    { label: 'Total Sales', value: `${metrics.salesCount} Orders`, icon: <Car className="w-5 h-5" />, colorClass: 'text-brand-400', bgClass: 'bg-brand-500/15' },
    { label: 'Physical Inventory', value: `${metrics.totalUnits} Units`, icon: <Box className="w-5 h-5" />, colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/15' },
    { label: 'Total Users', value: `${recentUsers.length} Users`, icon: <Users className="w-5 h-5" />, colorClass: 'text-violet-400', bgClass: 'bg-violet-500/15' },
  ];

  const tabs = [
    { id: 'overview', label: 'Metrics', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Activity Logs', icon: ListTodo },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-white/6">
        <div>
          <SectionLabel className="mb-3">Admin Portal</SectionLabel>
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-tight mt-2">
            Control <span className="text-gradient-gold">Center</span>
          </h1>
          <p className="text-silver-600 text-xs mt-1.5 font-semibold">
            Enterprise analytics, inventory listings, restock alerts, and transaction logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => setShowImportModal(true)} variant="secondary" size="sm" className="gap-1.5 text-xs font-bold uppercase tracking-widest">
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={handleExportCSV} variant="secondary" size="sm" className="gap-1.5 text-xs font-bold uppercase tracking-widest">
            <Download className="w-4 h-4" /> CSV Export
          </Button>
          <Button onClick={handleExportPDF} variant="gold" size="sm" className="gap-1.5 text-xs font-black uppercase tracking-widest">
            <Layers className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1.5 rounded-2xl bg-obsidian-850/80 border border-white/6 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            whileTap={{ scale: 0.97 }}
            className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === id ? 'text-obsidian-900' : 'text-silver-500 hover:text-white'
            }`}
          >
            {activeTab === id && (
              <motion.div layoutId="dash-tab-bg" className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 shadow-gold-sm" />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Low stock alert */}
      {metrics.lowStock.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-amber-500/8 border border-amber-500/25 rounded-xl text-amber-300 text-xs font-semibold"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
            </motion.div>
            <span>Low Stock Warning: <strong>{metrics.lowStock.length}</strong> models have critical inventory levels.</span>
          </div>
          <Link to="/dashboard/vehicles" className="underline hover:text-amber-200 transition-colors">
            Restock Inventory →
          </Link>
        </motion.div>
      )}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiCards.map((kpi, i) => (
              <KpiCard key={i} {...kpi} delay={i * 0.1} />
            ))}
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-silver-600 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-gold-500" /> Recent Showroom Sales
              </h3>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    {['Order ID', 'Vehicle', 'Buyer', 'Amount'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-silver-600">{h}</th>
                    ))}
                  </TableRow>
                </TableHead>
                <tbody>
                  {recentOrders.map((ord: any, i: number) => (
                    <motion.tr
                      key={ord.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-white/3 transition-colors border-b border-white/4 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-xs font-mono font-bold text-silver-400">{ord.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-white">{ord.vehicle}</td>
                      <td className="px-4 py-3 text-xs text-silver-500 truncate max-w-[150px]">{ord.customer}</td>
                      <td className="px-4 py-3 text-xs font-black text-gold-400">${ord.amount.toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </TableContainer>
            </div>

            {/* Recent Users */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-silver-600 flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-500" /> Registered Users
              </h3>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    {['Name', 'Email', 'Access Level'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-silver-600">{h}</th>
                    ))}
                  </TableRow>
                </TableHead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-white/3 transition-colors border-b border-white/4 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-xs font-bold text-white">{u.name}</td>
                      <td className="px-4 py-3 text-xs text-silver-500 truncate">{u.email}</td>
                      <td className="px-4 py-3 text-xs">
                        <Badge variant={u.role === 'ADMIN' ? 'warning' : 'neutral'}>{u.role}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </TableContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Bar Chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-white/8 bg-obsidian-800/80 flex flex-col gap-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inventory Allocation by Class</h3>
              <span className="text-[10px] font-bold text-silver-600 uppercase tracking-widest flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Distribution
              </span>
            </div>

            <div className="flex flex-col gap-5 pt-2">
              {categoryChartData.map((data, idx) => {
                const pct = metrics.totalUnits > 0 ? (data.count / metrics.totalUnits) * 100 : 0;
                const barColors = ['from-gold-600 to-gold-400', 'from-brand-600 to-brand-400', 'from-cyan-600 to-cyan-400', 'from-violet-600 to-violet-400', 'from-emerald-600 to-emerald-400'];
                return (
                  <div key={idx} className="flex flex-col gap-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-silver-400 font-bold uppercase tracking-widest text-[10px]">{data.cat}</span>
                      <span className="text-white font-bold">{data.count} units — <span className="text-gold-400">{pct.toFixed(1)}%</span></span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${barColors[idx % barColors.length]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low stock alerts panel */}
          <div className="p-6 rounded-2xl border border-white/8 bg-obsidian-800/80 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Warnings
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] no-scrollbar">
              {metrics.lowStock.length === 0 ? (
                <div className="text-center py-12 text-silver-600 text-xs font-semibold">
                  ✅ All showrooms fully supplied.
                </div>
              ) : (
                metrics.lowStock.map((v: any, i: number) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex justify-between items-center border-b border-white/5 pb-3 last:border-b-0 last:pb-0 text-xs"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-white">{v.make} {v.model}</span>
                      <span className="text-silver-600 text-[10px] font-semibold">Stock: {v.quantity} units remaining</span>
                    </div>
                    <Badge variant="warning">Low Stock</Badge>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-2xl border border-white/8 bg-obsidian-800/80 flex flex-col gap-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ListTodo className="w-4.5 h-4.5 text-gold-500" /> Showroom Action Registry
          </h3>
          <div className="flex flex-col gap-4 relative">
            {/* Timeline connector */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/8" />

            {recentActivityLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex items-start gap-4 pl-8 relative"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-5.5 h-5.5 flex items-center justify-center">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    log.action === 'VEHICLE_PURCHASED' ? 'bg-gold-500 border-gold-700'
                    : log.action === 'STOCK_RESTOCKED' ? 'bg-emerald-500 border-emerald-700'
                    : 'bg-brand-500 border-brand-700'
                  }`} />
                </div>

                <div className="flex-grow flex items-start justify-between border-b border-white/5 pb-4 last:border-b-0 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-silver-200">{log.desc}</span>
                    <span className="text-[10px] font-black text-gold-500/70 uppercase tracking-widest">{log.action}</span>
                  </div>
                  <div className="flex items-center gap-1 text-silver-600 text-[10px] font-semibold shrink-0 ml-4">
                    <Clock className="w-3 h-3" />
                    {log.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Inventory (CSV)">
        <form onSubmit={handleImportCSV} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-silver-500">Paste CSV Contents</label>
            <textarea
              required
              rows={6}
              value={importCsvData}
              onChange={(e) => setImportCsvData(e.target.value)}
              placeholder={"make,model,category,price,quantity\nToyota,Camry Hybrid,Sedan,28000,5\nHonda,Accord,Sedan,29500,3"}
              className="input-premium w-full p-3.5 rounded-xl text-xs font-mono resize-y"
            />
          </div>
          <div className="flex gap-2.5 mt-1">
            <Button type="button" variant="secondary" onClick={() => setShowImportModal(false)} className="flex-grow py-3 font-bold uppercase text-xs tracking-widest">
              Cancel
            </Button>
            <Button type="submit" variant="gold" className="flex-grow py-3 font-black uppercase text-xs tracking-widest">
              Import Records
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
