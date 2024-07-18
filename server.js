import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

const app = express();
const port = 9000;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/reservationDB');

// Define a Mongoose schema for reservations
const reservationSchema = new mongoose.Schema({
  name: String, // User's name
  email: String, // User's email
  date: String, // Reservation date
  time: String, // Reservation time
  guests: Number, // Number of guests
  specialRequests: String, // Special requests from the user
});

// Schema for Mongoose
const Reservation = mongoose.model('Reservation', reservationSchema);

// Define an API endpoint to handle reservation creation
app.post('/api/reservations', async (req, res) => {
  // Extract reservation details from the request body
  const { name, email, date, time, guests, specialRequests } = req.body;

  // Create a new reservation
  const reservation = new Reservation({
    name,
    email,
    date,
    time,
    guests,
    specialRequests,
  });

  // Save the reservation to the database
  await reservation.save();

  //  Nodemailer configuration  for sending emails
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com', // Your email address
      pass: 'your-email-password', // Your email password
    },
  });

  // Define the email 
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Reservation Confirmation',
    text: `Hi ${name},\n\nYour reservation for ${guests} guests on ${date} at ${time} has been confirmed.\n\nSpecial Requests: ${specialRequests}\n\nThank you!`,
  };

  // Send the confirmation email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error); // Log any errors
      res.status(500).send('Error sending confirmation email'); // Respond with error status
    } else {
      console.log('Email sent: ' + info.response); // Log success message
      res.status(200).send('Reservation confirmed'); // Respond with success status
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
