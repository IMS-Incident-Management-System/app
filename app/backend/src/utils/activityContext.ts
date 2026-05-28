import { Request } from 'express';
import { ActivityActorContext } from '../interfaces/activity';
import { ActivitySource, ActorType } from '../enums/entityActivity';

export function getActivityActorContext(req: Request): ActivityActorContext {
  const user = (req as Request & { user?: { sub?: string } }).user;
  return {
    actorType: ActorType.USER,
    actorExternalId: user?.sub ?? null,
    source: ActivitySource.UI,
  };
}

export function getActivityActorContextFromSub(sub?: string | null): ActivityActorContext {
  return {
    actorType: ActorType.USER,
    actorExternalId: sub ?? null,
    source: ActivitySource.UI,
  };
}
