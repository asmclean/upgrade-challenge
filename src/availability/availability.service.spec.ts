import { Test, TestingModule } from '@nestjs/testing';
import { LocalDate } from '@js-joda/core';
import { AvailabilityService } from './availability.service';
import { ReservationRepository } from '../reservation/repository/reservation.repository';
import { GetAvailabilityDto } from './dto/get-availability.dto';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  function withDto(body) {
    const dto = new GetAvailabilityDto();
    dto.start = body.start;
    dto.end = body.end;
    return () => service.find(dto);
  }

  function daysFromNow(days: number): string {
    return LocalDate.now().plusDays(days).toString();
  }

  const mockFindAvailability = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: ReservationRepository,
          useValue: {
            findAvailability: mockFindAvailability,
          },
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);

    mockFindAvailability.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('defaults', () => {
    it('searches one month by default', () => {
      service.find({ start: undefined, end: undefined });
      expect(mockFindAvailability).toBeCalledWith(
        LocalDate.now().toString(),
        LocalDate.now().plusMonths(1).toString(),
      );
    });

    it('searches one month from start by default', () => {
      const startDate = LocalDate.now();
      service.find({ start: startDate.toString(), end: undefined });
      expect(mockFindAvailability).toBeCalledWith(
        startDate.toString(),
        startDate.plusMonths(1).toString(),
      );
    });

    it('searches one month to end by default', () => {
      const endDate = LocalDate.now().plusMonths(1);
      service.find({ start: undefined, end: endDate.toString() });
      expect(mockFindAvailability).toBeCalledWith(
        endDate.minusMonths(1).toString(),
        endDate.toString(),
      );
    });

    it('searches the requested date range', () => {
      const startDate = daysFromNow(3);
      const endDate = daysFromNow(10);
      service.find({ start: startDate, end: endDate });
      expect(mockFindAvailability).toBeCalledWith(startDate, endDate);
    });

    it('searches only dates that can be reserved when requested beyond that range', () => {
      const startDate = daysFromNow(-3);
      const endDate = daysFromNow(40);
      service.find({ start: startDate, end: endDate });
      expect(mockFindAvailability).toBeCalledWith(
        LocalDate.now().toString(),
        LocalDate.now().plusMonths(1).toString(),
      );
    });
  });

  describe('failures', () => {
    it('rejects a start date after end date', () => {
      expect(
        withDto({
          start: daysFromNow(5),
          end: daysFromNow(4),
        }),
      ).toThrow('requested start date must be earlier than requested end date');
    });
  });
});
