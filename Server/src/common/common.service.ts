import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { User } from '../clients/Entities/users.entity';
import { Role } from '../utils/enums';
import { MailService } from '../mail/mail.service';
import { SendEmailRequest } from 'src/utils/types';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { URL } from '../utils/Constants';
import { ProcessImageProvider } from './providers/Images/ProcessImage.provider';
import { DeleteImageProvider } from './providers/Images/DeleteImage.provider';
import { GeneratorsProvider } from './providers/Generators/Generators.provider';
import { ErrorsHandlerProvider } from './providers/Errors/ErrorsHandler.provider';
import { CheckersProvider } from './providers/Checkers/Checkers.provider';
import { OthersProvider } from './providers/Other/Others.provider';
import { SendersProvider } from './providers/Senders/Senders.provider';

@Injectable()
export class CommonService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly httpService: HttpService,
    private readonly processImageProvider: ProcessImageProvider,
    private readonly deleteImageProvider: DeleteImageProvider,
    private readonly generatorsProvider: GeneratorsProvider,
    private readonly errorsHandlerProvider: ErrorsHandlerProvider,
    private readonly checkersProvider: CheckersProvider,
    private readonly othersProvider: OthersProvider,
    private readonly sendersProvider: SendersProvider,
  ) {}

  async processImage(
    destination: string,
    file: Express.Multer.File,
    name: string,
  ) {
    return this.processImageProvider.processImage(destination, file, name);
  }

  async deleteImage(imagePath: string, destination: string) {
    return this.deleteImageProvider.deleteImage(imagePath, destination);
  }

  async generateToken(payload: {
    id: string;
    IsLoggedIn: boolean;
    Role: string;
  }) {
    return this.generatorsProvider.generateToken(payload);
  }

  async hashPassword(password: string) {
    const salt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(password, salt);
  }

  async comparePassword(p1: string, p2: string): Promise<boolean> {
    return this.othersProvider.comparePassword(p1, p2);
  }

  async generateVerificationLink(id: string, token: string) {
    return this.generatorsProvider.generateVerificationLink(id, token);
  }

  async UpdateRole(id: string, updaterId: string, user: User, updater: User) {
    return this.othersProvider.UpdateRole(id, updaterId, user, updater);
  }

  async CheckIfUserLoggedInAndVerified(user: User, updater: User | null) {
    return this.checkersProvider.CheckIfUserLoggedInAndVerified(user, updater);
  }

  async SendEmailToUser(email: string, subject: string, body: string) {
    await this.sendersProvider.SendEmailToUser(email, subject, body);
  }

  async GenerateChangePasswordCode() {
    return this.generatorsProvider.GenerateChangePasswordCode();
  }

  async SendEmailRequest(payload: SendEmailRequest) {
    return this.sendersProvider.SendEmailRequest(payload);
  }

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
