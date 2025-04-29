import { Test, TestingModule } from '@nestjs/testing';
import { QaService } from './qa.service';
import { HttpService } from '@nestjs/axios';

describe('QaService', () => {
  let service: QaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QaService,
        {
          provide: HttpService,
          useValue: {}, // can be mocked if needed
        },
      ],
    }).compile();

    service = module.get<QaService>(QaService);

    // setting up faqData
    (service as any).faqData = [
      { question: 'Who is Anna Polianska?', answer: 'Anna is a developer.' },
      { question: 'Do you offer support?', answer: 'Yes, 24/7 support.' },
    ];
  });

  it('should return matched answer if context found', () => {
    const result = (service as any).retrieveContext('Who is Anna Polianska?');
    expect(result).toBe('Anna is a developer.');
  });

  it('should return fallback answer if no match found', () => {
    const result = (service as any).retrieveContext('Unrelated question');
    expect(result).toBe('No relevant information found.');
  });
});
