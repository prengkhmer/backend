// const db = require('../models');
// const Sales = db.Sale;
// const SaleItems = db.SaleItem;
// const Customer = db.Customer;
// const Product = db.Product;
// const sequelize = db.sequelize;
// const NotificationService = require('../services/notificationService');

// // Get all sales
// const getSales = async (req, res) => {
//   try {
//     const sales = await Sales.findAll({
//       include: [
//         { 
//           model: Customer,
//           as: "Customer",
//           attributes: ['id', 'name', 'phone','address']
//         },
//         {
//           model: SaleItems,
//           as: "SaleItems",
//           include: [{ 
//             model: Product,
//             as: "Product",
//             attributes: ['id', 'name', 'barcode', 'qty']
//           }]
//         }
//       ],
//       order: [['sale_date', 'DESC']]
//     });
//     res.status(200).json({
//       success: true,
//       message: "Sales retrieved successfully",
//       count: sales.length,
//       data: sales,
//     });
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving sales",
//       error: e.message,
//     });
//   }
// };

// // Get sale by ID
// const getSaleById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const sale = await Sales.findByPk(id, {
//       include: [
//         { 
//           model: Customer,
//           as: "Customer",
//           attributes: ['id', 'name', 'phone', 'address']
//         },
//         {
//           model: SaleItems,
//           as: "SaleItems",
//           include: [{ 
//             model: Product,
//             as: "Product",
//             attributes: ['id', 'name', 'barcode', 'qty', 'sale_price']
//           }]
//         }
//       ]
//     });

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Sale retrieved successfully",
//       data: sale,
//     });
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving sale",
//       error: e.message,
//     });
//   }
// };

// // Create new sale
// const createSale = async (req, res) => {
//   try {
//     const { customer_id, items, discount = 0, paid } = req.body;
    
//     // Validate items
//     if (!items || !Array.isArray(items) || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Items array is required and must not be empty",
//       });
//     }

//     // Calculate total from items
//     const subtotal = items.reduce((sum, item) => {
//       return sum + (item.quantity * item.unit_price);
//     }, 0);
    
//     const total = subtotal - (discount || 0);
//     const balance = total - (paid || 0);

//     // Start transaction
//     const result = await sequelize.transaction(async (t) => {
//       // Create sale
//       const sale = await Sales.create({
//         customer_id: customer_id || null,
//         total,
//         discount: discount || 0,
//         paid: paid || 0,
//         balance,
//         sale_date: new Date()
//       }, { transaction: t });

//       // Create sale items and update product stock
//       const saleItems = await Promise.all(items.map(async (item) => {
//         // Validate item
//         if (!item.product_id || !item.quantity || !item.unit_price) {
//           throw new Error("Each item must have product_id, quantity, and unit_price");
//         }

//         // Check product availability
//         const product = await Product.findByPk(item.product_id, { transaction: t });
//         if (!product) {
//           throw new Error(`Product with ID ${item.product_id} not found`);
//         }

//         // Check stock availability (using qty field from Product model)
//         const currentQty = product.qty || 0;
//         if (currentQty < item.quantity) {
//           throw new Error(`Insufficient stock for product ${product.name}. Available: ${currentQty}, Requested: ${item.quantity}`);
//         }

//         // Create sale item
//         const saleItem = await SaleItems.create({
//           sale_id: sale.id,
//           product_id: item.product_id,
//           quantity: item.quantity,
//           unit_price: item.unit_price
//         }, { transaction: t });

//         // Update product stock (decrease qty)
//         const newQty = currentQty - item.quantity;
//         await product.update({
//           qty: newQty
//         }, { transaction: t });

//         // Check stock levels and create notifications after quantity update
//         try {
//           await NotificationService.checkProductStockLevel(product.id);
//         } catch (notificationError) {
//           console.error('Error checking stock levels after sale:', notificationError);
//           // Don't fail the sale if notification fails
//         }

//         return saleItem;
//       }));

//       return { sale, items: saleItems };
//     });

//     // Fetch the complete sale with associations
//     const completeSale = await Sales.findByPk(result.sale.id, {
//       include: [
//         { 
//           model: Customer,
//           as: "Customer"
//         },
//         {
//           model: SaleItems,
//           as: "SaleItems",
//           include: [{ 
//             model: Product,
//             as: "Product"
//           }]
//         }
//       ]
//     });

//     // Create sale notification
//     try {
//       const customerName = completeSale.Customer ? completeSale.Customer.name : 'Walk-in Customer';
//       const itemCount = completeSale.SaleItems ? completeSale.SaleItems.length : 0;
//       const totalAmount = completeSale.total ? `$${parseFloat(completeSale.total).toFixed(2)}` : '$0.00';
      
