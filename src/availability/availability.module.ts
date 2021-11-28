import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { ReservationRepository } from '../reservation/repository/reservation.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationRepository])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
})
export class AvailabilityModule {}
