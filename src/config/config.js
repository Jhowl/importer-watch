export const DB_URL = process.env.DB_URL

export const select = `duration,
  matches.match_id,
  matches.start_time,
  matches.dire_score,
  matches.radiant_score,
  matches.radiant_win AS radiant_win,
  MAX(teams_radiant.name) AS radiant_name,
  teams_dire.name AS dire_name,
  leagues.name AS league_name,
  matches.radiant_team_id,
  matches.dire_team_id,
  match_patch.patch,
  leagues.leagueid AS leagueId,
  json_agg(json_build_object(
    'player_slot', player_matches.player_slot,
    'team', CASE WHEN player_matches.player_slot < 128 THEN 'radiant' ELSE 'dire' END,
    'hero_id', player_matches.hero_id,
    'kills', player_matches.kills,
    'deaths', player_matches.deaths,
    'assists', player_matches.assists,
    'account_id', player_matches.account_id,
    'team_id', teams.team_id
  )) AS players`

export const from = `
  matches
  JOIN match_patch USING (match_id)
  JOIN leagues USING (leagueid)
  JOIN player_matches ON player_matches.match_id = matches.match_id
  JOIN teams teams_radiant ON teams_radiant.team_id = matches.radiant_team_id
  JOIN teams teams_dire ON teams_dire.team_id = matches.dire_team_id
  JOIN teams ON teams.team_id = CASE WHEN player_matches.player_slot < 128 THEN matches.radiant_team_id ELSE matches.dire_team_id END`

export const groupBy = `
  matches.match_id,
  matches.start_time,
  matches.dire_score,
  matches.radiant_score,
  matches.radiant_win,
  teams_dire.name,
  leagues.name,
  leagues.leagueid,
  match_patch.patch`
