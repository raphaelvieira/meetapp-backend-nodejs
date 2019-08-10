import Cache from '../../lib/Cache';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class CreateSubscriptionService {
  async run({ meetup_id, user_id }) {
    const user = await User.findByPk(user_id);
    const meetup = await Meetup.findByPk(meetup_id, {
      include: [User],
    });
    if (!meetup) {
      throw new Error(`Meetup does not exists.`);
    } else {
      if (meetup.user_id === user_id) {
        throw new Error(`Can't subscribe to you own meetups`);
      }

      if (meetup.past) {
        throw new Error(`Can't subscribe to past meetups`);
      }

      const checkDate = await Subscription.findOne({
        where: {
          user_id,
        },
        include: [
          {
            model: Meetup,
            required: true,
            where: {
              date: meetup.date,
            },
          },
        ],
      });

      if (checkDate) {
        throw new Error(`Can't subscribe to two meetups at the same time`);
      }

      const subscription = await Subscription.create({
        user_id,
        meetup_id: meetup.id,
      });

      await Queue.add(SubscriptionMail.key, {
        meetup,
        user,
      });

      /** Invalidade Cache */
      await Cache.invalidatePrefix(`user:${user_id}:subscriptions`);
      return subscription;
    }
  }
}
export default new CreateSubscriptionService();
