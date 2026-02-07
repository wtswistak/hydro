import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RegisterResponseDto {
  id: number;

  @Expose()
  email: string;

  password: string;
  createdAt: Date;
  updatedAt: Date;
}
