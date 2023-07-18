const formatMatch = ({
  start_time: startTime,
  duration,
  match_id: matchId,
  radiant_score: radiantScore,
  dire_score: direScore,
  radiant_win: radiantWin,
  radiant_name: radiantName,
  dire_name: direName,
  league_name: leagueName,
  patch,
  leagueid: leagueId,
  players,
  objectives,
  radiant_team_id: radiantTeamId,
  dire_team_id: direTeamId,
}) => ({
  matchId,

  startTime: new Date(startTime * 1000),
  duration,
  radiant: {
    name: radiantName,
    score: radiantScore,
    teamId: radiantTeamId,
  },
  dire: {
    name: direName,
    score: direScore,
    teamId: direTeamId,
  },
  radiantWin,
  leagueName,
  patch,
  leagueId,
  players: getFilterPlayers(players),
  firstTowerTaken: getFirstTowerTeam(objectives, { radiant: radiantTeamId, dire: direTeamId }),
})

const getFilterPlayers = players => players.map(({
  player_slot: playerSlot,
  hero_id: heroId,
  kills,
  deaths,
  assists,
  account_id: accountId,
  team_id: teamId,
}) => ({
  playerSlot,
  heroId,
  kills,
  deaths,
  assists,
  accountId,
  teamId,
}))

const getFirstTowerTeam = (objectives, teams) => {

  if (!objectives) return null;

  const towers = objectives.filter((objective) => objective.type === 'building_kill');
  towers.sort((a, b) => a.time - b.time);

  const firstTower = towers[0];
  const team = firstTower.key.includes('badguys') ? teams.radiant : teams.dire;

  return {
    time: firstTower.time,
    team,
  }
}

export default formatMatch
