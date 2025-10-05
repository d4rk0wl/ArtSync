import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { clearTimeout } from "node:timers";

import getColors from "./Controllers/Palette"
import applyUpdate from "./Controllers/Wled";

const storage = multer.diskStorage({
  destination: './tmp',
  filename: (req, file, cb) => {
    cb(null, 'thumb.jpg')
  }
});
const upload = multer({ storage })

const app = express();
const port = process.env.PORT || 8080;

let stopTimeout: NodeJS.Timeout | null = null;

app.post("/", upload.single('thumb'), async (req, res) => {
  try {
    const data = JSON.parse(req.body.payload)

    let gradient: number[][] = []
    if(req.file){
      gradient = await getColors(req.file.path)
    }

    if(data.event === 'media.stop' || data.event === 'media.pause'){
      if(process.env.RETURNWHITE){
        stopTimeout = setTimeout(async () => {
          await applyUpdate([[255, 255, 255], [255, 255, 255], [255, 255, 255]])
        }, parseInt(process.env.WHITE_DELAY_MS || "2000"))
      }
    } else if (data.event === 'media.play' || data.event === 'media.resume'){
      if(stopTimeout) {
        clearTimeout(stopTimeout)
        stopTimeout = null
      }
      await applyUpdate(gradient)
    }

    res.json({ success: true})
  } catch(e) {
    console.error(e);
    res.status(500).json({success: false, error: (e instanceof Error) ? e.message : "Unknown error"})
  }
})

app.listen(port, () => {
  if(!fs.existsSync("./tmp")){
    fs.mkdirSync("./tmp")
    console.log("Temp directory created")
  }

  console.log(`WLED Address: ${process.env.WLEDADDR}`)
  console.log(`WLED Segments: ${process.env.SEGMENTS}`)
  console.log(`Application listening on port ${port}`)
})