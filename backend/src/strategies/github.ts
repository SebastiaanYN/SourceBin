import { Strategy } from 'passport-github2';

import { createOrGetUser } from '../utils/auth';

export const github = new Strategy(
  {
    clientID: process.env.GITHUB_OAUTH_ID || '',
    clientSecret: process.env.GITHUB_OAUTH_SECRET || '',
    callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL || '',
    scope: ['user:email'],
  },
  async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
    try {
      const info = profile._json; // eslint-disable-line no-underscore-dangle

      const user = await createOrGetUser(
        { 'oauth.github': profile.id },
        {
          email: profile.emails[0].value,
          username: profile.username,

          about: {
            avatarURL: info.avatar_url,
            bio: info.bio,
            website: info.blog,
            location: info.location,
          },

          'oauth.github': profile.id,
        },
      );

      done(undefined, user);
    } catch {
      done(undefined, undefined, new Error('Email is already used'));
    }
  },
);
