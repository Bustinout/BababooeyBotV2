const { Client } = require('pg')
const Bababooey = require('./bababooey');
const CONSTANTS = require('./constants');
const Discord = require('discord.js');

const client = new Client({
     user: process.env.PGUSER,
     host: process.env.PGHOST,
     database: process.env.PGDATABASE,
     password: process.env.PGPASSWORD,
     port: 5432,
})

function prettyDate(timestamp) {
     tempString = timestamp + "";
     return tempString.split('(')[0];
}

client.connect()
function addNewUser(username, userID) {
     query = `INSERT INTO public.users (discord_username, discord_id, gold) VALUES('${username}', ${userID}, 0);`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
          } else {
               console.log("${username} added to users");
          }
     });
}

function checkUserExists(username, userID) {
     query = `SELECT COUNT(*) FROM public.users WHERE discord_id = '${userID}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
          } else {
               if (res.rows[0].count == 0) {
                    addNewUser(username, userID);
               }
          }
     });
}

//BIG JIM
function gym_AddWorkout(message, description) {
     query = `INSERT INTO public.gym_workouts_current (description, user_id, guild_id) VALUES('${description}', ${message.author.id}, ${message.guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to add workout...", 'red');
          } else {
               cheer = Bababooey.getCheer();
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `\"${description}\" workout added! ${cheer}`, 'green');
          }
     });
}

function gym_ListWorkouts(message, listAll) {
     query = `SELECT * FROM public.gym_workouts_current WHERE user_id = '${message.author.id}' and guild_id = '${message.guildId}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to get workouts...", 'red');
          } else {
               displayCount = 0;
               if (listAll) {
                    displayCount = res.rowCount;
               } else {
                    displayCount = Math.min(10, res.rowCount);
               }
               const simpleEmbed = new Discord.MessageEmbed()
                    .setTitle(CONSTANTS.GYM_TITLE)
                    .setDescription(`You have completed ${res.rowCount} workout(s) this month.`)

               for (let i = 0; i < displayCount; i++) {
                    description = (res.rows[i].description == "") ? "No description." : res.rows[i].description;
                    date = prettyDate(res.rows[i].date_created);
                    simpleEmbed.addField(`[#${res.rows[i].id}] "${description}"`, date, false)
               }
               if (!listAll) {
                    notShown = res.rowCount - 10;
                    if (notShown > 0) {
                         simpleEmbed.setFooter(`${notShown} workout(s) not shown.`);
                    }
               }

               Bababooey.sendEmbed(message, simpleEmbed, 'blue');
          }
     });
}

function gym_RemoveWorkout(message, index) {
     query = `DELETE FROM public.gym_workouts_current WHERE user_id = '${message.author.id}' AND guild_id = '${message.guildId}' AND id = '${index}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to add workout...", 'red');
          } else {
               if (res.rowCount != 0) {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Workout ${index} removed. LIAR!`, 'green');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Failed to remove workout ${index}.`, 'red');
               }
          }
     });
}

function gym_Leaderboard(message) {
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to fetch leaderboard...", 'red');
          } else {
               if (res.rowCount > 0) {
                    const simpleEmbed = new Discord.MessageEmbed()
                         .setTitle(CONSTANTS.GYM_TITLE)
                         .setDescription(`${Bababooey.getYearAndMonth()} RANKING`)

                    for (let i = 0; i < res.rowCount; i++) {
                         simpleEmbed.addField(`RANK ${i + 1}`, Bababooey.getMentionFromId(res.rows[i].user_id), false)
                    }
                    Bababooey.sendEmbed(message, simpleEmbed, 'blue');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Not a single workout. Weakmen... all of you.", 'blue');
               }
          }
     });
}

function gym_Rank(message) {
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to fetch rank...", 'red');
          } else {
               rank = 0;
               for (let i = 0; i < res.rowCount; i++) {
                    if (res.rows[i].user_id == message.author.id) {
                         rank = i + 1;
                         break;
                    }
               }

               if (rank == 0) {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You are not ranked... pathetic.", 'blue');
               } else if (rank == 1) {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You are RANK 1! " + Bababooey.getCheer(), 'blue');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `You are RANK ${rank}.`, 'blue');
               }
          }
     });
}

function gym_Champions(message) {
     query = `SELECT * FROM public.gym_champions WHERE guild_id = '${message.guildId}' ORDER BY id DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to fetch champions of the past...", 'red');
          } else {
               const simpleEmbed = new Discord.MessageEmbed()
                    .setTitle(`BIG JIMS OF THE PAST`)
               for (let i = 0; i < res.rowCount; i++) {
                    simpleEmbed.addField(res.rows[i].description, Bababooey.getMentionFromId(res.rows[i].user_id), false)
               }
               Bababooey.sendEmbed(message, simpleEmbed, 'blue');

          }
     });
}

