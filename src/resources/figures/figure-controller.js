import passport from 'passport'
import figureDB from './figure-model'
import {FigureType, FigureStatus} from '../../utils/constants'

export const getDocumentFigures = async (req, res, next) => {
  const {id} = req.params

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) return res.status(500).send(err)
    if (info) return res.status(400).send(info)

    const figures = await figureDB
      .find({docId: id, type: FigureType.FIGURE})
      .sort({name: 1})
    return res.status(200).send(figures)
  })(req, res, next)
}

export const getSubfigures = async (req, res, next) => {
  const {id} = req.params

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) return res.status(500).send(err)
    if (info) return res.status(400).send(info)

    const subfigures = await figureDB
      .find({figureId: id, type: FigureType.SUBFIGURE})
      .sort({name: 1})
    return res.status(200).send(subfigures)
  })(req, res, next)
}

export const updateSubfigure = async (req, res, next) => {
  const {id} = req.params
  const {applyToAll} = req.body
  const values = req.body

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) return res.status(500).send(err)
    if (info) return res.status(400).send(info)

    let subfigure = await figureDB.findById(id)
    if (subfigure.type !== FigureType.SUBFIGURE)
      return res.status(400).send('only update subfigures')

    if (values.state === FigureStatus.SKIPPED) {
      subfigure.state = FigureStatus.SKIPPED
    } else {
      if (!values.modalities)
        return res.status(400).send('please add modalities')

      subfigure.modalities = values.modalities
      subfigure.needsCropping = values.needsCropping
      subfigure.isCompound = values.isCompound
      subfigure.observations = values.observations
      subfigure.isOvercropped = values.isOvercropped
      subfigure.isMissingSubfigures = values.isMissingSubfigures
      subfigure.numberSubpanes = values.numberSubpanes
      subfigure.closeUp = values.closeUp
      subfigure.isOverfragmented = values.isOverfragmented
      subfigure.state = FigureStatus.REVIEWED
      subfigure.composition = values.composition
    }

    const savedSubfigure = await subfigure.save()
    const {figureId} = savedSubfigure
    // update modalities to all other subfigures
    if (applyToAll) {
      await figureDB.updateMany(
        {figureId: figureId, type: FigureType.SUBFIGURE},
        {state: FigureStatus.REVIEWED, modalities: values.modalities},
      )
    }

    // check if we need to update the parent figure
    let updatedParent = null
    const subfiguresToReview = await figureDB.find({
      figureId: figureId,
      type: FigureType.SUBFIGURE,
      state: FigureStatus.TO_REVIEW,
    })

    if (subfiguresToReview.length === 0) {
      const parent = await figureDB.findById(figureId)
      if (parent.state !== FigureStatus.REVIEWED) {
        parent.state = FigureStatus.REVIEWED
        updatedParent = await parent.save()
      }
    }

    return res.status(200).send({
      subfigure: savedSubfigure,
      refreshFigure: updatedParent !== null,
    })
  })(req, res, next)
}

const fillSearchFilters = ({
  type,
  state,
  modalities,
  observations,
  additional,
  username,
}) => {
  const filter = {}
  filter['type'] = type !== undefined ? type : TYPE_SUBFIGURE
  if (state !== undefined) filter['state'] = state
  if (username !== undefined) filter['username'] = username
  if (observations !== undefined) filter['observations '] = observations
  if (observations !== undefined)
    filter['observations '] = {$regex: new RegExp(observations, 'i')}
  if (modalities !== undefined) {
    let mods = modalities.split(',')
    mods = mods.map(modality => new ObjectID(modality))
    filter['modalities._id'] = {$in: mods}
  }
  if (additional !== undefined) {
    const additionalObs = additional.split(',')
    if (additionalObs.length > 0) {
      if (additionalObs.includes('isCompound')) {
        filter['isCompound'] = true
      }
      if (additionalObs.includes('isOvercropped')) {
        filter['isOvercropped'] = true
      }
      if (additionalObs.includes('needsCropping')) {
        filter['needsCropping'] = true
      }
      if (additionalObs.includes('closeUp')) {
        filter['closeUp'] = true
      }
      if (additionalObs.includes('isOverfragmented')) {
        filter['isOverfragmented'] = true
      }
      if (additionalObs.includes('flag')) {
        filter['flag'] = true
      }
    }
  }

  return filter
}

exports.searchFigures = async (req, res, next) => {
  let {pageSize, pageNumber} = req.query
  pageSize = parseInt(pageSize)
  pageNumber = parseInt(pageNumber)

  if (isNaN(pageSize) || isNaN(pageNumber)) {
    res.statusCode(400).send({
      message: 'pageSize and pageNumber should be positive integer values',
    })
  }

  const skips = pageSize * (pageNumber - 1)
  try {
    const filter = fillSearchFilters(req.query)
    const totalSubfigures = await Figure.count(filter)
    const subfigures = await Figure.find(filter).skip(skips).limit(pageSize)
    res.statusCode(200).send({
      subfigures: subfigures,
      total: totalSubfigures,
      message: `Retrieved ${subfigures.length} figures`,
    })
  } catch (error) {
    res.statusCode(500).send({error, message: 'Error in search'})
  }
}
