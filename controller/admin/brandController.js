const Brand = require("../../models/brandSchema");

const loadBrand = async (req, res) => {
  let search = req.query.search || "";
  let page = parseInt(req.query.page) || 1;
  let limit = 6;
  let query = search
    ? { isDeleted: false, name: { $regex: search, $options: "i" } }
    : { isDeleted: false };

  const totalbrand = await Brand.countDocuments(query);
  const brandData = await Brand.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  let totalpages = Math.ceil(totalbrand / limit);
  res.render("brand", {
    brand: brandData,
    currentPage: page,
    totalPages: totalpages,
    totalbrand: totalbrand,
    search,
  });
};

const addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      req.session.message = "All fields are required";
      return res.redirect("/admin/brand");
    }
    const existing = await Brand.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });
    if (existing) {
      req.session.message = "Brand already exists";
      return res.redirect("/admin/brand");
    }
    await Brand.create({
      name,
      description,
      isDeleted: false,
    });
    req.session.message = "Brand added successfully";
    return res.redirect("/admin/brand");
  } catch (error) {
    console.log("Error:", error);
    req.session.message = "Server error!";
    return res.redirect("/admin/category");
  }
};

const editBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    await Brand.findByIdAndUpdate(id, {
      name,
      description,
    });
    return res.status(200).json({ message: "Updated" });
  } catch (error) {
    console.log("Edit error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const newStatus = req.body.isListed;

    const updateBrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: { isListed: newStatus } },
      { new: true }
    );
    if (!updateBrand) {
      return res.status(404).json({ message: "brand not found" });
    }
    res
      .status(200)
      .json({
        message: "successfully updated",
        newStatus: updateBrand.isListed,
      });
  } catch (error) {
    console.error("Error updating brand status:", error);
    res.status(500).json({ message: "server error" });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const deletebrand = await Brand.findByIdAndUpdate(
      brandId,
      { $set: { isDeleted: true } },
      { $new: true }
    );
    if (!deletebrand) {
      return res.status(404).json({ message: "brand not found" });
    }
    res.status(200).json({ message: "brand deleted" });
  } catch (error) {
    console.error("Error performing soft delete for brand:", error);
    res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  loadBrand,
  addBrand,
  editBrand,
  updateBrand,
  deleteBrand,
};
