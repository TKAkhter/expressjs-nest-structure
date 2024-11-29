import mongoose from "mongoose";
import { env } from "../env";

// eslint-disable-next-line no-return-await
const connectMongoDB = async () => await mongoose.connect(env.MONGODB_URI || "");

export default connectMongoDB;
