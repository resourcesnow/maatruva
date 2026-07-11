"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleLeadActionedAction } from "@/lib/actions/admin/leads";

export type LeadRowData = {
  id: string;
  type: "newsletter" | "contact";
  email: string | null;
  phone: string | null;
  message: string;
  isActioned: boolean;
  createdAt: string;
};

export function LeadRow({ lead }: { lead: LeadRowData }) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const res = await toggleLeadActionedAction(lead.id, !lead.isActioned);
      if (!res.ok) toast.error(res.error ?? "Could not update lead.");
      else toast.success(lead.isActioned ? "Lead reopened." : "Lead marked as actioned.");
    });
  }

  return (
    <TableRow>
      <TableCell className="capitalize">{lead.type}</TableCell>
      <TableCell>{lead.email ?? "—"}</TableCell>
      <TableCell>{lead.phone ?? "—"}</TableCell>
      <TableCell className="max-w-xs truncate text-sm">{lead.message || "—"}</TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {new Date(lead.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <Badge variant={lead.isActioned ? "secondary" : "outline"}>
          {lead.isActioned ? "Actioned" : "New"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
          {lead.isActioned ? "Reopen" : "Mark actioned"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
