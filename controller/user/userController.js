const env = require("dotenv").config();

const pageNotFound = async (req, res) => {
  try {
    const url = req.originalUrl;
    res.render("404", { requestedUrl: url });
  } catch (error) {
    res.send("Error rendering 404 page");
  }
};

const loadHomepage = async (req, res) => {
  try {
    return res.render("Home");
  } catch (error) {
    console.log("Home page is not render");
    res.status(500).send("server error");
  }
};
module.exports = {
  loadHomepage,
  pageNotFound,
};
