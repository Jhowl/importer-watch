import axios from 'axios';
import { MATCH_QUERY } from './config.js';
import { getLastMatchId, saveMatches } from './matches.js';

export async function fetchNewMatches(lastMatchId) {
  const query = MATCH_QUERY + ` AND match_id > ${lastMatchId}`;

  const { data } = await axios.get(
    `https://api.opendota.com/api/explorer?sql=${encodeURIComponent(query)}`
  );

  return data.rows.map(formatMatch);
}
