import "server-only";
import { db } from "./db";

/** Registra ação administrativa: quem, o quê, em qual registro, antes/depois. */
export function audit(actorId: string, action: string, entity: string, entityId: string, before?: unknown, after?: unknown) {
  return db.auditLog.create({
    data: { actorId, action, entity, entityId, before: before as object ?? undefined, after: after as object ?? undefined },
  });
}
