Maatruva storefront + admin panel — Next.js 15 (App Router), TypeScript, MongoDB (Mongoose), Cloudinary, Auth.js.

## Getting started

```bash
npm install
cp .env.example .env      # fill in the values below
npm run seed               # bootstraps users, coupons, homepage CMS content
npm run import:products    # loads catalog data (categories/products)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront, `/admin/login` for the admin panel.

## Environment variables

See `.env.example` for the full list. Grouped by concern:

- **Database** — `MONGODB_URI`: a MongoDB connection string. `src/lib/db.ts` caches the connection across hot reloads/serverless invocations; every data-access function calls `connectDB()` before querying, so you never need to open a connection manually.
- **Auth.js** — `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, plus `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` if you want Google sign-in. Config lives in `src/lib/auth.ts`.
- **Cloudinary** — see below.
- **Razorpay / Shiprocket / Resend** — payment, shipping, and transactional email providers. Optional for local development unless you're testing checkout/shipping/emails end-to-end.
- **Branding** — `NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_BRAND_TAGLINE`, `NEXT_PUBLIC_SITE_URL`.
- **Seed** — email/phone used by `npm run seed` to bootstrap an initial admin/manager/customer.

## Cloudinary setup

Image uploads (product images, category images, and all homepage CMS images — hero slides, collections, banners, founders, etc.) go through Cloudinary using **signed** uploads, not an unsigned upload preset:

1. Create a free Cloudinary account and note your **Cloud Name**, **API Key**, and **API Secret** from the dashboard.
2. Set all four Cloudinary vars in `.env`:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — server-only, used by the Cloudinary Admin/Upload SDK (`src/lib/cloudinary.ts`) to sign uploads and delete assets.
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY` — safe to expose; the client-side `next-cloudinary` upload widget needs these to talk to Cloudinary, but every upload still requires a fresh signature from the server.
3. No upload preset needs to be created. On every upload, the widget calls `POST /api/cloudinary/sign` (`src/app/api/cloudinary/sign/route.ts`), which checks the signed-in user's session and role via `isFolderAllowedForUser` (`src/lib/cloudinary-folders.ts`) before signing — so only authorized admins/shop managers can upload, and only into the folder their role permits (e.g. a shop manager can't write into another shop's product folder). This is intentionally stricter than an unsigned preset, which would let anyone holding the preset name upload directly with no server-side check.
4. Deleting an image (removing a hero slide, swapping a product photo, etc.) calls `POST /api/cloudinary/delete`, which destroys the asset by its stored `publicId` via `destroyCloudinaryAsset` (`src/lib/cloudinary.ts`) — so orphaned assets don't pile up in your Cloudinary account.

## Marking a user as admin

There's no self-service way to become an admin (by design — nothing should be able to grant admin access before one exists). To bootstrap the first `super_admin`:

```bash
npx tsx scripts/promote-super-admin.ts <email> [password]
```

- If the email doesn't exist yet, it creates the user as `super_admin`.
- If it exists, it promotes their role.
- Pass a password directly, or omit it to get a one-time set-password link (expires in 45 minutes) printed to the console — the same flow used when inviting a new admin from the dashboard.

Once you have a `super_admin`, further admins/shop managers can be invited from `/admin/admins` in the dashboard itself — no script needed after the first one.

## Homepage content (CMS)

The homepage is fully data-driven from a single `HomeContent` document (`src/models/HomeContent.ts`), editable at `/admin/content` (requires the `contentManage` role — see `src/lib/rbac.ts`). Sections: hero slides, featured banners, founders/"Our Message", "Why Choose Us", FAQ, collection tiles, and the bestsellers rail (title/subtitle/limit/visibility — the products themselves are ranked automatically from real order sales, not manually picked). Saving revalidates both `/` and `/admin/content` immediately, so changes go live without a rebuild or cache clear.
