import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter;

// Initialize the nodemailer transporter
const initTransporter = async () => {
  if (transporter) return;

  try {
    // If real credentials are provided in .env, use them (e.g. Gmail)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: "gmail", // You can change this or make it dynamic if not using gmail
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.log("Real SMTP transporter initialized.");
    } else {
      // Fallback: Use Nodemailer's Ethereal Email for testing/development
      console.log("No EMAIL_USER/EMAIL_PASS found. Generating Ethereal test account...");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("Ethereal test SMTP transporter initialized. Emails will not actually reach real inboxes.");
    }
  } catch (error) {
    console.error("Failed to initialize email transporter:", error);
  }
};

export const sendOfflineEmailNotification = async (senderName, recipientEmail, messageText) => {
  try {
    await initTransporter();
    
    if (!transporter) {
      console.warn("Transporter not initialized, skipping email notification.");
      return;
    }

    const shortMessage = messageText ? `"${messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText}"` : "Sent an attachment.";

    const info = await transporter.sendMail({
      from: '"Chatly Notifications" <noreply@chatly.com>',
      to: recipientEmail,
      subject: `New Message from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
          <h2 style="color: #6366f1; margin-bottom: 20px;">You have a new message!</h2>
          <p style="color: #334155; font-size: 16px;"><strong>${senderName}</strong> sent you a message while you were offline:</p>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #6366f1; border-radius: 4px; margin: 15px 0; color: #1e293b; font-style: italic;">
            ${shortMessage}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Log in to Chatly to reply to ${senderName}.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Open Chatly</a>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    
    // If using Ethereal, print the URL where the email can be viewed
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Error sending email notification:", error);
  }
};
