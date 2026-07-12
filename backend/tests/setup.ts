export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateRole: jest.fn(),
    findAll: jest.fn(),
    findMany: jest.fn(),
  },
  customer: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  vehicle: {
    findById: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  salesTransaction: {
    create: jest.fn(),
    findAll: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('../src/config/db', () => ({
  prisma: prismaMock,
}));

beforeEach(() => {
  jest.clearAllMocks();
  prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
});