//       await NotificationService.createNotification({
//         type: 'sale_new',
//         title: 'ការលក់ថ្មី - New Sale',
//         message: `ការលក់ #${completeSale.id} បានបង្កើតសម្រាប់អតិថិជន ${customerName}. សរុប: ${totalAmount}. ផលិតផល: ${itemCount}`,
//         referenceId: completeSale.id
//       });
//       console.log(`✅ Sale notification created for sale #${completeSale.id}`);
//     } catch (notificationError) {
//       console.error('Error creating sale notification:', notificationError);
//       // Don't fail the sale if notification fails
//     }

//     res.status(201).json({
//       success: true,
//       message: "Sale created successfully",
//       data: completeSale
//     });
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: "Error creating sale",
//       error: e.message,
//     });
//   }
// };

// // Update sale
// const updateSale = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { customer_id, discount, paid } = req.body;

//     const sale = await Sales.findByPk(id);
//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       });
//     }

//     // Calculate new balance if paid amount changed
//     let balance = sale.balance;
//     if (paid !== undefined) {
//       const total = sale.total - (discount !== undefined ? discount : sale.discount);
//       balance = total - paid;
//     } else if (discount !== undefined) {
//       const total = sale.total - discount;
//       balance = total - sale.paid;
//     }

//     await sale.update({
//       customer_id: customer_id !== undefined ? customer_id : sale.customer_id,
//       discount: discount !== undefined ? discount : sale.discount,
//       paid: paid !== undefined ? paid : sale.paid,
//       balance: balance,
//       total: discount !== undefined ? sale.total - sale.discount + discount : sale.total
//     });

//     const updatedSale = await Sales.findByPk(id, {
//       include: [
//         { 
//           model: Customer,
//           as: "Customer"
//         },
//         {
//           model: SaleItems,
//           as: "SaleItems",
//           include: [{ 
//             model: Product,
//             as: "Product"
//           }]
//         }
//       ]
//     });

//     res.status(200).json({
//       success: true,
//       message: "Sale updated successfully",
//       data: updatedSale,
//     });
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: "Error updating sale",
//       error: e.message,
//     });
//   }
// };

// // Delete sale
// const deleteSale = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const sale = await Sales.findByPk(id, {
//       include: [
//         {
//           model: SaleItems,
//           as: "SaleItems",
//           include: [{ 
//             model: Product,
//             as: "Product"
//           }]
//         }
//       ]
//     });

//     if (!sale) {
//       return res.status(404).json({
//         success: false,
//         message: "Sale not found",
//       });
//     }

//     // Start transaction to restore product stock
//     await sequelize.transaction(async (t) => {
//       // Restore product stock for each sale item
//       await Promise.all(sale.SaleItems.map(async (saleItem) => {
//         const product = await Product.findByPk(saleItem.product_id, { transaction: t });
//         if (product) {
//           const newQty = (product.qty || 0) + saleItem.quantity;
//           await product.update({
//             qty: newQty
//           }, { transaction: t });

//           // Check stock levels and create notifications after quantity restoration
//           try {
//             await NotificationService.checkProductStockLevel(product.id);
//           } catch (notificationError) {
//             console.error('Error checking stock levels after sale deletion:', notificationError);
//             // Don't fail the deletion if notification fails
//           }
//         }
//       }));

//       // Delete sale items first
//       await SaleItems.destroy({
//         where: { sale_id: id },
//         transaction: t
//       });

//       // Delete sale
//       await sale.destroy({ transaction: t });
//     });

//     res.status(200).json({
//       success: true,
//       message: "Sale deleted successfully",
//       data: { id: parseInt(id) },
//     });
//   } catch (e) {
//     res.status(500).json({
//       success: false,
//       message: "Error deleting sale",
//       error: e.message,
//     });
//   }
// };

// module.exports = {
//   getSales,
//   getSaleById,
//   createSale,
//   updateSale,
//   deleteSale,
// };


// const db = require("../models");
const db = require('../models');
const Sales = db.Sale;
const SaleItems = db.SaleItem;
const Customer = db.Customer;
const Product = db.Product;
const sequelize = db.sequelize;
const NotificationService = require("../services/notificationService");

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sales.findAll({
      include: [
        {
          model: Customer,
          as: "Customer",
          attributes: ["id", "name", "phone", "address"],
        },
        {
          model: SaleItems,
          as: "SaleItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["id", "name", "barcode", "qty"],
            },
          ],
        },
      ],
      order: [["sale_date", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Sales retrieved successfully",
      count: sales.length,
      data: sales,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving sales",
      error: e.message,
    });
  }
};

// Get sale by ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "Customer",
          attributes: ["id", "name", "phone", "address"],
        },
        {
          model: SaleItems,
          as: "SaleItems",
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["id", "name", "barcode", "qty", "sale_price"],
            },
          ],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sale retrieved successfully",
      data: sale,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving sale",
      error: e.message,
    });
  }
};

