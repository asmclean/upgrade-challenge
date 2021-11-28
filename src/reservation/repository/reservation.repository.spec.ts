import { Test, TestingModule } from '@nestjs/testing';
import { ReservationRepository } from './reservation.repository';
import { Reservation } from '../entities/reservation.entity';
import {
  ConflictingReservationException,
  ReservationNotFoundException,
} from '../../common/exception/reservation.exception';
import { QueryFailedError } from 'typeorm';

describe('ReservationRepository', () => {
  let repository: ReservationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationRepository,
      ],
    }).compile();

    repository = module.get<ReservationRepository>(ReservationRepository);
  });

  describe('createReservation', () => {
    it('creates a Reservation', () => {
      repository.create = jest.fn();
      repository.createReservation({
        fullName: 'fn',
        email: 'e@ma.il',
        arrival: '2021-01-01',
        departure: '2021-01-02',
      });
      expect(repository.create).toBeCalledWith({
        fullName: 'fn',
        email: 'e@ma.il',
        dates: '[2021-01-01,2021-01-02)',
      });
    });
  });

  describe('createUpdatedReservation', () => {
    it('throws an error if the reservation does not exist', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      expect(() => repository.createUpdatedReservation('id', {
        fullName: 'fn',
        email: 'e@ma.il',
        arrival: '2021-01-01',
        departure: '2021-01-02',
      })).rejects.toThrow(ReservationNotFoundException);
    });

    it('creates an update from an existing reservation', async () => {
      repository.findOne = jest.fn().mockResolvedValue({
        fullName: 'fn',
        email: 'e@ma.il',
        arrival: '2021-01-01',
        departure: '2021-01-02',
      });
      const newEntity = await repository.createUpdatedReservation('id', {
        fullName: 'fn2',
        arrival: '2020-12-31',
      });
      expect(newEntity).toEqual({
        id: 'id',
        fullName: 'fn2',
        email: 'e@ma.il',
        dates: '[2020-12-31,2021-01-02)',
      });
    });
  });

  describe('saveReservation', () => {
    it('throws an error if the dates conflict with an existing reservation', async () => {
      repository.save = jest.fn().mockRejectedValue(new QueryFailedError(
        'query',
        [],
        {
          driverError: {
            constraint: 'reservation_prevent_overlapping',
          }
        }
      ));

      const entity = new Reservation();
      entity.fullName = 'fn';
      entity.email = 'e@ma.il';
      entity.dates = '[2021-01-01,2021-01-02)';
      expect(() => repository.saveReservation(entity)).rejects.toThrow(ConflictingReservationException);
    });
  });

  describe('deleteReservationById', () => {
    it('throws an error if the reservation does not exist', async () => {
      repository.delete = jest.fn().mockResolvedValue({ affected: 0 });

      expect(() => repository.deleteReservationById('id')).rejects.toThrow(ReservationNotFoundException);
    });
  });

  describe('findAvailability', () => {
    it('returns an empty array if nothing is available', async () => {
      repository.query = jest.fn().mockResolvedValue([{ dates: '[2021-01-01,2021-01-31)' }]);

      const availability = await repository.findAvailability('2021-01-01', '2021-01-31');
      expect(availability).toEqual([]);
    });

    it('returns available dates', async () => {
      repository.query = jest.fn().mockResolvedValue([
        { dates: '[2021-01-01,2021-01-10)' },
        { dates: '[2021-01-12,2021-01-29)' },
      ]);

      const availability = await repository.findAvailability('2021-01-01', '2021-01-31');
      expect(availability).toEqual(['2021-01-11', '2021-01-30', '2021-01-31']);
    });

    it('uses memoization when called with the same parameters', async () => {
      repository.query = jest.fn().mockResolvedValue([
        { dates: '[2021-01-01,2021-01-10)' },
        { dates: '[2021-01-12,2021-01-29)' },
      ]);

      let availability: string[];
      availability = await repository.findAvailability('2021-01-01', '2021-01-31');
      expect(availability).toEqual(['2021-01-11', '2021-01-30', '2021-01-31']);
      availability = await repository.findAvailability('2021-01-01', '2021-01-31');
      expect(availability).toEqual(['2021-01-11', '2021-01-30', '2021-01-31']);
      availability = await repository.findAvailability('2021-01-01', '2021-01-31');
      expect(availability).toEqual(['2021-01-11', '2021-01-30', '2021-01-31']);
      expect(repository.query).toBeCalledTimes(1);
    });
  });
});
