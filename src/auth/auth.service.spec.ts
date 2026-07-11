/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: { username: string; userId: string }) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: 'token-falso-para-teste',
    };
  }
}
