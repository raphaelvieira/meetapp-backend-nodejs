import {
  startOfHour,
  isBefore,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

import UpdateMeetupService from '../services/UpdateMeetupService';
import Cache from '../../lib/Cache';

class MeetupController {
  async index(req, res) {
    const cached = await Cache.get('meetups');

    if (cached) {
      return res.json(cached);
    }

    const where = {};
    const page = req.query.page || 1;

    if (req.query.date) {
      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: ['id', 'title', 'description', 'date', 'past', 'cancelable'],
      limit: 10,
      offset: (page - 1) * 10,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'file',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });
    await Cache.set('meetups', meetups);
    return res.json(meetups);
  }

  async store(req, res) {
    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const meetup = await Meetup.create({
      user_id: req.userId,
      ...req.body,
    });

    await Cache.invalidade('meetups');

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await UpdateMeetupService.run({
      date: req.query.date,
      meetup_id: req.params.id,
      user_id: req.userId,
      meetup_data: req.body,
    });

    await Cache.invalidade('meetups');

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      res.status(401).json({
        error: "You don't have permission to cancel this Meetup",
      });
    }
    if (meetup.past) {
      res.status(400).json({
        error: "Can't delete past meetups",
      });
    }
    await meetup.destroy();

    await Cache.invalidade('meetups');

    return res.send();
  }
}

export default new MeetupController();
