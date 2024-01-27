# A Slash Command Discord Bot
Originally created as a way to create templates for new pages of the MBMBaM Wiki, now expanded with support for adding new slash commands.

## Requirements
- WSL 2 ubuntu 22.04
- Node 19.9.0
- A [Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) with proper permissions invited to the desired servers

## Dependencies
- `axios`
- `discord.js`

## Available Commands
Invoke commands by typing `/command` in a Discord channel where the bot has access.

### mbmbam
Use to create new page templates for the [MBMBaM Fandom Wiki](https://mbmbam.fandom.com/wiki/My_Brother,_My_Brother_and_Me_Wiki) utilizing data from [MaximumFun](https://maximumfun.org/podcasts/my-brother-my-brother-and-me/) and the [Spotify API](https://developer.spotify.com/documentation/web-api/reference/#/). In Discord, type `/mbmbam` followed by a space then the episode number to get the template for that episode's wiki page.

#### Requirements
- A [Spotify app](https://developer.spotify.com/dashboard/applications) for podcast search results

#### Usage
```sh
git clone https://github.com/Coding-Christian/mbmbam-wiki-script.git
cd mbmbam-wiki-script
mv src/config.example.js src/config.js #edit src/config.js to add required data

npm install
node src/main
```

#### Preview
![image](https://user-images.githubusercontent.com/54188971/197305268-1c44dbc0-2976-4adc-98f9-03361c5990a0.png)
![image](https://user-images.githubusercontent.com/54188971/197305368-6e957a30-f4fb-435e-a5cd-82e06ab20ec7.png)

## Docs and Resources
- [Axios](https://axios-http.com/docs/intro)
- [Discord.js](https://discordjs.guide/)
