import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async ({ name, email, resetUrl }: { name: string, email: string, resetUrl: string }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return;
  }
  console.log('RESEND_API_KEY present:', process.env.RESEND_API_KEY.slice(0, 8) + '...');

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your Kairo password',
      html: `
        <div style="background-color: #0A0A0A; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 40px 0; margin: 0; width: 100%;">
          <div style="max-width: 480px; margin: 0 auto; padding: 40px; background-color: #0A0A0A;">
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 30px; font-family: 'Georgia', serif;">
              <span style="color: #FFFFFF;">Kai</span><span style="color: #FF6B00;">ro</span>
            </div>
            <h1 style="color: #FFFFFF; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">Reset your password</h1>
            <p style="color: #888888; font-size: 14px; line-height: 24px; margin: 0 0 30px 0;">
              Hi ${name}, we received a request to reset your Kairo password. Click the button below to choose a new one. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="background-color: #FF6B00; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 500; display: inline-block; text-decoration: none; margin-bottom: 30px;">Reset password</a>
            <p style="color: #444444; font-size: 12px; margin: 0 0 20px 0;">
              If you didn't request this, ignore this email. Your password won't change.
            </p>
            <p style="color: #333333; font-size: 11px; margin: 0;">
              © 2026 Kairo
            </p>
          </div>
        </div>
      `
    });
    console.log('Resend response:', data);
  } catch (error) {
    console.error('Resend error:', error);
  }
};
