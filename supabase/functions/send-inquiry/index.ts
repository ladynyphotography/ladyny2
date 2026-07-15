import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/New_York",
  });
}

function adminEmailHtml(data: {
  name: string;
  email: string;
  phone: string;
  session_type: string;
  message: string;
  created_at: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8ddd0;">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:6px;text-transform:uppercase;font-family:Arial,sans-serif;">Lady Ny Photography</p>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:26px;font-weight:normal;letter-spacing:1px;">New Inquiry Received</h1>
            </td>
          </tr>
          <!-- Gold bar -->
          <tr><td style="height:3px;background:linear-gradient(90deg,#C9A84C,#e8c97a,#C9A84C);"></td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#5c5c5c;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;">
                A new booking inquiry was submitted on ${formatDate(data.created_at)}.
              </p>
              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${[
                  ["Name", data.name],
                  ["Email", `<a href="mailto:${data.email}" style="color:#C9A84C;">${data.email}</a>`],
                  ["Phone", data.phone || "<em style='color:#aaa;'>Not provided</em>"],
                  ["Session Type", data.session_type || "<em style='color:#aaa;'>Not specified</em>"],
                ]
                  .map(
                    ([label, value]) => `
                <tr>
                  <td style="padding:12px 16px;background:#faf7f3;border-bottom:1px solid #ede7de;width:140px;font-family:Arial,sans-serif;font-size:12px;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">${label}</td>
                  <td style="padding:12px 16px;background:#faf7f3;border-bottom:1px solid #ede7de;font-family:Arial,sans-serif;font-size:14px;color:#2d2d2d;">${value}</td>
                </tr>`
                  )
                  .join("")}
                <tr>
                  <td style="padding:12px 16px;background:#faf7f3;font-family:Arial,sans-serif;font-size:12px;color:#C9A84C;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">Message</td>
                  <td style="padding:12px 16px;background:#faf7f3;font-family:Arial,sans-serif;font-size:14px;color:#2d2d2d;line-height:1.7;white-space:pre-wrap;">${data.message}</td>
                </tr>
              </table>
              <div style="margin-top:32px;text-align:center;">
                <a href="mailto:${data.email}" style="display:inline-block;background:#C9A84C;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;padding:14px 32px;">Reply to Client</a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5f0eb;padding:20px 40px;text-align:center;border-top:1px solid #e8ddd0;">
              <p style="margin:0;color:#aaa;font-family:Arial,sans-serif;font-size:11px;">Lady Ny Photography &bull; New Castle, DE</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function confirmationEmailHtml(name: string) {
  const firstName = name.split(" ")[0];
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e8ddd0;">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:40px;text-align:center;">
              <p style="margin:0;color:#C9A84C;font-size:11px;letter-spacing:6px;text-transform:uppercase;font-family:Arial,sans-serif;">Lady Ny Photography</p>
              <h1 style="margin:16px 0 0;color:#ffffff;font-size:28px;font-weight:normal;font-style:italic;letter-spacing:1px;">Thank You, ${firstName}</h1>
            </td>
          </tr>
          <!-- Gold bar -->
          <tr><td style="height:3px;background:linear-gradient(90deg,#C9A84C,#e8c97a,#C9A84C);"></td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:44px 40px;">
              <p style="margin:0 0 20px;color:#3d3d3d;font-size:16px;line-height:1.8;">
                Your inquiry has been received and I'm so excited to learn more about your vision.
              </p>
              <p style="margin:0 0 20px;color:#5c5c5c;font-family:Arial,sans-serif;font-size:14px;line-height:1.8;">
                I personally review every message and will be in touch within <strong>24&ndash;48 hours</strong> to discuss how we can create something truly beautiful together.
              </p>
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="height:1px;background:#e8ddd0;"></td>
                  <td style="padding:0 16px;white-space:nowrap;color:#C9A84C;font-size:18px;">&diams;</td>
                  <td style="height:1px;background:#e8ddd0;"></td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#5c5c5c;font-family:Arial,sans-serif;font-size:14px;">If you need to reach me sooner:</p>
              <table cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;width:100px;vertical-align:top;padding-top:2px;">Email</td>
                  <td style="font-family:Arial,sans-serif;font-size:14px;color:#2d2d2d;"><a href="mailto:Ladynyphotos@gmail.com" style="color:#C9A84C;">Ladynyphotos@gmail.com</a></td>
                </tr>
                <tr><td colspan="2" style="padding-bottom:10px;"></td></tr>
                <tr>
                  <td style="font-family:Arial,sans-serif;font-size:12px;color:#C9A84C;letter-spacing:2px;text-transform:uppercase;vertical-align:top;padding-top:2px;">Phone</td>
                  <td style="font-family:Arial,sans-serif;font-size:14px;color:#2d2d2d;">+1 (302) 375-5002</td>
                </tr>
              </table>
              <p style="margin:40px 0 0;color:#3d3d3d;font-size:16px;line-height:1.8;font-style:italic;">
                Every great photograph begins with a conversation &mdash; I look forward to ours.
              </p>
              <p style="margin:24px 0 0;color:#5c5c5c;font-family:Arial,sans-serif;font-size:14px;">Warmly,</p>
              <p style="margin:4px 0 0;color:#1a1a1a;font-size:20px;font-style:italic;">Lady Ny</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5f0eb;padding:20px 40px;text-align:center;border-top:1px solid #e8ddd0;">
              <p style="margin:0;color:#aaa;font-family:Arial,sans-serif;font-size:11px;">Lady Ny Photography &bull; New Castle, DE &amp; Destinations Worldwide</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "re_bvd7xWNP_2sGdgTiqv8YJDGv6syvEmnty";
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server misconfiguration" }, 500);
    }

    const body = await req.json();
    const { name, email, phone, session_type, message } = body as {
      name: string;
      email: string;
      phone?: string;
      session_type?: string;
      message: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return jsonResponse({ error: "name, email and message are required" }, 400);
    }

    // Insert into DB via service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: inquiry, error: dbError } = await supabase
      .from("inquiries")
      .insert([{ name, email, phone: phone ?? "", session_type: session_type ?? "", message }])
      .select("created_at")
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return jsonResponse({ error: "Failed to save inquiry" }, 500);
    }

    const created_at = inquiry?.created_at ?? new Date().toISOString();

    // Send both emails in parallel
    const sendEmail = (to: string, subject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Lady Ny Photography <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });

    const [adminRes, clientRes] = await Promise.all([
      sendEmail(
        "msnykisha@icloud.com",
        `New Inquiry from ${name} — ${session_type || "Photography Session"}`,
        adminEmailHtml({ name, email, phone: phone ?? "", session_type: session_type ?? "", message, created_at })
      ),
      sendEmail(
        email,
        "Your Inquiry Has Been Received — Lady Ny Photography",
        confirmationEmailHtml(name)
      ),
    ]);

    if (!adminRes.ok || !clientRes.ok) {
      const adminBody = await adminRes.text().catch(() => "");
      const clientBody = await clientRes.text().catch(() => "");
      console.error("Resend error (admin):", adminRes.status, adminBody);
      console.error("Resend error (client):", clientRes.status, clientBody);
      // Inquiry saved — don't fail the whole request; emails are best-effort
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error("Unhandled error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
