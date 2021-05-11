const uploadController = require('./upload-controller')
// const users = require('./services/users')
// const tasks = require('./services/tasks')
// const content = require('./services/content')

import {register} from './resources/users/user-controller'

const opts = {session: false}

const getRouter = (app, passport) => {
  const router = express.Router()
  // const auth = passport.authenticate('jwt', opts)

  // app.post('/api/document/upload', uploadController.uploadPdfs)

  // security
  router.post('/register', register)
  // app.get('/api/login', users.login)
  // app.get('/api/users', auth, users.find)
  // tasks
  // app.get('/api/tasks', auth, tasks.find)
  // app.post('/api/tasks', auth, tasks.create)
  // app.put('/api/tasks/:id', tasks.open)
  // app.put('/api/tasks/:id/finish', tasks.finish)
  // TODO: counting strategy for assigning tasks
  // document and figures
  // app.get('/api/document/:id/figures', auth, content.fetchFiguresFromDocument)
  // app.get('/api/document/:id', auth, content.fetchDocument)
  // app.get('/api/figures/:id/subfigures', auth, content.fetchSubfigures)
  // app.put('/api/figures/subfigures/:id', auth, content.updateSubfigure)
  // app.post('/api/document/pipeline', auth, content.createDocumentFromPipeline)
  // app.get('/api/modalities', content.fetchModalities)
  // app.get('/api/figures', auth, content.searchFigures)
}

module.exports = {router}
