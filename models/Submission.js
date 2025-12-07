import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },     // e.g. "Carousel"
  library: { type: String, required: true },  // e.g. "Swiper.js"
  framework: { type: String, required: true },// e.g. "React"
  docUrl: { type: String, required: true },   // e.g. "https://swiper..."
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);