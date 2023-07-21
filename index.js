import 'dotenv/config'

import axios from "axios";
import chalk from "chalk";

import { db } from "./src/db/db.js";
import logger from "./src/logger/index.js";
import { select, from, groupBy } from "./src/config/config.js";

import MatchesController from "./src/controller/matches/index.js";
import LeaguesController from "./src/controller/leagues/index.js";
import TeamsController from "./src/controller/teams/index.js";

const MController = new MatchesController();
const LController = new LeaguesController();
const TController = new TeamsController();

const makeFirstImport = async () => {
  logger.info("Make first import");

  const mongoMatches = await MController.getLatest();

  if (mongoMatches.length !== 0) {
    logger.info("First import already done");
    return false;
  }

  logger.info("First import started");

  const where = `(
    leagues.tier = 'premium'
    OR leagues.leagueid = 15196
    OR leagues.leagueid = 15439
    OR leagues.leagueid = 15475
  ) AND
  EXTRACT(YEAR FROM to_timestamp(matches.start_time)) >= 2023`;

  const query = `
    SELECT
      ${select}
    FROM
      ${from}
    WHERE
      ${where}
    GROUP BY
      ${groupBy}
    ORDER BY
      matches.match_id DESC
  `;

  try {
    const response = await axios.get(
      `https://api.opendota.com/api/explorer?sql=${encodeURIComponent(
        query
      )}`
    );

    if (response.status !== 200) {
      logger.warn("Error in response");
      return false;
    }

    await Promise.all([
      MController.saveMatches(response.data.rows),
      LController.saveLeagues(response.data.rows),
      TController.saveTeams(response.data.rows),
    ]);

    logger.info("First import saved");
  } catch (error) {
    logger.error(`Error in first import ${error.message}`);
    return false;
  }
};

const watcher = async () => {
  const timeInHours = 15;
  // const timeInMilliseconds = timeInHours * 60 * 60 * 1000;
  const timeUnix = Math.floor(new Date().getTime() / 1000) - timeInHours * 60 * 60;
  const matchesCurrentDay = await MController.getLatestByTime(timeInHours);
  const whereClause = `
    (
      leagues.tier = 'premium'
      OR leagues.leagueid = 15475
    ) AND (
      matches.start_time >= ${timeUnix}
      ${matchesCurrentDay.length > 0 ? `AND matches.match_id NOT IN (${matchesCurrentDay.join(',')})` : ''}
    ) AND
    EXTRACT(YEAR FROM to_timestamp(matches.start_time)) >= 2023
  `;
  const query = `
    SELECT
      ${select}
    FROM
      ${from}
    WHERE
      ${whereClause}
    GROUP BY
      ${groupBy}
  `;

  console.log(chalk.green(`Getting matches after ${new Date(timeUnix * 1000).toLocaleString()}`));
  logger.info("Checking for new matches...");

  try {
    const response = await axios.get(`https://api.opendota.com/api/explorer?sql=${encodeURIComponent(query)}`);

    if (response.status !== 200) {
      logger.warn("Error in watcher");
      return false;
    }

    const { rows: matches } = response.data;

    if (matches.length === 0) {
      console.log(chalk.yellow("No matches found"));
      console.log(chalk.yellow("Waiting 5 minutes..."));
      return false;
    }

    logger.info(`Matches found ${matches.length}`);

    const newMatches = matches.filter(({ match_id: matchId }) => !matchesCurrentDay.includes(matchId));
    const newMatchesIds = newMatches.map(({ match_id: matchId }) => matchId);

    await Promise.all([
      MController.saveMatches(newMatches),
      LController.newLeague(newMatches),
      TController.newTeam(newMatches),
    ]);

    logger.info("Watcher saved");

    return newMatchesIds;
  } catch (error) {
    logger.error(`Error in watcher: ${error.message}`);
    return false;
  }
};

const start = async () => {
  await makeFirstImport();
  await watcher();

  console.log(chalk.green("Starting watcher..."));

  setInterval(async () => {
    await watcher();
  }, 60 * 1000 * 5);
};

const api = axios.create({
  baseURL: "https://api.opendota.com/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error(`Error in API request: ${error.message}`);
    return Promise.reject(error);
  }
);

db.then(() => {
  logger.info("Connected to database");
  start();
}).catch((err) => {
  logger.error(err);
});
