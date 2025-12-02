"use server";

import nodemailer from "nodemailer";

export async function sendReturnStatusUpdateEmail(returnRequestId, newStatus, recipientEmail, customerName) {
    // Validate SMTP credentials
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {
        console.error("❌ Missing SMTP configuration. Please check your environment variables.");
        throw new Error("Email service is not configured correctly.");
    }

    if (!recipientEmail) {
        console.warn(`No recipient email provided for return request ${returnRequestId}. Skipping email notification.`);
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
    });

    const formattedStatus = newStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let subject = `Update on your Return Request #${returnRequestId}`;
    let htmlBody = "";

    switch (newStatus) {
        case "approved":
            subject = `Your Return Request #${returnRequestId} has been approved!`;
            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>Great news! Your return request <strong>#${returnRequestId}</strong> has been approved.</p>
                <p>We will process your return/replacement shortly. You will receive further updates from us.</p>
            `;
            break;
        case "rejected":
            subject = `Update on your Return Request #${returnRequestId}`;
            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>We're writing to inform you that your return request <strong>#${returnRequestId}</strong> has been rejected.</p>
                <p>If you have any questions, please contact our support team.</p>
            `;
            break;
        default:
            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>This is an update regarding your return request <strong>#${returnRequestId}</strong>.</p>
                <p>The status has been updated to: <strong>${formattedStatus}</strong>.</p>
            `;
            break;
    }

    htmlBody += `<br/><p>Best regards,</p><p>The Mobile Display Team</p>`;

    const mailOptions = {
        from: `"Mobile Display" <${process.env.SMTP_FROM_EMAIL}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlBody,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Return status update email sent for request ${returnRequestId} to ${recipientEmail} (Status: ${newStatus})`);
    } catch (error) {
        console.error(`❌ Error sending return status update email for request ${returnRequestId}:`, error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}