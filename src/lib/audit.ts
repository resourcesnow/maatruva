import "server-only";
import type { Session } from "next-auth";
import { connectDB } from "./db";
import { AuditLog, type AuditLogDoc } from "@/models/AuditLog";

type Actor = { id?: string | null; name: string; role: string };

function actorFromSession(session: Session | null): Actor {
  if (!session?.user) return { id: null, name: "unknown", role: "unknown" };
  return { id: session.user.id, name: session.user.name ?? "unknown", role: session.user.role };
}

export async function logAdminAction(
  actor: Actor | Session | null,
  entry: {
    action: AuditLogDoc["action"];
    entityType: string;
    entityId?: string | null;
    entityLabel?: string;
    changes?: unknown;
  },
) {
  try {
    const resolvedActor =
      actor && "user" in (actor as Session)
        ? actorFromSession(actor as Session)
        : (actor as Actor | null);
    const { id, name, role } = resolvedActor ?? { id: null, name: "unknown", role: "unknown" };

    await connectDB();
    await new AuditLog({
      actorId: id || undefined,
      actorName: name,
      actorRole: role,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? undefined,
      entityLabel: entry.entityLabel ?? "",
      changes: entry.changes ?? undefined,
    }).save();
  } catch (err) {
    console.error("[audit] failed to log admin action", entry.action, entry.entityType, err);
  }
}
