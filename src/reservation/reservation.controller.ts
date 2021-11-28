import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationValidationPipe } from './dto/reservation.validation';

@Controller('reservation')
@UseInterceptors(ClassSerializerInterceptor)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @ApiOperation({ summary: 'Create a new campsite reservation' })
  @ApiResponse({
    status: 201,
    description: 'The new reservation was successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Values for the reservation are invalid',
  })
  @ApiResponse({
    status: 409,
    description: 'The requested dates conflict with an existing reservation',
  })
  @Post()
  @UsePipes(new ReservationValidationPipe())
  async create(@Body() createReservationDto: CreateReservationDto) {
    return await this.reservationService.create(createReservationDto);
  }

  @ApiOperation({ summary: 'Update an existing campsite reservation' })
  @ApiResponse({
    status: 200,
    description: 'The reservation was successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Values for the reservation are invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'The reservation does not exist',
  })
  @ApiResponse({
    status: 409,
    description: 'The requested dates conflict with an existing reservation',
  })
  @Patch(':id')
  @UsePipes(new ReservationValidationPipe())
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @ApiOperation({ summary: 'Cancel an existing campsite reservation' })
  @ApiResponse({
    status: 200,
    description: 'The reservation was successfully canceled',
  })
  @ApiResponse({
    status: 400,
    description: 'Value for the reservation ID is invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'The reservation does not exist',
  })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.remove(id);
  }
}
