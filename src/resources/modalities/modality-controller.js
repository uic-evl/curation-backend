import modalityDB from './modality-model'

export const getModalities = async (req, res, next) => {
  const {name} = req.params

  const tree = await modalityDB.findOne({name: name})
  if (!tree) res.status(400).send({message: 'no modalities definition found'})

  const rows = []
  let fringe = tree.modalities
  while (fringe.length > 0) {
    const node = fringe.shift()
    if (node.isRow) {
      rows.push(node)
    } else {
      if (node.children) {
        fringe = fringe.concat(node.children)
      }
    }
  }

  res.status(200).send(rows)
}
