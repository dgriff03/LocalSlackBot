# Using Local Slack Bot

0. Set up an [ngrok](https://ngrok.com/) account and get it running to make your local server publically accessible.
1. Set up a Slack app at `https://api.slack.com/apps`.

   - If you don't have an app, hit `Create New App`, then select `From an app manifest` and copy the yaml from `example_manifest.yaml`. Make sure to replace `YOUR_APP_NAME` (two places) and `<YOUR_NGROK>`.
     - If you have an existing app you would like to reuse, you can do the same by clicking `App Manifest` on the **Features** side-nav of https://api.slack.com/apps/<your_app>/app-home and following the steps above.
   - If you have an existing app and want to keep your configuration, just make sure that the OAuth redirect URL at https://api.slack.com/apps/<your app>/oauth?set_up_redirect_urls=1 is setup. Using OAuth will allow you to read public channels that the bot is not a member. A bot token can only read values of channels if is a member of. For the redirect URL, use `https://<YOUR_NGROK>.ngrok-free.app/slack/oauth_redirect`

2. Add an .env file to the root directory with the following values:

   - `SLACK_SIGNING_SECRET`: On the https://api.slack.com/apps/<your_app>/general page in _App Credentials_
   - `SLACK_CLIENT_ID`: On the https://api.slack.com/apps/<your_app>/general page in _App Credentials_
   - `SLACK_CLIENT_SECRET`: On the https://api.slack.com/apps/<your_app>/general page in _App Credentials_
   - `SLACK_BOT_SCOPES` (optional): Must be equal to or a subset of the **bot** scopes on https://api.slack.com/apps/<your_app>/oauth in _Scopes_, subsection _Bot Token Scopes_. Values are `;` separated. Optional if you use the example_manifest or you have the same scopes.
   - `SLACK_BOT_SCOPES`: Must be equal to or a subset of the **User** scopes on https://api.slack.com/apps/<your_app>/oauth in*Scopes*, subsection _User Token Scopes_. Values are be `;` separated. It is recommended to use channel:history here to be able to read public channels that the bot is not a member of. Optional if you use the example_manifest or you have the same scopes.
   - `SLACK_SERVER_STATE_SECRET` (Optional): Any random string - doesn't matter much unless productionalizing
   - `SLACK_SERVER_PORT` (Optional): What port you would like the server to run on. Defaults to 3000

3. Run `npm install` to install all dependencies
4. Run `npm run dev` to start the server
5. Go to `https://<YOUR_NGROK>.ngrok-free.app/slack/install`
   - Pick your target slack workspace
   - Click `Allow`
   - Click `Open Slack` on pop-up
   - Do step 5 again anytime you change scopes. Remember to change both on https://api.slack.com/apps/<your_app>/oauth and in the .env
6. You can now post to the following, using slack_method values from https://api.slack.com/methods. For all of the endopoints, the post data will be forwarded along to the method. For all methods, headers are optional
   - http://localhost:{SLACK_SERVER_PORT}/`slack_method`
     - Header[`team_id`]: If there are multiple tokens, specifying which team you would like to use. If unspecified, always uses the first entry in the "DB".
     - Header[`token_type`]: Specify if you would like to use the 'bot' token or 'user' token - defaults to 'bot';
   - http://localhost:{SLACK_SERVER_PORT}/bot/`slack_method` is the same as above but always uses token_type='bot'
   - http://localhost:{SLACK_SERVER_PORT}/user/`slack_method` is the same as above but always uses token_type='user'
7. Assuming you are using port 3000 some examples are:

```
curl -X POST http://localhost:3000/conversations.list
curl -X POST -d '{"channel": "<ID_FROM_ABOVE_COMMAND>"}' -H "Content-Type: application/json" http://localhost:3000/user/conversations.history
```

8. Want to use the token another way? The pretty-printed values are in ./src/store/db.json
