import {
  InvalidReservationException,
  ConflictingReservationException,
  ReservationNotFoundException,
} from './reservation.exception';
import { InvalidAvailabilityException } from './availability.exception';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  Catch,
  ArgumentsHost,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof InvalidReservationException) {
      return super.catch(new BadRequestException(exception.message), host);
    }

    if (exception instanceof ReservationNotFoundException) {
      return super.catch(new NotFoundException(exception.message), host);
    }

    if (exception instanceof ConflictingReservationException) {
      return super.catch(new ConflictException(exception.message), host);
    }

    if (exception instanceof InvalidAvailabilityException) {
      return super.catch(new BadRequestException(exception.message), host);
    }

    super.catch(exception, host);
  }
}
