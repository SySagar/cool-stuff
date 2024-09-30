import { Injectable, HttpServer } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JokeService {
  private readonly jokesAPI = 'https://official-joke-api.appspot.com/random_joke';

  async fetchRandomJoke() {
    try {
      const response = await axios.get(this.jokesAPI);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch joke');
    }
  }
}
