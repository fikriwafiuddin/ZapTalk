import mongoose from "mongoose"

const connectDB = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => console.log("Connected to mongodb"))
    .catch((err) =>
      console.log("Error in database connection", new Date(), err)
    )
}
export default connectDB
