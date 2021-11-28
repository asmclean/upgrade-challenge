import { Injectable } from '@nestjs/common';
import { ReservationRepository } from '../reservation/repository/reservation.repository';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { LocalDate, ChronoUnit } from '@js-joda/core';
import { InvalidAvailabilityException } from '../common/exception/availability.exception';

@Injectable()
export class AvailabilityService {
  constructor(private repository: ReservationRepository) {}

  find(getAvailabilityDto: GetAvailabilityDto) {
    const hasStart = !!getAvailabilityDto.start;
    const hasEnd = !!getAvailabilityDto.end;
    let startDate: LocalDate;
    let endDate: LocalDate;
    const today = LocalDate.now();
    const oneMonthAway = LocalDate.now().plusMonths(1);

    if (!hasStart || !hasEnd) {
      if (!hasStart && !hasEnd) {
        startDate = today;
        endDate = oneMonthAway;
      } else if (hasStart) {
        startDate = LocalDate.parse(getAvailabilityDto.start);
        endDate = startDate.plusMonths(1);
      } else {
        endDate = LocalDate.parse(getAvailabilityDto.end);
        startDate = endDate.minusMonths(1);
      }
    } else {
      startDate = LocalDate.parse(getAvailabilityDto.start);
      endDate = LocalDate.parse(getAvailabilityDto.end);
    }

    const durationInDays = startDate.until(endDate, ChronoUnit.DAYS);

    if (durationInDays < 0) {
      throw new InvalidAvailabilityException(
        'requested start date must be earlier than requested end date',
      );
    }

    // Only check availability for dates that can actually be
    // reserved.  It's debatable whether dates outside of that window
    // should be returned as available or not.  I'm making the
    // opinionated decision to not do that since it limits
    // unnecessarily large queries on the DB and improves the odds of
    // cache hits, but it could be changed if unreservable dates
    // should be shown as available.
    if (startDate.isBefore(today)) {
      startDate = today;
    }

    if (endDate.isAfter(oneMonthAway)) {
      endDate = oneMonthAway;
    }

    const result = this.repository.findAvailability(
      startDate.toString(),
      endDate.toString(),
    );
    return result;
  }
}
