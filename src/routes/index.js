import express from 'express'
import {registerUser} from '../resources/users/user-controller'

const getRouter = passport => {
  const router = express.Router()
  router.post('/users/register', registerUser)

  return router
}

export default getRouter
