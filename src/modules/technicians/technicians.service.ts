import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import {
  ListTechniciansQuery,
  UpdateTechnicianProfileInput,
  UpdateAvailabilityInput,
} from './technicians.validation';

export async function listTechnicians(query: ListTechniciansQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.TechnicianProfileWhereInput = {
    ...(query.location && {
      location: { contains: query.location, mode: 'insensitive' },
    }),
    ...(query.minRating !== undefined && {
      avgRating: { gte: query.minRating },
    }),
    ...(query.category && {
      services: {
        some: {
          category: { name: { equals: query.category, mode: 'insensitive' } },
        },
      },
    }),
  };

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { avgRating: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        services: { include: { category: true } },
      },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return {
    technicians,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTechnicianById(id: string) {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      services: { include: { category: true } },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { customer: { select: { id: true, name: true } } },
      },
    },
  });

  if (!technician) {
    throw ApiError.notFound('Technician not found');
  }

  return technician;
}

async function getOwnProfileOrThrow(userId: string) {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Technician profile not found for this account');
  }
  return profile;
}

export async function updateOwnProfile(userId: string, input: UpdateTechnicianProfileInput) {
  const profile = await getOwnProfileOrThrow(userId);

  return prisma.technicianProfile.update({
    where: { id: profile.id },
    data: input,
  });
}

export async function setOwnAvailability(userId: string, input: UpdateAvailabilityInput) {
  const profile = await getOwnProfileOrThrow(userId);

  // Replace the full availability set atomically so stale slots don't linger.
  return prisma.$transaction(async (tx) => {
    await tx.availabilitySlot.deleteMany({ where: { technicianProfileId: profile.id } });

    await tx.availabilitySlot.createMany({
      data: input.slots.map((slot) => ({
        technicianProfileId: profile.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    });

    return tx.availabilitySlot.findMany({
      where: { technicianProfileId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    });
  });
}
