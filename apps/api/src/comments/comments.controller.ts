import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { Public } from '../common/decorators/public.decorator'

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Post()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: '提交评论（公开，每分钟限 3 条）' })
  @ApiResponse({ status: 201, description: '评论已创建' })
  @ApiResponse({ status: 429, description: '请求过于频繁' })
  create(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    const ip = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']
    const isAdmin = !!req.user
    return this.commentsService.create(createCommentDto, ip, userAgent, isAdmin)
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '获取评论列表（公开）；传 all=true 且已认证时返回全部' })
  @ApiQuery({ name: 'slug', required: false, description: '按文章 slug 过滤' })
  @ApiQuery({ name: 'all', required: false, description: '传 true 且认证后返回全部评论（管理员）' })
  @ApiResponse({ status: 200, description: '评论列表' })
  findAll(@Query('slug') slug: string, @Query('all') all?: string, @Req() req?: any) {
    if (all === 'true' && req.user) {
      return this.commentsService.findAll()
    }
    return this.commentsService.findAllBySlug(slug)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论（私有）' })
  @ApiParam({ name: 'id', description: '评论 ID (CUID)' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id)
  }
}
