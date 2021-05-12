import express, {Router} from 'express'
import {registerUser, login} from '../resources/users/user-controller'
import * as taskController from '../resources/tasks/task-controller'

const opts = {session: false}

const getRouter = passport => {
  const auth = passport.authenticate('jwt', opts)

  const router = express.Router()
  router.post('/users/register', registerUser)
  router.post('/users/login', login)

  router.get('/tasks', auth, taskController.find)
  router.get('/tasks/:id', auth, taskController.getById)
  router.patch('/tasks/:id/start', auth, taskController.startTask)
  router.patch('/tasks/:id/finish', auth, taskController.finishTask)
  router.post('/tasks', auth, taskController.create)

  return router
}

export default getRouter
