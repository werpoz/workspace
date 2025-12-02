import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { Account } from '../src/context/identity/domain/Account';
import { AccountID } from '../src/context/identity/domain/value-object/AccountID.vo';
import { Email } from '../src/context/identity/domain/value-object/Email.vo';
import { Password } from '../src/context/identity/domain/value-object/Password.vo';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accountRepository: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accountRepository = moduleFixture.get('AccountRepository');

    const accountId = new AccountID('123e4567-e89b-12d3-a456-426614174000');
    const email = new Email('test@example.com');
    const plainPassword = new Password('password123');
    const hashedPassword = await plainPassword.hash();
    const password = new Password(hashedPassword);
    const account = Account.createWithPassword(accountId, password, email);

    await accountRepository.save(account);
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
      });
  });

  it('/auth/login (POST) - Invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);
  });
});
