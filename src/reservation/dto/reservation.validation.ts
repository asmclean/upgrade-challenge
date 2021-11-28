import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { LocalDate } from '@js-joda/core';
import { InvalidReservationException } from '../../common/exception/reservation.exception';

@Injectable()
export class ReservationValidationPipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    const dto = plainToClass(metatype, value);

    if (dto.arrival) {
      try {
        LocalDate.parse(dto.arrival);
      } catch (err) {
        throw new InvalidReservationException(
          'arrival not in YYYY-MM-DD format',
        );
      }
    }

    if (dto.departure) {
      try {
        LocalDate.parse(dto.departure);
      } catch (err) {
        throw new InvalidReservationException(
          'departure not in YYYY-MM-DD format',
        );
      }
    }

    return value;
  }
}
