import { applyDecorators } from '@nestjs/common';
import { IsEthereumAddress } from 'class-validator';
import { Transform } from 'class-transformer';
import { ethers } from 'ethers';

export function TransformChecksumEthereumAddress() {
  return applyDecorators(
    Transform(({ value }) => {
      try {
        return ethers.getAddress(String(value).toLowerCase().trim());
      } catch (error) {
        return '';
      }
    }),
    IsEthereumAddress(),
  );
}
