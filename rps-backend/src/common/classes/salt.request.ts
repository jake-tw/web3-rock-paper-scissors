import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ValidationInfo } from './validation-info';

export class SaltRequest extends ValidationInfo {
  @ApiProperty({ type: Number })
  @IsInt()
  @Min(0)
  gameId: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  salt: string;
}
