import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('/api/ask (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should return an answer for a valid question', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ask')
      .send({ question: 'Who is Anna Polianska?' })
      .expect(200);

    expect(response.body).toHaveProperty('answer');
    expect(typeof response.body.answer).toBe('string');
    expect(response.body.answer.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
