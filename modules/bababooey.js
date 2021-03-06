const Discord = require('discord.js');
const CONSTANTS = require('./constants');

function getCheer() {
     return CONSTANTS.CHEERS[Math.floor(Math.random() * CONSTANTS.CHEERS.length)]
}

function getColor(color) {
     let colorV = '';
     switch (color) {
          case 'blue':
               colorV = '#0080c0'
               break;
          case 'red':
               colorV = '#ff0000';
               break;
          case 'green':
               colorV = '#00ff00';
               break;
          case 'yellow':
               colorV = '#ffff00';
     }
     return colorV
}

function getMentionFromId(id) {
     return `<@!${id}>`;
}

function sendMessage(message, title, text, color, footer) {
     let colorV = getColor(color);
     const simpleEmbed = new Discord.MessageEmbed()
          .setColor(colorV)
          .setTitle(title)
          .setDescription(text);

     if (footer != undefined) {
          simpleEmbed.setFooter(footer);
     }
     message.reply({ embeds: [simpleEmbed] });
}

function sendEmbed(message, embed, color, footer) {
     let colorV = getColor(color);
     embed.setColor(colorV);
     if (footer != undefined) {
          embed.setFooter(footer);
     }
     message.reply({ embeds: [embed] });
}

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
function getYearAndMonthString(year, month) {
     return `${year} ${MONTHS[month]}`;
}
function getYearAndMonth() {
     dateObj = new Date();
     month = dateObj.getUTCMonth();
     year = dateObj.getUTCFullYear();

     return getYearAndMonthString(year, month);
}

exports.getMentionFromId = function (id) {
     return getMentionFromId(id);
};

exports.getCheer = function () {
     return getCheer();
};

exports.sendMessage = function (message, title, text, color, footer) {
     sendMessage(message, title, text, color, footer);
};

exports.sendEmbed = function (message, embed, color, footer) {
     sendEmbed(message, embed, color, footer);
};

exports.getYearAndMonth = function () {
     return getYearAndMonth();
};
exports.getYearAndMonthString = function (year, month) {
     return getYearAndMonthString(year, month);
};