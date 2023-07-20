import slugify from 'slugify'

import Controller from '../index.js'
import Teams from '../../models/Team.js'

class TeamsController extends Controller {
  constructor() {
    super()
  }

  setModel() {
    this.Model = Teams
  }

  async saveTeams(matches) {
    const teamsIds = [...new Set(matches.flatMap(match => [match.radiant_team_id, match.dire_team_id]))]

    const teams = await this.getTeamsData(teamsIds)

    if (teams.length === 0) return false

    const response = await this.insertMany(teams)

    return response
  }

  async newTeam(matches) {
    const teamsIds = [...new Set(matches.flatMap(match => [match.radiant_team_id, match.dire_team_id]))]

    const teams = teamsIds.reduce((acc, teamId) => {
        const team = this.find({ teamId })
        if (team.length === 0) acc.push(teamId)
        console.log('team Already exists')
        return acc
      }, [])

    if (teams.length === 0) return false

    const response = await this.insertMany(teams)

    return response
  }

  async getTeamsData(teamsIds) {
    const query =`
      SELECT
        team_id,
        name,
        logo_url
      FROM
        teams
      WHERE
        team_id IN (${teamsIds.join(',')})
    `

    const response = await this.getQuery(query)

    if (response.length === 0) return []

    const formatedTeams = await Promise.all(response.map(({ team_id: teamId, name, logo_url: logoUrl }) => ({
      teamId,
      name,
      logoUrl,
      slug: slugify(name, { lower: true }) || name
    })))

    return formatedTeams
  }

}

export default TeamsController
