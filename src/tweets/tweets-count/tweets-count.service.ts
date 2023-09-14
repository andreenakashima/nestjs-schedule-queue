import { Inject, Injectable } from '@nestjs/common';
import { Tweet } from '../entities/tweet.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Interval } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class TweetsCountService {
  private limit = 10;

  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @InjectQueue('emails')
    private emailsQueue: Queue,
  ) {}

  @Interval(5000)
  async countTweets() {
    console.log('procurando tweets');
    let offset = await this.cacheManager.get<number>('tweet-offset');
    offset = offset === undefined ? 0 : offset;

    console.log(`offsets: ${offset}`);
    const tweets = await this.tweetModel.findAll({
      offset,
      limit: this.limit,
    });

    console.log(`${tweets.length} encontrados`);

    if (tweets.length === this.limit) {
      const timeInMinutes: number = 1000 * 60 * 10; // 10min;
      this.cacheManager.set('tweet-offset', offset + this.limit, timeInMinutes);

      console.log(`Achou mais ${this.limit} tweets`);
      this.emailsQueue.add({ tweets: tweets.map((t) => t.toJSON()) });
    }
  }
}
