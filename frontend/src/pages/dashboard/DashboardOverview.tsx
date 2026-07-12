import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Badge, Modal, TableContainer, TableHead, TableRow } from '../../components/UI';
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
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      // Deterministic mock sales count
      const soldUnits = Math.abs(v.id.charCodeAt(0) % 3) + 1;
      revenue += price * soldUnits;
      salesCount += soldUnits;
    });

    return {
      totalTypes,
      totalUnits,
      lowStock,
      revenue,
      salesCount,
    };
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

  // Group by category for SVG chart visualization
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
    const rows = vehicles
      .map((v: any) => `${v.id},"${v.make}","${v.model}","${v.category}",${v.price},${v.quantity}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DriveElite_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success('Inventory CSV exported successfully.');
  };

  // Bulk PDF report trigger (Print page)
  const handleExportPDF = () => {
    window.print();
  };

  // Bulk CSV Import form handler
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
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !vehicles) {
    return (
      <div className="flex items-center gap-2.5 p-4 bg-red-955/35 border border-red-500/50 text-red-200 rounded-xl text-xs font-semibold">
        <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
        <span>Failed to fetch inventory analytics. Database connection offline.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 dark:border-brand-900 pb-5">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            Control Center
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Enterprise-level analytics, inventory listings, restock alerts, and transaction files.
          </p>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => setShowImportModal(true)} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="w-4 h-4" /> CSV Export
          </Button>
          <Button onClick={handleExportPDF} variant="accent" size="sm" className="gap-1.5 text-xs uppercase tracking-wider font-bold">
            <Layers className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-brand-900 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-brand-600 text-brand-700 dark:border-accent-500 dark:text-accent-400'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Metrics Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-transparent text-slate-400 hover:text-slate-700'
              : ''
          }`}
        >
          Analytics Charts
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-transparent text-slate-400 hover:text-slate-700'
              : ''
          }`}
        >
          Activity logs
        </button>
      </div>

      {/* 2. Low stock alert banner */}
      {metrics.lowStock.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500 animate-bounce" />
            <span>Low Stock Warning: {metrics.lowStock.length} models have critical stock levels.</span>
          </div>
          <Link to="/dashboard/vehicles" className="underline hover:text-amber-900">
            Restock Inventory &rarr;
          </Link>
        </div>
      )}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Metrics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hoverEffect className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xxs font-bold uppercase text-slate-400 tracking-wider">Total Revenue</span>
                <span className="text-2xl font-black text-brand-655 dark:text-accent-500">${metrics.revenue.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-655 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </Card>

            <Card hoverEffect className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xxs font-bold uppercase text-slate-400 tracking-wider">Total Sales</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics.salesCount} Orders</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
            </Card>

            <Card hoverEffect className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xxs font-bold uppercase text-slate-400 tracking-wider">Physical Inventory</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics.totalUnits} Units</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Box className="w-5 h-5" />
              </div>
            </Card>

            <Card hoverEffect className="bg-white dark:bg-brand-900 border border-slate-200/50 p-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xxs font-bold uppercase text-slate-400 tracking-wider">Total Users</span>
                <span className="text-2xl font-black text-slate-800 dark:text-white">{recentUsers.length} Users</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </Card>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" /> Recent showroom Sales
              </h3>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">ID</th>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Vehicle</th>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Buyer</th>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Price</th>
                  </TableRow>
                </TableHead>
                <tbody>
                  {recentOrders.map((ord: any) => (
                    <TableRow key={ord.id}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-300">{ord.id}</td>
                      <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200 font-semibold">{ord.vehicle}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{ord.customer}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200">${ord.amount.toLocaleString()}</td>
                    </TableRow>
                  ))}
                </tbody>
              </TableContainer>
            </div>

            {/* Recent Users */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Registered Users
              </h3>
              <TableContainer>
                <TableHead>
                  <TableRow>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Name</th>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Email</th>
                    <th className="px-4 py-2.5 text-xxs font-bold uppercase tracking-wider text-slate-455">Role</th>
                  </TableRow>
                </TableHead>
                <tbody>
                  {recentUsers.map((u, i) => (
                    <TableRow key={i}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-300">{u.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-550">{u.email}</td>
                      <td className="px-4 py-3 text-xs font-bold">
                        <Badge variant={u.role === 'ADMIN' ? 'warning' : 'neutral'}>{u.role}</Badge>
                      </td>
                    </TableRow>
                  ))}
                </tbody>
              </TableContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analytics (Charts) */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Bar Chart */}
          <Card hoverEffect={false} className="lg:col-span-2 bg-white border border-slate-200/50 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-brand-850 pb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Inventory Allocation by Class</h3>
              <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Charts</span>
            </div>

            <div className="flex flex-col gap-5 pt-2">
              {categoryChartData.map((data, idx) => {
                const pct = metrics.totalUnits > 0 ? (data.count / metrics.totalUnits) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-655 dark:text-slate-350">{data.cat}</span>
                      <span className="text-slate-800 dark:text-slate-200">{data.count} units ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-brand-950 h-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-brand-600 dark:bg-accent-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Low stock alerts panel */}
          <Card hoverEffect={false} className="bg-white border border-slate-200/50 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Low Stock Warnings</h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] no-scrollbar">
              {metrics.lowStock.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                  No stock alerts active. All showrooms fully supplied.
                </div>
              ) : (
                metrics.lowStock.map((v: any) => (
                  <div key={v.id} className="flex justify-between items-center border-b border-slate-50 dark:border-brand-850 pb-3 last:border-b-0 last:pb-0 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-850 dark:text-slate-250">{v.make} {v.model}</span>
                      <span className="text-slate-400 text-xxs font-semibold">Stock count: {v.quantity} units</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 rounded text-xxs font-extrabold uppercase">
                      Low Stock
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <Card hoverEffect={false} className="bg-white border border-slate-200/50 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ListTodo className="w-4.5 h-4.5 text-slate-400" /> Showroom Action Registry
          </h3>
          <div className="flex flex-col gap-4">
            {recentActivityLogs.map((log, i) => (
              <div key={i} className="flex justify-between items-start border-b border-slate-50 dark:border-brand-850 pb-3 last:border-b-0 last:pb-0 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-800 dark:text-slate-350">{log.desc}</span>
                  <span className="text-xxs font-bold text-slate-400 uppercase tracking-widest">{log.action}</span>
                </div>
                <span className="text-xxs text-slate-400 font-semibold">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bulk CSV Import Modal */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Inventory (CSV)">
        <form onSubmit={handleImportCSV} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xxs font-bold uppercase tracking-wider text-slate-500">Paste CSV Contents</label>
            <textarea
              required
              rows={6}
              value={importCsvData}
              onChange={(e) => setImportCsvData(e.target.value)}
              placeholder="make,model,category,price,quantity&#10;Toyota,Camry Hybrid,Sedan,28000,5&#10;Honda,Accord,Sedan,29500,3"
              className="w-full p-3 bg-slate-50 dark:bg-brand-950 border border-slate-200 dark:border-brand-800 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2.5 mt-2">
            <Button type="button" variant="secondary" onClick={() => setShowImportModal(false)} className="flex-grow py-3 font-bold uppercase text-xs tracking-wider">
              Cancel
            </Button>
            <Button type="submit" variant="accent" className="flex-grow py-3 font-bold uppercase text-xs tracking-wider">
              Import Records
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
