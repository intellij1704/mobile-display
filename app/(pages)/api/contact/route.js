import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { firstName, lastName, email, phone, message } = await req.json();

    // Create transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for port 465
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
  const mailOptions = {
  from: `"${firstName} ${lastName}" <${process.env.SMTP_EMAIL}>`,
  to: process.env.RECEIVER_EMAIL || process.env.SMTP_EMAIL, // where you receive the form
  subject: "New Contact Form Message from mobiledisplay.in",
  html: `
    <h2>New Message from mobiledisplay.in Contact Form</h2>
    <p><strong>Name:</strong> ${firstName} ${lastName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong><br/>${message}</p>
  `,
};


    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ success: false, message: "Failed to send message." }), {
      status: 500,
    });
  }
}
