import { Injectable } from '@nestjs/common';
import { Tweet } from '../entities/tweet.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TweetsCountService {
  constructor(
    @InjectModel(Tweet)
    private tweetModel: typeof Tweet,
  ) {}

  @Interval(5000)
  async countTweets() {
    const tweets = await this.tweetModel.findAll({
      offset: 0,
      limit: 10,
    });
  }
}