// ✅ Create new sale (FIXED)
const createSale = async (req, res) => {
  try {
    const { customer_id, items, discount = 0, paid = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and must not be empty",
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const total = subtotal - (discount || 0);
    const balance = total - (paid || 0);

    // ✅ IMPORTANT: keep list of product ids (check AFTER commit)
    const affectedProductIds = new Set();

    const { saleId } = await sequelize.transaction(async (t) => {
      const sale = await Sales.create(
        {
          customer_id: customer_id || null,
          total,
          discount: discount || 0,
          paid: paid || 0,
          balance,
          sale_date: new Date(),
        },
        { transaction: t }
      );

      await Promise.all(
        items.map(async (item) => {
          if (!item.product_id || !item.quantity || !item.unit_price) {
            throw new Error("Each item must have product_id, quantity, and unit_price");
          }

          const product = await Product.findByPk(item.product_id, { transaction: t });
          if (!product) throw new Error(`Product with ID ${item.product_id} not found`);

          const currentQty = product.qty || 0;
          if (currentQty < item.quantity) {
            throw new Error(
              `Insufficient stock for product ${product.name}. Available: ${currentQty}, Requested: ${item.quantity}`
            );
          }

          await SaleItems.create(
            {
              sale_id: sale.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
            },
            { transaction: t }
          );

          await product.update({ qty: currentQty - item.quantity }, { transaction: t });

          affectedProductIds.add(product.id);
        })
      );

      return { saleId: sale.id };
    });

    // ✅ Fetch sale AFTER commit
    const completeSale = await Sales.findByPk(saleId, {
      include: [
        { model: Customer, as: "Customer" },
        { model: SaleItems, as: "SaleItems", include: [{ model: Product, as: "Product" }] },
      ],
    });

    // ✅ sale_new notification (referenceType="sale")
    try {
      const customerName = completeSale.Customer ? completeSale.Customer.name : "Walk-in Customer";
      const itemCount = completeSale.SaleItems ? completeSale.SaleItems.length : 0;
      const totalAmount = `$${parseFloat(completeSale.total || 0).toFixed(2)}`;

      await NotificationService.createNotification({
        type: "sale_new",
        title: "ការលក់ថ្មី - New Sale",
        message: `ការលក់ #${completeSale.id} សម្រាប់ ${customerName}. សរុប: ${totalAmount}. ផលិតផល: ${itemCount}`,
        referenceId: completeSale.id,
        referenceType: "sale",
      });
    } catch (err) {
      console.error("Error creating sale_new notification:", err);
    }

    // ✅ AFTER COMMIT: now check product stock level (reads updated qty)
    for (const pid of affectedProductIds) {
      try {
        await NotificationService.checkProductStockLevel(pid, 10, 5);
      } catch (err) {
        console.error("Error checking stock after sale:", err);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      data: completeSale,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error creating sale",
      error: e.message,
    });
  }
};

// Update sale
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, discount, paid } = req.body;

    const sale = await Sales.findByPk(id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const newDiscount = discount !== undefined ? discount : sale.discount;
    const newPaid = paid !== undefined ? paid : sale.paid;

    const newTotal = sale.total - (sale.discount || 0) + (newDiscount || 0);
    const newBalance = newTotal - (newPaid || 0);

    await sale.update({
      customer_id: customer_id !== undefined ? customer_id : sale.customer_id,
      discount: newDiscount,
      paid: newPaid,
      total: newTotal,
      balance: newBalance,
    });

    const updatedSale = await Sales.findByPk(id, {
      include: [
        { model: Customer, as: "Customer" },
        { model: SaleItems, as: "SaleItems", include: [{ model: Product, as: "Product" }] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      data: updatedSale,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error updating sale",
      error: e.message,
    });
  }
};

// ✅ Delete sale (FIXED)
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sales.findByPk(id, {
      include: [
        {
          model: SaleItems,
          as: "SaleItems",
          include: [{ model: Product, as: "Product" }],
        },
      ],
    });

    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }

    const affectedProductIds = new Set(sale.SaleItems.map((it) => it.product_id));

    await sequelize.transaction(async (t) => {
      await Promise.all(
        sale.SaleItems.map(async (saleItem) => {
          const product = await Product.findByPk(saleItem.product_id, { transaction: t });
          if (!product) return;

          const newQty = (product.qty || 0) + saleItem.quantity;
          await product.update({ qty: newQty }, { transaction: t });
        })
      );

      await SaleItems.destroy({ where: { sale_id: id }, transaction: t });
      await sale.destroy({ transaction: t });
    });

    // ✅ AFTER COMMIT: re-check stock (autoDismiss if ok)
    for (const pid of affectedProductIds) {
      try {
        await NotificationService.checkProductStockLevel(pid, 10, 5);
      } catch (err) {
        console.error("Error checking stock after delete:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
      data: { id: parseInt(id, 10) },
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error deleting sale",
      error: e.message,
    });
  }
};

module.exports = {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
};
