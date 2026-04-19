import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, ip: string, userAgent: string, isAdmin = false) {
    // 1. Honeypot check
    if (createCommentDto.website) {
      // Potentially silent fail or throw error. For now, throw for easier debugging.
      throw new BadRequestException('Spam detected');
    }

    const { slug, content, author, email, parentId } = createCommentDto;

    return this.prisma.comment.create({
      data: {
        slug,
        content,
        author,
        email,
        parentId,
        isAdmin,
        ip,
        userAgent,
      },
      include: {
        replies: true, // Optional: return new comment with replies
      },
    });
  }

  async findAllBySlug(slug: string) {
    // Fetch only top-level comments and recursively include replies
    return this.prisma.comment.findMany({
      where: {
        slug,
        parentId: null,
      },
      include: {
        replies: {
          include: {
            replies: {
              include: {
                replies: true, // Up to 3 levels deep manually for simplicity, or we can fetch all and build tree
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAll() {
    return this.prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
