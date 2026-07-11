import Stripe from 'stripe';
import { BookingStatus, PaymentStatus, Role } from '@prisma/client';
import { prisma } from '../../config/db';
import { stripe } from '../../config/stripe';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { CreatePaymentInput, ListPaymentsQuery } from './payments.validation';

// Stripe expects amounts in the smallest currency unit (cents for USD).
function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

export async function createPaymentForBooking(customerId: string, input: CreatePaymentInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.customerId !== customerId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }
  if (booking.status !== BookingStatus.ACCEPTED) {
    throw ApiError.badRequest(
      `Payment can only be created for an accepted booking (current status: ${booking.status})`,
    );
  }
  if (booking.payment) {
    throw ApiError.conflict('A payment already exists for this booking');
  }

  const amount = Number(booking.service.price);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toStripeAmount(amount),
    currency: 'usd',
    metadata: { bookingId: booking.id, customerId },
    automatic_payment_methods: { enabled: true },
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: customerId,
      transactionId: paymentIntent.id,
      amount,
      provider: 'stripe',
      status: PaymentStatus.PENDING,
    },
  });

  return {
    payment,
    clientSecret: paymentIntent.client_secret,
  };
}

/**
 * Verifies the Stripe webhook signature and applies the resulting state
 * change to the Payment + Booking records. rawBody must be the untouched
 * request body buffer (see the express.raw() middleware on this route).
 */
export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);
  } catch (err) {
    throw ApiError.badRequest(
      `Webhook signature verification failed: ${(err as Error).message}`,
    );
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await markPaymentCompleted(intent.id);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await markPaymentFailed(intent.id);
      break;
    }
    default:
      // Unhandled event types are acknowledged but ignored.
      break;
  }

  return { received: true };
}

async function markPaymentCompleted(transactionId: string) {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });
  if (!payment) return; // Nothing to reconcile — ignore unknown intents.

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: BookingStatus.PAID },
    }),
  ]);
}

async function markPaymentFailed(transactionId: string) {
  const payment = await prisma.payment.findUnique({ where: { transactionId } });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });
}

export async function listMyPayments(userId: string, role: Role, query: ListPaymentsQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  // Admins can see everything via /api/admin routes; this endpoint is scoped
  // to the requesting user's own payments regardless of role.
  const where = { userId };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { booking: { include: { service: true } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPaymentById(paymentId: string, userId: string, role: Role) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { service: true } } },
  });

  if (!payment) {
    throw ApiError.notFound('Payment not found');
  }

  if (payment.userId !== userId && role !== Role.ADMIN) {
    throw ApiError.forbidden('You do not have access to this payment');
  }

  return payment;
}
