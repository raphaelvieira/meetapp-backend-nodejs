import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class DetailsMeetupController {
  async index(req, res) {
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
    return res.json(meetup);
  }
}

export default new DetailsMeetupController();
