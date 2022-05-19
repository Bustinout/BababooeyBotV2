const Discord = require('discord.js');
const Bababooey = require('./bababooey');
const DB = require('./db');
const CONSTANTS = require('./constants');

function addWorkout(message) {
     //check there isnt crazy quote formatting
     quoteCount = (message.content.split('\"').length) - 1
     if (quoteCount == 2) {
          description = message.content.split('\"')[1];
          DB.gym_AddWorkout(message, description);
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym add> \"workout description\"", 'red');
     }
}

function listWorkouts(message, listAll) {
     DB.gym_ListWorkouts(message, listAll);
}

function removeWorkout(message, index) {
     if (!isNaN(index)) {
          DB.gym_RemoveWorkout(message, index);
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym remove> <id>", 'red');
     }
}

function leaderboard(message) {
     DB.gym_Leaderboard(message);
}

function rank(message) {
     DB.gym_Rank(message);
}

function champions(message) {
     DB.gym_Champions(message);
}

function weakmen(message) {
     DB.gym_Weakmen(message);
}

function ChooseWinner(message) {
     //select winner.
     //add new record for winner.
     //add description like 2022 MAR BIG JIM
     //also add weakmen to record

     Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "add!", 'green')
}

function ForceEnd(message) {
     if (message.author.id == process.env.BOT_TOKEN) {
          ChooseWinner(message)
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You don't have the right, O you don't have the right.", 'red')
     }
}

function checkMonth(message) {
     //check if start of new month.
     //check db table for winner of last month.
     //ChooseWinner(message)
}

function helpMessage(message) {
     const simpleEmbed = new Discord.MessageEmbed()
          .setTitle(CONSTANTS.GYM_TITLE + ' COMMANDS')
     simpleEmbed.addField(`<b!gym add> "workout description"`, `Add a workout.`, false)
     simpleEmbed.addField(`<b!gym list>`, `List your 10 most recent completed workouts for the month.`, false)
     simpleEmbed.addField(`<b!gym listAll> "workout description"`, `List all your workouts for the month.`, false)
     simpleEmbed.addField(`<b!gym remove> <id>`, `Remove a workout.`, false)
     simpleEmbed.addField(`<b!gym leaderboard>`, `Display this month\'s leaderboard.`, false)
     simpleEmbed.addField(`<b!gym rank>`, `Display your current rank.`, false)
     simpleEmbed.addField(`<b!gym champions>`, `Display the BIG JIMs of the past.`, false)
     simpleEmbed.addField(`<b!gym weakmen>`, `Display the WEAKMEN of the past.`, false)
     Bababooey.sendEmbed(message, simpleEmbed, 'blue');
}

function handleArgs(message, args) {
     //Check if current month is not the same as last record for channel in DB. Select winner if needed.
     checkMonth(message);

     switch (args[1]) {
          //add a workout
          case 'add':
               addWorkout(message);
               break;

          //list your 10 most recent workouts for the month
          case 'list':
               listWorkouts(message, false);
               break;

          //list your all your workouts for the month
          case 'listAll':
               listWorkouts(message, true);
               break;

          //remove a workout
          case 'remove':
               removeWorkout(message, args[2]);
               break;

          //display leaders
          case 'leaderboard':
               leaderboard(message);
               break;

          //display own rank
          case 'rank':
               rank(message);
               break;

          //display past champions
          case 'champions':
               champions(message);
               break;

          //display past weakmen
          case 'weakmen':
               weakmen(message);
               break;

          //get list of commands
          case 'help':
               helpMessage(message);
               break;

          case 'end':
               ForceEnd(message);
               break;

          default:
               Bababooey.sendMessage(message, 'WHAT?', 'For a list of gym commands type <b!gym help>.', 'red');
               break;
     }
}

exports.handleArgs = function (message, args) {
     return handleArgs(message, args);
};