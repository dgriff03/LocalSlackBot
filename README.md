# Using Local Slack Bot

1. Set up your slack app to use OAuth and add a redirect URL at https://api.slack.com/apps/<your app>/oauth?set_up_redirect_urls=1 . Using OAuth will allow you to read public channels that bot is not a member of rather than needing to add the bot to each channel. For the redirect URL, use `https://<your_value>.ngrok-free.app/slack/oauth_redirect`

   - Use [ngrok](https://ngrok.com/) to make your local server publically accessible

2. Add an .env file to the root directory with the following values:

   - `SLACK_SIGNING_SECRET`: On the https://api.slack.com/apps/<your*app>/general page in \_App Credentials*
   - `SLACK_CLIENT_ID`: On the https://api.slack.com/apps/<your*app>/general page in \_App Credentials*
   - `SLACK_CLIENT_SECRET`: On the https://api.slack.com/apps/<your*app>/general page in \_App Credentials*
   - `SLACK_BOT_SCOPES`: Should be equal to or a subset of the **bot** scopes on https://api.slack.com/apps/<your*app>/oauth in \_Scopes*, subsection _Bot Token Scopes_. Values should be `;` separated
   - `SLACK_BOT_SCOPES`: Should be equal to or a subset of the **User** scopes on https://api.slack.com/apps/<your*app>/oauth in \_Scopes*, subsection _User Token Scopes_. Values should be `;` separated. It is recommended to use channel:history here to be able to read public channels that the bot is not a member of.
   - `SLACK_SERVER_STATE_SECRET` (Optional): Any random string - doesn't matter much unless productionalizing
   - `SLACK_SERVER_PORT` (Optional): What port you would like the server to run on. Defaults to 3000

3. Run `npm install` to install all dependencies
4. Run `npm run dev` to start the server
5. Go to `https://<your_value>.ngrok-free.app/slack/install`
   - Pick your target slack workspace
   - Click `Allow`
   - Click `Open Slack` on pop-up
   - Do step 5 again anytime you change scopes. Remember to change both on https://api.slack.com/apps/<your\*app>/oauth and in the .env
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
