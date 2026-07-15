import { Resend } from "resend";
import { brand } from "./brand";

let client: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

// Shared send wrapper for all email templates (auth emails below, and the order-lifecycle
// templates in order-emails.ts) — one place for the "no API key configured" dev fallback and
// the from-address convention, so new templates don't duplicate this boilerplate.
export async function sendEmail({
  to,
  subject,
  html,
  fromLabel,
}: {
  to: string;
  subject: string;
  html: string;
  fromLabel?: string;
}) {
  const resend = getClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured. Would send "${subject}" to ${to}.`);
    return;
  }

  const { error } = await resend.emails.send({
    from: `${fromLabel ?? brand.name} <${fromEmail}>`,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email "${subject}": ${error.message}`);
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  const resend = getClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not configured. Verification code for ${email}: ${code}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: `${brand.name} <${fromEmail}>`,
    to: email,
    subject: `${code} is your ${brand.name} verification code`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Enter this code to verify your ${brand.name} account. It expires in 5 minutes.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const resend = getClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not configured. Password reset link for ${email}: ${resetUrl}`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: `${brand.name} Admin <${fromEmail}>`,
    to: email,
    subject: `Reset your ${brand.name} admin password`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #555; margin-bottom: 24px;">
          Click the button below to set a new password for your ${brand.name} admin account.
          This link expires in 45 minutes.
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #7a1f2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
}

export async function sendAdminInviteEmail(
  email: string,
  inviterName: string,
  setPasswordUrl: string,
) {
  const resend = getClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY not configured. Admin invite link for ${email}: ${setPasswordUrl}`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: `${brand.name} Admin <${fromEmail}>`,
    to: email,
    subject: `You've been added as a ${brand.name} admin`,
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">You've been invited</h2>
        <p style="color: #555; margin-bottom: 24px;">
          ${inviterName} added you as an admin on ${brand.name}. Click the button below to set
          your password and get started. This link expires in 45 minutes.
        </p>
        <a href="${setPasswordUrl}" style="display: inline-block; padding: 12px 24px; background: #7a1f2e; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Set your password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you weren't expecting this, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send admin invite email: ${error.message}`);
  }
}
