import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';

class MeetupController {
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
}

export default new MeetupController();
