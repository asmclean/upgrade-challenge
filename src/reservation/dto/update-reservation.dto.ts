import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({
    description: 'name to use for the reservation',
    example: 'John Smith'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({
    description: 'email address to associate with the reservation',
    example: 'user@domain.tld'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'arrival date in YYYY-MM-DD format',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  arrival?: string;

  @ApiProperty({
    description: 'departure date in YYYY-MM-DD format',
    example: '2021-12-31',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  departure?: string;
}
