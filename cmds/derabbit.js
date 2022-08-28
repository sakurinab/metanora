const Discord = require('discord.js');
const fs = require('fs');
const config = require('../botconfig.json');
const info = require('../botinfo.json');
const mongoose = require('mongoose');
const botUptime = require('../schemas/uptime.js');
module.exports.run = async (bot,message,args) => {
	
	let rUser = message.author;

	if (message.channel.id == config.mainChannel || message.channel.id == config.toxicChannel || message.channel.id == config.selfiesChannel) {
        bot.channels.cache.get(config.floodChannel).send(`Ещё раз привет, ${rUser}! Ты не можешь отправлять команды в общие чаты для общения! Для этого есть чат <#${config.floodChannel}>!`);
        message.delete();
        return;
    }

	uptimeData = await botUptime.findOne({ name: 'Dead_rabbit_bot' });
	let uptimems = uptimeData.uptime;

	let mustWork = Date.now() - info.BotStart;

	let uptimepersent = ((uptimems/mustWork)*100).toFixed(2);

	let derabbitEmbed = new Discord.MessageEmbed()
	.setColor(config.defaultColor)
	.setTitle(`⸝⸝ ♡₊˚ Dead rabbit.◞`)
	.setDescription(`**Информация о боте:**`)
	.addField(`Автор: `, '```' + `${info.Author}` + '```', inline = true)
	.addField(`Версия: `, '```' + `${info.Version}` + '```', inline = true)
	.addField(`Лицензия: `, '```' + `${info.License}` + '```', inline = true)
	.addField(`RAM: `, '```' + `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB` + '```', inline = true)
	.addField(`В работе: `, '```' + `${Math.floor(bot.uptime / 1000 / 60 / 60 / 24)}д. ${Math.floor((bot.uptime / 1000 / 60 / 60) % 24)}ч. ${Math.floor((bot.uptime / 1000 / 60) % 60)}м. ${Math.floor((bot.uptime / 1000) % 60)}с.` + '```', inline = true)
	.addField(`Аптайм: `, '```' + `${uptimepersent}%` + '```', inline = true)
	.addField(`Derabbit пинг: `, '```' + `${Date.now() - message.createdTimestamp}ms` + '```', inline = true)
	.addField(`API пинг: `, '```' + `${Math.round(bot.ws.ping)}ms` + '```', inline = true)
	.addField(`Последнее обновление: `, '```' + `${info.LastUpdate}` + '```', inline = false)
	.addField(`Специальная благодарность: `, '⚡`' + `Keyloga` + '`\n' + '⚡`' + `Sharell` + '`\n' + '⚡`' + `lunapark.` + '`', inline = false)
	.setImage('https://imgur.com/fWJ0Jca.gif')
	.setFooter(`© Dead Rabbit ☕ by Kristopher`);
	message.channel.send(derabbitEmbed);
};

module.exports.help = {
	name: "derabbit"
};