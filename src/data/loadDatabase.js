import {startDatabase} from '../db/database'
import modalitiesData from './modalities.json'
import modalityDB from '../resources/modalities/modality-model'

const loadDatabase = async () => {
  await startDatabase()

  for (let tree of modalitiesData) {
    let treeData = new modalityDB(tree)
    const savedTree = await treeData.save()
  }
  console.log('finished')
}

// Execute with npx babel-node ./path/to/file/.js
loadDatabase()
