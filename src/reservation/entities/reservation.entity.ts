import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('Reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar' })
  fullName: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ name: 'dates', type: 'daterange' })
  dates: string;

  @Expose()
  get arrival() {
    return this.dates.slice(1, 11);
  }

  @Expose()
  get departure() {
    return this.dates.slice(12, 22);
  }
}
