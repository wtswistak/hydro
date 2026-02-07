import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { Public } from 'src/common/decorators/public.decorator';
import { AlchemyAddressActivityDto } from './dto/AlchemyAddressActivityDto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('alchemy')
  @HttpCode(200)
  @Public()
  async handleAlchemyWebhook(
    @Body() addressActivityDto: AlchemyAddressActivityDto,
  ): Promise<void> {
    await this.webhookService.handleAlchemyWebhook(addressActivityDto);
  }
}
