import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from 'src/context/identity/application/service/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return user payload', async () => {
    const payload = {
      sub: '123',
      username: 'testuser',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: '123',
      username: 'testuser',
    });
  });
});
