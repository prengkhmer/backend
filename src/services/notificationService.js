// services/notificationService.js
const db = require("../models");
const { Op } = require('sequelize');
const Notification = db.Notification;
const Product = db.Product;
const Brand = db.Brand;
const Category = db.Category;

class NotificationService {
  static async createNotification({
    type,
    title,
    message,
    referenceId = null,
    referenceType = "product",
  }) {
    try {
      // ✅ Fetch product details including expire_date if referenceId is provided
      let notificationData = {
        type,
        title,
        message,
        reference_id: referenceId,
        reference_type: referenceType,
        data: {}, // Initialize empty data
      };

      if (referenceId && referenceType === "product") {
        const product = await Product.findByPk(referenceId, {
          attributes: ["id", "name", "expire_date", "qty", "barcode"],
        });

        if (product) {
          notificationData.data = {
            product_id: product.id,
            product_name: product.name,
            expire_date: product.expire_date, // ✅ Store expire_date
            quantity: product.qty,
            barcode: product.barcode,
          };
        }
      }

      return await Notification.create(notificationData);
    } catch (error) {
      throw error;
    }
  }

  static async getUnreadCount() {
    return await Notification.count({
      where: { is_read: false },
    });
  }

  static async getRecentNotifications(limit = 10, unreadOnly = false) {
    const where = {};
    if (unreadOnly) {
      where.is_read = false;
    }

    return await Notification.findAll({
      where,
      include: [
        {
          model: Product,
          as: "Product",
          attributes: ["id", "name", "expire_date"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
    });
  }

  static async getNotificationById(id) {
    return await Notification.findByPk(id, {
      include: [
        {
          model: Product,
          as: "Product",
          attributes: ["id", "name", "expire_date"],
          required: false,
        },
      ],
    });
  }

  static async markAllAsRead() {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      { where: { is_read: false } },
    );
    return updatedCount;
  }

  static async deleteNotification(id) {
    const notification = await Notification.findByPk(id);
    if (notification) {
      await notification.destroy();
      return true;
    }
    return false;
  }

  static async markAsRead(notificationId) {
    const notification = await Notification.findByPk(notificationId);
    if (notification) {
      notification.is_read = true;
      await notification.save();
    }
    return notification;
  }

  static async checkStockLevels(
    lowStockThreshold = 10,
    criticalStockThreshold = 5,
  ) {
    try {
      const products = await Product.findAll({
        include: [
          { model: Brand, as: "Brand", attributes: ["name"] },
          { model: Category, as: "Category", attributes: ["name"] },
        ],
      });

      let notificationsCreated = 0;

      for (const product of products) {
        const currentQty = product.qty || 0;
        const productName = product.name || "Unknown Product";
        const brandName = product.Brand?.name || "Unknown Brand";
        const categoryName = product.Category?.name || "Unknown Category";

        const existingNotification = await Notification.findOne({
          where: {
            reference_id: product.id,
            type: ["out_of_stock", "low_stock"],
            created_at: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          order: [["created_at", "DESC"]],
        });

        // Out of stock notification
        if (currentQty === 0) {
          if (
            !existingNotification ||
            existingNotification.type !== "out_of_stock"
          ) {
            await this.createNotification({
              type: "out_of_stock",
              title: "Out of Stock Alert",
              message: `${productName} (${brandName}) is completely out of stock. Barcode: ${product.barcode}`,
              referenceId: product.id,
            });
            notificationsCreated++;
          }
        }
        // Critical low stock notification
        else if (currentQty <= criticalStockThreshold) {
          if (
            !existingNotification ||
            (existingNotification.type !== "out_of_stock" &&
              existingNotification.type !== "low_stock")
          ) {
            await this.createNotification({
              type: "low_stock",
              title: "Critical Low Stock Alert",
              message: `${productName} (${brandName}) is critically low. Only ${currentQty} items remaining. Category: ${categoryName}`,
              referenceId: product.id,
            });
            notificationsCreated++;
          }
        }
        // Low stock notification
        else if (currentQty <= lowStockThreshold) {
          if (
            !existingNotification ||
            existingNotification.type === "out_of_stock"
          ) {
            await this.createNotification({
              type: "low_stock",
              title: "Low Stock Alert",
              message: `${productName} (${brandName}) is running low. Current stock: ${currentQty}. Category: ${categoryName}`,
              referenceId: product.id,
            });
            notificationsCreated++;
          }
        }
      }

      return notificationsCreated;
    } catch (error) {
      throw error;
    }
  }

  static async autoDismissStockNotifications(
    productId,
    currentQty,
    lowStockThreshold = 10,
  ) {
    try {
      if (currentQty > lowStockThreshold) {
        const dismissedCount = await Notification.destroy({
          where: {
            reference_id: productId,
            type: ["out_of_stock", "low_stock"],
            is_read: false,
          },
        });

        return dismissedCount;
      }

      return 0;
    } catch (error) {
      throw error;
    }
  }

  static async checkProductStockLevel(
    productId,
    lowStockThreshold = 10,
    criticalStockThreshold = 5,
  ) {
    try {
      const product = await Product.findByPk(productId, {
        include: [
          { model: Brand, as: "Brand", attributes: ["name"] },
          { model: Category, as: "Category", attributes: ["name"] },
        ],
      });

      if (!product) {
        return false;
      }

      const currentQty = product.qty || 0;
      const productName = product.name || "Unknown Product";
      const brandName = product.Brand?.name || "Unknown Brand";
      const categoryName = product.Category?.name || "Unknown Category";

      await this.autoDismissStockNotifications(
        productId,
        currentQty,
        lowStockThreshold,
      );

      const existingNotification = await Notification.findOne({
        where: {
          reference_id: product.id,
          type: ["out_of_stock", "low_stock"],
          created_at: {
            [Op.gte]: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        },
        order: [["created_at", "DESC"]],
      });

      let notificationCreated = false;

      if (currentQty === 0) {
        if (
          !existingNotification ||
          existingNotification.type !== "out_of_stock"
        ) {
          await this.createNotification({
            type: "out_of_stock",
            title: "Product Out of Stock",
            message: `${productName} (${brandName}) is now out of stock. Please reorder immediately. Barcode: ${product.barcode}`,
            referenceId: product.id,
          });
          notificationCreated = true;
        }
      } else if (currentQty <= criticalStockThreshold) {
        if (
          !existingNotification ||
          (existingNotification.type !== "out_of_stock" &&
            existingNotification.type !== "low_stock")
        ) {
          await this.createNotification({
            type: "low_stock",
            title: "Critical Stock Level",
            message: `${productName} (${brandName}) has reached critical stock level. Only ${currentQty} items left. Category: ${categoryName}`,
            referenceId: product.id,
          });
          notificationCreated = true;
        }
      } else if (currentQty <= lowStockThreshold) {
        if (
          !existingNotification ||
          existingNotification.type === "out_of_stock"
        ) {
          await this.createNotification({
            type: "low_stock",
            title: "Low Stock Warning",
            message: `${productName} (${brandName}) stock is getting low. Current quantity: ${currentQty}. Category: ${categoryName}`,
            referenceId: product.id,
          });
          notificationCreated = true;
        }
      }

      return notificationCreated;
    } catch (error) {
      throw error;
    }
  }

  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const deletedCount = await Notification.destroy({
        where: {
          created_at: {
            [Op.lt]: cutoffDate,
          },
          is_read: true,
        },
      });

      return deletedCount;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationService;
