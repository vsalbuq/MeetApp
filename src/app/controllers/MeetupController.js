import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  startOfHour,
  isBefore,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { date, page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        { model: User, as: 'organizer', attributes: ['name', 'email'] },
        { model: File, as: 'banner', attributes: ['name', 'path', 'url'] },
      ],
      where: date
        ? {
            date: {
              [Op.between]: [
                startOfDay(parseISO(date)),
                endOfDay(parseISO(date)),
              ],
            },
          }
        : null,
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(meetups);
  }

  async store(req, res) {
    /**
     * All fields are required
     */
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      organizer_id: Yup.number().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    /**
     * You can't create meetups for past dates.
     */

    const { date } = req.body;
    const startHour = startOfHour(parseISO(date));
    if (isBefore(startHour, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }

    const meetup = await Meetup.create({
      ...req.body,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(1),
      description: Yup.string().min(1),
      location: Yup.string().min(1),
      date: Yup.date(),
      organizer_id: Yup.number(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    /**
     * The meetup does not exist
     */

    if (!meetup) {
      return res.status(400).json({ error: 'There is no event with this id.' });
    }
    /**
     * You must be the organizer
     */
    if (meetup.organizer_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'Only the organizer is allowed to edit this event.' });
    }

    /**
     * Date must not be past
     */
    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot edit an event that is already past.' });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot use a date that is already past.' });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (meetup.organizer_id !== req.userId) {
      return res.status(401).json({ error: 'Not authorized.' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({
        error: 'You cannot cancel an event that has already happened.',
      });
    }

    await meetup.destroy();

    return res.json({ message: 'The event was cancelled.' });
  }
}

export default new MeetupController();
