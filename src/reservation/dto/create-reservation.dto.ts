import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'name to use for the reservation',
    example: 'John Smith'
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'email address to associate with the reservation',
    example: 'user@domain.tld'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'arrival date in YYYY-MM-DD format',
    example: '2021-01-01',
  })
  @IsString()
  @IsNotEmpty()
  arrival: string;

  @ApiProperty({
    description: 'departure date in YYYY-MM-DD format',
    example: '2021-12-31',
  })
  @IsString()
  @IsNotEmpty()
  departure: string;
}
