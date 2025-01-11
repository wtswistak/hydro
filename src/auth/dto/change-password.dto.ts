import { IsNumber, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  password: string;

  @IsString()
  @MinLength(8, { message: 'Password is too short' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, {
    message: 'Password is too weak',
  })
  newPassword: string;
}
