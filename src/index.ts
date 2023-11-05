import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { App, ExpressReceiver, LogLevel, Logger } from "@slack/bolt";

import { installationStore, get_token } from "./installationStore";

const app = express();
const port = parseInt(process.env["SLACK_SERVER_PORT"] || "3000", 10);

const signingSecret = process.env["SLACK_SIGNING_SECRET"] || "";
const clientId = process.env["SLACK_CLIENT_ID"] || "";
const clientSecret = process.env["SLACK_CLIENT_SECRET"] || "";
const stateSecret = process.env["SLACK_SERVER_STATE_SECRET"] || "super-secret";
const scopes = (
  process.env["SLACK_BOT_SCOPES"] ||
  "channels:read;channels:history;users:read;users:read.email;users.profile:read"
).split(";");
const userScopes = (
  process.env["SLACK_USER_SCOPES"] || "channels:read;channels:history"
).split(";");

const missing: string[] = [];
const required = { signingSecret, clientId, clientSecret, stateSecret };
for (const [key, val] of Object.entries(required)) {
  if (val === "") {
    missing.push(key);
  }
}

if (scopes.length === 0) {
  missing.push("scopes");
}

if (missing.length > 0) {
  throw Error(`Missing values for the following keys: ${missing.join(", ")}`);
}

const receiver = new ExpressReceiver({
  logLevel: LogLevel.INFO,
  app: app,
  signingSecret,
  clientId,
  clientSecret,
  stateSecret,
  scopes,
  installationStore,
  installerOptions: {
    directInstall: true,
    userScopes,
  },
});

const slackapp = new App({
  signingSecret,
  receiver,
});

app.use(express.json());

const handle_slack_method = async (
  req: Request,
  res: Response,
  next: NextFunction,
  args: { team_id: string; token_type: string }
) => {
  const { team_id, token_type } = args;
  const token = get_token(team_id, token_type);
  const slack_method = req.params.slack_method;

  const { client } = new App({
    token,
    signingSecret,
  });

  try {
    const resp = await client.apiCall(slack_method, req.body);
    res.json(JSON.stringify(resp));
  } catch (error) {
    res.status(400).json(JSON.stringify({ error }));
  }
};

app.post("/:slack_method", async (req, res, next) => {
  const team_id = (req.headers["team-id"] as string) || "";
  const token_type = (req.headers["token_type"] as string) || "";
  await handle_slack_method(req, res, next, {
    team_id,
    token_type,
  });
});

app.post("/:token_type/:slack_method", async (req, res, next) => {
  const team_id = (req.headers["team-id"] as string) || "";
  const token_type = req.params.token_type;

  await handle_slack_method(req, res, next, {
    team_id,
    token_type,
  });
});

const server = app.listen(port, () => {
  console.log(`Server ready at: http://localhost:${port}`);
});
