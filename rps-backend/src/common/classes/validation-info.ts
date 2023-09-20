import { ApiProperty } from '@nestjs/swagger';
import { TransformChecksumEthereumAddress } from '../decorator/transform-checksum-ethereum-address.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidationInfo {
  @ApiProperty({ type: String })
  @TransformChecksumEthereumAddress()
  walletAddress: string;

  @ApiProperty({ type: Number })
  timestamp: number;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
