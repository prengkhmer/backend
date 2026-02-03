const NotificationService = require("../services/notificationService");
const db = require("../models");
const { Op } = require("sequelize");
const { Product, Brand, Category, Notification } = db;

class ExpirationChecker {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    // this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours - recommended for production
    this.checkInterval = 1 * 60 * 1000; // 1 hours test for production

    this.autoDismissInterval = null;
  }

  start() {
    if (this.isRunning)
      return console.log("Expiration checker already running");

    console.log("🚀 Starting expiration checker...");
    console.log(`Check every ${this.checkInterval / (1000 * 60 * 60)} hours`);

    this.runCheck();
    this.intervalId = setInterval(() => this.runCheck(), this.checkInterval);

    this.startAutoDismiss();
    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.intervalId);
    clearInterval(this.autoDismissInterval);
    this.isRunning = false;
    console.log("🛑 Expiration checker stopped");
  }

  startAutoDismiss() {
    console.log(
      "Starting auto-dismiss for outdated notifications (every 15 min)",
    );
    this.dismissOldExpirationNotifications();
    this.autoDismissInterval = setInterval(
      () => this.dismissOldExpirationNotifications(),
      15 * 60 * 1000,
    );
  }

  async dismissOldExpirationNotifications() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only care about expiring_soon that are now invalid
      const notifications = await Notification.findAll({
        where: {
          type: "expiring_soon",
          is_read: false,
        },
        include: [
          {
            model: Product,
            as: "Product",
            attributes: ["id", "expire_date"],
            required: true,
          },
        ],
      });

      let dismissed = 0;

      for (const n of notifications) {
        if (!n.Product?.expire_date) continue;

        const expire = new Date(n.Product.expire_date);
        expire.setHours(0, 0, 0, 0);

        const daysLeft = Math.ceil((expire - today) / 86400000);

        // Dismiss only if more than 7 days left
        if (daysLeft > 7) {
          await n.destroy();
          dismissed++;
          console.log(
            `Dismissed outdated expiring_soon for product ${n.Product.id} (${daysLeft} days)`,
          );
        }
      }

      if (dismissed > 0) {
        console.log(`Dismissed ${dismissed} outdated notifications`);
      }
    } catch (err) {
      console.error("Auto-dismiss error:", err);
    }
  }

  async runCheck() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const products = await Product.findAll({
        where: { expire_date: { [Op.ne]: null } },
        include: [
          { model: Brand, as: "Brand", attributes: ["name"] },
          { model: Category, as: "Category", attributes: ["name"] },
        ],
      });

      let createdCount = 0;

      for (const p of products) {
        const expire = new Date(p.expire_date);
        expire.setHours(0, 0, 0, 0);

        const days = Math.ceil((expire - today) / 86400000);

        if (days <= 7 && days >= -3) {
          // reasonable range
          const created = await this.checkAndCreateExpirationNotification(
            p,
            days,
          );
          if (created) createdCount++;
        }
      }

      console.log(
        `Processed ${products.length} products → ${createdCount} notifications`,
      );
    } catch (err) {
      console.error("Expiration check error:", err);
    }
  }

  async checkAndCreateExpirationNotification(product, daysUntilExpiration) {
    try {
      let type = "";
      let title = "";
      let message = "";

      const name = product.name || "Unknown Product";

      if (daysUntilExpiration === 7) {
        type = "expiring_soon";
        title = "ផលិតផលជិតផុតកំណត់";
        message = `ផលិតផល "${name}" នឹងផុតកំណត់ក្នុងរយៈពេល 7 ថ្ងៃទៀត។`;
      } else if (daysUntilExpiration === 0) {
        type = "expiring_today";
        title = "ផលិតផលផុតកំណត់ថ្ងៃនេះ";
        message = `ផលិតផល "${name}" ផុតកំណត់ថ្ងៃនេះ! សូមពិនិត្យភ្លាម។`;
      } else if (daysUntilExpiration < 0 && daysUntilExpiration >= -3) {
        type = "expired";
        const overdue = Math.abs(daysUntilExpiration);
        title = "ផលិតផលបានផុតកំណត់";
        message = `ផលិតផល "${name}" ផុតកំណត់ ${overdue} ថ្ងៃហើយ! សូមយកចេញ។`;
      } else {
        return false;
      }

      // Clean old notifications of same type for this product
      await Notification.destroy({
        where: {
          reference_id: product.id,
          type: ["expiring_soon", "expiring_today", "expired"],
        },
      });

      // Prevent duplicate same-day notification
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const exists = await Notification.findOne({
        where: {
          reference_id: product.id,
          type,
          created_at: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart },
        },
      });

      if (exists) return false;

      await NotificationService.createNotification({
        type,
        title,
        message,
        referenceId: product.id,
        // Optional: include expire_date in data for frontend
        data: { expire_date: product.expire_date },
      });

      console.log(`Created ${type} notification for ${name}`);
      return true;
    } catch (err) {
      console.error(
        `Failed to create notification for product ${product.id}:`,
        err,
      );
      return false;
    }
  }
}

const expirationChecker = new ExpirationChecker();
module.exports = expirationChecker;
