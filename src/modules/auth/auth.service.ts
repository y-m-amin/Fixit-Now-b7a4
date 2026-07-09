import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';
import { Role } from '@prisma/client';

// Fields we ever expose to clients — never leak the password hash.
function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: input.role,
      // If registering as a technician, immediately create the linked profile
      // shell so they can fill it in via PUT /api/technician/profile.
      technicianProfile:
        input.role === Role.TECHNICIAN
          ? { create: {} }
          : undefined,
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status === 'BANNED') {
    throw ApiError.forbidden('This account has been banned. Contact support.');
  }

  const isMatch = await comparePassword(input.password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });

  return { user: toPublicUser(user), token };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technicianProfile: true },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return {
    ...toPublicUser(user),
    technicianProfile: user.technicianProfile ?? undefined,
  };
}
