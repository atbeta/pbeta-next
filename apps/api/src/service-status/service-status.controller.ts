import { Controller, Get, Param, Post, Body, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { ServiceStatusService } from './service-status.service'
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto'

@ApiTags('Services')
@Controller('services')
export class ServiceStatusController {
  constructor(private readonly statusService: ServiceStatusService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取所有服务及当前状态', description: '公开接口，无需认证' })
  @ApiResponse({ status: 200, description: '服务列表' })
  findAll() {
    return this.statusService.findAll()
  }

  @Public()
  @Get(':id/history')
  @ApiOperation({ summary: '获取指定服务的近期健康检查历史（最多 48 条）' })
  @ApiParam({ name: 'id', description: '服务 ID (CUID)' })
  @ApiResponse({ status: 200, description: '历史记录列表' })
  findHistory(@Param('id') id: string) {
    return this.statusService.findHistory(id)
  }

  @Post('check')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: '手动触发全量健康检查（私有）', description: '正常由调度器每 5 分钟自动触发' })
  @ApiResponse({ status: 202, description: '已加入队列' })
  @ApiResponse({ status: 401, description: '未认证' })
  async triggerCheck() {
    await this.statusService.enqueueAll()
    return { message: 'Health checks enqueued' }
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '新增服务（私有）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.statusService.create(createServiceDto)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新服务（私有）' })
  @ApiParam({ name: 'id', description: '服务 ID (CUID)' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.statusService.update(id, updateServiceDto)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除服务（私有）' })
  @ApiParam({ name: 'id', description: '服务 ID (CUID)' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.statusService.remove(id)
  }
}
