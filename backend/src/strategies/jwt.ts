import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserModel } from '../models/User';

passport.use(new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (payload, done) => {
    try {
      const user = await UserModel
        .findOne({ email: payload.sub })
        .exec();

      done(undefined, user);
    } catch (err) {
      done(err);
    }
  },
));
