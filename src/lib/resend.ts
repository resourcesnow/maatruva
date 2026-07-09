import { Resend } from "resend";
import { brand } from "./brand";

let client: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
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
