import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiOperation({ summary: 'Get dates the campsite is available' })
  @ApiResponse({
    status: 200,
    description: 'The available dates for the campsite',
  })
  @ApiResponse({
    status: 400,
    description: 'Values for start and/or end are invalid',
  })
  @Get()
  find(@Query() getAvailablityDto: GetAvailabilityDto) {
    return this.availabilityService.find(getAvailablityDto);
  }
}
