// const nodemailer = require("nodemailer");

// // Ensure environment variables are loaded
// require("dotenv").config();

// console.log("📧 Email service initializing...");
// console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? "SET" : "NOT SET"}`);
// console.log(`📧 EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });

// // Test the connection
// transporter.verify(function(error, success) {
//   if (error) {
//     console.log("❌ Email service connection failed:", error.message);
//   } else {
//     console.log("✅ Email service is ready to send messages");
//   }
// });

// async function sendEmail(to, subject, html) {
//   console.log(`📧 Attempting to send email to: ${to}`);
//   console.log(`📧 Subject: ${subject}`);

//   try {
//     const result = await transporter.sendMail({
//       from: `"IMS System" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });
//     console.log(`✅ Email sent successfully to ${to}`);
//     return result;
//   } catch (error) {
//     console.error(`❌ Failed to send email to ${to}:`, error.message);
//     throw error;
//   }
// }

// module.exports = { sendEmail };

const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("📧 Email service initializing...");
console.log(`📧 EMAIL_USER: ${process.env.EMAIL_USER ? "SET" : "NOT SET"}`);
console.log(`📧 EMAIL_PASS: ${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`);

// ✅ Use SMTP config instead of service:"gmail"
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // ✅ 587 = STARTTLS (recommended)
  secure: false, // ✅ false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ✅ MUST be Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// ✅ Verify but don't crash server if it fails
(async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready to send messages");
  } catch (error) {
    console.log("❌ Email service connection failed:", error.message);
    console.log(
      "⚠️ Server will continue running (email disabled until fixed).",
    );
  }
})();

async function sendEmail(to, subject, html) {
  try {
    const result = await transporter.sendMail({
      from: `"IMS System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail };
