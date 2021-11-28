import {
  EntityRepository,
  Repository,
  QueryFailedError,
} from 'typeorm';
import { Reservation } from '../entities/reservation.entity';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { UpdateReservationDto } from '../dto/update-reservation.dto';
import {
  ConflictingReservationException,
  ReservationNotFoundException,
} from '../../common/exception/reservation.exception';
import { LocalDate, ChronoUnit } from '@js-joda/core';
import { Memoize } from 'typescript-memoize';

@EntityRepository(Reservation)
export class ReservationRepository extends Repository<Reservation> {
  createReservation(dto: CreateReservationDto): Reservation {
    const entity = this.create({
      fullName: dto.fullName,
      email: dto.email,
      dates: `[${dto.arrival},${dto.departure})`,
    });

    return entity;
  }

  async createUpdatedReservation(
    id: string,
    dto: UpdateReservationDto,
  ): Promise<Reservation> {
    const existingEntity = await this.findOne(id);

    if (existingEntity) {
      const { fullName, email, arrival, departure } = existingEntity;

      const newEntity = new Reservation();
      newEntity.id = id;
      newEntity.fullName = dto.fullName || fullName;
      newEntity.email = dto.email || email;
      newEntity.dates = `[${dto.arrival || arrival},${
        dto.departure || departure
      })`;

      return newEntity;
    }

    throw new ReservationNotFoundException('reservation does not exist');
  }

  async saveReservation(entity: Reservation): Promise<Reservation> {
    try {
      return await this.save(entity);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        err.driverError.constraint === 'reservation_prevent_overlapping'
      ) {
        throw new ConflictingReservationException(
          'requested dates are no longer available',
        );
      }

      throw err;
    }
  }

  async deleteReservationById(id: string): Promise<void> {
    if (!!(await this.delete(id)).affected) {
      return;
    }

    throw new ReservationNotFoundException('reservation does not exist');
  }

  private generateDatesFromRange(start: string, end: string): string[] {
    const startDate = LocalDate.parse(start);
    const endDate = LocalDate.parse(end);
    const size = startDate.until(endDate, ChronoUnit.DAYS);
    return [...Array(size + 1).keys()].map((dayOffset) =>
      startDate.plusDays(dayOffset).toString(),
    );
  }

  @Memoize({
    expiring: 1000,
    hashFunction: (start: string, end: string) => `[${start},${end})`,
  })
  async findAvailability(start: string, end: string): Promise<string[]> {
    const dates = `[${start},${end})`;
    const reservations = await this.query(
      'SELECT dates FROM "Reservation" WHERE dates && $1',
      [dates],
    );

    const expandedReservations = reservations.map(({ dates }) =>
      this.generateDatesFromRange(dates.slice(1, 11), dates.slice(12, 22)),
    );

    // Get unique dates
    const reservedDates = [...new Set(expandedReservations.flat())];

    const requestedAvailability = this.generateDatesFromRange(start, end);

    return requestedAvailability.filter(
      (date) => !reservedDates.includes(date),
    );
  }
}
