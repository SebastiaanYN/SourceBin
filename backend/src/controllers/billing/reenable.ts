import { Request, Response } from 'express';

import { replyError } from '../../utils/errors';
import { stripe, getCustomer } from '../../utils/stripe';

export async function reenable(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new Error('User unavailable after authentication');
  }

  if (!req.user.payments.stripeId) {
    replyError(400, 'No customer', res);
    return;
  }

  try {
    const customer = await getCustomer(req.user.payments.stripeId);

    if (!customer.subscriptions) {
      replyError(400, 'No subscription', res);
      return;
    }

    const subscription = await stripe.subscriptions.update(customer.subscriptions.data[0].id, {
      cancel_at_period_end: false, // eslint-disable-line @typescript-eslint/camelcase
    });

    res.json(subscription);
  } catch (err) {
    console.error(err);

    replyError(400, err.message, res);
  }
}
