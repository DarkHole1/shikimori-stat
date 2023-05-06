import mongoose from "mongoose";

import { mongoUri } from "./config";

mongoose.connect(
  mongoUri
).catch(err => {
  if (err) {
    console.log(err);
    process.exit(-1);
  }
});

export default mongoose;
