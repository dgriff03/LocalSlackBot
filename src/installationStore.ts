import { Installation, Logger, InstallationQuery } from "@slack/bolt";
import fs from "fs";

const db_path = "./src/store/db.json";
// "touch" file to make sure it exists
fs.writeFile(db_path, "{}", { flag: "wx" }, (err) => {});

const get_db = () => {
  const data = fs.readFileSync(db_path, {
    flag: "r",
    encoding: "utf8",
  });
  return JSON.parse(data);
};
const write_db = (db: Record<string, any>) => {
  fs.writeFileSync(db_path, JSON.stringify(db, null, 4), {
    flag: "w+",
    encoding: "utf8",
  });
};

const storeInstallation = async (
  installation: Installation,
  logger?: Logger
): Promise<void> => {
  if (
    installation.isEnterpriseInstall &&
    installation.enterprise !== undefined
  ) {
    // Start without handling enterprise
    throw new Error("Unable to support enterprises at this moment");
  }
  if (installation.team !== undefined) {
    const teamId = installation.team.id;
    const db = get_db();
    if (!db[teamId]) {
      db[teamId] = installation;
      write_db(db);
    }
    return;
  }
  throw new Error("Failed saving installation data to installationStore");
};

const fetchInstallation = async (
  query: InstallationQuery<boolean>,
  logger?: Logger
): Promise<Installation> => {
  if (query.isEnterpriseInstall && query.enterpriseId !== undefined) {
    // Start without handling enterprise
    throw new Error("Unable to support enterprises at this moment");
  }
  if (query.teamId !== undefined) {
    const teamId = query.teamId;
    const db = get_db();
    if (db[teamId]) {
      return db[teamId];
    }
  }
  throw new Error("Failed fetching installation");
};

const deleteInstallation = async (
  query: InstallationQuery<boolean>,
  logger?: Logger
): Promise<void> => {
  if (query.isEnterpriseInstall && query.enterpriseId !== undefined) {
    // Start without handling enterprise
    throw new Error("Unable to support enterprises at this moment");
  }
  if (query.teamId !== undefined) {
    const teamId = query.teamId;
    const db = get_db();
    if (db[teamId]) {
      delete db[teamId];
      write_db(db);
    }
  }
};

export const installationStore = {
  storeInstallation,
  fetchInstallation,
  deleteInstallation,
};

export const get_token = (teamId?: string, token_type?: string): string => {
  const db = get_db();
  let installation;
  if (teamId) {
    installation = db[teamId];
  } else {
    const keys = Object.keys(db);
    if (keys.length) {
      installation = db[keys[0]];
    }
  }
  if (!token_type || token_type === "bot") {
    return installation?.bot?.token || "";
  }
  if (token_type === "user") {
    return installation?.user?.token || "";
  }
  return "";
};
