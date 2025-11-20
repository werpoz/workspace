import { ClerkAuthGuard } from './ClerkAuthGuard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

jest.mock('@clerk/clerk-sdk-node', () => ({
    clerkClient: {
        verifyToken: jest.fn(),
    },
}));

describe('ClerkAuthGuard', () => {
    let guard: ClerkAuthGuard;
    let configService: ConfigService;

    beforeEach(() => {
        configService = new ConfigService();
        guard = new ClerkAuthGuard(configService);
    });

    it('should return true if token is valid', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: 'Bearer valid_token',
                    },
                }),
            }),
        } as unknown as ExecutionContext;

        (clerkClient.verifyToken as jest.Mock).mockResolvedValue({ sub: 'user_id' });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if token is missing', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {},
                }),
            }),
        } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: 'Bearer invalid_token',
                    },
                }),
            }),
        } as unknown as ExecutionContext;

        (clerkClient.verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
});
