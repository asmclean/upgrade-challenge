import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { LocalDate } from '@js-joda/core';
import { InvalidAvailabilityException } from '../../common/exception/availability.exception';

@Injectable()
export class AvailabilityValidationPipe implements PipeTransform {
  transform(value: any, { metatype }: ArgumentMetadata) {
    const dto = plainToClass(metatype, value);

    if (dto.start) {
      try {
        LocalDate.parse(dto.start);
      } catch (err) {
        throw new InvalidAvailabilityException(
          'start not in YYYY-MM-DD format',
        );
      }
    }

    if (dto.end) {
      try {
        LocalDate.parse(dto.end);
      } catch (err) {
        throw new InvalidAvailabilityException('end not in YYYY-MM-DD format');
      }
    }

    return value;
  }
}
