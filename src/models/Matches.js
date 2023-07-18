import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
  playerSlot: {
    type: Number,
    required: true,
  },
  heroId: {
    type: Number,
    required: true,
  },
  kills: {
    type: Number,
    required: true,
  },
  deaths: {
    type: Number,
    required: true,
  },
  assists: {
    type: Number,
    required: true,
  },
  accountId: {
    type: Number,
    required: true,
  },
  teamId: {
    type: Number,
    required: true,
  },
})

const sideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  teamId: {
    type: Number,
    required: true,
  },
})

const matchSchema = new mongoose.Schema({
  duration: {
    type: Number,
    required: true,
  },
  matchId: {
    type: Number,
    required: true,
    index: true,
    unique: true,
  },
  startTime: {
    type: Date,
    index: true,
  },
  radiant: {
    type: sideSchema,
    required: true,
  },
  dire: {
    type: sideSchema,
    required: true,
  },
  radiantWin: {
    type: Boolean,
    required: true,
  },
  leagueName: {
    type: String,
    required: true,
  },
  leagueId: {
    type: Number,
    required: true,
  },
  patch: {
    type: String,
    required: true,
  },
  firstTower: {
    type: Object,
    required: false,
  },
  players: {
    type: [playerSchema],
    required: true,
  },
},
{
  timestamps: true,
  strict: false,
})

matchSchema.index({ matchId: 1, startTime: -1 })

// matchSchema.statics.findMatches = function findMatches(query) {
//   return this.find(query)
//     .sort({ matchId: -1
//     })
//     .limit(100)
// }

const Matches = mongoose.models.Matches || mongoose.model('Matches', matchSchema)

export default Matches
