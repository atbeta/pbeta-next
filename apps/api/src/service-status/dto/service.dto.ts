import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateServiceDto {
  @ApiProperty({ example: 'pbeta.me', description: '服务显示名称' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ example: '个人主页', description: '简短描述' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ example: 'https://pbeta.me', description: '监控目标 URL（HEAD 请求）' })
  @IsUrl()
  @IsNotEmpty()
  url: string

  @ApiPropertyOptional({ example: 'web', description: '分类标签', default: 'general' })
  @IsString()
  @IsOptional()
  category?: string
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'pbeta.me' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: '个人主页' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'https://pbeta.me' })
  @IsUrl()
  @IsOptional()
  url?: string

  @ApiPropertyOptional({ example: 'web' })
  @IsString()
  @IsOptional()
  category?: string
}
