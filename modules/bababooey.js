const Discord = require('discord.js');

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

function getName(message) {
     return message.author.username;
}

function createUser(username, userID) {
     //create user to sql db
}

exports.sendMessage = function (message, title, text, color) {
     sendMessage(message, title, text, color);
};

exports.getName = function (message) {
     return getName(message);
};

exports.createUser = function (username, userID) {
     createUser(username, userID);
};