"use client";

import Link from "next/link";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { CategoryWithCount } from "@/types/catalog";

type TreeNode = CategoryWithCount & { children: TreeNode[] };

function buildTree(categories: CategoryWithCount[]): TreeNode[] {
  const nodes = new Map<string, TreeNode>(categories.map((c) => [c.id, { ...c, children: [] }]));
  const roots: TreeNode[] = [];

  nodes.forEach((node) => {
    if (node.parent && nodes.has(node.parent)) {
      nodes.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CategoryTreeNav({
  categories,
  activeCategorySlug,
}: {
  categories: CategoryWithCount[];
  activeCategorySlug?: string;
}) {
  const tree = buildTree(categories);
  const defaultOpen = tree
    .filter((node) => node.children.some((child) => child.slug === activeCategorySlug))
    .map((node) => node.id);

  return (
    <Accordion className="w-full" defaultValue={defaultOpen}>
      {tree.map((node) =>
        node.children.length > 0 ? (
          <AccordionItem key={node.id} value={node.id} className="border-none">
            <AccordionPrimitive.Header className="flex items-center gap-1">
              <Link
                href={`/product-category/${node.slug}`}
                className={cn(
                  "text-maroon hover:bg-cream flex min-h-10 flex-1 items-center gap-2 rounded-md px-2 text-sm font-semibold transition-colors",
                  activeCategorySlug === node.slug && "bg-gold/10",
                )}
              >
                <span>{node.name}</span>
                <span className="text-maroon/50 text-xs font-normal">({node.count})</span>
              </Link>
              <AccordionPrimitive.Trigger
                aria-label={`Toggle ${node.name} subcategories`}
                className="group/accordion-trigger text-maroon hover:bg-cream focus-visible:ring-gold flex size-10 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2"
              >
                <ChevronDownIcon className="size-4 group-aria-expanded/accordion-trigger:hidden" />
                <ChevronUpIcon className="hidden size-4 group-aria-expanded/accordion-trigger:inline" />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent className="[&_a]:no-underline [&_a]:hover:no-underline">
              <ul className="border-cream-dark ml-3 flex flex-col gap-0.5 border-l-2 pl-3">
                {node.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/product-category/${child.slug}`}
                      className={cn(
                        "flex min-h-10 items-center justify-between gap-2 rounded-md px-2 text-sm transition-colors",
                        activeCategorySlug === child.slug
                          ? "text-maroon bg-gold/10 font-semibold"
                          : "text-maroon/70 hover:bg-cream hover:text-maroon",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {activeCategorySlug === child.slug && (
                          <span className="bg-gold size-1.5 shrink-0 rounded-full" />
                        )}
                        {child.name}
                      </span>
                      <span className="text-xs opacity-60">({child.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ) : (
          <Link
            key={node.id}
            href={`/product-category/${node.slug}`}
            className={cn(
              "flex min-h-10 items-center justify-between gap-2 rounded-md px-2 text-sm font-semibold transition-colors",
              activeCategorySlug === node.slug
                ? "text-maroon bg-gold/10"
                : "text-maroon/80 hover:bg-cream hover:text-maroon",
            )}
          >
            <span>{node.name}</span>
            <span className="text-xs font-normal opacity-60">({node.count})</span>
          </Link>
        ),
      )}
    </Accordion>
  );
}
