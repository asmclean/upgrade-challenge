import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { ReservationRepository } from './repository/reservation.repository';
import { APP_FILTER } from '@nestjs/core';
import { ExceptionFilter } from '../common/exception/exception.filter';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationRepository])],
  controllers: [ReservationController],
  providers: [
    ReservationService,
    { provide: APP_FILTER, useClass: ExceptionFilter },
  ],
})
export class ReservationModule {}