function gym_Weakmen(message) {
     query = `SELECT * FROM public.gym_weakmen WHERE guild_id = '${message.guildId}' ORDER BY id DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to fetch weakmen of the past...", 'red');
          } else {
               const simpleEmbed = new Discord.MessageEmbed()
                    .setTitle(`WEAKMEN OF THE PAST`)
               for (let i = 0; i < res.rowCount; i++) {
                    simpleEmbed.addField(res.rows[i].description, Bababooey.getMentionFromId(res.rows[i].user_id), false);
               }
               Bababooey.sendEmbed(message, simpleEmbed, 'blue');
          }
     });
}

function gym_AddChampion(description, userId, guildId){
     query = `INSERT INTO public.gym_champions (description, user_id, guild_id) VALUES('${description}', ${userId}, ${guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to add big jim...", 'red');
          } else {
               console.log(`Champion ${userId} successfully added.`);
          }
     });
}

function gym_AddWeakman(description, userId, guildId){
     query = `INSERT INTO public.gym_weakmen (description, user_id, guild_id) VALUES('${description}', ${userId}, ${guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to add weakman...", 'red');
          } else {
               console.log(`Weakman ${userId} successfully added.`);
          }
     });
}

function gym_CheckMonth(message){
     query = `SELECT * FROM public.gym_workouts_current WHERE guild_id=${message.guildId} LIMIT 1;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
          } else {
               if (res.rowCount > 0){
                    date = new Date(res.rows[0].date_created);
                    currentDate = new Date();

                    if (date.getUTCFullYear() != currentDate.getUTCFullYear() || 
                         (date.getUTCFullYear() == currentDate.getUTCFullYear() && date.getUTCMonth() != currentDate.getUTCMonth()) ){
                         description = Bababooey.getYearAndMonthString(date.getUTCFullYear(), date.getUTCMonth());
                         gym_ChooseWinner(description, message);
                    }
               }
          }
     });
}

function gym_ClearCurrent(message){
     query = `INSERT INTO public.gym_workouts_past SELECT * FROM public.gym_workouts_current WHERE guild_id = ${message.guildId}; DELETE FROM public.gym_workouts_current WHERE guild_id = ${message.guildId};`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to reset workouts table...", 'red');
          } else {
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Workouts have been reset. A new month has begun!", 'green');
          }
     });
     console.log(`Current workouts for ${message.guildId} moved to past workouts table.`);
}

function gym_ChooseWinner(description, message){
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to pick winner...", 'red');
          } else {
               if (res.rowCount > 0) {
                    const simpleEmbed = new Discord.MessageEmbed()
                         .setTitle(CONSTANTS.GYM_TITLE)
                         .setDescription(`THE RESULTS ARE IN!`)

                    cheer = Bababooey.getCheer().toUpperCase()l
                    simpleEmbed.addField(`${cheer} THE ${description} BIG JIM IS...`, Bababooey.getMentionFromId(res.rows[0].user_id), false);
                    gym_AddChampion(description, res.rows[0].user_id, res.rows[0].guild_id);

                    if (res.rowCount > 1){
                         simpleEmbed.addField(`THE ${description} WEAKMAN IS...`, Bababooey.getMentionFromId(res.rows[res.rowCount-1].user_id), false);
                         gym_AddWeakman(description, res.rows[res.rowCount-1].user_id, res.rows[res.rowCount-1].guild_id);
                    }
                    gym_ClearCurrent(message);
                    Bababooey.sendEmbed(message, simpleEmbed, 'blue');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "There is no winner this month. Weakmen... all of you.", 'blue');
               }
          }
     });
}

exports.gym_AddWorkout = function (message, description) {
     return gym_AddWorkout(message, description);
}

exports.gym_ListWorkouts = function (message, listAll) {
     return gym_ListWorkouts(message, listAll);
}

exports.gym_RemoveWorkout = function (message, index) {
     return gym_RemoveWorkout(message, index);
}

exports.checkUserExists = function (username, userID) {
     checkUserExists(username, userID);
}

exports.gym_Leaderboard = function (message) {
     gym_Leaderboard(message);
}

exports.gym_Rank = function (message) {
     gym_Rank(message);
}

exports.gym_Champions = function (message) {
     gym_Champions(message);
}

exports.gym_Weakmen = function (message) {
     gym_Weakmen(message);
}

exports.gym_CheckMonth = function (message) {
     gym_CheckMonth(message);
}