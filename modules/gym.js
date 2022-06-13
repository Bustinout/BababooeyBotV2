const Discord = require('discord.js');
const Bababooey = require('./bababooey');
const DB = require('./db');
const CONSTANTS = require('./constants');

function WHAT(message) {
     Bababooey.sendMessage(message, 'WHAT?', 'For a list of gym commands type <b!gym help>.', 'red');
}

function addWorkout(message) {
     //check there isnt crazy quote formatting
     if (((message.content.split('\"').length) - 1) == 2) {
          description = message.content.split('\"')[1];
          if (cooldownConfigMap.has(message.guildId) && cooldownConfigMap.get(message.guildId)) {
               checkOneADayAndAdd(message, description);
          } else {
               addWorkoutToDB(message, description);
          }
     } else if (((message.content.split('“').length) - 1) == 1 && ((message.content.split('”').length) - 1) == 1) {
          startIndex = message.content.indexOf('“') + 1;
          endIndex = message.content.indexOf('”');
          description = message.content.substring(startIndex, endIndex);
          if (cooldownConfigMap.has(message.guildId) && cooldownConfigMap.get(message.guildId)) {
               checkOneADayAndAdd(message, description);
          } else {
               addWorkoutToDB(message, description);
          }
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym add> \"workout description\"", 'red');
     }
}

function amendWorkout(message, index) {
     //Get description.
     var description;
     if (((message.content.split('\"').length) - 1) == 2) {
          description = message.content.split('\"')[1];
     } else if (((message.content.split('“').length) - 1) == 1 && ((message.content.split('”').length) - 1) == 1) {
          startIndex = message.content.indexOf('“') + 1;
          endIndex = message.content.indexOf('”');
          description = message.content.substring(startIndex, endIndex);
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym amend> <optional_id> \"amended workout description\"", 'red');
     }

     //Check if index supplied and handle.
     if (!isNaN(index)) {
          amendWorkoutInDB(message, description, index);
     } else {
          //If no index provided, check if workout added today and use as index if so.
          client = DB.getDBClient();
          query = `SELECT * FROM public.gym_workouts_current WHERE guild_id=${message.guildId} and user_id = '${message.author.id}' ORDER BY date_created DESC LIMIT 1;`
          client.query(query, (err, res) => {
               if (err) {
                    console.log(err.stack);
                    Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
               } else {
                    if (res.rowCount > 0) {
                         date = new Date(res.rows[0].date_created);
                         currentDate = new Date();
                         if (date.getUTCFullYear() == currentDate.getUTCFullYear() &&
                              date.getUTCMonth() == currentDate.getUTCMonth() &&
                              date.getDate() == currentDate.getDate()) {
                              amendWorkoutInDB(message, description, res.rows[0].id);
                         } else {
                              Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You don't have a workout to amend today.", 'red');
                         }
                    } else {
                         Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You don't have workouts to amend... weakman.", 'red');
                    }
               }
          });
     }
}

function amendWorkoutInDB(message, description, index) {
     client = DB.getDBClient();
     query = `UPDATE public.gym_workouts_current SET description = '${description}' WHERE user_id = '${message.author.id}' AND guild_id = '${message.guildId}' AND id = ${index};`;
     console.log(query)
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               cheer = Bababooey.getCheer();
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Workout ${index} amended to \"${description}\". ${cheer}`, 'green');
          }
     });
}

