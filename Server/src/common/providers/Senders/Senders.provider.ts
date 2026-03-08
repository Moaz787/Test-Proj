import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MailService } from 'src/mail/mail.service';
import { URL } from 'src/utils/Constants';
import { SendEmailRequest } from 'src/utils/types';

@Injectable()
export class SendersProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ) {}

  async SendEmailRequest(payload: SendEmailRequest) {
    return firstValueFrom(this.httpService.post(URL, payload))
      .then((res) => res.data)
      .catch((error) => {
        throw new HttpException(
          'Error sending email, Error is: ' + error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  async SendEmailToUser(email: string, subject: string, body: string) {
    await this.mailService.sendEmail(email, subject, body);
  }
}
