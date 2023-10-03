# mbmbam-wiki-script
for creating templates to upload to the Fandom wiki

![image](https://user-images.githubusercontent.com/54188971/197305268-1c44dbc0-2976-4adc-98f9-03361c5990a0.png)
![image](https://user-images.githubusercontent.com/54188971/197305368-6e957a30-f4fb-435e-a5cd-82e06ab20ec7.png)

# Requirements
- WSL 2 `ubuntu 18.04`
- Node `16.9.0`
- A [Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html) with proper permissions invited to the desired servers
- A [Spotify app](https://developer.spotify.com/dashboard/applications) for show search results

# Dependencies
- `axios`
- `discord.js`

# Usage
```shell
git clone https://github.com/Coding-Christian/mbmbam-wiki-script.git
cd mbmbam-wiki-script
mv config.example.js config.js

npm install
//edit config.js to add required data
node src/main
```

In Discord, type `!mbmbam` followed by a space then the episode number to get the template for that episode's wiki page.

# Docs
- Spotify API: https://developer.spotify.com/documentation/web-api/reference/#/
- Axios: https://axios-http.com/docs/intro
- Discord.js: https://discordjs.guide/
- MBMBaM Wiki: https://mbmbam.fandom.com/wiki/My_Brother,_My_Brother_and_Me_Wiki
- Max Fun Page: https://maximumfun.org/podcasts/my-brother-my-brother-and-me/
