import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('You must provide a user name.'),
      email: Yup.string()
        .email('The email provided is invalid.')
        .required('You must provide an email.'),
      password: Yup.string()
        .required('You must provide a password.')
        .min(6, 'The password must have at least 6 characters.'),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'There were validation errors.' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res
        .status(400)
        .json({ error: 'There is already a user with this email.' });
    }
    const { id, name, email } = await User.create(req.body);

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email('The email provided is invalid.'),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword
            ? field.required('You must provide a new password.')
            : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Password confirmation does not match.')
              .oneOf([Yup.ref('password')])
          : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation failed.' });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'This email is associated with another account.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
