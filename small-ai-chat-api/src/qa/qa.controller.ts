import { Controller, Post, Body, Get, HttpCode } from '@nestjs/common';
import { QaService } from './qa.service';

@Controller('api')
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post('ask')
  @HttpCode(200)
  async ask(@Body() body: { question: string }) {
    const { question } = body;
    return await this.qaService.handleQuestion(question);
  }
}
