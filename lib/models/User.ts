import mongoose from "mongoose";
export default mongoose.models.User||mongoose.model("User",new mongoose.Schema({},{strict:false,timestamps:true}));