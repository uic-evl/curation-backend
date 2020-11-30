const uploadController = require("./upload-controller");

module.exports = function (app) {
  app.post("/document/upload", uploadController.uploadPdfs);
};
