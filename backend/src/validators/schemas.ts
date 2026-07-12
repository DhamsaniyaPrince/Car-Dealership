import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userRoleUpdateSchema = z.object({
  role: z.nativeEnum(Role),
});

export const vehicleCreateSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative'),
});

export const vehicleUpdateSchema = vehicleCreateSchema.partial();

export const restockSchema = z.object({
  quantity: z.coerce.number().int().positive('Restock quantity must be a positive integer'),
});
