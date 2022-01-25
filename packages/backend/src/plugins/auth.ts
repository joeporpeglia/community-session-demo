import {
  createGithubProvider,
  createRouter,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  config,
  discovery,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({
    logger,
    config,
    database,
    discovery,
    providerFactories: {
      github: createGithubProvider({
        signIn: {
          async resolver(info, ctx) {
            const id = info.result.fullProfile.username!;
            const ent = [`user:default/${id}`, 'group:default/team-a'];

            // Issue the token containing the entity claims
            const token = await ctx.tokenIssuer.issueToken({
              claims: { sub: id, ent },
            });
            return { id, token };
          },
        },
      }),
    },
  });
}