function checkOneADayAndAdd(message, description) {
     client = DB.getDBClient();
     query = `SELECT * FROM public.gym_workouts_current WHERE guild_id=${message.guildId} and user_id = '${message.author.id}' ORDER BY date_created DESC LIMIT 1;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               if (res.rowCount > 0) {
                    date = new Date(res.rows[0].date_created);
                    currentDate = new Date();

                    if (date.getUTCFullYear() == currentDate.getUTCFullYear() &&
                         date.getUTCMonth() == currentDate.getUTCMonth() &&
                         date.getDate() == currentDate.getDate()) {

                         hour = 24 - currentDate.getUTCHours();
                         minutes = 60 - currentDate.getUTCMinutes();
                         footer = `Delete your last workout or wait ${hour} hour(s) and ${minutes} minute(s) before trying again.`;
                         Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "You can only add one workout each day.", 'red', footer);
                    } else {
                         addWorkoutToDB(message, description);
                    }
               } else {
                    addWorkoutToDB(message, description);
               }
          }
     });
}

function addWorkoutToDB(message, description) {
     client = DB.getDBClient();
     query = `INSERT INTO public.gym_workouts_current (description, user_id, guild_id) VALUES('${description}', ${message.author.id}, ${message.guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               cheer = Bababooey.getCheer();
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `\"${description}\" workout added! ${cheer}`, 'green');
          }
     });
}


function listWorkouts(message, listAll) {
     client = DB.getDBClient();
     query = `SELECT * FROM public.gym_workouts_current WHERE user_id = '${message.author.id}' and guild_id = '${message.guildId}' ORDER BY date_created DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
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
                    date = DB.PrettyDate(res.rows[i].date_created);
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

function removeWorkout(message, index) {
     if (!isNaN(index)) {
          client = DB.getDBClient();
          query = `DELETE FROM public.gym_workouts_current WHERE user_id = '${message.author.id}' AND guild_id = '${message.guildId}' AND id = '${index}';`
          client.query(query, (err, res) => {
               if (err) {
                    console.log(err.stack);
                    Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
               } else {
                    if (res.rowCount != 0) {
                         Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Workout ${index} removed. LIAR!`, 'green');
                    } else {
                         Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Failed to remove workout ${index}.`, 'red');
                    }
               }
          });
     } else {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Incorrect format!\nShould look like: <b!gym remove> <id>", 'red');
     }
}

function leaderboard(message) {
     client = DB.getDBClient();
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               currentDate = new Date();
               daysInMonth = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0).getDate();

               days = daysInMonth - currentDate.getDate();
               hours = 24 - currentDate.getUTCHours();
               minutes = 60 - currentDate.getUTCMinutes();
               footer = `Big Jim will be selected after ${days} day(s) ${hours} hour(s) and ${minutes} minute(s)`;

               if (res.rowCount > 0) {
                    const simpleEmbed = new Discord.MessageEmbed()
                         .setTitle(CONSTANTS.GYM_TITLE)
                         .setDescription(`${Bababooey.getYearAndMonth()} RANKING`)

                    for (let i = 0; i < res.rowCount; i++) {
                         simpleEmbed.addField(`RANK ${i + 1}`, Bababooey.getMentionFromId(res.rows[i].user_id) + ` - ${res.rows[i].count} workout(s)`, false)
                    }
                    Bababooey.sendEmbed(message, simpleEmbed, 'blue', footer);
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Not a single workout. Weakmen... all of you.", 'blue', footer);
               }
          }
     });
}

function rank(message) {
     client = DB.getDBClient();
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
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
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `You have completed ${res.rowCount} workout(s) this month.\n\n` + "You are RANK 1! " + Bababooey.getCheer(), 'blue');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `You have completed ${res.rowCount} workout(s) this month.\n\n` + `You are RANK ${rank}.`, 'blue');
               }
          }
     });
}

function champions(message) {
     client = DB.getDBClient();
     query = `SELECT * FROM public.gym_champions WHERE guild_id = '${message.guildId}' ORDER BY id DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               const simpleEmbed = new Discord.MessageEmbed()
                    .setTitle(`BIG JIMS OF THE PAST`)
               if (res.rowCount == 0) {
                    simpleEmbed.setDescription("There are no BIG JIMS of the past yet.")
               } else {
                    for (let i = 0; i < res.rowCount; i++) {
                         simpleEmbed.addField(res.rows[i].description, Bababooey.getMentionFromId(res.rows[i].user_id), false)
                    }
               }
               Bababooey.sendEmbed(message, simpleEmbed, 'blue');
          }
     });
}

