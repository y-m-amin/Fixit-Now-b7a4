import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { CreateCategoryInput } from './categories.validation';

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) {
    throw ApiError.conflict('A category with this name already exists');
  }

  return prisma.category.create({ data: input });
}
