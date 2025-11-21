import { Test, TestingModule } from '@nestjs/testing';
import { ClerkAuthGuard } from 'src/context/identity/infrastructure/http/guards/ClerkAuthGuard';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

jest.mock('@clerk/clerk-sdk-node', () => ({
    clerkClient: {
        verifyToken: jest.fn(),
    },
}));

describe('ClerkAuthGuard', () => {
    let guard: ClerkAuthGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClerkAuthGuard,
                {
                    provide: ConfigService,
                    useValue: {},
                },
            ],
        }).compile();

        guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access with valid token', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: 'Bearer valid-token',
                    },
                }),
            }),
        } as any;

        (clerkClient.verifyToken as jest.Mock).mockResolvedValue({ sub: 'user_123' });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should deny access without token', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {},
                }),
            }),
        } as any;

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should deny access with invalid token', async () => {
        const context = {
            switchToHttp: () => ({
                getRequest: () => ({
                    headers: {
                        authorization: 'Bearer invalid-token',
                    },
                }),
            }),
        } as any;

        (clerkClient.verifyToken as jest.Mock).mockRejectedValue(new Error('Invalid token'));

        await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle undefined configService manually', () => {
        const guard = new ClerkAuthGuard(undefined as any);
        expect(guard).toBeDefined();
    });

    it('should be instantiated manually', () => {
        const g = new ClerkAuthGuard({} as any);
        expect(g).toBeDefined();
        expect(g['configService']).toBeDefined();
    });
});
