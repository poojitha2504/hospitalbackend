
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
const app = express();


app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb+srv://poojithameinfinity:pooja2504@hospital.xrodeuq.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (error) => {
  if (error) {
    console.error('MongoDB connection error:', error);
  } else {
    console.log('MongoDB connected successfully');
  }
});


// MongoDB Schema for User
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

// MongoDB Schema for Appointments
const appointmentSchema = new mongoose.Schema(
  {
  //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // date: Date,
  firstName: String,
  lastName: String,
  place: String,
  subject: String,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Sign-up Endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role : 'customer'
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      // Duplicate email error
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

// Sign-in Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Invalid credentials' });
    } else {
      // Generate JWT token for authentication
      // const token = jwt.sign({ userId: user._id }, 'your_secret_key', {
      //   expiresIn: '1h',
      // });

      // res.json({ token });
      res.status(201).json({ message: 'User Logged In successfully', role:user?.role});
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Save Appointment Endpoint
app.post('/appointment', async (req, res) => {
  const { firstName, lastName, place, subject } = req.body;
  try {
    const appointment = new Appointment({ firstName, lastName, place, subject  });
    await appointment.save();

    res.status(201).json({ message: 'Appointment saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get All Appointments Endpoint
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

