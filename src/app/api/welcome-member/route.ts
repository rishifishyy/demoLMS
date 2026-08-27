import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, phone, password } = body;

    const roleName = role === 'admin' ? 'Admin' : 'Team Sales Agent';
    const loginUrl = 'https://happy-lms.vercel.app/login';

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: #ffffff; padding: 32px 24px; text-align: center;">
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
            🎉 Welcome Aboard!
          </div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Welcome to HappyLMS CRM</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #dbeafe;">Your real estate sales management portal</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 32px 24px; color: #334155;">
          <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0;">
            Hello ${name},
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            You have been added to <strong>HappyLMS</strong> as a <strong>${roleName}</strong>. You can now log in to view property leads, make calls, update follow-ups, and track buyer site visits.
          </p>

          <!-- Login Credentials Box -->
          <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">
              🔑 Your Login Credentials
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 35%;">Portal Link:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: bold;">
                  <a href="${loginUrl}" style="color: #2563eb; text-decoration: none;">happy-lms.vercel.app</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Login Email:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">${email}</td>
              </tr>
              ${password ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Password:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">${password}</td>
              </tr>` : ''}
              ${phone ? `
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">WhatsApp Mobile:</td>
                <td style="padding: 6px 0; color: #059669; font-weight: bold; font-family: monospace;">+91 ${phone}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Access Role:</td>
                <td style="padding: 6px 0; color: #1e293b; font-weight: bold;">${roleName}</td>
              </tr>
            </table>
          </div>

          <!-- Direct Login Button -->
          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
              🚀 Log In to Your Account &rarr;
            </a>
          </div>

          <!-- Help Tips -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 16px; margin-top: 24px;">
            <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
              💡 <strong>Mobile Tip:</strong> Save <em>happy-lms.vercel.app</em> to your phone home screen for 1-tap mobile access anytime.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8;">
            HappyLMS Real Estate Sales Portal &bull; Automated System Notification
          </p>
        </div>
      </div>
    `;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const resendApiKey = process.env.RESEND_API_KEY;

    // 1. Direct Gmail SMTP (if configured)
    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      await transporter.sendMail({
        from: `"HappyLMS CRM" <${gmailUser}>`,
        to: email,
        subject: `🎉 Welcome to HappyLMS CRM - Your Login Credentials (${name})`,
        html: emailHtml
      });

      return NextResponse.json({ success: true, method: 'gmail_smtp' });
    }

    // 2. Resend API (if configured)
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'HappyLMS <onboarding@resend.dev>',
          to: [email],
          subject: `🎉 Welcome to HappyLMS CRM - Your Login Credentials (${name})`,
          html: emailHtml
        })
      });

      const resData = await res.json();
      return NextResponse.json({ success: true, method: 'resend', data: resData });
    }

    // Fallback: SMTP not configured yet
    console.log(`[Welcome Email Logged] To: ${email}, Name: ${name}, Role: ${role}, Password: ${password}`);
    return NextResponse.json({ 
      success: true, 
      method: 'logged',
      message: 'Welcome email recorded (Set GMAIL_USER or RESEND_API_KEY in Vercel to send live emails)' 
    });
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send welcome email' }, { status: 500 });
  }
}
