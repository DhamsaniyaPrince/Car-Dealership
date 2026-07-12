import { SalesTransaction } from '@prisma/client';
import { ITransactionRepository, ICustomerRepository, ICarRepository, IAuditLogRepository } from '../repositories/interfaces';
import { prisma } from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class TransactionService {
  constructor(
    private transactionRepository: ITransactionRepository,
    private customerRepository: ICustomerRepository,
    private carRepository: ICarRepository,
    private auditLogRepository: IAuditLogRepository
  ) {}

  async createTransaction(
    data: {
      carId: string;
      customerId: string;
      salePrice: number;
      paymentMethod: string;
    },
    sellerId: string
  ): Promise<SalesTransaction> {
    const car = await this.carRepository.findById(data.carId);
    if (!car) {
      throw new NotFoundError('Car not found');
    }
    if (car.status !== 'AVAILABLE') {
      throw new BadRequestError('Car is not available for sale');
    }

    let customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      customer = await this.customerRepository.findByUserId(data.customerId);
    }
    
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const transaction = await this.transactionRepository.create({
      carId: data.carId,
      customerId: customer.id, // Use the resolved customer profile ID!
      sellerId,
      salePrice: data.salePrice,
      paymentMethod: data.paymentMethod,
    });

    await this.auditLogRepository.create({
      userId: sellerId,
      action: 'TRANSACTION_RECORDED',
      details: {
        transactionId: transaction.id,
        carId: data.carId,
        customerId: data.customerId,
        price: data.salePrice,
      },
    });

    return transaction;
  }

  async getAllTransactions(): Promise<SalesTransaction[]> {
    return this.transactionRepository.findAll();
  }

  async getDashboardMetrics(): Promise<{
    totalRevenue: number;
    salesCount: number;
    activeInventoryCount: number;
    soldInventoryCount: number;
    pendingInventoryCount: number;
    recentTransactions: any[];
  }> {
    // Aggregating statistics
    const [revenueAgg, salesCount, carStats, recentTransactions] = await Promise.all([
      prisma.salesTransaction.aggregate({
        _sum: {
          salePrice: true,
        },
      }),
      prisma.salesTransaction.count(),
      prisma.car.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      }),
      prisma.salesTransaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          car: true,
          customer: {
            include: {
              user: true,
            },
          },
          seller: true,
        },
      }),
    ]);

    const statsMap = {
      AVAILABLE: 0,
      PENDING: 0,
      SOLD: 0,
    };

    carStats.forEach((stat) => {
      statsMap[stat.status] = stat._count.id;
    });

    return {
      totalRevenue: Number(revenueAgg._sum.salePrice || 0),
      salesCount,
      activeInventoryCount: statsMap.AVAILABLE,
      soldInventoryCount: statsMap.SOLD,
      pendingInventoryCount: statsMap.PENDING,
      recentTransactions,
    };
  }
}
