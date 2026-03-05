
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// In-memory data store
let schedule = {};

// Function to initialize the schedule
function initializeSchedule() {
  schedule = {};
  for (let i = 9; i <= 21; i++) {
    const time = `${i}:00`;
    schedule[time] = { isBooked: false, bookedBy: null };
  }
  console.log("Schedule initialized in memory:", schedule);
}

// Endpoint to get the current schedule
app.get('/schedule', (req, res) => {
  res.status(200).json(schedule);
});

// Endpoint to book a time
app.post('/book', (req, res) => {
  const { time, userId } = req.body;

  if (!time || !userId) {
    return res.status(400).send('Time and userId are required');
  }

  if (!schedule[time]) {
    return res.status(404).send('Time slot not found');
  }

  if (schedule[time].isBooked) {
    return res.status(409).send('Time slot is already booked');
  }

  schedule[time] = { isBooked: true, bookedBy: userId };
  console.log(`Time slot ${time} booked by ${userId}. Current schedule:`, schedule);
  res.status(200).send('Time slot booked successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  initializeSchedule(); // Initialize schedule on server start
  console.log(`In-memory server is running on port ${PORT}`);
});
