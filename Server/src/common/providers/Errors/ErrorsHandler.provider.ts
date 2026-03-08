import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ErrorsHandlerProvider {
  async ErrorHandler(type: string, error: string) {
    if (type === 'Unauthorized') {
      throw new UnauthorizedException(error);
    } else if (type === 'Forbidden') {
      throw new ForbiddenException(error);
    } else if (type === 'Not Found') {
      throw new NotFoundException(error);
    } else if (type === 'Bad Request') {
      throw new BadRequestException(error);
    } else if (type === 'Internal Server Error') {
      throw new InternalServerErrorException(error);
    } else {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
