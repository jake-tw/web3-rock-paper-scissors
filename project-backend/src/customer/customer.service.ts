import { Injectable, Logger } from '@nestjs/common';
import { SmtpService } from '../smtp/smtp.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../common/entities/customer.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly smtpService: SmtpService,
  ) {}

  public async putEmail(walletAddress: string, email: string): Promise<void> {
    let customer = await this.customerRepository.findOneBy({ walletAddress });

    if (!customer) {
      customer = await this.customerRepository.save({
        walletAddress,
        email,
        isVerify: false,
      });
    } else {
      customer.email = email;
      customer.isVerify = false;
    }

    this.smtpService
      .sendValidationCode(customer.id, customer.email)
      .then((success) => {
        this.logger.log(`[${customer.id}] Sending email success.`);
      })
      .catch((error) => {
        this.logger.log(
          `[${
            customer.id
          }] Unexpected error while sending email: ${JSON.stringify(error)}`,
        );
      });
  }

  public async verifyCode(code: string): Promise<void> {}
}
