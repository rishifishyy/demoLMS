import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentEmail, agentName, customerName, customerPhone, propertyLocation, leadSource, remark, leadId } = body;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold;">⚡ New Lead Assigned to You!</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe;">HappyLMS Real Estate CRM</p>
        </div>

        <div style="padding: 24px; background-color: #ffffff;">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">
            Hi <strong>${agentName}</strong>, a property buyer has just been assigned to you. Please make the initial outreach call as soon as possible.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 40%;">Lead ID:</td>
                <td style="padding: 6px 0; color: #2563eb; font-weight: bold; font-family: monospace;">${leadId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Customer Name:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Mobile Number:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">+91 ${customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Interested Property:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">📍 ${propertyLocation}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Lead Source:</td>
                <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${leadSource}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Discussion Notes:</td>
                <td style="padding: 6px 0; color: #334155; font-style: italic;">"${remark || 'No initial remarks'}"</td>
              </tr>
            </table>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 25px 0;">
            <a href="tel:+91${customerPhone}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; margin-right: 10px;">
              📞 Call Customer Now
            </a>
            <a href="https://wa.me/91${customerPhone}?text=Hello%20${encodeURIComponent(customerName)}%2C%20this%20is%20${encodeURIComponent(agentName)}%20regarding%20the%20property%20in%20${encodeURIComponent(propertyLocation)}." style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">
              💬 WhatsApp Customer
            </a>
          </div>

          <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <a href="https://happy-lms.vercel.app" style="color: #64748b; font-size: 12px; text-decoration: underline;">
              Open HappyLMS CRM &rarr;
            </a>
          </div>
        </div>
      </div>
    `;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const resendApiKey = process.env.RESEND_API_KEY;

    // 1. Preferred Method: Direct Gmail SMTP (Works to ANY Gmail with ZERO sandbox restrictions!)
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
        to: agentEmail,
        subject: `⚡ New Lead: ${customerName} (${propertyLocation})`,
        html: emailHtml
      });

      return NextResponse.json({ success: true, method: 'gmail_smtp' });
    }

    // 2. Fallback: Resend API
    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'HappyLMS Leads <onboarding@resend.dev>',
          to: [agentEmail],
          subject: `⚡ New Lead: ${customerName} (${propertyLocation})`,
          html: emailHtml
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ success: false, error: data.message || 'Resend error', data }, { status: res.status });
      }
      return NextResponse.json({ success: true, method: 'resend', data });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Neither GMAIL_APP_PASSWORD nor RESEND_API_KEY is configured' 
    }, { status: 400 });

  } catch (err: any) {
    console.error('Email sending error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
