import { Module } from '@nestjs/common';
import { JokeModule } from './joke/joke.module';

@Module({
  imports: [JokeModule],
})
export class AppModule {}
