import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction-service';
import { UnauthorizedError } from '../utils/errors';

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  createTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      const transaction = await this.transactionService.createTransaction(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transactions = await this.transactionService.getAllTransactions();
      res.status(200).json({
        status: 'success',
        data: { transactions },
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await this.transactionService.getDashboardMetrics();
      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };
}
