import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCommentDto {
  @ApiProperty({ example: 'notes/hello-world', description: '对应内容的 slug' })
  slug: string

  @ApiProperty({ example: '写得很好！', description: '评论正文' })
  content: string

  @ApiProperty({ example: '读者', description: '作者昵称' })
  author: string

  @ApiPropertyOptional({ example: 'user@example.com', description: '邮箱（可选，不公开显示）' })
  email?: string

  @ApiPropertyOptional({ description: '父评论 ID（回复时传入）' })
  parentId?: string

  @ApiPropertyOptional({ description: '蜜罐字段，机器人填写时过滤' })
  website?: string
}
