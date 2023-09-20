import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ValidationInfo } from './validation-info';

export class EmailRequest extends ValidationInfo {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
