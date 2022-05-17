const Discord = require('discord.js');
const Bababooey = require('./bababooey');
const DB = require('./db');
const CONSTANTS = require('./constants');

function addWorkout(message) {
     //check there isnt crazy quote formatting
     quoteCount = (message.content.split('\"').length) - 1
     if (quoteCount == 2) {
          description = message.content.split('\"')[1]
          DB.gym_AddWorkout(message, description, message.author.id)
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym add> \"workout description\"", 'red');
     }
}

function listWorkouts(message) {
     DB.gym_ListWorkouts(message)
}

function chooseWinner() {
     //check if start of new month.
     //check db table for winner of last month.
     //select winner.
     //add new record for winner.


     Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "add!", 'green')
}

function handleArgs(message, args) {
     switch (args[1]) {
          case 'add':
               //add a workout to db
               addWorkout(message)
               break;
          case 'remove':
               //remove a workout
               //check if owned by you
               //TODO
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "remove!", 'red')
               break;
          case 'list':
               //list all workouts with an index
               listWorkouts(message)
               break;
          case 'leaderboard':
               //display leaders
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE + ' LEADERBOARD', "leaderboard!", 'green')
               break;
          case 'rank':
               //display own rank
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "you are rank X!", 'green')
               break;
          case 'champions':
               //display previous champions
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "previous champions!", 'green')
               break;

          case 'help': //get list of commands
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE + ' COMMANDS', CONSTANTS.GYM_COMMANDS, 'blue');
               break;
          default:
               Bababooey.sendMessage(message, 'WHAT?', 'For a list of gym commands type <b!gym help>.', 'red');
               break;
     }
}

exports.handleArgs = function (message, args) {
     return handleArgs(message, args);
};