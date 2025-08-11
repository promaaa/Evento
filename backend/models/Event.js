import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sold: { type: Number, default: 0 }
});

const contributionSchema = new mongoose.Schema({
  buyer: String,
  amount: Number,
  quantity: Number,
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: String,
  description: String,
  goal: Number,
  raised: { type: Number, default: 0 },
  date: Date,
  imageUrl: String,
  beneficiaryWallet: String,
  creatorWallet: String,
  tickets: [ticketSchema],
  contributions: [contributionSchema]
}, { timestamps: true });

eventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; }
});

export default mongoose.model('Event', eventSchema);
