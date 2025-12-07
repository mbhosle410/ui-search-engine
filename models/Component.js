import mongoose from 'mongoose';

const ComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  library: { type: String, required: true },
  framework: { type: String, default: 'React' },
  docUrl: { type: String, required: true },
  keywords: [String],
  popularityScore: { type: Number, default: 0 }
});

// Prevent model recompilation error in Next.js hot reloading
export default mongoose.models.Component || mongoose.model('Component', ComponentSchema);