import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ProcessImageProvider {
  constructor() {}

  async processImage(destination: string, file: Express.Multer.File, name: string) {
    const rootPublic = './uploads';
    const uploadDir = path.join(rootPublic, destination);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (file) {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${name}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      try {
        fs.writeFileSync(filePath, file.buffer);

        return path.join(destination, fileName).replace(/\\/g, '/');
      } catch (error) {
        throw new InternalServerErrorException('Error saving file');
      }
    }
    throw new BadRequestException('File not found');
  }
}
