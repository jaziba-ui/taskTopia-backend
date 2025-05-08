import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "user"], default: "user" },
});

const User = mongoose.model("User", UserSchema);
export default User;
