const db = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("./emailService");

const Product = db.Product;
const Supplier = db.Supplier;
const Brand = db.Brand;
const Category = db.Category;
const Notification = db.Notification;

/**
 * Make sure your Notification model uses either createdAt (default)
 * or created_at (if underscored: true).
 */
const CREATED_FIELD = Notification?.rawAttributes?.createdAt
  ? "createdAt"
  : "created_at";

async function sendStockAlert({ type, product, supplier, brand, category }) {
  if (!supplier?.email) return false;

  const subject =
    type === "outstock" ? "🚨 Out of Stock Alert" : "⚠️ Low Stock Alert";

  const html = `
<div style="background:#f4f6f8;padding:30px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#ff6a00,#ff9800);padding:20px 25px;color:#fff;">
      <h2 style="margin:0;font-size:22px;">📦 IMS Stock Alert</h2>
      <p style="margin:5px 0 0;font-size:14px;opacity:.95;">
        Inventory Management System
      </p>
    </div>

    <!-- Body -->
    <div style="padding:25px;color:#333;">
      <p style="font-size:15px;margin-top:0;">
        Hello <b>${supplier?.name}</b>,
      </p>

      <p style="font-size:14px;line-height:1.6;">
        This is an automated notification to inform you that the following product
        requires immediate restocking:
      </p>

      <!-- Info Card -->
      <div style="border:1px solid #eee;border-radius:10px;padding:15px;margin:18px 0;background:#fafafa;">
        <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;">
          <tr>
            <td><b>📦 Product</b></td>
            <td>${product?.name}</td>
          </tr>
          <tr>
            <td><b>🏷 Brand</b></td>
            <td>${brand?.name ?? "-"}</td>
          </tr>
          <tr>
            <td><b>🗂 Category</b></td>
            <td>${category?.name ?? "-"}</td>
          </tr>
          <tr>
            <td><b>📊 Quantity</b></td>
            <td>
              <span style="
                padding:4px 10px;
                border-radius:20px;
                color:#fff;
                font-size:12px;
                background:${product.qty <= 0 ? "#e53935" : "#ff9800"};
              ">
                ${product.qty <= 0 ? "OUT OF STOCK" : `LOW STOCK (${product.qty})`}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <p style="font-size:14px;">
        🙏 Please arrange new stock supply as soon as possible.
      </p>

      <p style="font-size:13px;color:#777;margin-top:25px;">
        If you have already dispatched this item, you may ignore this message.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f1f3f5;padding:15px;text-align:center;font-size:12px;color:#777;">
      © ${new Date().getFullYear()} Inventory Management System<br/>
      This email was generated automatically. Please do not reply.
    </div>

  </div>
</div>
`;
  try {
    console.log(
      `📧 Sending stock alert email to ${supplier.email} for product ${product.name}`,
    );
    console.log(
      `📧 Email credentials check: USER=${process.env.EMAIL_USER ? "SET" : "NOT SET"}, PASS=${process.env.EMAIL_PASS ? "SET" : "NOT SET"}`,
    );

    await sendEmail(supplier.email, subject, html);

    console.log(`✅ Stock alert email sent successfully to ${supplier.email}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to send stock alert email to ${supplier.email}:`,
      error?.message || error,
    );
    return false;
  }
}

async function checkStockAndAlert(low = 10, critical = 0) {
  // low stock: qty <= low AND qty > critical
  // outstock: qty <= critical

  const products = await Product.findAll({
    where: { qty: { [Op.lte]: low } },
    include: [
      { model: Supplier, as: "Supplier", attributes: ["id", "name", "email"] },
      { model: Brand, as: "Brand", attributes: ["id", "name"] },
      { model: Category, as: "Category", attributes: ["id", "name"] },
    ],
  });

  let alerted = 0;

  // today range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (const p of products) {
    const supplier = p.Supplier;
    if (!supplier?.email) continue;

    const type = p.qty <= critical ? "outstock" : "low_stock";
    const emailType = `email_${type}`; // email_outstock or email_low_stock

    // ✅ prevent spam: do not send same email alert for same product on same day
    const emailSentToday = await Notification.findOne({
      where: {
        reference_id: p.id,
        type: emailType,
        reference_type: "email_tracking",
        [CREATED_FIELD]: { [Op.gte]: today, [Op.lt]: tomorrow },
      },
    });

    if (emailSentToday) continue;

    const sent = await sendStockAlert({
      type,
      product: p,
      supplier,
      brand: p.Brand,
      category: p.Category,
    });

    if (sent) {
      await Notification.create({
        type: emailType,
        title: "Email Alert Sent",
        message: `Email sent to ${supplier.email} for ${p.name}`,
        reference_id: p.id,
        reference_type: "email_tracking",
        is_read: true,
        data: {
          supplier_id: supplier.id,
          supplier_email: supplier.email,
          product_id: p.id,
          product_name: p.name,
          qty: p.qty,
          brand: p.Brand?.name ?? null,
          category: p.Category?.name ?? null,
          email_sent: true,
        },
      });
      alerted++;
    }
  }

  return alerted;
}

module.exports = { checkStockAndAlert };
