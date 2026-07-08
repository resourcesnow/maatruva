export interface SmsProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}

class Msg91Provider implements SmsProvider {
  async sendOtp(phone: string, code: string) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

    if (!authKey || !templateId) {
      console.warn(`[sms] MSG91 not configured. OTP for ${phone}: ${code}`);
      return;
    }

    const res = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phone.replace("+", ""),
        otp: code,
        sender: process.env.MSG91_SENDER_ID,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`MSG91 OTP send failed: ${res.status} ${body}`);
    }
  }
}

export const sms: SmsProvider = new Msg91Provider();
