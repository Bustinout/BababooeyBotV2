const Discord = require('discord.js');

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

require('dotenv').config();

//Load custom modules.
const Bababooey = require('./modules/bababooey');
const DB = require('./modules/db');
const Gym = require('./modules/gym');
const COMMANDS = '<b!gym> - Big Jim.'

//Connect to DB.


client.on("ready", () => {
     console.log(`Logged in as ${client.user.tag}!`)
})
client.on("message", message => {
     if (message.author.username != "BababooeyBotV2") {
          if (message.content.substring(0, 2) == 'b!') {

               DB.checkUserExists(message.author.username, message.author.id);
               let args = message.content.substring(2).split(' ');

               switch (args[0]) {
                    case 'gym':
                         Gym.handleArgs(message, args)
                         break;


                    case 'help': //get list of commands
                         Bababooey.sendMessage(message, 'COMMANDS:', COMMANDS, 'blue');
                         break;
                    default:
                         Bababooey.sendMessage(message, 'WHAT?', 'For a list of available commands type <b!help>.', 'red');
                         break;
               }

          }
     }
})
client.login(process.env.BOT_TOKEN);