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
    const formatedMatches = matches.map(match => formatMatch(match))
    const response = await this.insertMany(formatedMatches)
    return response
  }

  async getLatestMatchId() {
    const response = await this.getLatest()
    if (response.length === 0) return 0
    return response[0].matchId
  }
}


export default MatchesController
