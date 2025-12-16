const Product = require("../../models/productSchema");
const Brand = require("../../models/brandSchema");
const Category = require("../../models/categorySchema");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const loadProduct = async (req, res) => {
  try {
    let search = req.query.search || "";
    let page = parseInt(req.query.page) || 1;
    let limit = 6;
    let query = search
      ? { isDeleted: false, productName: { $regex: search, $options: "i" } }
      : { isDeleted: false };

    const totalProduct = await Product.countDocuments(query);
    const productData = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("brand")
      .populate("category")
      .exec();

    let totalpages = Math.ceil(totalProduct / limit);
    const brands = await Brand.find({ isListed: true, isDeleted: false });
    const categories = await Category.find({
      isListed: true,
      isDeleted: false,
    });
    res.render("addproduct", {
      product: productData,
      currentPage: page,
      totalPages: totalpages,
      totalProducts: totalProduct,
      search,
      brand: brands,
      cat: categories,
    });
  } catch (error) {
    console.error("server error");
  }
};

const addProduct = async (req, res) => {
  try {
    const product = req.body;

    const productExists = await Product.findOne({
      productName: product.productName,
    });
    if (productExists) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Product already exists, please try another name",
        });
    }

    const targetDir = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "uploads",
      "product-images"
    );
    const uploadsDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "product-images"
    );

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const originalImagePath = req.files[i].path;
        const resizedImagePath = path.join(
          "public",
          "uploads",
          "product-images",
          req.files[i].filename
        );

        await sharp(originalImagePath)
          .resize({ width: 440, height: 440 })
          .toFile(resizedImagePath);

        images.push(req.files[i].filename);
      }
    }

    const categoryId = await Category.findOne({ name: product.category });
    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category name selected" });
    }

    const brandId = await Brand.findOne({ name: product.brand });
    if (!brandId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid brand selected" });
    }

    const newProduct = new Product({
      productName: product.productName,
      description: product.description,
      brand: brandId._id,
      category: categoryId._id,
      salePrice: product.salePrice,
      createdOn: new Date(),
      quantity: product.quantity,
      productImages: images,
      status: "Available",
    });

    await newProduct.save();
    return res
      .status(201)
      .json({ success: true, message: "Product added successfully!" });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports = {
  loadProduct,
  addProduct,
};
