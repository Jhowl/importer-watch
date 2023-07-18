
import mongoose, { Schema } from 'mongoose';

const LeagueSchema = new Schema({
  leagueId: {
    type: Number,
    required: [true, 'Please provide a league id.'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug.'],
  },
  tier: {
    type: String,
    required: [true, 'Please provide a tier.'],
  },
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

export default mongoose.models.League || mongoose.model('League', LeagueSchema);
