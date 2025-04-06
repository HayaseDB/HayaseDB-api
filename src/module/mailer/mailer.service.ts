import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send a verification email with a token.
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>('app.base_url');
    const url = `${baseUrl}/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Please verify your email address',
      template: 'verification',
      context: {
        url,
      },
    });
  }
}
