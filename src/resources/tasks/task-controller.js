import taskDB from './task-model'
import passport from 'passport'
import {TaskStatus} from '../../utils/constants'

export const find = async (req, res, next) => {
  const {username, status, type, taxonomy} = req.query

  passport.authenticate('jwt', async (err, _, info) => {
    if (err) res.send(500).send(err)
    if (info) res.send(400).send(info)

    const filters = {}
    if (username) filters.username = username
    if (status) filters.status = status
    if (type) filters.type = type
    if (taxonomy) filters.taxonomy = taxonomy

    const tasks = await taskDB.find(filters).sort({creationDate: -1})
    res.status(200).send(tasks)
  })(req, res, next)
}

export const getById = async (req, res, next) => {
  //TODO: do i want to open the task in read-only mode?
  const {id} = req.params

  passport.authenticate('jwt', async (err, _, info) => {
    if (err) res.send(500).send(err)
    if (info) res.send(400).send(info)

    const task = await taskDB.findById(id)
    if (!task) res.send(400).send({message: 'task not found'})
    else {
      res.send(200).send(task)
    }
  })(req, res, next)
}

export const startTask = async (req, res, next) => {
  const {id} = req.params

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) res.send(500).send(err)
    if (info) res.send(400).send(info)

    const {username} = user

    const task = await taskDB.findById(id)
    // TODO: i should return some status to tell that the task cannot
    // be editted?
    if (!task) res.send(400).send({message: 'task not found'})
    if (!task.assignedTo.includes(username))
      res.send(400).send({message: 'user not assigned to task'})
    if (task.status !== TaskStatus.ASSIGNED) {
      res.send(400).send({
        message: 'Cannot start task, task has been started or finished.',
      })
    }

    task.startDate = Date.now()
    task.status = TaskStatus.IN_PROCESS
    const updatedTask = await task.save()
    return res.status(200).send(updatedTask)
  })(req, res, next)
}

export const finishTask = async (req, res, next) => {
  const {id} = req.params

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) res.send(500).send(err)
    if (info) res.send(400).send(info)

    const {username} = user

    const task = await taskDB.findById(id)
    if (!task) res.send(400).send({message: 'task not found'})
    if (!task.assignedTo.includes(username))
      res.send(400).send({message: 'user not assigned to task'})
    if (!task.status !== TaskStatus.IN_PROCESS)
      res.send(400).send({message: 'task not in process.'})

    task.endDate = Date.now()
    task.taskPerformer = username
    task.status = TaskStatus.FINISHED
    const finishedTask = await task.save()
    return res.status(200).send(finishedTask)
  })(req, res, next)
}

export const create = async (req, res, next) => {
  const {username, description, assignedTo, type, taxonomy} = req.body

  passport.authenticate('jwt', async (err, user, info) => {
    const newTask = new Task({
      username,
      description,
      assignedTo,
      type,
      status: TaskStatus.ASSIGNED,
      creationDate: Date.now(),
      taxonomy,
      startDate: null,
      endDate: null,
    })

    const savedTask = await newTask.save()
    res.status(200).send(savedTask)
  })(req, res, next)
}
