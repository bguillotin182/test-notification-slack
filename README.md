# nodeJS-notification-hook-slack

## For installation,

1. Be sure you have `nodeJs` installed and running with version > 6
    ..* Test it in a terminal with `which node` && `node -v`

2. Run `npm install` for all the dependencies contains in `package.json`

3. Run `node main.js` to run the application


## General Help :
Here is a POSTMAN collection to help you to test the `nodeJS` server : https://www.getpostman.com/collections/dc661de8ae74d0b04ad5
- [link to Slack Node package!](https://www.npmjs.com/package/slack-node)
- [link to my Slack incoming webhook uri!](https://my.slack.com/services/new/incoming-webhook)
- [link to Slack Legacy Token](https://api.slack.com/custom-integrations/legacy-tokens)

## Dev Help :
```
slack.webhook({
    channel: "#testnotificationhook",
    username: 'Benoit',
    text: '<https://github.com/bguillotin182/nodeJS-notification-hook-slack/issues|Click here to report a bug>',
    icon_emoji: ":ghost:",
});
```
