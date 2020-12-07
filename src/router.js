const uploadController = require("./upload-controller");
const users = require("./services/users");

module.exports = function (app, passport) {
  app.post("/api/document/upload", uploadController.uploadPdfs);

  // security
  app.post("/api/register", users.register);
  app.get("/api/login", users.login);
  app.get("/api/users", passport.authenticate("jwt"), users.find);
};
