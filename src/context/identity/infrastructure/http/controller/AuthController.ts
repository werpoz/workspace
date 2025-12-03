import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../../../application/service/auth.service';
import { VerifyAccountByCodeUseCase } from '../../../application/VerifyAccountByCodeUseCase';
import { ResendVerificationUseCase } from '../../../application/ResendVerificationUseCase';
import { LocalAuthGuard } from '../../../application/service/local.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../application/service/jwt-auth.guard';

class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;
}

class RegisterDto {
  @ApiProperty({
    example: 'newuser@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  password: string;
}

class VerifyCodeDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  code: string;
}

class ResendVerificationDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email: string;

  @ApiProperty({
    example: 'email_code',
    description: 'Verification method',
    enum: ['email_code', 'email_link'],
    required: false
  })
  method?: 'email_code' | 'email_link';
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private verifyByCodeUseCase: VerifyAccountByCodeUseCase,
    private resendVerificationUseCase: ResendVerificationUseCase,
  ) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    examples: {
      register: {
        value: {
          email: 'newuser@example.com',
          password: 'securePassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        email: { type: 'string', example: 'newuser@example.com' },
        status: { type: 'string', example: 'pending_verification', enum: ['pending_verification', 'active', 'suspended'] },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials',
    examples: {
      login: {
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'user@example.com' },
            isActive: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalidate token on client side)' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout() {
    return {
      message: 'Logout successful. Please remove the token from client.',
    };
  }

  @Post('verify/code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify account with email code' })
  @ApiBody({ type: VerifyCodeDto })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Account verified successfully' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.verifyByCodeUseCase.execute({
      email: verifyCodeDto.email,
      code: verifyCodeDto.code,
    });
    return { message: 'Account verified successfully' };
  }

  @Post('verification/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Verification code sent to your email' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email or account already verified' })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    await this.resendVerificationUseCase.execute({
      email: resendDto.email,
      method: resendDto.method,
    });
    return { message: 'Verification code sent to your email' };
  }
}
