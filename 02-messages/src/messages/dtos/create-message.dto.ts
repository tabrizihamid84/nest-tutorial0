import { IsString } from 'class-validator';

export class CreatemessageDto {
  @IsString()
  content: string;
}
