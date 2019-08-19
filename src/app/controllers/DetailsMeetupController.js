import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

// import Cache from '../../lib/Cache';

class DetailsMeetupController {
  async index(req, res) {
    // const cached = await Cache.get('meetups');

    // if (cached) {
    //   return res.json(cached);
    // }

    if (!req.params.id) {
      return res.status(400).json({ error: 'Meetup id invalid' });
    }
    const { id } = req.params;

    const meetup = await Meetup.findOne({
      where: { id },
      attributes: [
        'id',
        'title',
        'description',
        'date',
        'past',
        'location',
        'cancelable',
      ],
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
    });
    // await Cache.set('meetups', meetups);
    return res.json(meetup);
  }
}

export default new DetailsMeetupController();
