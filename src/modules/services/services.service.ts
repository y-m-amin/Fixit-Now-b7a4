import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { ListServicesQuery, CreateServiceInput, UpdateServiceInput } from './services.validation';

export async function listServices(query: ListServicesQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.ServiceWhereInput = {
    ...(query.category && {
      category: { name: { equals: query.category, mode: 'insensitive' } },
    }),
    ...(query.maxPrice !== undefined && { price: { lte: query.maxPrice } }),
    ...((query.location || query.minRating !== undefined) && {
      technicianProfile: {
        ...(query.location && {
          location: { contains: query.location, mode: 'insensitive' },
        }),
        ...(query.minRating !== undefined && { avgRating: { gte: query.minRating } }),
      },
    }),
  };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        technicianProfile: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return {
    services,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getOwnProfileOrThrow(userId: string) {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw ApiError.notFound('Technician profile not found for this account');
  }
  return profile;
}

export async function createOwnService(userId: string, input: CreateServiceInput) {
  const profile = await getOwnProfileOrThrow(userId);

  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category) {
    throw ApiError.badRequest('Invalid category');
  }

  return prisma.service.create({
    data: { ...input, technicianProfileId: profile.id },
    include: { category: true },
  });
}

export async function updateOwnService(userId: string, serviceId: string, input: UpdateServiceInput) {
  const profile = await getOwnProfileOrThrow(userId);

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.technicianProfileId !== profile.id) {
    throw ApiError.notFound('Service not found');
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      throw ApiError.badRequest('Invalid category');
    }
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: input,
    include: { category: true },
  });
}

export async function deleteOwnService(userId: string, serviceId: string) {
  const profile = await getOwnProfileOrThrow(userId);

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.technicianProfileId !== profile.id) {
    throw ApiError.notFound('Service not found');
  }

  await prisma.service.delete({ where: { id: serviceId } });
}
