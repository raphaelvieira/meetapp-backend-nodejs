import * as Yup from 'yup';
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

class MeetupController {
  async index(req, res) {
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
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      file_id: Yup.number().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const hourStart = startOfHour(parseISO(req.body.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const meetup = await Meetup.create({
      user_id: req.userId,
      ...req.body,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      file_id: Yup.number(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const hourStart = startOfHour(parseISO(req.query.date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Meetup date invalid' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== req.userId) {
      res.status(401).json({
        error: "You don't have permission to update this meetup",
      });
    }

    if (meetup.past) {
      res.status(400).json({
        error: "Can't update past meetups",
      });
    }

    meetup.update(req.body);

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
    await meetup.delete();
    await meetup.destroy();
    return res.send();
  }
}

export default new MeetupController();
