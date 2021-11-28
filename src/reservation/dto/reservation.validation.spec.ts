import { ReservationValidationPipe } from './reservation.validation';
import { CreateReservationDto } from './create-reservation.dto';

describe('ReservationValidatePipe', () => {
  const validation = new ReservationValidationPipe();

  function withBody(body: CreateReservationDto) {
    return () =>
      validation.transform(body, {
        type: 'body',
        metatype: CreateReservationDto,
      });
  }

  it('arrival must have valid format', () => {
    expect(
      withBody({
        fullName: 'fn',
        email: 'e@ma.il',
        arrival: '2021/11/13',
        departure: '2021-11-13',
      }),
    ).toThrow('arrival not in YYYY-MM-DD format');
  });

  it('departure must have valid format', () => {
    expect(
      withBody({
        fullName: 'fn',
        email: 'e@ma.il',
        arrival: '2021-11-13',
        departure: '2021-11-43',
      }),
    ).toThrow('departure not in YYYY-MM-DD format');
  });
});
