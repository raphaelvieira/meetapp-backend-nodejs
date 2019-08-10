import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import Cache from '../../lib/Cache';
import CreateSubscriptionService from '../services/CreateSubscriptionService';

class SubscriptionController {
  async index(req, res) {
    const cacheKey = `user:${req.userId}:subscriptions`;

    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    // study
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          required: true,
        },
      ],
      order: [[Meetup, 'date']],
    });

    await Cache.set(cacheKey, subscriptions);

    return res.json(subscriptions);
  }

  async store(req, res) {
    const subscription = await CreateSubscriptionService.run({
      meetup_id: req.params.meetup_id,
      user_id: req.userId,
    });
    return res.json(subscription);
  }
}

export default new SubscriptionController();
