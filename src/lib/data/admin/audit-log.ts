import "server-only";
import type { QueryFilter } from "mongoose";
import { connectDB } from "@/lib/db";
import { AuditLog, type AuditLogDoc } from "@/models/AuditLog";

export async function getAuditLog(filters: {
  entityType?: string;
  page?: number;
  perPage?: number;
}) {
  await connectDB();
  const query: QueryFilter<AuditLogDoc> = {};
  if (filters.entityType) query.entityType = filters.entityType;

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 30;

  const [docs, total, entityTypes] = await Promise.all([
    AuditLog.find(query)
      .sort({ at: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean(),
    AuditLog.countDocuments(query),
    AuditLog.distinct("entityType") as unknown as Promise<string[]>,
  ]);

  return {
    entries: docs.map((d) => ({
      id: d._id.toString(),
      actorName: d.actorName,
      actorRole: d.actorRole,
      action: d.action,
      entityType: d.entityType,
      entityLabel: d.entityLabel,
      at: d.at?.toISOString() ?? "",
    })),
    total,
    entityTypes: entityTypes.sort(),
  };
}
