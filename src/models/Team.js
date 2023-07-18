
import mongoose, { Schema } from 'mongoose';

const TeamSchema = new Schema({
  teamId: {
    type: Number,
    required: [true, 'Please provide a Team id.'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug.'],
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    getters: true,
  },
  strict: false,
});

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
