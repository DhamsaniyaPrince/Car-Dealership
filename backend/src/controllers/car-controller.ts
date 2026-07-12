import { Request, Response, NextFunction } from 'express';
import { CarService } from '../services/car-service';
import { CarStatus } from '@prisma/client';
import { UnauthorizedError } from '../utils/errors';

export class CarController {
  constructor(private carService: CarService) {}

  getCars = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        make,
        model,
        minYear,
        maxYear,
        minPrice,
        maxPrice,
        status,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const filters = {
        make: make ? String(make) : undefined,
        model: model ? String(model) : undefined,
        minYear: minYear ? parseInt(String(minYear), 10) : undefined,
        maxYear: maxYear ? parseInt(String(maxYear), 10) : undefined,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        status: status ? (String(status) as CarStatus) : undefined,
        search: search ? String(search) : undefined,
        page: page ? parseInt(String(page), 10) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        sortBy: sortBy ? String(sortBy) : undefined,
        sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
      };

      const result = await this.carService.getCars(filters);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCarById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const car = await this.carService.getCarById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { car },
      });
    } catch (error) {
      next(error);
    }
  };

  createCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const car = await this.carService.createCar(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        data: { car },
      });
    } catch (error) {
      next(error);
    }
  };

  updateCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const car = await this.carService.updateCar(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        data: { car },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      await this.carService.deleteCar(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Car deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
