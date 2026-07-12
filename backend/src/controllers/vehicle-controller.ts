import { Request, Response, NextFunction } from 'express';
import { VehicleService } from '../services/vehicle-service';
import { UnauthorizedError } from '../utils/errors';

export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  getVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        make,
        model,
        category,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const filters = {
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.vehicleService.getVehicles(filters);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  searchVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { make, model, category, minPrice, maxPrice, page, limit, sortBy, sortOrder } = req.query;

      const filters = {
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        category: category ? String(category) : undefined,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.vehicleService.searchVehicles(filters);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getVehicleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await this.vehicleService.getVehicleById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const vehicle = await this.vehicleService.createVehicle(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const vehicle = await this.vehicleService.updateVehicle(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.vehicleService.deleteVehicle(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  purchaseVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const vehicle = await this.vehicleService.purchaseVehicle(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };

  restockVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const { quantity } = req.body;
      const vehicle = await this.vehicleService.restockVehicle(req.params.id, quantity, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  };
}
