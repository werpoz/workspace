import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailUseCase } from 'src/context/notifier/application/SendEmailUseCase';
import type { EmailSender } from 'src/context/notifier/domain/interface/EmailSender';
import { EmailMessage } from 'src/context/notifier/domain/EmailMessage';
import type { DomainEventBus } from 'src/context/shared/domain/DomainEventBus';
import { EmailSentDomainEvent } from 'src/context/notifier/domain/events/EmailSentDomainEvent';
import { EmailFailedDomainEvent } from 'src/context/notifier/domain/events/EmailFailedDomainEvent';

describe('SendEmailUseCase', () => {
  let useCase: SendEmailUseCase;
  let mockEmailSender: jest.Mocked<EmailSender>;
  let mockEventBus: jest.Mocked<DomainEventBus>;

  beforeEach(async () => {
    mockEmailSender = {
      send: jest.fn(),
    };

    mockEventBus = {
      publish: jest.fn(),
      publishAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailUseCase,
        {
          provide: 'EmailSender',
          useValue: mockEmailSender,
        },
        {
          provide: 'DomainEventBus',
          useValue: mockEventBus,
        },
      ],
    }).compile();

    useCase = module.get<SendEmailUseCase>(SendEmailUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should send email successfully and publish EmailSentDomainEvent', async () => {
    const params = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    await useCase.execute(params);

    expect(mockEmailSender.send).toHaveBeenCalledTimes(1);
    const sentMessage = mockEmailSender.send.mock.calls[0][0];
    expect(sentMessage).toBeInstanceOf(EmailMessage);
    expect(sentMessage.toAddress).toBe('test@example.com');
    expect(sentMessage.emailSubject).toBe('Test Subject');
    expect(sentMessage.emailBody).toBe('<p>Test Body</p>');

    // Verify EmailSentDomainEvent was published
    expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    const publishedEvents = mockEventBus.publishAll.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]).toBeInstanceOf(EmailSentDomainEvent);
    const sentEvent = publishedEvents[0] as EmailSentDomainEvent;
    expect(sentEvent.to).toBe('test@example.com');
    expect(sentEvent.subject).toBe('Test Subject');
  });

  it('should publish EmailFailedDomainEvent and throw error when email sender fails', async () => {
    const params = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    const error = new Error('Send failed');
    mockEmailSender.send.mockRejectedValue(error);

    await expect(useCase.execute(params)).rejects.toThrow('Send failed');

    // Verify EmailFailedDomainEvent was published
    expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    const publishedEvents = mockEventBus.publishAll.mock.calls[0][0];
    expect(publishedEvents).toHaveLength(1);
    expect(publishedEvents[0]).toBeInstanceOf(EmailFailedDomainEvent);
    const failedEvent = publishedEvents[0] as EmailFailedDomainEvent;
    expect(failedEvent.to).toBe('test@example.com');
    expect(failedEvent.error).toBe('Send failed');
  });

  it('should throw error for invalid email address', async () => {
    const params = {
      to: 'invalid-email',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    await expect(useCase.execute(params)).rejects.toThrow();
  });

  it('should handle non-Error exceptions and publish EmailFailedDomainEvent', async () => {
    const params = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: '<p>Test Body</p>',
    };

    mockEmailSender.send.mockRejectedValue('String error');

    await expect(useCase.execute(params)).rejects.toBe('String error');

    // Verify EmailFailedDomainEvent was published with 'Unknown error'
    expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    const publishedEvents = mockEventBus.publishAll.mock.calls[0][0];
    const failedEvent = publishedEvents[0] as EmailFailedDomainEvent;
    expect(failedEvent).toBeInstanceOf(EmailFailedDomainEvent);
    expect(failedEvent.error).toBe('Unknown error');
  });
});
