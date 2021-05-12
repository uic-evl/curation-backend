import taskDB from './task-model'
import passport from 'passport'
import {TaskStatus, TaskType} from '../../utils/constants'

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

export const createFromPipeline = async (req, res, next) => {
  const {documentId, documentName, organization, groupname, taxonomy} = req.body

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) res.send(500).send(err)
    if (info) res.send(400).send(info)

    const nextUser = getNextUser(organization, groupname)
    if (!nextUser) res.status(400).send({message: 'no user available for task'})

    const newTask = new Task({
      description: documentName,
      assignedTo: [nextUser.username],
      type: TaskType.LABEL,
      status: TaskStatus.ASSIGNED,
      creationDate: Date.now(),
      taxonomy,
      startDate: null,
      endDate: null,
      documentId,
    })

    const savedTask = await newTask.save()
    res.status(200).send(savedTask)
  })(req, res, next)
}

const getNextUser = (organization, groupname) => {
  const countTasksPerUser = await taskDB.aggregate([
    {
      $unwind: {
        path: '$assignedTo',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedTo',
        foreignField: 'username',
        as: 'user',
      },
    },
    {
      $unwind: {
        path: '$user',
      },
    },
    {
      $match: {
        status: {$ne: TaskStatus.FINISHED},
        'user.organization': organization,
        'user.groups': {$in: [groupname]},
      },
    },
    {
      $group: {
        _id: {assignedTo: '$assignedTo', _id: '$user._id'},
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: 1,
      },
    },
  ])

  if (!countTasksPerUser) return null
  else
    return {
      _id: countTasksPerUser[0]._id._id,
      username: countTasksPerUser[0]._id.assignedTo,
    }
}
