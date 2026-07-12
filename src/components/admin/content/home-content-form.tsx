"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "@/components/admin/image-uploader";
import { updateHomeContentAction } from "@/lib/actions/admin/content";
import { cloudinaryFolders } from "@/lib/cloudinary-folders";

const initialState = { ok: false, error: null as string | null };

type HeroSlide = {
  image: string;
  publicId: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
};
type Banner = {
  image: string;
  publicId: string;
  title: string;
  mrp: number;
  salePrice: number;
  ctaLabel: string;
  ctaHref: string;
};
type Founder = {
  name: string;
  role: string;
  photo: string;
  photoPublicId: string;
  message: string;
};
type WhyItem = { icon: string; title: string; text: string };
type Faq = { q: string; a: string };
type BrandStatement = { image: string; publicId: string; words: string[] };
type BestsellersSection = { enabled: boolean; title: string; subtitle: string; limit: number };

type HomeContentValue = {
  heroSlides: HeroSlide[];
  featuredBanners: Banner[];
  founders: Founder[];
  whyChooseUs: WhyItem[];
  faq: Faq[];
  brandStatement: BrandStatement;
  bestsellersSection: BestsellersSection;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export function HomeContentForm({ initial }: { initial: HomeContentValue }) {
  const [state, formAction, pending] = useActionState(updateHomeContentAction, initialState);
  const [value, setValue] = useState<HomeContentValue>(initial);

  useEffect(() => {
    if (state.ok) toast.success("Homepage content updated.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  function update<K extends keyof HomeContentValue>(key: K, next: HomeContentValue[K]) {
    setValue((v) => ({ ...v, [key]: next }));
  }

  function deleteFromCloudinary(publicId: string | undefined) {
    if (!publicId || publicId.startsWith("placeholder-")) return;
    fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    }).catch(() => {
      toast.error("Removed here, but failed to delete image from Cloudinary.");
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="payload" value={JSON.stringify(value)} />

      <p className="text-muted-foreground -mb-2 text-sm">
        The &ldquo;Explore Our Collections&rdquo; homepage section is no longer edited here — it now
        shows your top-level product categories automatically. Edit category names/images at{" "}
        <Link href="/admin/categories" className="underline">
          /admin/categories
        </Link>
        .
      </p>

      <Section title="Hero Slides">
        {value.heroSlides.map((slide, i) => (
          <div key={i} className="border-border flex flex-col gap-2 rounded-lg border p-3">
            <ImageUploader
              images={
                slide.image
                  ? [{ url: slide.image, publicId: slide.publicId, alt: "", order: 0 }]
                  : []
              }
              onChange={(imgs) => {
                const next = [...value.heroSlides];
                next[i] = {
                  ...slide,
                  image: imgs[0]?.url ?? "",
                  publicId: imgs[0]?.publicId ?? "",
                };
                update("heroSlides", next);
              }}
              folder={cloudinaryFolders.homepageBanners}
              maxFiles={1}
            />
            <Input
              placeholder="Heading"
              value={slide.heading}
              onChange={(e) => {
                const next = [...value.heroSlides];
                next[i] = { ...slide, heading: e.target.value };
                update("heroSlides", next);
              }}
            />
            <Input
              placeholder="Subheading"
              value={slide.subheading}
              onChange={(e) => {
                const next = [...value.heroSlides];
                next[i] = { ...slide, subheading: e.target.value };
                update("heroSlides", next);
              }}
            />
            <div className="flex gap-2">
              <Input
                placeholder="CTA Label"
                value={slide.ctaLabel}
                onChange={(e) => {
                  const next = [...value.heroSlides];
                  next[i] = { ...slide, ctaLabel: e.target.value };
                  update("heroSlides", next);
                }}
              />
              <Input
                placeholder="CTA Link (/shop)"
                value={slide.ctaHref}
                onChange={(e) => {
                  const next = [...value.heroSlides];
                  next[i] = { ...slide, ctaHref: e.target.value };
                  update("heroSlides", next);
                }}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-fit"
              onClick={() => {
                deleteFromCloudinary(slide.publicId);
                update(
                  "heroSlides",
                  value.heroSlides.filter((_, idx) => idx !== i),
                );
              }}
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            update("heroSlides", [
              ...value.heroSlides,
              {
                image: "",
                publicId: "",
                heading: "",
                subheading: "",
                ctaLabel: "Shop Now",
                ctaHref: "/shop",
                order: value.heroSlides.length,
              },
            ])
          }
        >
          <Plus className="size-3.5" /> Add Slide
        </Button>
      </Section>

      <Section title="Featured Banners">
        {value.featuredBanners.map((banner, i) => (
          <div key={i} className="border-border flex flex-col gap-2 rounded-lg border p-3">
            <ImageUploader
              images={
                banner.image
                  ? [{ url: banner.image, publicId: banner.publicId, alt: "", order: 0 }]
                  : []
              }
              onChange={(imgs) => {
                const next = [...value.featuredBanners];
                next[i] = {
                  ...banner,
                  image: imgs[0]?.url ?? "",
                  publicId: imgs[0]?.publicId ?? "",
                };
                update("featuredBanners", next);
              }}
              folder={cloudinaryFolders.homepageFeatured}
              maxFiles={1}
            />
            <Input
              placeholder="Title"
              value={banner.title}
              onChange={(e) => {
                const next = [...value.featuredBanners];
                next[i] = { ...banner, title: e.target.value };
                update("featuredBanners", next);
              }}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="MRP"
                value={banner.mrp || ""}
                onChange={(e) => {
                  const next = [...value.featuredBanners];
                  next[i] = { ...banner, mrp: Number(e.target.value) };
                  update("featuredBanners", next);
                }}
              />
              <Input
                type="number"
                placeholder="Sale Price"
                value={banner.salePrice || ""}
                onChange={(e) => {
                  const next = [...value.featuredBanners];
                  next[i] = { ...banner, salePrice: Number(e.target.value) };
                  update("featuredBanners", next);
                }}
              />
            </div>
            <Input
              placeholder="Link (/product-category/rakhi)"
              value={banner.ctaHref}
              onChange={(e) => {
                const next = [...value.featuredBanners];
                next[i] = { ...banner, ctaHref: e.target.value };
                update("featuredBanners", next);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-fit"
              onClick={() => {
                deleteFromCloudinary(banner.publicId);
                update(
                  "featuredBanners",
                  value.featuredBanners.filter((_, idx) => idx !== i),
                );
              }}
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            update("featuredBanners", [
              ...value.featuredBanners,
              {
                image: "",
                publicId: "",
                title: "",
                mrp: 0,
                salePrice: 0,
                ctaLabel: "Shop Now",
                ctaHref: "/shop",
              },
            ])
          }
        >
          <Plus className="size-3.5" /> Add Banner
        </Button>
      </Section>

      <Section title="Bestsellers Rail">
        <p className="text-muted-foreground text-sm">
          Products are picked automatically by total quantity sold (all-time) &mdash; there&rsquo;s
          nothing to curate here besides the section copy, count, and visibility below.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={value.bestsellersSection.enabled}
            onCheckedChange={(checked) =>
              update("bestsellersSection", { ...value.bestsellersSection, enabled: checked })
            }
          />
          Show this section on the homepage
        </label>
        <Input
          placeholder="Title"
          value={value.bestsellersSection.title}
          onChange={(e) =>
            update("bestsellersSection", { ...value.bestsellersSection, title: e.target.value })
          }
        />
        <Input
          placeholder="Subtitle"
          value={value.bestsellersSection.subtitle}
          onChange={(e) =>
            update("bestsellersSection", { ...value.bestsellersSection, subtitle: e.target.value })
          }
        />
        <Input
          type="number"
          min={1}
          max={24}
          placeholder="Number of products to show"
          value={value.bestsellersSection.limit}
          onChange={(e) =>
            update("bestsellersSection", {
              ...value.bestsellersSection,
              limit: Number(e.target.value),
            })
          }
        />
      </Section>

      <Section title="Founders / Our Message">
        {value.founders.map((founder, i) => (
          <div key={i} className="border-border flex flex-col gap-2 rounded-lg border p-3">
            <ImageUploader
              images={
                founder.photo
                  ? [{ url: founder.photo, publicId: founder.photoPublicId, alt: "", order: 0 }]
                  : []
              }
              onChange={(imgs) => {
                const next = [...value.founders];
                next[i] = {
                  ...founder,
                  photo: imgs[0]?.url ?? "",
                  photoPublicId: imgs[0]?.publicId ?? "",
                };
                update("founders", next);
              }}
              folder={cloudinaryFolders.homepageFounders}
              maxFiles={1}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={founder.name}
                onChange={(e) => {
                  const next = [...value.founders];
                  next[i] = { ...founder, name: e.target.value };
                  update("founders", next);
                }}
              />
              <Input
                placeholder="Role"
                value={founder.role}
                onChange={(e) => {
                  const next = [...value.founders];
                  next[i] = { ...founder, role: e.target.value };
                  update("founders", next);
                }}
              />
            </div>
            <Textarea
              placeholder="Message"
              value={founder.message}
              onChange={(e) => {
                const next = [...value.founders];
                next[i] = { ...founder, message: e.target.value };
                update("founders", next);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-fit"
              onClick={() => {
                deleteFromCloudinary(founder.photoPublicId);
                update(
                  "founders",
                  value.founders.filter((_, idx) => idx !== i),
                );
              }}
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            update("founders", [
              ...value.founders,
              { name: "", role: "", photo: "", photoPublicId: "", message: "" },
            ])
          }
        >
          <Plus className="size-3.5" /> Add Founder
        </Button>
      </Section>

      <Section title="Brand Statement (Our Message hero image + words)">
        <p className="text-muted-foreground text-sm">
          The founder bios shown alongside this image come from the first 2 entries in
          &ldquo;Founders / Our Message&rdquo; above.
        </p>
        <ImageUploader
          images={
            value.brandStatement.image
              ? [
                  {
                    url: value.brandStatement.image,
                    publicId: value.brandStatement.publicId,
                    alt: "",
                    order: 0,
                  },
                ]
              : []
          }
          onChange={(imgs) => {
            update("brandStatement", {
              ...value.brandStatement,
              image: imgs[0]?.url ?? "",
              publicId: imgs[0]?.publicId ?? "",
            });
          }}
          folder={cloudinaryFolders.homepageBrandStatement}
          maxFiles={1}
        />
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              placeholder={`Word ${i + 1}`}
              value={value.brandStatement.words[i] ?? ""}
              onChange={(e) => {
                const words = [...value.brandStatement.words];
                words[i] = e.target.value;
                update("brandStatement", { ...value.brandStatement, words });
              }}
            />
          ))}
        </div>
      </Section>

      <Section title="Why Choose Us">
        {value.whyChooseUs.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Lucide icon name (e.g. Sparkles)"
              value={item.icon}
              onChange={(e) => {
                const next = [...value.whyChooseUs];
                next[i] = { ...item, icon: e.target.value };
                update("whyChooseUs", next);
              }}
            />
            <Input
              placeholder="Title"
              value={item.title}
              onChange={(e) => {
                const next = [...value.whyChooseUs];
                next[i] = { ...item, title: e.target.value };
                update("whyChooseUs", next);
              }}
            />
            <Input
              placeholder="Text"
              value={item.text}
              onChange={(e) => {
                const next = [...value.whyChooseUs];
                next[i] = { ...item, text: e.target.value };
                update("whyChooseUs", next);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() =>
                update(
                  "whyChooseUs",
                  value.whyChooseUs.filter((_, idx) => idx !== i),
                )
              }
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() =>
            update("whyChooseUs", [...value.whyChooseUs, { icon: "Sparkles", title: "", text: "" }])
          }
        >
          <Plus className="size-3.5" /> Add Item
        </Button>
      </Section>

      <Section title="FAQ">
        {value.faq.map((item, i) => (
          <div key={i} className="border-border flex flex-col gap-2 rounded-lg border p-3">
            <Input
              placeholder="Question"
              value={item.q}
              onChange={(e) => {
                const next = [...value.faq];
                next[i] = { ...item, q: e.target.value };
                update("faq", next);
              }}
            />
            <Textarea
              placeholder="Answer"
              value={item.a}
              onChange={(e) => {
                const next = [...value.faq];
                next[i] = { ...item, a: e.target.value };
                update("faq", next);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-fit"
              onClick={() =>
                update(
                  "faq",
                  value.faq.filter((_, idx) => idx !== i),
                )
              }
            >
              <Trash2 className="size-3.5" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => update("faq", [...value.faq, { q: "", a: "" }])}
        >
          <Plus className="size-3.5" /> Add FAQ
        </Button>
      </Section>

      <Button type="submit" disabled={pending} size="lg" className="w-fit">
        {pending ? "Saving..." : "Save Homepage Content"}
      </Button>
    </form>
  );
}
