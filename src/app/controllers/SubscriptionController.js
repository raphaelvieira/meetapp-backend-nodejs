import { Op } from 'sequelize';
import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import File from '../models/File';
import Cache from '../../lib/Cache';
import CreateSubscriptionService from '../services/CreateSubscriptionService';

class SubscriptionController {
  async index(req, res) {
    const cacheKey = `user:${req.userId}:subscriptions`;
    const cached = await Cache.get(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
            {
              model: File,
              as: 'file',
              attributes: ['id', 'path', 'url'],
            },
          ],
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
    const { meetup_id } = req.body;
    const subscription = await CreateSubscriptionService.run({
      meetup_id,
      user_id: req.userId,
    });

    return res.json(subscription);
  }

  async delete(req, res) {
    const cacheKey = `user:${req.userId}:subscriptions`;
    const subscription = await Subscription.findByPk(req.params.id);

    if (subscription.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this subscription",
      });
    }
    if (subscription.past) {
      return res.status(400).json({
        error: "Can't delete past subscriptions",
      });
    }
    await subscription.destroy();

    /** Invalidade Cache */
    await Cache.invalidatePrefix(cacheKey);

    return res.send();
  }
}

export default new SubscriptionController();
