import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { Response } from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /user', async () => {
    const res: Response = await request(app.getHttpServer())
      .post('/user')
      .send({
        name: 'Tinh',
        email: 'tinh@gmail.com',
      })
      .expect(201);

    type CreatedUserBody = { email: string };

    const body = res.body as CreatedUserBody;
    expect(body.email).toBe('tinh@gmail.com');
  });

  it('GET /user', async () => {
    const res = await request(app.getHttpServer()).get('/user').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
