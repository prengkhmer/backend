// const db = require("../models");
// const Supplier = db.Supplier;
// const getAllSupplier = async (req, res) => {
//   try {
//     const suppliers = await Supplier.findAll();
//     res.status(200).json({
//       message: "Suppliers retrieved successfully",
//       suppliers,
//     });
//   } catch (e) {
//     res.status(500).json({
//       message: "Error retrieving suppliers",
//       error: e.message,
//     });
//   }
// };
// const getSupplierById = async(req ,res)=>{
//     const {id}= req.params;
//     try{
//         const supplier = await Supplier.findByPk(id);
//         if (!supplier) {
//             return res.status(404).json({
//                 message: "Supplier not found"
//             });
//         }
//         res.status(200).json({
//             message:"Supplier found by ID",
//             supplier,
//         })
//     }catch(e){
//         res.status(500).json({
//             message:'error supplier find',error:e.message,
//         })
//     }
// }
// const createSupplier = async (req, res) => {
//   try {
//     const { name, phone_first, phone_second, address } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({
//         message: "Name is required"
//       });
//     }

//     const newSupplier = await Supplier.create({
//       name,
//       phone_first,
//       phone_second,
//       address,
//     });
//     res.status(201).json({
//         message:"create supplier success",
//         newSupplier,
//     });
//   } catch (e) {
//     res.status(500).json({
//         message:"error supplier create",error:e.message,
//     });
//   }
// };

// const updateSupplier = async (req , res)=>{
//     const {id}= req.params;
//     const {name , phone_first , phone_second , address} = req.body;
//     try{
//         const supplier = await Supplier.findByPk(id);
//         if (!supplier) {
//             return res.status(404).json({
//                 message: "Supplier not found"
//             });
//         }
//         await supplier.update({name , phone_first , phone_second , address});
//         res.status(200).json({
//             message:'update supplier success',
//             supplier,
//         });
//     }catch(e){
//         res.status(500).json({
//             message:"error update supplier",error:e.message,
//         });
//     }
// }

// const deleteSupplier = async(req  ,res)=>{
//     const {id}=req.params;
//     try{
//         const supplier = await Supplier.findByPk(id);
//         if (!supplier) {
//             return res.status(404).json({
//                 message: "Supplier not found"
//             });
//         }
//         await supplier.destroy();
//         res.status(200).json({
//             message:"delete supplier success",
//             supplier,
//         });
//     }catch(e){
//         res.status(500).json({
//             message:"error delete supplier",error:e.message,
//         });
//     }
// }

// module.exports = {
//   getAllSupplier,
//   getSupplierById,
//   createSupplier,
//   updateSupplier,
//   deleteSupplier,
// };

// const db = require("../models");
const db = require('../models');
const Supplier = db.Supplier;

// Simple email validation (basic)
const isValidEmail = (email) => {
  if (!email) return true; // allow null/empty
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getAllSupplier = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Suppliers retrieved successfully",
      suppliers,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving suppliers",
      error: e.message,
    });
  }
};

const getSupplierById = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier found by ID",
      supplier,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error finding supplier",
      error: e.message,
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, email, phone_first, phone_second, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      email: email?.trim() || null,
      phone_first: phone_first?.trim() || null,
      phone_second: phone_second?.trim() || null,
      address: address?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Create supplier success",
      supplier,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error creating supplier",
      error: e.message,
    });
  }
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const { name, email, phone_first, phone_second, address } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    await supplier.update({
      name: name !== undefined ? name.trim() : supplier.name,
      email: email !== undefined ? email?.trim() || null : supplier.email,
      phone_first:
        phone_first !== undefined
          ? phone_first?.trim() || null
          : supplier.phone_first,
      phone_second:
        phone_second !== undefined
          ? phone_second?.trim() || null
          : supplier.phone_second,
      address:
        address !== undefined ? address?.trim() || null : supplier.address,
    });

    return res.status(200).json({
      success: true,
      message: "Update supplier success",
      supplier,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error updating supplier",
      error: e.message,
    });
  }
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  try {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await supplier.destroy();

    return res.status(200).json({
      success: true,
      message: "Delete supplier success",
      supplier,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error deleting supplier",
      error: e.message,
    });
  }
};

module.exports = {
  getAllSupplier,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
