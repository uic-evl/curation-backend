import express, {Router} from 'express'
import * as userController from '../resources/users/user-controller'
import * as taskController from '../resources/tasks/task-controller'
import * as figureController from '../resources/figures/figure-controller'
import * as modalityController from '../resources/modalities/modality-controller'
import * as documentController from '../resources/documents/document-controller'

const opts = {session: false}

const getRouter = passport => {
  const auth = passport.authenticate('jwt', opts)

  const router = express.Router()
  router.post('/users/register', userController.registerUser)
  router.post('/users/login', userController.login)
  router.get('/users/me', auth, userController.me)

  // TODO: missing create task from pipeline -> start from pipeline in old code
  router.get('/tasks', auth, taskController.find)
  router.get('/tasks/:id', auth, taskController.getById)
  router.patch('/tasks/:id/start', auth, taskController.startTask)
  router.patch('/tasks/:id/finish', auth, taskController.finishTask)
  router.post('/tasks', auth, taskController.createFromPipeline)

  router.get(
    '/api/documents/:id/figures',
    auth,
    figureController.getDocumentFigures,
  )
  router.post('/document', auth, documentController.createFromPipeline)
  router.get('/figures/:id/subfigures', auth, figureController.getSubfigures)
  router.patch('/figures/:id', auth, figureController.updateSubfigure)

  router.get('/modalities/:name', modalityController.getModalities)

  return router
}

export default getRouter
