import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreventOverlappingReservations1636945825703
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "Reservation" ADD CONSTRAINT reservation_prevent_overlapping EXCLUDE USING gist (dates WITH &&)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "Reservation" DROP CONSTRAINT reservation_prevent_overlapping',
    );
  }
}
