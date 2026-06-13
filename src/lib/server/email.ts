import dns from "node:dns";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");

type WelcomeEmailPayload = {
  to: string;
  username: string;
};

type VerificationEmailPayload = {
  to: string;
  username: string;
  token: string;
};

let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (transport) {
    return transport;
  }

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  return transport;
}

function buildWelcomeEmailHtml(username: string, landingUrl: string) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to SubSync</title>
    </head>
    <body style="margin:0;padding:0;background:#050505;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f5f7;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:linear-gradient(150deg,#0f0f10 0%,#10100a 100%);border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 16px;">
                  <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ffd60a;">SubSync</p>
                  <h1 style="margin:0;font-size:34px;line-height:1.08;color:#f5f5f7;font-weight:800;letter-spacing:-0.03em;">Welcome to your<br/>sync ecosystem.</h1>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#b6b6bd;">Hey ${username}, your account is live. Explore all SubSync services from one connected home.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(255,214,10,0.25);border-radius:14px;background:rgba(255,214,10,0.06);">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0;font-size:13px;line-height:1.7;color:#f5f5f7;">Start here to see every service and where to go next.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px;">
                  <a href="${landingUrl}" style="display:inline-block;background:#ffd60a;color:#050505;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:12px;">Open SubSync Landing Page</a>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 24px;">
                  <p style="margin:0;font-size:12px;line-height:1.7;color:#8f8f96;">Apps in your ecosystem: TravelSync, PhotoSync, BrainSync, FluencySync, SteadySync, TrackerSync, and SeatSync.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0;font-size:11px;line-height:1.6;color:#6f6f76;">This email was sent because a new SubSync account was created with this address.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function buildWelcomeEmailText(username: string, landingUrl: string) {
  return [
    `Welcome to SubSync, ${username}.`,
    "",
    "Your account is now live.",
    "Explore all SubSync services from one connected home:",
    landingUrl,
    "",
    "Apps: TravelSync, PhotoSync, BrainSync, FluencySync, SteadySync, TrackerSync, SeatSync.",
  ].join("\n");
}

export async function sendWelcomeEmail({ to, username }: WelcomeEmailPayload) {
  const mailer = getTransport();

  if (!mailer) {
    console.warn("Welcome email skipped: EMAIL_USER or EMAIL_PASS is not configured.");
    return false;
  }

  const from = process.env.EMAIL_USER as string;
  const landingUrl = process.env.LANDING_PAGE_URL || "https://sub-sync.ca";

  await mailer.sendMail({
    from: `SubSync <${from}>`,
    to,
    subject: "Welcome to SubSync",
    text: buildWelcomeEmailText(username, landingUrl),
    html: buildWelcomeEmailHtml(username, landingUrl),
  });

  return true;
}

function buildVerificationEmailHtml(username: string, verificationLink: string) {
  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your SubSync Account</title>
    </head>
    <body style="margin:0;padding:0;background:#050505;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f5f7;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:linear-gradient(150deg,#0f0f10 0%,#10100a 100%);border:1px solid rgba(255,255,255,0.1);border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 16px;">
                  <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#ffd60a;">SubSync Verification</p>
                  <h1 style="margin:0;font-size:34px;line-height:1.08;color:#f5f5f7;font-weight:800;letter-spacing:-0.03em;">Verify your<br/>email address.</h1>
                  <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#b6b6bd;">Hey ${username}, thank you for signing up for SubSync. Please click the button below to verify your email and activate your account.</p>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(255,214,10,0.25);border-radius:14px;background:rgba(255,214,10,0.06);">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0;font-size:13px;line-height:1.7;color:#f5f5f7;">This link is valid for 1 hour. If you did not sign up for SubSync, you can safely ignore this email.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 28px;">
                  <a href="${verificationLink}" style="display:inline-block;background:#ffd60a;color:#050505;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:12px;">Verify Email Address</a>
                </td>
              </tr>

              <tr>
                <td style="padding:0 28px 24px;">
                  <p style="margin:0;font-size:12px;line-height:1.7;color:#8f8f96;">Or copy and paste this URL into your browser:<br/><a href="${verificationLink}" style="color:#ffd60a;text-decoration:underline;">${verificationLink}</a></p>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 28px 24px;border-top:1px solid rgba(255,255,255,0.08);">
                  <p style="margin:0;font-size:11px;line-height:1.6;color:#6f6f76;">This email was sent because a verification request was triggered for this address.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function buildVerificationEmailText(username: string, verificationLink: string) {
  return [
    `Verify your SubSync Account, ${username}.`,
    "",
    "Thank you for signing up for SubSync.",
    "Please use the link below to verify your email and activate your account:",
    verificationLink,
    "",
    "This link is valid for 1 hour. If you did not sign up for SubSync, please ignore this email.",
  ].join("\n");
}

export async function sendVerificationEmail({ to, username, token }: VerificationEmailPayload) {
  const mailer = getTransport();
  const landingUrl = process.env.LANDING_PAGE_URL || "http://localhost:3000";
  const verificationLink = `${landingUrl}/verify-email?token=${token}`;

  console.log(`[Verification Email] To: ${to}, Link: ${verificationLink}`);

  if (!mailer) {
    console.warn(`Verification email skipped: EMAIL_USER or EMAIL_PASS is not configured.`);
    console.warn(`To verify locally, open this link: ${verificationLink}`);
    return false;
  }

  const from = process.env.EMAIL_USER as string;

  await mailer.sendMail({
    from: `SubSync <${from}>`,
    to,
    subject: "Verify Your Email Address - SubSync",
    text: buildVerificationEmailText(username, verificationLink),
    html: buildVerificationEmailHtml(username, verificationLink),
  });

  return true;
}
