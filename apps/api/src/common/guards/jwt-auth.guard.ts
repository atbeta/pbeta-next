import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class JwtAuthGuard {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }, user?: any }>()
    const token = this.extractToken(request.headers.authorization)

    if (token) {
      try {
        const payload = this.jwtService.verify(token)
        request.user = payload
      } catch {
        // If public, ignore invalid token; otherwise throw
        if (!isPublic) throw new UnauthorizedException()
      }
    }

    if (isPublic) return true
    if (!token) throw new UnauthorizedException()

    return true
  }

  private extractToken(authorization?: string): string | null {
    if (!authorization?.startsWith('Bearer ')) return null
    return authorization.slice(7)
  }
}
