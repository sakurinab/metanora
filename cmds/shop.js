const Discord = require('discord.js');
const fs = require('fs');
const derabbit = require('../package.json');
const config = require('../botconfig.json');
const pagination = require('discord.js-pagination');
//mongoose
const mongoose = require('mongoose');
const invModel = require('../schemas/inventorySchema.js');

//магазин ролей
const roles = [
	{"index": 1, "roleID": "831929939028606996", "price": "1000", "type": "silver"},
	{"index": 2, "roleID": "831929952906903578", "price": "2000", "type": "silver"},
	{"index": 3, "roleID": "831929967498494002", "price": "4000", "type": "silver"},
	{"index": 4, "roleID": "831929982015111208", "price": "6000", "type": "silver"},
	{"index": 5, "roleID": "831929998611972168", "price": "8000", "type": "silver"},
	{"index": 6, "roleID": "831930014319902772", "price": "10000", "type": "silver"},
	{"index": 7, "roleID": "831930028673466428", "price": "12000", "type": "silver"},
	{"index": 8, "roleID": "831930044129607740", "price": "14000", "type": "silver"},
	{"index": 9, "roleID": "831930056774385684", "price": "20000", "type": "silver"},
	{"index": 10, "roleID": "831930091449483305", "price": "22000", "type": "silver"},
	{"index": 11, "roleID": "831930110646288465", "price": "24000", "type": "silver"},
	{"index": 12, "roleID": "831930123195383870", "price": "26000", "type": "silver"},
	{"index": 13, "roleID": "831930136156176434", "price": "28000", "type": "silver"},
	{"index": 14, "roleID": "831930148814192680", "price": "30000", "type": "silver"},
	{"index": 15, "roleID": "831930161641160724", "price": "32000", "type": "silver"},
	{"index": 16, "roleID": "831930175230443530", "price": "40000", "type": "silver"},
	{"index": 17, "roleID": "831929925459247134", "price": "150", "type": "gold"},
	{"index": 18, "roleID": "831929911911907399", "price": "150", "type": "gold"},
	{"index": 19, "roleID": "831929896212496394", "price": "200", "type": "gold"},
	{"index": 20, "roleID": "831929881981353985", "price": "200", "type": "gold"},
	{"index": 21, "roleID": "831929868915965992", "price": "250", "type": "gold"},
	{"index": 22, "roleID": "831929855645843456", "price": "250", "type": "gold"},
	{"index": 23, "roleID": "831929842471141397", "price": "500", "type": "gold"},
	{"index": 24, "roleID": "831929827967369218", "price": "500", "type": "gold"},
];

module.exports.run = async (bot,message,args) => {
	try{
		
		let rUser = message.author;
		let uid = message.author.id;

		if (message.channel.id == config.mainChannel || message.channel.id == config.toxicChannel || message.channel.id == config.selfiesChannel) {
            bot.channels.cache.get(config.floodChannel).send(`Ещё раз привет, ${rUser}! Ты не можешь отправлять команды в общие чаты для общения! Для этого есть чат <#${config.floodChannel}>!`);
            message.delete();
            return;
        }

		invData = await invModel.findOne({ userID: uid });
        if (!invData) {
			inv = await invModel.create({
				userID: uid,
			});
			//сохранение документа
			inv.save();
		}
		userRoles = invData.invRoles;

		var storeEmbedPage1 = new Discord.MessageEmbed()
		.setColor("#147cb8")
		.setTitle("⸝⸝ ♡₊˚ Магазин ролей◞")
		.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
		.setTimestamp();

		for (let i = 0; i < 8; i++) {
			storeEmbedPage1.addField(`Индекс`, "`" + `${roles[i].index}` + "`", inline = true);
			storeEmbedPage1.addField(`Роль`, `<@&${roles[i].roleID}>`, inline = true);
			if (userRoles.find(x => x.index === roles[i].index)) {
				storeEmbedPage1.addField(`Цена`, `куплено!`, inline = true);
			} else {
				if (roles[i].type == "gold") {
					storeEmbedPage1.addField(`Цена`, `${roles[i].price} ${config.goldCoin}`, inline = true);
				} else {
					storeEmbedPage1.addField(`Цена`, `${roles[i].price} ${config.silverCoin}`, inline = true);
				}
			}
		}

		var storeEmbedPage2 = new Discord.MessageEmbed()
		.setColor("#d1234f")
		.setTitle("⸝⸝ ♡₊˚ Магазин ролей◞")
		.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
		.setTimestamp();

		for (let i = 8; i < 16; i++) {
			storeEmbedPage2.addField(`Индекс`, "`" + `${roles[i].index}` + "`", inline = true);
			storeEmbedPage2.addField(`Роль`, `<@&${roles[i].roleID}>`, inline = true);
			if (userRoles.find(x => x.index === roles[i].index)) {
				storeEmbedPage2.addField(`Цена`, `Куплено!`, inline = true);
			} else {
				if (roles[i].type == "gold") {
					storeEmbedPage2.addField(`Цена`, `${roles[i].price} ${config.goldCoin}`, inline = true);
				} else {
					storeEmbedPage2.addField(`Цена`, `${roles[i].price} ${config.silverCoin}`, inline = true);
				}
			}
		}

		var storeEmbedPage3 = new Discord.MessageEmbed()
		.setColor("#00c09a")
		.setTitle("⸝⸝ ♡₊˚ Магазин ролей◞")
		.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
		.setTimestamp();

		for (let i = 16; i < 24; i++) {
			storeEmbedPage3.addField(`Индекс`, "`" + `${roles[i].index}` + "`", inline = true);
			storeEmbedPage3.addField(`Роль`, `<@&${roles[i].roleID}>`, inline = true);
			if (userRoles.find(x => x.index === roles[i].index)) {
				storeEmbedPage3.addField(`Цена`, `куплено!`, inline = true);
			} else {
				if (roles[i].type == "gold") {
					storeEmbedPage3.addField(`Цена`, `${roles[i].price} ${config.goldCoin}`, inline = true);
				} else {
					storeEmbedPage3.addField(`Цена`, `${roles[i].price} ${config.silverCoin}`, inline = true);
				}
			}
		}


		const pages = [
			storeEmbedPage1,
			storeEmbedPage2,
			storeEmbedPage3
		];
		const emoji = ["⏪", "⏩"];
		const timeout = '45000';
		pagination(message, pages, emoji, timeout);

	} catch(err) {
		if(err.name === "ReferenceError")
		console.log("У вас ошибка")
		console.log(`1.${err.name}\n2.${err.message}\n3.${err.stack}`);
	}
};

module.exports.help = {
	name: "roleshop",
	alias: "rs"
};