import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MeResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  emailVerified: boolean;

  @Expose()
  createdAt: Date;
}
