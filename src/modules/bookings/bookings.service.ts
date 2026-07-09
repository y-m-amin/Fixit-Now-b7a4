import { BookingStatus, Role } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { CreateBookingInput, ListBookingsQuery, UpdateBookingStatusInput } from './bookings.validation';

// Allowed technician-driven transitions. PAID is set internally by the
// payments module once a payment succeeds, and is never a client input here.
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.REQUESTED]: [BookingStatus.ACCEPTED, BookingStatus.DECLINED],
  [BookingStatus.ACCEPTED]: [],
  [BookingStatus.DECLINED]: [],
  [BookingStatus.PAID]: [BookingStatus.IN_PROGRESS],
  [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.CANCELLED]: [],
};

export async function createBooking(customerId: string, input: CreateBookingInput) {
  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { technicianProfile: true },
  });

  if (!service) {
    throw ApiError.badRequest('Invalid service');
  }

  return prisma.booking.create({
    data: {
      customerId,
      serviceId: service.id,
      technicianProfileId: service.technicianProfileId,
      scheduledAt: input.scheduledAt,
      address: input.address,
      notes: input.notes,
      status: BookingStatus.REQUESTED,
    },
    include: { service: true },
  });
}

export async function listMyBookings(
  userId: string,
  role: Role,
  query: ListBookingsQuery,
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where =
    role === Role.TECHNICIAN
      ? {
          technicianProfile: { userId },
          ...(query.status && { status: query.status }),
        }
      : {
          customerId: userId,
          ...(query.status && { status: query.status }),
        };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        service: { include: { category: true } },
        technicianProfile: { include: { user: { select: { id: true, name: true } } } },
        customer: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getBookingWithAccessCheck(bookingId: string, userId: string, role: Role) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { include: { category: true } },
      technicianProfile: { include: { user: { select: { id: true, name: true } } } },
      customer: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  const isOwnerCustomer = role === Role.CUSTOMER && booking.customerId === userId;
  const isOwnerTechnician =
    role === Role.TECHNICIAN && booking.technicianProfile.userId === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isOwnerCustomer && !isOwnerTechnician && !isAdmin) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  return booking;
}

export async function getBookingById(bookingId: string, userId: string, role: Role) {
  return getBookingWithAccessCheck(bookingId, userId, role);
}

export async function cancelBooking(bookingId: string, customerId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.customerId !== customerId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  const nonCancellableStatuses: BookingStatus[] = [
    BookingStatus.IN_PROGRESS,
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
    BookingStatus.DECLINED,
  ];
  if (nonCancellableStatuses.includes(booking.status)) {
    throw ApiError.badRequest(
      `Booking cannot be cancelled once it is ${booking.status.toLowerCase()}`,
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
}

export async function updateBookingStatusByTechnician(
  bookingId: string,
  technicianUserId: string,
  input: UpdateBookingStatusInput,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { technicianProfile: true },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.technicianProfile.userId !== technicianUserId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }

  const allowedNextStatuses = ALLOWED_TRANSITIONS[booking.status];
  if (!allowedNextStatuses.includes(input.status)) {
    throw ApiError.badRequest(
      `Cannot transition booking from ${booking.status} to ${input.status}`,
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: input.status },
  });
}
