import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class QaService {
  private faqData: { question: string; answer: string }[] = [];
  private history: { question: string; answer: string }[] = [];

  constructor(private readonly httpService: HttpService) {
    this.loadFaq();
  }

  private loadFaq() {
    try {
      const filePath = join(__dirname, '..', '..', 'faq.csv');
      console.log('CSV path:', filePath);
      const file = readFileSync(filePath, 'utf-8');
      const lines = file.trim().split('\n').slice(1);
      this.faqData = lines.map((line) => {
        const [id, question, answer] = line.split(',');
        return { question: question?.trim(), answer: answer?.trim() };
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to load FAQ CSV file');
    }
  }

  private retrieveContext(userQuestion: string): string {
    const lowerQ = userQuestion.toLowerCase();

    const exactMatch = this.faqData.find((faq) =>
      lowerQ.includes(faq.question.toLowerCase()),
    );
    if (exactMatch) return exactMatch.answer;

    const partialMatch = this.faqData.find((faq) =>
      faq.question
        .toLowerCase()
        .split(' ')
        .some((word) => lowerQ.includes(word)),
    );
    if (partialMatch) return partialMatch.answer;

    // Provide full FAQ context if no match found
    return this.faqData
      .map((faq) => `${faq.question}: ${faq.answer}`)
      .join('\n');
  }

  async handleQuestion(question: string): Promise<{ answer: string }> {
    if (process.env.MOCK_AI === 'true') {
      const mockAnswer = `Anna Polianska is a talented full-stack developer specializing in React and NestJS.`;
      this.history.push({ question, answer: mockAnswer });
      return { answer: mockAnswer };
    }

    const context = this.retrieveContext(question);

    const prompt = `You are a helpful assistant. Using the following context, provide a clear and informative answer about the developer Anna Polianska. \nContext: ${context}\nQuestion: ${question}\nAnswer:`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Missing OPENAI_API_KEY');
    }

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const answer =
        response.data?.choices?.[0]?.message?.content?.trim() || 'No answer.';
      this.history.push({ question, answer });

      return { answer };
    } catch (error) {
      console.error(
        'OpenAI API error full response:',
        JSON.stringify(error, null, 2),
      );
      throw new InternalServerErrorException(
        error?.response?.data?.error?.message ||
          'Failed to get response from OpenAI',
      );
    }
  }

  getHistory() {
    return this.history;
  }
}
