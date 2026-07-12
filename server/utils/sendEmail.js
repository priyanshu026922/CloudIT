import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendShareEmail = async ({ to, fileName, shareUrl, senderName }) => {
  await transporter.sendMail({
    from: `"CloudIT" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${senderName} shared a file with you on CloudIT`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>${senderName} shared a file with you</h2>
        <p><strong>${fileName}</strong></p>
        <p>This link expires in 20 minutes.</p>
        <a href="${shareUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          View & Download
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px;">If you didn't expect this, you can ignore this email.</p>
      </div>
    `,
  });
};

export { sendShareEmail };