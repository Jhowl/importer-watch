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
  const lastMatchId = await MController.getLatestMatchId();

  logger.info("Checking for new matches...");
  console.log(chalk.yellow("Last match id: " + lastMatchId));

  const where = `leagues.tier = 'premium'`;

  const query = `
    SELECT
      ${select}
    FROM
      ${from}
    WHERE
      ${where}
      AND matches.match_id > ${lastMatchId}
    GROUP BY
      ${groupBy}
  `;

  try {
    const response = await axios.get(
      `https://api.opendota.com/api/explorer?sql=${encodeURIComponent(
        query
      )}`
    );

    if (response.status !== 200) {
      logger.warn("Error in watcher");
      return false;
    }

    if (response.data.rows.length === 0) {
      console.log(chalk.yellow("No matches found"));
      console.log(chalk.yellow("Waiting 1 minute..."));

      return false;
    }

    logger.info(`Matches found ${response.data.rows.length}`);

    await Promise.all([
      MController.saveMatches(response.data.rows),
      LController.newLeague(response.data.rows),
      TController.newTeam(response.data.rows),
    ]);

    logger.info("Watcher saved");
  } catch (error) {
    logger.error("Error in watcher");
    return false;
  }
};

const start = async () => {
  await makeFirstImport();
  console.log(chalk.green("Starting watcher..."));

  setInterval(async () => {
    await watcher();
  }, 60 * 1000);
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
