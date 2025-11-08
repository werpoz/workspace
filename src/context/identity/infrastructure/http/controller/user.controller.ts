import { Body, Controller, Post } from '@nestjs/common';
import { RegisterAccountUseCase } from 'src/context/identity/application/RegisterAccountUseCase';

@Controller('accounts')
export class RegisterAccountController {
  constructor(
    private readonly registerAccountUseCase: RegisterAccountUseCase,
  ) {}

  @Post()
  async register(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const account = await this.registerAccountUseCase.execute(email, password);

    return {
      message: 'Account registered successfully',
      account,
    };
  }
}
