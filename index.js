const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
dotenv.config();

const port = process.env.PORT || 8000;

app.use(cors());
app.get('/', (req, res) => {
  res.send('aziz')
});

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected')
  } catch (error) {
    throw error
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('disconnected')
})
mongoose.connection.on('connected', () => {
  console.log('connected')
})

app.use(express.json({ limit: '3mb' }));

const userSchema = new mongoose.Schema({
  email: String,
  id: String
});

const User = mongoose.model('User', userSchema);

app.post('/save-user', async (req, res) => {
  const { email, id } = req.body;

  // Create a new user instance
  const newUser = new User({
    email,
    id
  });

  // Save the user to the database
 await newUser.save();
 return res.status(201).send({
  message: "OKA SAX",
  success: true,
 })
});

app.listen(port, () => {
  connect();
  console.log('server connected')
});