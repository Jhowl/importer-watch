import Controller from '../index.js'
import Matches from '../../models/Matches.js'
import formatMatch from '../../utils/format.js'

class MatchesController extends Controller {
  constructor() {
    super()
  }

  setModel() {
    this.Model = Matches
  }

  async saveMatches(matches) {
    const matchNotInDB = await this.getMatchesNotInDB(matches)
    if (matchNotInDB.length === 0) return false

    const formatedMatches = matchNotInDB.map(match => formatMatch(match))

    const response = await this.insertMany(formatedMatches)
    return response
  }

  async getMatchesNotInDB(matches) {
    const matchIds = matches.map(match => match.match_id)
    const response = await this.Model.find({ matchId: { $in: matchIds } })

    const newMatches = matches.filter(match => {
      const matchInDB = response.find(m => m.matchId === match.match_id)
      return !matchInDB
    })

    return newMatches
  }

  async getLatestMatchId() {
    const response = await this.getLatest()
    if (response.length === 0) return 0
    return response[0].matchId
  }

  async getLatestByTime(time) {
    const response = await this.Model.find({
      startTime: {
        $gte: new Date(new Date().getTime() - time)
      }
    })

    if (response.length === 0) return []

    const matchIds = response.map(({ matchId }) => matchId)

    return matchIds
  }
}


export default MatchesController
