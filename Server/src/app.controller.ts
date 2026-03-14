import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('success')
  getSuccess(): string {
    return 'Payment Success';
  }

  @Get('cancel')
  getCancel(): string {
    return 'Payment Cancel';
  }
}
