import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Public } from '../common/decorators/public.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录获取 JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['apiKey'],
      properties: {
        apiKey: { type: 'string', description: '管理员 API Key', example: 'your-api-key' },
      },
    },
  })
  @ApiResponse({ status: 200, description: '登录成功', schema: { example: { access_token: 'eyJ...' } } })
  @ApiResponse({ status: 401, description: 'API Key 无效' })
  async login(@Body('apiKey') apiKey: string) {
    return this.authService.login(apiKey)
  }
}