function addChampion(message, description, userId, guildId) {
     client = DB.getDBClient();
     query = `INSERT INTO public.gym_champions (description, user_id, guild_id) VALUES('${description}', ${userId}, ${guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               console.log(`Champion ${userId} successfully added.`);
          }
     });
}

function weakmen(message) {
     client = DB.getDBClient();
     query = `SELECT * FROM public.gym_weakmen WHERE guild_id = '${message.guildId}' ORDER BY id DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               const simpleEmbed = new Discord.MessageEmbed()
                    .setTitle(`WEAKMEN OF THE PAST`)
               if (res.rowCount == 0) {
                    simpleEmbed.setDescription("There are no weakmen of the past yet.")
               } else {
                    for (let i = 0; i < res.rowCount; i++) {
                         simpleEmbed.addField(res.rows[i].description, Bababooey.getMentionFromId(res.rows[i].user_id), false);
                    }
               }
               Bababooey.sendEmbed(message, simpleEmbed, 'blue');
          }
     });
}

function addWeakman(message, description, userId, guildId) {
     client = DB.getDBClient();
     query = `INSERT INTO public.gym_weakmen (description, user_id, guild_id) VALUES('${description}', ${userId}, ${guildId});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               console.log(`Weakman ${userId} successfully added.`);
          }
     });
}

function checkMonth(message) {
     client = DB.getDBClient();
     query = `SELECT * FROM public.gym_workouts_current WHERE guild_id=${message.guildId} LIMIT 1;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               if (res.rowCount > 0) {
                    date = new Date(res.rows[0].date_created);
                    currentDate = new Date();

                    if (date.getUTCFullYear() != currentDate.getUTCFullYear() ||
                         (date.getUTCFullYear() == currentDate.getUTCFullYear() && date.getUTCMonth() != currentDate.getUTCMonth())) {
                         description = Bababooey.getYearAndMonthString(date.getUTCFullYear(), date.getUTCMonth());
                         chooseWinner(description, message);
                    }
               }
          }
     });
}

function chooseWinner(description, message) {
     client = DB.getDBClient();
     query = `SELECT user_id, count(*) FROM public.gym_workouts_current WHERE guild_id = '${message.guildId}' GROUP BY user_id ORDER BY count DESC;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               if (res.rowCount > 0) {
                    const simpleEmbed = new Discord.MessageEmbed()
                         .setTitle(CONSTANTS.GYM_TITLE)
                         .setDescription(`THE RESULTS ARE IN!`)

                    cheer = Bababooey.getCheer().toUpperCase();
                    simpleEmbed.addField(`${cheer} THE ${description} BIG JIM IS...`, Bababooey.getMentionFromId(res.rows[0].user_id), false);
                    addChampion(message, description, res.rows[0].user_id, message.guildId);

                    if (res.rowCount > 1) {
                         simpleEmbed.addField(`THE ${description} WEAKMAN IS...`, Bababooey.getMentionFromId(res.rows[res.rowCount - 1].user_id), false);
                         addWeakman(message, description, res.rows[res.rowCount - 1].user_id, message.guildId);
                    }
                    clearTable(message);
                    Bababooey.sendEmbed(message, simpleEmbed, 'blue');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "There is no winner this month. Weakmen... all of you.", 'blue');
               }
          }
     });
}

function clearTable(message) {
     client = DB.getDBClient();
     query = `INSERT INTO public.gym_workouts_past SELECT * FROM public.gym_workouts_current WHERE guild_id = ${message.guildId}; DELETE FROM public.gym_workouts_current WHERE guild_id = ${message.guildId};`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, "Workouts have been reset. A new month has begun!", 'green');
          }
     });
     console.log(`Current workouts for ${message.guildId} moved to past workouts table.`);
}

function helpMessage(message) {
     const simpleEmbed = new Discord.MessageEmbed()
          .setTitle(CONSTANTS.GYM_TITLE + ' COMMANDS')
     simpleEmbed.addField(`<b!gym add> "workout description"`, `Add a workout. Once a day. Daily reset at 00:00UTC/20:00EST.`, false)
     simpleEmbed.addField(`<b!gym amend> <optional_id> "new workout description"`, `Amends the specified workout. Amends today's last workout if not specified.`, false)
     simpleEmbed.addField(`<b!gym list>`, `List your 10 most recent completed workouts for the month.`, false)
     simpleEmbed.addField(`<b!gym listAll>`, `List all your workouts for the month.`, false)
     simpleEmbed.addField(`<b!gym remove> <id>`, `Remove a workout.`, false)
     simpleEmbed.addField(`<b!gym leaderboard>`, `Display this month\'s leaderboard.`, false)
     simpleEmbed.addField(`<b!gym rank>`, `Display your current rank.`, false)
     simpleEmbed.addField(`<b!gym champions>`, `Display the BIG JIMs of the past.`, false)
     simpleEmbed.addField(`<b!gym weakmen>`, `Display the WEAKMEN of the past.`, false)
     simpleEmbed.addField(`<b!gym cooldown>`, `Toggle the daily limit for adding a workout.`, false)
     Bababooey.sendEmbed(message, simpleEmbed, 'blue');
}


