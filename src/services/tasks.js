import Task from "../models/task";
import passport from "passport";

const STATUS_ASSIGNED = "Assigned";
const STATUS_IN_PROCESS = "In Process";
const STATUS_FINISHED = "Finished";

exports.find = async (req, res, next) => {
  const { username, status, type, page, limit } = req.query;

  const filters = {};
  if (username) filter.username = username;
  if (status) filter.status = status;
  if (type) filter.type = type;

  try {
    const tasks = await Task.find(filters).sort({ creationDate: -1 });
    res.status(200).send({ tasks, message: `${tasks.length} tasks found` });
  } catch (error) {
    res
      .status(500)
      .send({ message: "An error ocurred fetching the tasks", error });
  }
};

exports.open = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  passport.authenticate("jwt", async (err, user, info) => {
    if (err) res.send(500).send(err);
    if (info) res.send(400).send(info);

    const { username } = user;
    try {
      const task = await Task.findById(id);
      if (!task) res.send(400).send({ message: "task not found" });
      else {
        if (!task.assignedTo.includes(username)) {
          res
            .status(200)
            .send({ task, message: "fetched task in read-only mode" });
        } else {
          if (task.status === STATUS_ASSIGNED) {
            task.startDate = Date.now();
            task.status = STATUS_IN_PROCESS;
            const savedTask = await task.save();
            res.status(200).send({ task: savedTask, message: "task opened" });
          } else {
            res.status(200).send({ task, message: "task fetched" });
          }
        }
      }
    } catch (error) {
      res.status(500).send({ message: "Error opening the task", error });
    }
  })(req, res, next);
};

exports.finish = async (req, res, next) => {
  const { id } = req.params;

  passport.authenticate("jwt", async (err, user, info) => {
    if (err) res.send(500).send(err);
    if (info) res.send(400).send(info);

    const { username } = user;
    try {
      const task = await Task.findById(id);
      if (!task) res.send(400).send({ message: "Task not found" });
      else {
        if (!task.assignedTo.includes(username)) {
          res
            .send(400)
            .send({ message: "Only the task performer can finish this task" });
        } else {
          task.endDate = Date.now();
          task.taskPerformer = username;
          task.status = STATUS_FINISHED;

          const savedTask = await task.save();
          res.status(200).send({ task: savedTask, message: "Task finished" });
        }
      }
    } catch (error) {
      res.status(500).send({ message: "Error finishing the task", error });
    }
  })(req, res, next);
};

exports.create = async (req, res, next) => {
  const { username, description, assignedTo, type } = req.body;
  const newTask = new Task({
    username,
    description,
    assignedTo,
    type,
    status: STATUS_ASSIGNED,
    creationDate: Date.now(),
    startDate: null,
    endDate: null,
  });

  try {
    const savedTask = await newTask.save();
    res.status(201).send({ task: savedTask, message: "Task created." });
  } catch (error) {
    res.status(500).send({ message: "Error creating the task", error });
  }
};
