import { Injectable } from '@nestjs/common';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './repository/reservation.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { LocalDate, LocalDateTime, ChronoUnit } from '@js-joda/core';
import { InvalidReservationException } from '../common/exception/reservation.exception';

@Injectable()
export class ReservationService {
  constructor(private repository: ReservationRepository) {}

  private validateEntity(entity: Reservation): void {
    const entityArrival = entity.dates.slice(1, 11);
    const entityDeparture = entity.dates.slice(12, 22);

    const arrival = LocalDate.parse(entityArrival);
    // This might not be necessary, but adding due to ambiguity around '1 day(s) ahead'
    const arrivalWithTime = LocalDateTime.of(
      arrival.year(),
      arrival.month(),
      arrival.dayOfMonth(),
    );
    const departure = LocalDate.parse(entityDeparture);

    const durationInDays = arrival.until(departure, ChronoUnit.DAYS);

    if (durationInDays < 1) {
      throw new InvalidReservationException(
        'time from arrival to departure is not at least one day',
      );
    }

    if (durationInDays > 3) {
      throw new InvalidReservationException(
        'time from arrival to departure is greater than maximum three days',
      );
    }

    if (LocalDateTime.now().plusDays(1).isAfter(arrivalWithTime)) {
      throw new InvalidReservationException(
        'reservations not accepted later than one day in advance',
      );
    }

    if (arrivalWithTime.isAfter(LocalDateTime.now().plusMonths(1))) {
      throw new InvalidReservationException(
        'reservations not accepted further than one month in advance',
      );
    }
  }

  create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const entity = this.repository.createReservation(createReservationDto);
    this.validateEntity(entity);

    return this.repository.saveReservation(entity);
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const entity = await this.repository.createUpdatedReservation(id, updateReservationDto);
    this.validateEntity(entity);

    return this.repository.saveReservation(entity);
  }

  remove(id: string): Promise<void> {
    return this.repository.deleteReservationById(id);
  }
}
