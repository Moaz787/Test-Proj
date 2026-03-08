import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GeneratorsProvider {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: {
    id: string;
    IsLoggedIn: boolean;
    Role: string;
  }) {
    return this.jwtService.signAsync(payload)
  }

  async generateVerificationLink(id: string, token: string) {
    return {
      MainVerificationLink: `http://localhost:3000/api/v1/users/verify/${id}/${token}`,
    };
  }

  async GenerateChangePasswordCode() {
    return Math.floor(Math.random() * 999999);
  }
}