function toggleCooldown(message) {
     client = DB.getDBClient();
     var query;
     var newValue;
     if (cooldownConfigMap.has(message.guildId)) {
          newValue = !cooldownConfigMap.get(message.guildId)
          cooldownConfigMap.set(message.guildId, newValue);
          query = `UPDATE public.configs SET config_value = '${String(newValue)}' WHERE guild_id = '${message.guildId}' AND config_name = 'gym_cooldown'`;
     } else {
          newValue = !cooldown_default_value;
          cooldownConfigMap.set(message.guildId, newValue);
          query = `INSERT INTO public.configs (guild_id, config_name, config_value) VALUES('${message.guildId}', 'gym_cooldown', '${String(newValue)}');`
     }
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR_TITLE, CONSTANTS.DB_ERROR, 'red');
          } else {
               if (newValue) {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Daily workout cooldown enabled.`, 'green');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `Daily workout cooldown disabled.`, 'green');
               }
          }
     });
}

cooldownConfigMap = new Map();
cooldown_default_value = true;
function LoadDBConfig() {
     //Set cooldown value.
     client = DB.getDBClient();
     query = `SELECT * FROM public.configs WHERE config_name = 'gym_cooldown';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
          } else {
               if (res.rowCount > 0) {
                    cooldownValue = (res.rows[0].config_value == "true");
                    cooldownConfigMap.set(res.rows[0].guild_id, cooldownValue);
               }
               console.log("Gym config loaded.");
          }
     });
}

function handleArgs(message, args) {
     if (message.guildId == undefined) {
          Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, 'You need to be in a channel for the BIG JIM.', 'red');
          return;
     }

     //Check if current month/year is not the same as last record for channel in DB. Select winner and loser if so.
     checkMonth(message);

     if (!args[1]) {
          WHAT(message);
          return;
     }

     switch (args[1].toLowerCase()) {
          //add a workout
          case 'add':
               addWorkout(message);
               break;

          //amend todays workout
          case 'amend':
               amendWorkout(message, args[2]);
               break;

          //list your 10 most recent workouts for the month
          case 'list':
               listWorkouts(message, false);
               break;

          //list your all your workouts for the month
          case 'listall':
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

          //toggle cooldown
          case 'cooldown':
               toggleCooldown(message);
               break;

          //get list of commands
          case 'help':
               helpMessage(message);
               break;

          default:
               WHAT(message);
               break;
     }
}

exports.handleArgs = function (message, args) {
     return handleArgs(message, args);
};

exports.LoadDBConfig = function () {
     LoadDBConfig();
}