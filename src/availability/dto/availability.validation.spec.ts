import { AvailabilityValidationPipe } from './availability.validation';
import { GetAvailabilityDto } from './get-availability.dto';

describe('AvailabilityValidatePipe', () => {
  const validation = new AvailabilityValidationPipe();

  function withBody(body: GetAvailabilityDto) {
    return () =>
      validation.transform(body, {
        type: 'body',
        metatype: GetAvailabilityDto,
      });
  }

  it('start must have valid format', () => {
    expect(
      withBody({
        start: '2021/11/13',
        end: '2021-11-13',
      }),
    ).toThrow('start not in YYYY-MM-DD format');
  });

  it('end must have valid format', () => {
    expect(
      withBody({
        start: '2021-11-13',
        end: '2021-11-43',
      }),
    ).toThrow('end not in YYYY-MM-DD format');
  });
});
