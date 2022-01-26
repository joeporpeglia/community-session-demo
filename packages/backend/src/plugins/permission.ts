import {
  BackstageIdentityResponse,
  IdentityClient,
} from '@backstage/plugin-auth-backend';
import {
  catalogConditions,
  createCatalogPolicyDecision,
} from '@backstage/plugin-catalog-backend';
import { createRouter } from '@backstage/plugin-permission-backend';
import { AuthorizeResult } from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyAuthorizeQuery,
  PolicyDecision,
} from '@backstage/plugin-permission-node';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

class DemoPolicy implements PermissionPolicy {
  async handle(
    request: PolicyAuthorizeQuery,
    user?: BackstageIdentityResponse,
  ): Promise<PolicyDecision> {
    if (request.permission.resourceType === 'catalog-entity') {
      return createCatalogPolicyDecision(
        catalogConditions.isEntityOwner(
          user?.identity.ownershipEntityRefs ?? [],
        ),
      );
    }

    return { result: AuthorizeResult.ALLOW };
  }
}

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const { logger, discovery } = env;
  return await createRouter({
    logger,
    discovery,
    policy: new DemoPolicy(),
    identity: new IdentityClient({
      discovery,
      issuer: await discovery.getExternalBaseUrl('auth'),
    }),
  });
}
