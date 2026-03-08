import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DeleteImageProvider {
  async deleteImage(imagePath: string, destination: string) {
    const rootPublic = './uploads/';
    const uploadDir = path.join(rootPublic, destination);
    const filePath = path.join(uploadDir, imagePath);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { message: 'Image deleted successfully' };
      }
      return { error: 'Image not found' };
    } catch (error) {
      return { error: 'Error deleting file' };
    }
  }
}
