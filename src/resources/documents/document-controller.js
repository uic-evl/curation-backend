import passport from 'passport'
import documentDB from './document-model'
import figureDB from '../figures/figure-model'
import {FigureStatus, FigureType} from '../../utils/constants'

export const getDocumentById = async (req, res, next) => {
  const {id} = req.params

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) return res.status(500).send(err)
    if (info) return res.status(400).send(info)

    const document = await documentDB.findById(id)
    return res.status(200).send(document)
  })(req, res, next)
}

export const createFromPipeline = async (req, res, next) => {
  const input = req.body.document

  passport.authenticate('jwt', async (err, user, info) => {
    if (err) return res.status(500).send(err)
    if (info) return res.status(400).send(info)

    const document = createNewDocument(input)
    const savedDocument = await document.save()
    // TODO: check if did not save

    const {_id: docId} = savedDocument
    for (let fig of input.figures) {
      const figure = createNewFigure(fig, docId)
      const savedFigure = await figure.save()

      for (let subfig of fig.subfigures) {
        const subfigure = createNewSubfigure(subfig, docId, savedFigure._id)
        const savedSubfigure = await subfigure.save()
      }
    }

    return res.status(200).send(savedDocument)
  })(req, res, next)
}

const createNewDocument = ({name, pubmedId, entityId, uri}) => {
  return new documentDB({name, pubmedId, entityId, uri})
}

const createNewFigure = (figure, docId) => {
  const {name, uri, caption} = figure
  const type = FigureType.FIGURE
  const state = FigureStatus.TO_REVIEW
  return new figureDB({name, type, state, docId, uri, caption})
}

const createNewSubfigure = (subfigure, docId, figureId) => {
  const {name, uri} = subfigure
  const type = FigureType.SUBFIGURE
  const state = FigureStatus.TO_REVIEW
  return new figureDB({name, type, state, docId, figureId, uri})
}
