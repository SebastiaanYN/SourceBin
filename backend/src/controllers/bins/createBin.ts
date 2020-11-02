import { Request, Response } from 'express';
import Joi from '@hapi/joi';

import { saveBin } from '../../utils/bins';
import { classifySnippets } from '../../utils/code';
import { replyError, replyJoiError } from '../../utils/errors';

import * as config from '../../config';

const schema = Joi.object({
  title: Joi.string()
    .allow('')
    .max(config.bin.maxTitleLength),

  description: Joi.string()
    .allow('')
    .max(config.bin.maxDescriptionLength),

  files: Joi.array()
    .min(1)
    .max(25)
    .required()
    .items({
      name: Joi.string()
        .allow('')
        .max(config.bin.maxNameLength),

      content: Joi.string()
        .required(),

      languageId: Joi.number()
        .integer()
        .positive(),
    }),
});

export async function createBin(req: Request, res: Response): Promise<void> {
  const { error } = schema.validate(req.body);

  if (error) {
    replyJoiError(error, res);
    return;
  }

  if (req.body.files.length > 1 && (!req.user || req.user.plan !== 'Pro')) {
    replyError(403, 'You need Pro to save multibins', res);
    return;
  }

  try {
    const unclassified: any[] = req.body.files.filter((file: any) => file.languageId === undefined);
    const languages = await classifySnippets(unclassified.map((file: any) => file.content));

    for (let i = 0; i < unclassified.length; i += 1) {
      unclassified[i].languageId = languages[i];
    }
  } catch {
    replyError(500, 'Failed to classify languages', res);
    return;
  }

  try {
    const bin = await saveBin({
      title: req.body.title,
      description: req.body.description,
      ownerId: req.user
        ? req.user._id
        : undefined,

      files: req.body.files.map((file: any) => ({
        name: file.name,
        languageId: file.languageId,
      })),

      contents: req.body.files.map((file: any) => file.content),
    });

    res.json({
      key: bin.key,
      languages: bin.files.map(file => file.languageId),
    });
  } catch (err) {
    console.error(err);

    replyError(500, 'Error saving bin', res);
  }
}
