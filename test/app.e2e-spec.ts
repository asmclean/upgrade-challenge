import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ReservationRepository } from '../src/reservation/repository/reservation.repository';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { LocalDate } from '@js-joda/core';
import { Worker } from 'worker_threads';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let repository: ReservationRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    repository = await app.get(ReservationRepository);
  });

  afterEach(async () => {
    await app.close();
  });

  function daysFromNow(days: number): string {
    return LocalDate.now().plusDays(days).toString();
  }

  describe('/reservation (POST)', () => {
    describe('validation', () => {
      it('performs basic validation', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: '',
            email: 'email',
            arrival: null,
            departure: 1,
          })
          .expect(400)
          .expect((res) =>
            [
              'fullName should not be empty',
              'email must be an email',
              'arrival should not be empty',
              'arrival must be a string',
              'departure must be a string',
            ].every((msg) => res.body.message.includes(msg)),
          );
      });

      it('performs custom data validations', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(2),
            departure: 'asdf',
          })
          .expect(400);
      });
    });

    describe('successes', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(3),
            departure: daysFromNow(4),
          })
          .expect(201);
      });

      it('accepts available dates', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(5),
            departure: daysFromNow(6),
          })
          .expect(201);
      });

      it('accepts arrival on existing departure', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(4),
            departure: daysFromNow(5),
          })
          .expect(201);
      });

      it('accepts departure on existing arrival', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(2),
            departure: daysFromNow(3),
          })
          .expect(201);
      });
    });

    describe('failures', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(3),
            departure: daysFromNow(6),
          })
          .expect(201);
      });

      it('rejects reservations with backward dates', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(8),
            departure: daysFromNow(7),
          })
          .expect(400);
      });

      it('rejects reservations on the same dates', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(3),
            departure: daysFromNow(6),
          })
          .expect(409);
      });

      it('rejects reservations overlapping the arrival', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(2),
            departure: daysFromNow(4),
          })
          .expect(409);
      });

      it('rejects reservations overlapping the departure', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(5),
            departure: daysFromNow(7),
          })
          .expect(409);
      });

      it('rejects reservations contained within existing reservation', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(4),
            departure: daysFromNow(5),
          })
          .expect(409);
      });

      it('rejects reservations containing existing reservation', async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(6),
            departure: daysFromNow(9),
          })
          .expect(201);
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(7),
            departure: daysFromNow(8),
          })
          .expect(409);
      });
    });
  });

  describe('/reservation (DELETE)', () => {
    describe('validation', () => {
      it('rejects invalid UUIDs', async () => {
        await request(app.getHttpServer())
          .delete('/reservation/invalidd4-dfad-4199-ad52-0f1c6d6a8a6c')
          .expect(400);
      });
    });

    describe('failures', () => {
      it('rejects reservation that do not exist', async () => {
        await request(app.getHttpServer())
          .delete('/reservation/a156e4d4-dfad-4199-ad52-0f1c6d6a8a6c')
          .expect(404);
      });
    });

    describe('successes', () => {
      it('deletes the reservation', async () => {
        const { body: reservation } = await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(6),
            departure: daysFromNow(9),
          })
          .expect(201);

        await request(app.getHttpServer())
          .delete(`/reservation/${reservation.id}`)
          .expect(200);
      });
    });
  });

  describe('/reservation (PATCH)', () => {
    let id: string;

    beforeEach(async () => {
      const { body: reservation } = await request(app.getHttpServer())
        .post('/reservation')
        .send({
          fullName: 'fn',
          email: 'e@ma.il',
          arrival: daysFromNow(3),
          departure: daysFromNow(4),
        })
        .expect(201);

      id = reservation.id;
    });

    describe('validation', () => {
      it('performs basic validation', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            fullName: '',
            email: 'email',
            arrival: null,
            departure: 1,
          })
          .expect(400)
          .expect((res) =>
            [
              'fullName should not be empty',
              'email must be an email',
              'arrival should not be empty',
              'arrival must be a string',
              'departure must be a string',
            ].every((msg) => res.body.message.includes(msg)),
          );
      });

      it('rejects invalid UUIDs', async () => {
        await request(app.getHttpServer())
          .patch('/reservation/invalidd4-dfad-4199-ad52-0f1c6d6a8a6c')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(3),
            departure: daysFromNow(4),
          })
          .expect(400);
      });

      it('performs custom data validations', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(2),
            departure: 'asdf',
          })
          .expect(400);
      });
    });

    describe('successes', () => {
      it('accepts no changes', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(3),
            departure: daysFromNow(4),
          })
          .expect(200);
      });

      it('updates all fields', async () => {
        const arrival = daysFromNow(5);
        const departure = daysFromNow(6);
        const { body: reservation } = await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            fullName: 'fn2',
            email: 'e2@ma.il',
            arrival,
            departure,
          })
          .expect(200);
        expect(reservation.id).toEqual(id);
        expect(reservation.fullName).toEqual('fn2');
        expect(reservation.email).toEqual('e2@ma.il');
        expect(reservation.arrival).toEqual(arrival);
        expect(reservation.departure).toEqual(departure);
      });

      it('updates reserved dates', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            arrival: daysFromNow(5),
            departure: daysFromNow(6),
          })
          .expect(200);
      });

      it('updates only arrival', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            arrival: daysFromNow(2),
          })
          .expect(200);
      });

      it('updates only departure', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            departure: daysFromNow(5),
          })
          .expect(200);
      });
    });

    describe('failures', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/reservation')
          .send({
            fullName: 'fn',
            email: 'e@ma.il',
            arrival: daysFromNow(4),
            departure: daysFromNow(5),
          })
          .expect(201);
      });

      it('rejects reservations that do not exist', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/abcd${id.slice(4)}`)
          .send({
            fullName: 'fn',
          })
          .expect(404);
      });

      it('rejects invalid updates', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            arrival: daysFromNow(10),
            departure: daysFromNow(14),
          })
          .expect(400);
      });

      it('rejects reservations on unavailable dates', async () => {
        await request(app.getHttpServer())
          .patch(`/reservation/${id}`)
          .send({
            departure: daysFromNow(5),
          })
          .expect(409);
      });
    });
  });

  describe('/availability (GET)', () => {
    describe('defaults', () => {
      it('searches one month by default', async () => {
        const { body: availableDates } = await request(app.getHttpServer())
          .get('/availability')
          .expect(200);
        const today = LocalDate.now();
        expect(availableDates).toContain(today.toString());
        expect(availableDates).toContain(today.plusMonths(1).toString());
        expect(availableDates).not.toContain(today.minusDays(1).toString());
        expect(availableDates).not.toContain(
          today.plusMonths(1).plusDays(1).toString(),
        );
      });

      it('searches up to one month from start by default', async () => {
        const startDate = LocalDate.now().plusDays(17);
        const { body: availableDates } = await request(app.getHttpServer())
          .get('/availability')
          .query({ start: startDate.toString() })
          .expect(200);
        expect(availableDates).toContain(startDate.toString());
        expect(availableDates).toContain(LocalDate.now().plusMonths(1).minusDays(1).toString());
        expect(availableDates).not.toContain(startDate.minusDays(1).toString());
        expect(availableDates).not.toContain(
          startDate.plusMonths(1).plusDays(1).toString(),
        );
      });

      it('searches up to one month to end by default', async () => {
        const endDate = LocalDate.now().plusDays(17);
        const { body: availableDates } = await request(app.getHttpServer())
          .get('/availability')
          .query({ end: endDate.toString() })
          .expect(200);
        expect(availableDates).toContain(daysFromNow(1));
        expect(availableDates).toContain(endDate.toString());
        expect(availableDates).not.toContain(
          endDate.minusMonths(1).minusDays(1).toString(),
        );
        expect(availableDates).not.toContain(endDate.plusDays(1).toString());
      });
    });

    describe('with both values', () => {
      it('rejects searches with backward date range', async () => {
        await request(app.getHttpServer())
          .get('/availability')
          .query({
            start: daysFromNow(3),
            end: daysFromNow(2),
          })
          .expect(400);
      });

      it('searches the requested date range', async () => {
        const { body: availableDates } = await request(app.getHttpServer())
          .get('/availability')
          .query({
            start: daysFromNow(3),
            end: daysFromNow(20),
          })
          .expect(200);
        expect(availableDates.length).toEqual(18);
        expect(availableDates).toContain(daysFromNow(3));
        expect(availableDates).toContain(daysFromNow(20));
        expect(availableDates).not.toContain(daysFromNow(2));
        expect(availableDates).not.toContain(daysFromNow(21));
      });
    });
  });

  describe('database', () => {
    it('should not create unexpected reservations from concurrent requests', (done) => {
      const NUM_WORKERS = 4;
      let completedWorkers = 0;
      app.listen(3000)
        .then((_) => app.getUrl())
        .then((url) => {
          const daysToRequest = [...new Array(28)].map((_, dayOffset) => daysFromNow(2 + dayOffset));
          for (let workerNumber = 0; workerNumber < NUM_WORKERS; workerNumber++) {
            const worker = new Worker(`${__dirname}/parallelRequests.js`, {
              workerData: {
                url,
                workerNumber,
                daysToRequest
              }
            });
            worker.on('exit', (_) => {
              if (++completedWorkers === NUM_WORKERS) {
                repository.query('SELECT full_name from "Reservation"')
                  .then((fullNames) => {
                    // Check for the expected number of reservations
                    expect(fullNames.length).toEqual(27);
                    // Make sure we had some real competition by
                    // seeing more than one name
                    expect((new Set(fullNames)).size).toBeGreaterThan(1);
                    return repository.findAvailability(
                      daysFromNow(2).toString(),
                      daysFromNow(29).toString(),
                    );
                  })
                  .then((availability) => {
                    // Check the expected days were all reserved
                    expect(availability.length).toEqual(0);
                    done();
                  });
              }
            });
          }
        });
    });

    it('should hit the index', async () => {
      const result = await repository.query(
        'EXPLAIN SELECT dates FROM "Reservation" WHERE dates && $1',
        [`[${daysFromNow(2)},${daysFromNow(3)})`]
      );
      const queryPlans = result.map((obj: { 'QUERY PLAN': string }) => obj['QUERY PLAN']);
      const indexQueryPlan = queryPlans.find((plan) => plan.includes('Index Scan'));
      expect(indexQueryPlan).toContain('reservation_prevent_overlapping');
    });
  });
});
