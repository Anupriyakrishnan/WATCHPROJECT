const Category = require("../../models/categorySchema");

const loadCategory = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = 6;
  let search = req.query.search || "";
  let query = search
    ? { isDeleted: false, name: { $regex: search, $options: "i" } }
    : { isDeleted: false };
  const totalcategory = await Category.countDocuments(query);
  const categoryData = await Category.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  let totalpages = Math.ceil(totalcategory / limit);

  res.render("category", {
    cat: categoryData,
    currentPage: page,
    totalPages: totalpages,
    totalCategories: totalcategory,
    search,
  });
};

const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      req.session.message = "All fields are required";
      return res.redirect("/admin/category");
    }

    const existing = await Category.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });

    if (existing) {
      req.session.message = "Category already exists";
      return res.redirect("/admin/category");
    }

    await Category.create({
      name,
      description,
      isDeleted: false,
    });

    req.session.message = "Category added successfully";
    return res.redirect("/admin/category");
  } catch (error) {
    console.log("Error:", error);
    req.session.message = "Server error!";
    return res.redirect("/admin/category");
  }
};

const editCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;

    await Category.findByIdAndUpdate(id, {
      name,
      description,
    });

    return res.status(200).json({ message: "Updated" });
  } catch (error) {
    console.log("Edit error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const newStatus = req.body.isListed;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { isListed: newStatus } },
      { new: true } // return a new document
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "category not found" });
    }

    res.status(200).json({
      message: "successfully changed the status.",
      newStatus: updatedCategory.isListed,
    });
  } catch (error) {
    console.error("Error updating category status:", error);
    res.status(500).json({ message: "server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const deleteCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!deleteCategory) {
      return res.status(404).json({ message: "category not found" });
    }
    res.status(200).json({ message: "category deleted" });
  } catch (error) {
    console.error("Error performing soft delete for category:", error);
    res.status(500).json({ message: "server error" });
  }
};

module.exports = {
  loadCategory,
  addCategory,
  editCategory,
  updateCategory,
  deleteCategory,
};
