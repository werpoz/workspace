import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger = new Logger(ClerkAuthGuard.name);

    constructor(private readonly configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Missing authentication token');
        }

        try {
            const decodedToken = await clerkClient.verifyToken(token);
            (request as any).user = decodedToken;
            return true;
        } catch (error) {
            this.logger.error('Token verification failed', error);
            throw new UnauthorizedException('Invalid authentication token');
        }
    }
}
