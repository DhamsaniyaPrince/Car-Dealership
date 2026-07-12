import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Card, Input, Button } from '../../components/UI';
import { z } from 'zod';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const formSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
});

type VehicleFormFields = z.infer<typeof formSchema>;

export const CarFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 0,
      quantity: 1,
    },
  });

  // Query vehicle specs if in Edit mode
  const { data: vehicle, isLoading: isVehicleLoading } = useQuery({
    queryKey: ['adminVehicleDetail', id],
    queryFn: async () => {
      const res = await api.get(`/vehicles/${id}`);
      return res.data.data.vehicle;
    },
    enabled: isEditMode,
  });

  // Hydrate fields upon retrieval success
  useEffect(() => {
    if (isEditMode && vehicle) {
      reset({
        make: vehicle.make,
        model: vehicle.model,
        category: vehicle.category,
        price: Number(vehicle.price),
        quantity: vehicle.quantity,
      });
    }
  }, [vehicle, isEditMode, reset]);

  // Form submit mutation handler
  const saveMutation = useMutation({
    mutationFn: async (values: VehicleFormFields) => {
      if (isEditMode) {
        await api.put(`/vehicles/${id}`, values);
      } else {
        await api.post('/vehicles', values);
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? 'Vehicle specifications updated successfully!'
          : 'New vehicle published to catalog successfully!'
      );
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['adminVehiclesList'] });
      queryClient.invalidateQueries({ queryKey: ['featuredVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      navigate('/dashboard/vehicles');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Error saving the vehicle specs.';
      setErrorMsg(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data: VehicleFormFields) => {
    setErrorMsg(null);
    saveMutation.mutate(data);
  };

  if (isEditMode && isVehicleLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Back link */}
      <div>
        <Link
          to="/dashboard/vehicles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-655 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel & Return
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">
          {isEditMode ? 'Edit Vehicle Specifications' : 'Register New Vehicle'}
        </h1>
        <p className="text-slate-400 text-xs">
          {isEditMode ? 'Modify catalog values' : 'Register a new stock unit in inventory'}
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-500/50 rounded-lg text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card hoverEffect={false} className="bg-white border border-slate-200/50 p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="Manufacturer / Make" placeholder="Tesla" error={errors.make?.message} {...register('make')} />
            <Input label="Model Line" placeholder="Model 3" error={errors.model?.message} {...register('model')} />
            <Input label="Category Classification" placeholder="Electric SUV" error={errors.category?.message} {...register('category')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Base Price (USD)" type="number" step="0.01" placeholder="39990" error={errors.price?.message} {...register('price')} />
            <Input label="Stock Quantity" type="number" placeholder="5" error={errors.quantity?.message} {...register('quantity')} />
          </div>

          <div className="flex gap-4 border-t border-slate-100 dark:border-brand-850 pt-6">
            <Button type="submit" variant="accent" isLoading={isSubmitting} className="font-bold uppercase tracking-wider px-8 py-3">
              {isEditMode ? 'Save Specifications' : 'Publish Vehicle'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
