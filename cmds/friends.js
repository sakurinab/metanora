const Discord = require('discord.js');
const fs = require('fs');
module.exports.run = async (bot,message,args) => {
	let friends = new Discord.MessageEmbed()
	.setColor("#de3f67")
	.setTitle("⸝⸝ ♡₊˚ Друзья...◞")
	.setFooter(`© Dead Rabbit ☕ by Kristopher`)
	.setDescription(`Вы лучшие! ♥\n<@663846965930491973>\n<@702937369497829410>\n<@488758680683151366>\n<@419862963483181056>\n<@399553080913297408>`)
	.setTimestamp();
	message.channel.send(friends);
};

module.exports.help = {
	name: "friends"
};