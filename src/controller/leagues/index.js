import slugify from 'slugify'
import Controller from '../index.js'
import Leagues from '../../models/Leagues.js'

class LeaguesController extends Controller {
  constructor() {
    super()
    this.Model = Leagues
  }

  leaguesIdsFromMatches = (matches) => {
    const leaguesIds = new Set(matches.map(({ leagueid }) => leagueid))
    return Array.from(leaguesIds)
  }

  saveLeagues = async (matches) => {
    const leaguesIds = this.leaguesIdsFromMatches(matches)
    const leagues = await this.getLeaguesData(leaguesIds)
    if (!leagues.length) return false
    const response = await this.insertMany(leagues)
    return response
  }

  newLeague = async (matches) => {
    const leaguesIds = this.leaguesIdsFromMatches(matches)
    const league = await this.find({ leagueId: { $in: leaguesIds } })
    console.log(league)
    if (league.length) {
      console.log('league Already exists')
      return false
    }

    const leagues = await this.getLeaguesData(leaguesIds)
    if (!leagues.length) return false
    const response = await this.insertMany(leagues)
    return response
  }

  getLeaguesData = async (leaguesIds) => {
    const query = `
      SELECT
        leagueid,
        name,
        tier
      FROM
        leagues
      WHERE
        leagueid IN (${leaguesIds.join(',')})
    `
    const response = await this.getQuery(query)
    if (!response.length) return []
    const formatedLeagues = response.map(({ leagueid, name, tier }) => ({
      leagueId: leagueid,
      name,
      tier,
      slug: slugify(name, { lower: true })
    }))
    return formatedLeagues
  }

  getLatestMatchId = async () => {
    const [latest] = await this.getLatest()
    return latest ? latest.matchId : 0
  }
}

export default LeaguesController
