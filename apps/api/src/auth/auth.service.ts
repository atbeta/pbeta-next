import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(apiKey: string) {
    const validApiKey = this.configService.get<string>('apiKey')
    
    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return {
      access_token: this.jwtService.sign({ sub: 'admin', role: 'admin' }),
    }
  }
}
