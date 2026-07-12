import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Button, Modal, Input } from '../../components/UI';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

export const InventoryAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 8;

  // Restock modal states
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [activeVehicleId, setActiveVehicleId] = useState('');
  const [activeVehicleName, setActiveVehicleName] = useState('');
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockError, setRestockError] = useState<string | null>(null);

  // Query vehicles listing (both available and out of stock)
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminVehicles', page],
    queryFn: async () => {
      const res = await api.get('/vehicles', { params: { page, limit } });
      return res.data.data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/vehicles/${id}`);
    },
    onSuccess: () => {
      toast.success('Vehicle successfully removed from catalog.');
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['adminVehiclesList'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Delete operation failed.';
      toast.error(msg);
    },
  });

  // Restock mutation
  const restockMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await api.post(`/vehicles/${id}/restock`, { quantity });
    },
    onSuccess: () => {
      toast.success(`Inventory restocked successfully for ${activeVehicleName}!`);
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['adminVehiclesList'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setRestockModalOpen(false);
      setRestockQuantity('');
      setActiveVehicleId('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Restock operation failed.';
      setRestockError(msg);
      toast.error(msg);
    },
  });

  const handleDelete = (id: string, make: string, model: string) => {
    if (window.confirm(`Are you sure you want to delete the ${make} ${model}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenRestock = (id: string, name: string) => {
    setActiveVehicleId(id);
    setActiveVehicleName(name);
    setRestockError(null);
    setRestockQuantity('');
    setRestockModalOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(restockQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setRestockError('Quantity must be a positive integer.');
      return;
    }
    setRestockError(null);
    restockMutation.mutate({ id: activeVehicleId, quantity: qty });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Failed to load database vehicle directories.</span>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Vehicles Inventory</h1>
          <p className="text-slate-400 text-xs">Register new stock items, edit specs, and adjust stock quantities</p>
        </div>
        <Link to="/dashboard/inventory/new">
          <Button variant="accent" className="gap-1.5 text-xs font-bold uppercase tracking-wider py-2.5">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        </Link>
      </div>

      {/* Catalog Table */}
      <Card hoverEffect={false} className="bg-white border border-slate-200/50 p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-brand-900 border-b border-slate-200 dark:border-brand-850 text-xxs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Vehicle Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-brand-850 text-xs">
              {data.vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 font-semibold">
                    No vehicles registered. Create a new catalog entry to start.
                  </td>
                </tr>
              ) : (
                data.vehicles.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-brand-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {v.make} {v.model}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-655 dark:text-slate-400">
                      {v.category}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-100">
                      ${Number(v.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                          v.quantity <= 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 animate-pulse'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        }`}
                      >
                        {v.quantity <= 0 ? 'Out of stock' : `${v.quantity} units`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenRestock(v.id, `${v.make} ${v.model}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-850 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                          title="Restock Inventory"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <Link to={`/dashboard/inventory/${v.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-brand-850 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit Specs"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(v.id, v.make, v.model)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 hover:text-red-655 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 dark:border-brand-850 bg-slate-50/50 dark:bg-brand-900">
            <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1.5 text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1.5 text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Restock Modal */}
      <Modal isOpen={restockModalOpen} onClose={() => setRestockModalOpen(false)} title="Restock Vehicle Inventory">
        {restockError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-955/35 border border-red-500/50 rounded-lg text-red-200 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{restockError}</span>
          </div>
        )}

        <form onSubmit={handleRestockSubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-400">
            Register arriving units for model **{activeVehicleName}**. Specify the restocking quantity.
          </p>
          <Input
            label="Restock Quantity"
            type="number"
            placeholder="10"
            required
            value={restockQuantity}
            onChange={(e) => setRestockQuantity(e.target.value)}
          />
          <Button
            type="submit"
            variant="accent"
            isLoading={restockMutation.isPending}
            className="w-full mt-2 font-bold uppercase tracking-wider"
          >
            Confirm Restock
          </Button>
        </form>
      </Modal>
    </div>
  );
};
