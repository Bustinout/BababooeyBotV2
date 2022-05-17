const { Client } = require('pg')
const Bababooey = require('./bababooey');
const CONSTANTS = require('./constants');

const client = new Client({
     user: process.env.PGUSER,
     host: process.env.PGHOST,
     database: process.env.PGDATABASE,
     password: process.env.PGPASSWORD,
     port: 5432,
})

function prettyDate(timestamp) {
     tempString = timestamp + ""
     return tempString.split('(')[0]
}

client.connect()
function addNewUser(username, userID) {
     query = `INSERT INTO public.users (discord_username, discord_id, gold) VALUES('${username}', ${userID}, 0);`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack)
          } else {
               console.log("${username} added to users")
          }
     })
}

function checkUserExists(username, userID) {
     query = `SELECT COUNT(*) FROM public.users WHERE discord_id = '${userID}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack)
          } else {
               if (res.rows[0].count == 0) {
                    addNewUser(username, userID)
               }
          }
     })
}

//BIG JIM
function gym_AddWorkout(message, description, userID) {
     query = `INSERT INTO public.gym_workouts_current (description, user_id) VALUES('${description}', ${userID});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack)
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to add workout...", 'red')
          } else {
               cheer = Bababooey.getCheer()
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `\"${description}\" workout added! ${cheer}`, 'green')
          }
     })
}

function gym_ListWorkouts(message) {
     query = `SELECT * FROM public.gym_workouts_current WHERE user_id = '${message.author.id}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack)
               Bababooey.sendMessage(message, CONSTANTS.DB_ERROR, "Failed to get workouts...", 'red')
          } else {
               returnString = ""
               for (let i = 0; i < res.rowCount; i++) {
                    description = (res.rows[i].description == "") ? "No description." : res.rows[i].description
                    date = prettyDate(res.rows[i].date_created)
                    returnString += `[${res.rows[i].id}] - ${date} \n\"${description}\"\n\n`;
               }
               Bababooey.sendMessage(message, CONSTANTS.GYM_TITLE, `You have completed ${res.rowCount} workout(s) this month.\n` + returnString, 'blue')
          }
     })
}

exports.gym_AddWorkout = function (message, description, userID) {
     return gym_AddWorkout(message, description, userID)
}

exports.gym_ListWorkouts = function (message) {
     return gym_ListWorkouts(message)
}

exports.checkUserExists = function (username, userID) {
     checkUserExists(username, userID);
};