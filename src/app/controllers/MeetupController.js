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
    const where = {};
    const page = req.query.page || 1;

    let cachekey;
    if (req.query.date) {
      cachekey = `meetups:date:${req.query.date}:page:${page}`;
      const cached = await Cache.get(cachekey);
      if (cached) {
        return res.json(cached);
      }

      const searchDate = parseISO(req.query.date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    } else {
      cachekey = `meetups:date:all:page:${page}`;
      const cached = await Cache.get(cachekey);

      if (cached) {
        return res.json(cached);
      }
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: [
        'id',
        'title',
        'description',
        'location',
        'date',
        'past',
        'cancelable',
      ],
      limit: 10,
      offset: (page - 1) * 10,
      order: ['date'],
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
    await Cache.set(cachekey, meetups);
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

    const cachekeyAll = `meetups:date:all`;
    await Cache.invalidade(cachekeyAll);
    const cachekey = `meetups:date:${req.body.date}`;
    await Cache.invalidade(cachekey);

    return res.json(meetup);
  }

  async update(req, res) {
    const meetup = await UpdateMeetupService.run({
      date: req.query.date,
      meetup_id: req.params.id,
      user_id: req.userId,
      meetup_data: req.body,
    });

    const cachekeyAll = `meetups:date:all`;
    await Cache.invalidade(cachekeyAll);
    const cachekey = `meetups:date:${req.body.date}`;
    await Cache.invalidade(cachekey);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this Meetup",
      });
    }
    if (meetup.past) {
      return res.status(400).json({
        error: "Can't delete past meetups",
      });
    }
    const cachekey = `meetups:date:${meetup.date}`;
    await meetup.destroy();

    const cachekeyAll = `meetups:date:all`;
    await Cache.invalidade(cachekeyAll);
    await Cache.invalidade(cachekey);

    return res.send();
  }
}

export default new MeetupController();
