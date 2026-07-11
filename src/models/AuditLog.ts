import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "delete",
        "status_change",
        "role_change",
        "deactivate",
        "reactivate",
        "login",
        "login_failed",
      ],
      required: true,
    },
    entityType: { type: String, required: true },
    entityId: { type: String, default: null },
    entityLabel: { type: String, default: "" },
    changes: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: "at", updatedAt: false } },
);

auditLogSchema.index({ at: -1 });
auditLogSchema.index({ entityType: 1, at: -1 });
auditLogSchema.index({ actorId: 1, at: -1 });

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema>;

export const AuditLog: Model<AuditLogDoc> =
  models.AuditLog || model<AuditLogDoc>("AuditLog", auditLogSchema);
