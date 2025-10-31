"use server";

import nodemailer from "nodemailer";
import { getInvoiceAsBuffer } from "@/app/(user)/orders/[orderId]/Invoice";
import { adminDB } from "@/lib/firebase_admin";


export async function sendOrderStatusUpdateEmail(orderId, newStatus, recipientEmail, customerName, orderData) {
    // Validate SMTP credentials
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {
        console.error("❌ Missing SMTP configuration. Please check your environment variables (SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASS, SMTP_FROM_EMAIL).");
        throw new Error("Email service is not configured correctly.");
    }

    if (!recipientEmail) {
        console.warn(`No recipient email provided for order ${orderId}. Skipping email notification.`);
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

    let subject = "";
    let htmlBody = "";
    let attachments = [];
    const formattedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

    switch (newStatus) {
        case "delivered":
            subject = `Your Mobile Display Order #${orderId} has been successfully delivered!`;
            const { pdfBuffer, downloadURL, newInvoiceId } = await generateAndSendDeliveredInvoice(orderData);
            attachments.push({
                filename: `invoice_${orderId}_delivered.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            });

            // Save the delivered invoice URL to the order
            await adminDB.doc(`orders/${orderId}`).update({
                deliveredInvoiceUrl: downloadURL,
                deliveredInvoiceId: newInvoiceId
            });

            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>Great news! Your order <strong>#${orderId}</strong> has been successfully delivered.</p>
                <p>Please find your final invoice attached.</p>
                <p>We hope you enjoy your purchase!</p>
                <br/>
                <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
                <br/>
                <p>Best regards,</p>
                <p>The Mobile Display Team</p>
            `;
            break;
        case "cancelled":
            subject = `Your Mobile Display Order #${orderId} has been cancelled.`;
            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>We regret to inform you that your order <strong>#${orderId}</strong> has been cancelled.</p>
                <p>If you have any questions regarding this cancellation, please contact our support team.</p>
                <br/>
                <p>Best regards,</p>
                <p>The Mobile Display Team</p>
            `;
            break;
        default:
            subject = `Update on your Mobile Display Order #${orderId}: ${formattedStatus}`;
            htmlBody = `
                <h1>Hello ${customerName || "Customer"},</h1>
                <p>This is an update regarding your order <strong>#${orderId}</strong>.</p>
                <p>The status of your order has been updated to: <strong>${formattedStatus}</strong>.</p>
                <br/>
                <p>We will notify you again with further updates.</p>
                <br/>
                <p>Best regards,</p>
                <p>The Mobile Display Team</p>
            `;
            break;
    }

    const mailOptions = {
        from: `"Mobile Display" <${process.env.SMTP_FROM_EMAIL}>`,
        to: recipientEmail,
        subject: subject,
        html: htmlBody,
        attachments: attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order status update email sent for order ${orderId} to ${recipientEmail} (Status: ${newStatus})`);
    } catch (error) {
        console.error(`❌ Error sending order status update email for order ${orderId}:`, error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

export const generateAndSendDeliveredInvoice = async (orderData) => {
  try {
    // 1. Get new invoice number
    const counterRef = adminDB.doc("counters/invoices");
    const newInvoiceId = await adminDB.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      const newId = (counterDoc.data()?.lastId || 0) + 1;
      transaction.set(counterRef, { lastId: newId }, { merge: true });
      return newId;
    });

    console.log(`Starting delivered invoice generation for order: ${orderData.id}, Invoice ID: ${newInvoiceId}`);

    // 2. Generate PDF
    const { pdfBuffer, downloadURL } = await getInvoiceAsBuffer(orderData, {
      title: "Delivered Invoice",
      invoiceId: newInvoiceId,
      type: "delivered",
    });
    console.log(`Delivered PDF generated for order: ${orderData.id}. URL: ${downloadURL}`);

    // 3. Return invoice details to be used for sending email
    return { pdfBuffer, downloadURL, newInvoiceId };
  } catch (error) {
    console.error(`Error in generateAndSendDeliveredInvoice for order ${orderData.id}:`, error);
    throw new Error(`Failed to generate delivered invoice: ${error.message}`);
  }
};