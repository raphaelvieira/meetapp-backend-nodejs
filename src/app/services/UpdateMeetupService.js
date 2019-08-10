import { startOfHour, isBefore, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';

class UpdateMeetupService {
  async run({ date, meetup_id, user_id, meetup_data }) {
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Meetup date invalid');
    }

    const meetup = await Meetup.findByPk(meetup_id);

    if (meetup.user_id !== user_id) {
      throw new Error(`You don't have permission to update this meetup`);
    }

    if (meetup.past) {
      throw new Error(`Can't update past meetups`);
    }

    await meetup.update(meetup_data);

    return meetup;
  }
}
export default new UpdateMeetupService();
