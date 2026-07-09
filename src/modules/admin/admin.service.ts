import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { ListUsersQuery, UpdateUserStatusInput, ListAllBookingsQuery } from './admin.validation';

export async function listAllUsers(query: ListUsersQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where = {
    ...(query.role && { role: query.role }),
    ...(query.status && { status: query.status }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateUserStatus(userId: string, input: UpdateUserStatusInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'ADMIN') {
    throw ApiError.forbidden('Admin accounts cannot be banned through this endpoint');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status: input.status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
}

export async function listAllBookings(query: ListAllBookingsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where = { ...(query.status && { status: query.status }) };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technicianProfile: { include: { user: { select: { id: true, name: true } } } },
        service: { include: { category: true } },
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
