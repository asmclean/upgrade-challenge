import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class GetAvailabilityDto {
  @ApiPropertyOptional({
    description: 'date in YYYY-MM-DD format to start searching for availability',
    example: '2021-01-01',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiPropertyOptional({
    description: 'date in YYYY-MM-DD format to end searching for availability',
    example: '2021-12-31',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  end: string;
}
