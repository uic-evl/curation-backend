import passport from 'passport'
import figureDB from './figure-model'
import {FigureType, FigureStatus} from '../../utils/constants'

export const getDocumentFigures = (req, res, next) => {
  const {id} = req.params

  passport.authenticate('register', (err, user, info) => {
    if (err) res.status(500).send(err)
    if (info) res.status(400).send(info)

    const figures = await figureDB
      .find({docId: id, type: FigureType.FIGURE})
      .sort({name: 1})
    res.statusCode(200).send(figures)
  })(req, res, next)
}

export const getSubfigures = (req, res, next) => {
  const {id} = req.params

  passport.authenticate('register', (err, user, info) => {
    if (err) res.status(500).send(err)
    if (info) res.status(400).send(info)

    const subfigures = await figureDB
      .find({figureId: id, type: FigureType.SUBFIGURE})
      .sort({name: 1})
    res.statusCode(200).send(subfigures)
  })(req, res, next)
}

export const updateSubfigure = (req, res, next) => {
  const {id} = req.params
  const {values, applyToAll} = req.body

  passport.authenticate('register', (err, user, info) => {
    if (err) res.status(500).send(err)
    if (info) res.status(400).send(info)

    let subfigure = await Figure.findById(id)
    if (subfigure.type !== FigureType.SUBFIGURE)
      res.status(400).send('only update subfigures')

    if (values.state === FigureStatus.SKIPPED) {
      subfigure.state = FigureStatus.SKIPPED
    } else {
      if (!values.modalities) res.status(400).send('please add modalities')

      subfigure = {
        ...subfigure,
        modalities: values.modalities,
        needsCropping: values.needsCropping,
        isCompound: values.isCompound,
        observations: values.observations,
        isOvercropped: values.isOvercropped,
        isMissingSubfigures: values.isMissingSubfigures,
        numberSubpanes: values.numberSubpanes,
        closeUp: values.closeUp,
        isOverfragmented: values.isOverfragmented,
        state: FigureStatus.REVIEWED,
        composition: values.composition,
      }
    }

    const savedSubfigure = await subfigure.save()
    const {figureId} = savedSubfigure
    // update modalities to all other subfigures
    if (applyToAll) {
      await figureDB.updateMany(
        {figureId: figureId, type: FigureType.SUBFIGURE},
        {state: FigureStatus.REVIEWED},
      )
    }

    // check if we need to update the parent figure
    let updatedParent = null
    const subfiguresToReview = figureDB.find({
      figureId: figureId,
      type: FigureType.SUBFIGURE,
      state: FigureStatus.TO_REVIEW,
    })
    if (!subfiguresToReview) {
      const parent = await figureDB.findById(figureId)
      parent.state = FigureStatus.REVIEWED
      updatedParent = await parent.save()
    }

    return res.status(200).send({
      subfigure: savedSubfigure,
      refreshFigure: updatedParent !== null,
    })
  })(req, res, next)
}
