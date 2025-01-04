import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatemessageDto } from './dtos/create-message.dto';

@Controller('messages')
export class MessagesController {
  @Get()
  listMessages() {
    return 'test';
  }

  @Post()
  createMessage(@Body() body: CreatemessageDto) {
    console.log(body);
  }

  @Get('/:id')
  getMessage(@Param('id') id: string) {
    console.log({ id });
  }
}
