const RESEND_API = "https://api.resend.com/emails";

export async function sendOtpEmail(
  to: string,
  code: string
): Promise<{ sent: boolean; provider: string; devCode?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PGNearMe <onboarding@resend.dev>";

  const html = buildOtpEmailTemplate(code);

  if (!apiKey) {
    console.log(`[PGNearMe dev] OTP for ${to} is ${code}`);
    return { sent: false, provider: "dev", devCode: code };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Your PGNearMe Verification Code",
        html,
      }),
    });
    if (res.ok) return { sent: true, provider: "resend" };
    const body = await res.text().catch(() => "");
    console.error(`[PGNearMe] Resend failed (${res.status}): ${body}`);
    return { sent: false, provider: "resend" };
  } catch (err) {
    console.error("[PGNearMe] Resend error:", err);
    return { sent: false, provider: "resend" };
  }
}

function buildOtpEmailTemplate(code: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your PGNearMe Verification Code</title>
  </head>
  <body style="margin:0;padding:0;background-color:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background-color:#003580;padding:24px;text-align:center;">
                <span style="font-size:22px;font-weight:bold;color:#ffffff;">PG<span style="color:#F7A800;">NearMe</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <h1 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Your Verification Code</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.6;">
                  Use the 6-digit code below to complete your PGNearMe registration. It expires in 5 minutes.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;">
                  <tr>
                    <td style="background-color:#f1f5f9;border:1px dashed #cbd5e1;border-radius:12px;padding:14px 32px;letter-spacing:10px;font-size:32px;font-weight:bold;color:#003580;text-align:center;">
                      ${code}
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                  If you didn't request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#f8fafc;padding:16px 28px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;color:#64748b;">
                  &copy; ${new Date().getFullYear()} PGNearMe &middot; India's trusted PG finder
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}