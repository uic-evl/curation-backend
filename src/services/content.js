import Document from "../models/document";
import Figure from "../models/figure";
import Modality from "../models/modality";

const TYPE_FIGURE = "Figure";
const TYPE_SUBFIGURE = "Subfigure";
const STATE_REVIEWED = "Reviewed";
const STATE_TO_REVIEW = "To Review";
const STATE_SKIPPED = "Skipped";
const TASK_LABEL = "Label";

exports.fetchFiguresFromDocument = async (req, res, next) => {
  const { id } = req.params;

  try {
    const figures = await Figure.find({ docId: id }).sort({ name: 1 });
    // for (let figure of figures) {
    //   figure.subfigures = await Figure.find({ figureId: figure._id });
    // }
    res.statusCode(200).send({ figures, message: "Figures fetched" });
  } catch (error) {
    res
      .statusCode(500)
      .send({ error, message: "Error while fetching figures" });
  }
};

exports.fetchSubfigures = async (req, res, next) => {
  const { id } = req.params;

  try {
    const figures = await Figure.find({ figureId: id }).sort({ name: 1 });
    res.statusCode(200).send({ figures, message: "Figures fetched" });
  } catch (error) {
    res
      .statusCode(500)
      .send({ error, message: "Error while fetching subfigures" });
  }
};

exports.fetchDocument = async (req, res, next) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    res.statusCode(200).send({ document, message: "Document fetched" });
  } catch (error) {
    res
      .statusCode(500)
      .send({ error, message: "Error while fetching the document" });
  }
};

exports.updateSubfigure = async (req, res, next) => {
  const { id } = req.params;
  const { values } = req.body;

  if (!values.state)
    res.statusCode(400).send({ message: "You need to specify an image state" });

  try {
    let subfigure = await Figure.findById(id);

    if (values.state === STATE_SKIPPED) {
      subfigure.state = STATE_SKIPPED;
    } else {
      if (!values.modalities)
        res.statusCode(400).send({
          message: "Cannot save an image as reviewed without modalities",
        });
      else {
        let subfigure = {
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
          state: STATE_REVIEWED,
          composition: values.composition,
        };
      }

      const savedSubfigure = await subfigure.save();
      const { figureId } = savedSubfigure;

      // check if we need to update the parent
    }
  } catch (error) {
    res
      .statusCode(500)
      .send({ error, message: "Error while updating subfigure" });
  }
};

const createNewDocument = ({ name, pubmedId, entityId, uri }) => {
  return new Document({ name, pubmedId, entityId, uri });
};

const createNewFigure = (figure, docId) => {
  const { name, uri, caption } = figure;
  const type = TYPE_FIGURE,
    state = STATE_TO_REVIEW;
  return new Figure({ name, type, state, docId, uri, caption });
};

const createNewSubfigure = (subfigure, docId, figureId) => {
  const { name, uri } = subfigure;
  const type = TYPE_SUBFIGURE,
    state = STATE_TO_REVIEW;
  return new Figure({ name, type, state, docId, figureId, uri });
};

exports.createDocumentFromPipeline = async (req, res, next) => {
  const { input } = req.body.document;

  try {
    const document = createNewDocument(input);
    const savedDocument = await document.save();
    const { _id: docId } = savedDocument;

    for (let fig of input.figures) {
      const figure = createNewFigure(fig, docId);
      const savedFigure = await figure.save();

      for (let subfig of fig.subfigures) {
        const subfigure = createNewSubfigure(subfig, docId, savedFigure._id);
        const savedSubfigure = await subfigure.save();
      }
    }
    res.statusCode(201).send({ document: savedDocument });
  } catch (error) {
    res
      .statusCode(500)
      .send({ error, message: "Error inserting from pipeline" });
  }
};

exports.fetchModalities = async (req, res, next) => {
  try {
    const modalities = await Modality.find({});
    res.statusCode(200).send({ modalities, message: "modalities fetched" });
  } catch (error) {
    res.statusCode(500).send({ message: "Error fetching modalities" });
  }
};

const fillSearchFilters = ({
  type,
  state,
  modalities,
  observations,
  additional,
  username,
}) => {
  const filter = {};
  filter["type"] = type !== undefined ? type : TYPE_SUBFIGURE;
  if (state !== undefined) filter["state"] = state;
  if (username !== undefined) filter["username"] = username;
  if (observations !== undefined) filter["observations "] = observations;
  if (observations !== undefined)
    filter["observations "] = { $regex: new RegExp(observations, "i") };
  if (modalities !== undefined) {
    let mods = modalities.split(",");
    mods = mods.map((modality) => new ObjectID(modality));
    filter["modalities._id"] = { $in: mods };
  }
  if (additional !== undefined) {
    const additionalObs = additional.split(",");
    if (additionalObs.length > 0) {
      if (additionalObs.includes("isCompound")) {
        filter["isCompound"] = true;
      }
      if (additionalObs.includes("isOvercropped")) {
        filter["isOvercropped"] = true;
      }
      if (additionalObs.includes("needsCropping")) {
        filter["needsCropping"] = true;
      }
      if (additionalObs.includes("closeUp")) {
        filter["closeUp"] = true;
      }
      if (additionalObs.includes("isOverfragmented")) {
        filter["isOverfragmented"] = true;
      }
      if (additionalObs.includes("flag")) {
        filter["flag"] = true;
      }
    }
  }

  return filter;
};

exports.searchFigures = async (req, res, next) => {
  let { pageSize, pageNumber } = req.query;
  pageSize = parseInt(pageSize);
  pageNumber = parseInt(pageNumber);

  if (isNaN(pageSize) || isNaN(pageNumber)) {
    res.statusCode(400).send({
      message: "pageSize and pageNumber should be positive integer values",
    });
  }

  const skips = pageSize * (pageNumber - 1);
  try {
    const filter = fillSearchFilters(req.query);
    const totalSubfigures = await Figure.count(filter);
    const subfigures = await Figure.find(filter).skip(skips).limit(pageSize);
    res.statusCode(200).send({
      subfigures: subfigures,
      total: totalSubfigures,
      message: `Retrieved ${subfigures.length} figures`,
    });
  } catch (error) {
    res.statusCode(500).send({ error, message: "Error in search" });
  }
};
