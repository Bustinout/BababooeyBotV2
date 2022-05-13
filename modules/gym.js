const Discord = require('discord.js');
const Bababooey = require('./bababooey');

const COMMANDS = '<b!gym add> "workout name" - Add a workout.\n'
const MODULE_NAME = 'gym'
const TITLE = 'GYM'

function chooseWinner() {
     //check if start of new month.
     //check db table for winner of last month.
     //select winner.
     //add new record for winner.
}

function handleArgs(message, args) {
     console.log(args[1])
     switch (args[1]) {
          case 'add':
               //add a workout to db
               Bababooey.sendMessage(message, TITLE, "add!", 'green')
               break;
          case 'remove':
               //remove a workout
               //check if owned by you
               Bababooey.sendMessage(message, TITLE, "remove!", 'green')
          case 'workouts':
               //list all workouts with an index
               Bababooey.sendMessage(message, TITLE, "workouts!", 'green')
          case 'leaderboard':
               //display leaders
               Bababooey.sendMessage(message, TITLE + ' LEADERBOARD', "leaderboard!", 'green')
               break;
          case 'rank':
               //display own rank
               Bababooey.sendMessage(message, TITLE, "you are rank X!", 'green')
               break;
          case 'champions':
               //display previous champions
               Bababooey.sendMessage(message, TITLE, "previous champions!", 'green')
               break;

          case 'help': //get list of commands
               Bababooey.sendMessage(message, TITLE + '- COMMANDS', COMMANDS, 'blue');
               break;
          default:
               Bababooey.sendMessage(message, 'WHAT?', 'For a list of ' + MODULE_NAME + ' commands type <b!' + MODULE_NAME + ' help>.', 'red');
               break;
     }
}

exports.handleArgs = function (message, args) {
     return handleArgs(message, args);
};