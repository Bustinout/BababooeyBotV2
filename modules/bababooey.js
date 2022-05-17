const Discord = require('discord.js');
const DB = require('./db');
const CONSTANTS = require('./constants');

function getCheer() {
     return CONSTANTS.CHEERS[Math.floor(Math.random() * CONSTANTS.CHEERS.length)]
}

function sendMessage(message, title, text, color) {
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

     const simpleEmbed = new Discord.MessageEmbed()
          .setColor(colorV)
          .setTitle(title)
          .setDescription(text);

     message.reply({ embeds: [simpleEmbed] });
}

exports.sendMessage = function (message, title, text, color) {
     sendMessage(message, title, text, color);
};

exports.getCheer = function () {
     return getCheer();
};
