import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export async function sendAlertEmail(
    to: string,
    userName: string,
    stockName: string,
    stockSymbol: string,
    condition: "above" | "below",
    targetPrice: number,
    currentPrice: number
) {
    const subject = `Sentinel Alert: ${stockSymbol} price ${condition} $${targetPrice}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 24px; border-radius: 12px;">
      <h1 style="color: #22c55e; margin-bottom: 8px;">Sentinel Alert Triggered</h1>
      <p style="color: #9ca3af; margin-bottom: 24px;">Your price alert has been triggered</p>
      
      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0 0 16px 0;">${stockName} (${stockSymbol})</h2>
        <p style="margin: 8px 0; color: #9ca3af;">
          Condition: Price went <strong style="color: #22c55e;">${condition}</strong> $${targetPrice}
        </p>
        <p style="margin: 8px 0; color: #9ca3af;">
          Current Price: <strong style="color: #ffffff; font-size: 24px;">$${currentPrice.toFixed(2)}</strong>
        </p>
        <p style="margin: 8px 0; color: #9ca3af;">
          Target Price: <strong style="color: #22c55e;">$${targetPrice}</strong>
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated alert from Sentinel Stock Tracker. 
        Log in to manage your alerts.
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"Sentinel" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject,
        html,
    });
}

export async function sendDailyDigestEmail(
    to: string,
    userName: string,
    digest: string,
    date: string
) {
    const subject = `Sentinel Daily Digest — ${date}`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 24px; border-radius: 12px;">
      <h1 style="color: #22c55e; margin-bottom: 8px;">Daily Market Digest</h1>
      <p style="color: #9ca3af; margin-bottom: 24px;">${date}</p>
      
      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #e5e7eb; line-height: 1.6;">${digest}</p>
      </div>
      
      <p style="color: #6b7280; font-size: 12px;">
        Your daily AI-powered market digest from Sentinel.
      </p>
    </div>
  `;

    await transporter.sendMail({
        from: `"Sentinel" <${process.env.NODEMAILER_EMAIL}>`,
        to,
        subject,
        html,
    });
}