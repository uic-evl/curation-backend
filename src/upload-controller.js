import multer from "multer";
import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.IMPORTS);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).array("file");

exports.uploadPdfs = (req, res) => {
  /* Upload a group of documents and metadata to start the curation
     pipeline. The pipeline uses the 'organization' and 'group' metadata
     to assign the task.
   */
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err });
    } else if (err) {
      return res.status(500).json({ error: err });
    }

    const organization = req.body.organization;
    const group = req.body.group;
    const tempFolder = path.join(process.env.IMPORTS, Date.now().toString());
    try {
      await fs.mkdir(tempFolder);

      for (let file of req.files) {
        await fs.move(file.path, path.join(tempFolder, file.filename));
      }

      const python = spawn("python", [
        process.env.PIPELINE,
        organization,
        group,
      ]);

      // python.stdout.on("data", function (data) {
      //   console.log("Pipe data from python script ...");
      //   console.log(data.toString());
      // });

      python.stderr.on("data", (err) => {
        // Executes on the background as the process runs in async mode
        // to alert the user, we need to save the import process status
        console.log("Failed to execute the curation script: " + err);
      });

      return res
        .status(200)
        .send({ message: `${req.files.length} documents uploaded.` });
    } catch (error) {
      return res.status(500).send({ error });
    }
  });
};
