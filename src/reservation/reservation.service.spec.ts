import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { ReservationRepository } from './repository/reservation.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { LocalDate } from '@js-joda/core';

describe('ReservationService', () => {
  let service: ReservationService;

  function withDto(body) {
    const dto = new CreateReservationDto();
    dto.fullName = body.fullName;
    dto.email = body.email;
    dto.arrival = body.arrival;
    dto.departure = body.departure;
    return () => service.create(dto);
  }

  let clockTime: string;

  function getClockDate(): string {
    return clockTime.substring(0, 10);
  }

  function daysFromClock(days: number): string {
    return LocalDate.parse(getClockDate()).plusDays(days).toString();
  }

  function freezeTime(frozenDateTime: string) {
    beforeEach(() => {
      clockTime = frozenDateTime;
      jest
        .useFakeTimers()
        .setSystemTime(new Date(clockTime));
    });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: ReservationRepository,
          useValue: {
            createReservation: (dto) => ({
              fullName: dto.fullName,
              email: dto.email,
              dates: `[${dto.arrival},${dto.departure})`,
            }),
            saveReservation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('failures', () => {
    freezeTime('2021-11-13T21:00:00');

    it('duration must be at least one day', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromClock(2),
          departure: daysFromClock(2),
        }),
      ).toThrow('time from arrival to departure is not at least one day');

      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromClock(3),
          departure: daysFromClock(2),
        }),
      ).toThrow('time from arrival to departure is not at least one day');
    });

    it('duration must not exceed three days', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromClock(2),
          departure: daysFromClock(6),
        }),
      ).toThrow(
        'time from arrival to departure is greater than maximum three days',
      );
    });

    it('reservation must be at least one day in advance', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromClock(1), // less than one full day
          departure: daysFromClock(4),
        }),
      ).toThrow('reservations not accepted later than one day in advance');
    });

    it('reservation must be at most one month in advance', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: LocalDate.parse(getClockDate())
            .plusMonths(1)
            .plusDays(1)
            .toString(),
          departure: LocalDate.parse(getClockDate())
            .plusMonths(1)
            .plusDays(2)
            .toString(),
        }),
      ).toThrow('reservations not accepted further than one month in advance');
    });
  });

  describe('successes', () => {
    freezeTime('2021-11-13T21:00:00');

    it('allows a reservation beyond one day in advance', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromClock(2),
          departure: daysFromClock(5),
        }),
      ).not.toThrow();
    });

    it('allows a reservation close to a month in advance', () => {
      expect(
        withDto({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: LocalDate.parse(getClockDate())
            .plusMonths(1)
            .minusDays(1)
            .toString(),
          departure: LocalDate.parse(getClockDate())
            .plusMonths(1)
            .plusDays(1)
            .toString(),
        }),
      ).not.toThrow();
    });

    describe('when it is midnight', () => {
      freezeTime('2021-11-13T00:00:00');

      it('allows a reservation exactly one day in advance', () => {
        expect(
          withDto({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromClock(1),
            departure: daysFromClock(4),
          }),
        ).not.toThrow();
      });

      it('allows a reservation exactly one month in advance', () => {
        expect(
          withDto({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: LocalDate.parse(getClockDate()).plusMonths(1).toString(),
            departure: LocalDate.parse(getClockDate())
              .plusMonths(1)
              .plusDays(2)
              .toString(),
          }),
        ).not.toThrow();
      });
    });
  });
});
