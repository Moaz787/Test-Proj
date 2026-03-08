import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as path from 'path';
import * as ejs from 'ejs';
import { UsersService } from '../clients/users.service';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class MailService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}

  private HtmlContent(templatePath: string, subject?: string, body?: string) {
    return ejs.renderFile(templatePath, { subject, body });
  }

  async sendEmail(userEmail: string, subject: string, body: string) {
    const templatePath = path.join(__dirname, 'Templates', 'SimpleEmail.ejs');

    const response = await this.commonService.SendEmailRequest({
      receiver: userEmail,
      subject,
      body: await this.HtmlContent(templatePath, subject, body),
    });

    return response;
  }

  async sendVerificationEmail(userEmail: string, link: string, token: string) {
    const user = await this.usersService.findUserByEmail(userEmail);

    if (user.EmailVerificationToken === token) {
      try {
        const templatePath = path.join(__dirname, 'Templates', 'verify.ejs');
        const HtmlContent = await ejs.renderFile(templatePath, {
          link: link,
        });

        const response = await this.commonService.SendEmailRequest({
          receiver: userEmail,
          subject: 'Verify your email',
          body: HtmlContent,
        });

        return response;
      } catch (error) {
        return this.commonService.ErrorHandler('Internal Server Error', error);
      }
    } else {
      return this.commonService.ErrorHandler('Bad Request', 'Invalid token');
    }
  }

  async sendCode(userEmail: string, code: number) {
    try {
      const templatePath = path.join(__dirname, 'Templates', 'code.ejs');

      const response = await this.commonService.SendEmailRequest({
        receiver: userEmail,
        subject: 'Change password',
        body: await this.HtmlContent(templatePath, 'Change password', code.toString()),
      });

      return response;
    } catch (error) {
      return this.commonService.ErrorHandler('Internal Server Error', error);
    }
  }
}
