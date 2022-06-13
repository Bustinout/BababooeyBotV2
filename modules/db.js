const { Client } = require('pg')
const Bababooey = require('./bababooey');
const CONSTANTS = require('./constants');
const Discord = require('discord.js');
const { DB_ERROR, DB_ERROR_TITLE } = require('./constants');

const client = new Client({
     user: process.env.PGUSER,
     host: process.env.PGHOST,
     database: process.env.PGDATABASE,
     password: process.env.PGPASSWORD,
     port: 5432,
})

function PrettyDate(timestamp) {
     tempString = timestamp + "";
     return tempString.split('(')[0];
}

client.connect()
function addNewUser(username, userID) {
     query = `INSERT INTO public.users (discord_username, discord_id, gold) VALUES('${username}', ${userID}, 0);`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, DB_ERROR_TITLE, DB_ERROR, 'red');
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
               Bababooey.sendMessage(message, DB_ERROR_TITLE, DB_ERROR, 'red');
          } else {
               if (res.rows[0].count == 0) {
                    addNewUser(username, userID);
               }
          }
     });
}

BlacklistedChannels = [];
function LoadDBConfig() {
     //Set blacklist.
     query = `SELECT * FROM public.channel_blacklist;`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
          } else {
               for (let i = 0; i < res.rowCount; i++) {
                    BlacklistedChannels.push(res.rows[i].channel_id)
               }
               console.log("Blacklist loaded.");
          }
     });
}

function IsBlacklisted(channelID) {
     return BlacklistedChannels.includes(channelID);
}

function Blacklist(message) {
     query = `INSERT INTO public.channel_blacklist (guild_id, channel_id, blacklister_user_id) VALUES('${message.guildId}', '${message.channelId}', ${message.author.id});`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, DB_ERROR_TITLE, DB_ERROR, 'red');
          } else {
               BlacklistedChannels.push(message.channelId)
               Bababooey.sendMessage(message, CONSTANTS.TITLE, `Channel blacklisted.`, 'green');
          }
     });
}

function Whitelist(message) {
     query = `DELETE FROM public.channel_blacklist WHERE guild_id = '${message.guildId}' AND channel_id = '${message.channelId}';`
     client.query(query, (err, res) => {
          if (err) {
               console.log(err.stack);
               Bababooey.sendMessage(message, DB_ERROR_TITLE, DB_ERROR, 'red');
          } else {
               if (res.rowCount != 0) {
                    BlacklistedChannels = BlacklistedChannels.filter(function (x) {
                         return x !== message.channelId;
                    });
                    Bababooey.sendMessage(message, CONSTANTS.TITLE, `Channel removed from blacklist.`, 'green');
               } else {
                    Bababooey.sendMessage(message, CONSTANTS.TITLE, `Channel is not blacklisted.`, 'red');
               }
          }
     });
}

exports.getDBClient = function () {
     return client;
}

exports.IsBlacklisted = function (channelID) {
     return IsBlacklisted(channelID)
}
exports.Blacklist = function (message) {
     Blacklist(message);
}
exports.Whitelist = function (message) {
     Whitelist(message);
}
exports.checkUserExists = function (username, userID) {
     checkUserExists(username, userID);
}
exports.PrettyDate = function (timestamp) {
     return PrettyDate(timestamp);
}
exports.LoadDBConfig = function () {
     LoadDBConfig();
}