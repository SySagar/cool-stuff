import { Module } from '@nestjs/common';
import { JokeService } from './joke.service';
import { JokeController } from './joke.controller';

@Module({
  providers: [JokeService],
  controllers: [JokeController],
})
export class JokeModule {}
