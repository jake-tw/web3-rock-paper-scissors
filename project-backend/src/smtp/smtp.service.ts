import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationInfo } from 'src/common/entities/validation-info.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/common/enums';
import { TEN_MIN_SECONDS } from 'src/common/constants';
import { nowSeconds } from 'src/common/utils';
import { join } from 'path';

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  constructor(
    @InjectRepository(ValidationInfo)
    private readonly validationInfoRepository: Repository<ValidationInfo>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  public async sendValidationCode(
    customerId: number,
    email: string,
  ): Promise<void> {
    const code = uuid();
    const expiredTime = nowSeconds() + TEN_MIN_SECONDS;

    const validationInfo = await this.validationInfoRepository.save({
      customerId,
      email,
      expiredTime,
      code,
    });

    this.logger.log(
      `Create validation info: ${JSON.stringify(validationInfo)}`,
    );

    // TODO send email and click bottom to verify email
    // this.sendEmail({
    //   to: email,
    //   from: this.configService.get(ConfigKey.MAIL_SENDER),
    //   subject: 'Rock Paper Scissors email validation.',
    //   html: `${join(
    //     this.configService.get('ConfigKey.VALIDATION_BASE_URL'),
    //     code,
    //   )}`,
    // });
  }

  public async verifyCode(customerId: number, code: string): Promise<boolean> {
    const now = nowSeconds();

    const validationInfo = await this.validationInfoRepository.findOne({
      where: { customerId },
      order: { expiredTime: 'DESC' },
    });

    if (validationInfo.expiredTime <= now) {
      throw new UnauthorizedException('Validation code expired.');
    }
    if (validationInfo.code !== code) {
      throw new UnauthorizedException('Invalid validation code.');
    }

    validationInfo.expiredTime = 0;
    await this.validationInfoRepository.save(validationInfo);
    return true;
  }

  private async sendEmail(options: ISendMailOptions) {
    this.mailerService
      .sendMail(options)
      .then((success) => {
        this.logger.log(`Smtp service success: ${JSON.stringify(success)}`);
      })
      .catch((error) => {
        this.logger.log(`Smtp service fail: ${JSON.stringify(error)}`);
      });
  }
}
