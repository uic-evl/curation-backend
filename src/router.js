const uploadController = require("./upload-controller");
const users = require("./services/users");
const tasks = require("./services/tasks");

const opts = { session: false };

module.exports = function (app, passport) {
  app.post("/api/document/upload", uploadController.uploadPdfs);

  // security
  app.post("/api/register", users.register);
  app.get("/api/login", users.login);
  app.get("/api/users", passport.authenticate("jwt", opts), users.find);

  app.get("/api/tasks", passport.authenticate("jwt", opts), tasks.find);
  app.post("/api/tasks", passport.authenticate("jwt", opts), tasks.create);
  app.put("/api/tasks/:id", tasks.open);
  app.put("/api/tasks/:id/finish", tasks.finish);
};
