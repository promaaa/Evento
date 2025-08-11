import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/evento';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error', err);
});

app.use('/events', eventsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
