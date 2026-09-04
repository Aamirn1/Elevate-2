import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const ADMIN_EMAIL = "amir03185614193@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, businessType, services, budget, message } = body;

    const resend = new Resend(RESEND_API_KEY);

    const bizLabels: Record<string, string> = {
      retail: "Retail / E-commerce",
      food: "Food & Restaurant",
      professional: "Professional Services",
      health: "Health & Fitness",
      "real-estate": "Real Estate",
      education: "Education",
      other: "Other",
    };

    const serviceLabels: Record<string, string> = {
      "web-design": "Website Design & Dev",
      "app-dev": "App Development",
      saas: "SaaS Solutions",
      marketing: "Digital Marketing & Ads",
      social: "Social Media Management",
      seo: "SEO Optimization",
      chat: "AI Chat Support",
      branding: "Branding & UI/UX",
      maintenance: "Ongoing Maintenance",
    };

    const servicesText = (services || "")
      .split(",")
      .map((s: string) => serviceLabels[s] || s)
      .join(", ");

    const html = `
      <h2>New Order Submission - ElevateEdge Digital</h2>
      <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Business Type</td><td style="padding:8px;border:1px solid #ddd;">${bizLabels[businessType] || businessType || "Not specified"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Services</td><td style="padding:8px;border:1px solid #ddd;">${servicesText || "Not specified"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Budget</td><td style="padding:8px;border:1px solid #ddd;">${budget || "Not specified"}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Message</td><td style="padding:8px;border:1px solid #ddd;">${message}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px;">This email was sent from the ElevateEdge Digital website order form.</p>
    `;

    const { error } = await resend.emails.send({
      from: "ElevateEdge Digital <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `New Order from ${name} - ElevateEdge Digital`,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
