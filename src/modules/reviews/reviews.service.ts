import { BookingStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { ApiError } from '../../utils/ApiError';
import { CreateReviewInput } from './reviews.validation';

export async function createReview(customerId: string, input: CreateReviewInput) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }
  if (booking.customerId !== customerId) {
    throw ApiError.forbidden('You do not have access to this booking');
  }
  if (booking.status !== BookingStatus.COMPLETED) {
    throw ApiError.badRequest('You can only review a booking after the job is completed');
  }
  if (booking.review) {
    throw ApiError.conflict('This booking has already been reviewed');
  }

  return prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        bookingId: booking.id,
        customerId,
        technicianProfileId: booking.technicianProfileId,
        rating: input.rating,
        comment: input.comment,
      },
    });

    // Recalculate the technician's rolling average rating and review count.
    const aggregate = await tx.review.aggregate({
      where: { technicianProfileId: booking.technicianProfileId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.technicianProfile.update({
      where: { id: booking.technicianProfileId },
      data: {
        avgRating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count.rating,
      },
    });

    return review;
  });
}
