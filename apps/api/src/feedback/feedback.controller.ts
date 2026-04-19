import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Public } from '../common/decorators/public.decorator'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackSchema, CreateFeedbackDto } from './feedback.dto'

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: '提交反馈（公开，每分钟限 5 条）' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', minLength: 4, maxLength: 2000, example: '网站做得很好！' },
        serviceId: { type: 'string', description: '关联的服务 ID（可选）' },
        contact: { type: 'string', format: 'email', example: 'user@example.com', description: '联系邮箱（可选，匿名则留空）' },
      },
    },
  })
  @ApiResponse({ status: 201, description: '反馈已创建', schema: { example: { id: 'clxxx...', createdAt: '2026-03-17T00:00:00.000Z' } } })
  @ApiResponse({ status: 400, description: '字段校验失败' })
  @ApiResponse({ status: 429, description: '请求过于频繁' })
  async create(@Body() body: unknown) {
    const parsed = CreateFeedbackSchema.safeParse(body)
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors)
    }
    return this.feedbackService.create(parsed.data as CreateFeedbackDto)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有反馈（私有）' })
  @ApiQuery({ name: 'serviceId', required: false, description: '按服务 ID 过滤' })
  @ApiResponse({ status: 200, description: '反馈列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  findAll(@Query('serviceId') serviceId?: string) {
    return this.feedbackService.findAll(serviceId)
  }
}
