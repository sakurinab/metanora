const Discord = require('discord.js');
const fs = require('fs');
const derabbit = require('../package.json');
const config = require('../botconfig.json');
//mongoose
const mongoose = require('mongoose');
const profileModel = require('../schemas/profileSchema.js');
const invModel = require('../schemas/inventorySchema.js');
const actionModel = require('../schemas/actionSchema.js');

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

const emojiShop = [
	{"index": 1, "packEmoji": `${config.silverCoin} ${config.goldCoin} 💬 ☠️ 🔖 🕹️ 🎭 💞 ⚔️ 🎙️ 🏅`, "packName": "Dead rabbit", "price": "1000", "type": "silver"},
	{"index": 2, "packEmoji": `🤍 💛 💌 💢 🎀 🎈 💥 💕 🌹 🎤 🧿`, "packName": "Lovely", "price": "2000", "type": "silver"},
	{"index": 3, "packEmoji": `⚪ 🟡 🔻 ⬛ ◻ ⬜ 🔺 🔶 🔷 🔲 🔳`, "packName": "Aesthetic", "price": "4000", "type": "silver"},
	{"index": 4, "packEmoji": `💀 ☠️ ⛓️ ❕ 🎓 ⚰️ 🧟‍♂️ 🖤 🗑️ 🔝 👑 `, "packName": "Lunapack", "price": "6000", "type": "silver"},
	{"index": 5, "packEmoji": `🍼 🍯 🍎 🧂 🥚 🍳 🍪 🍭 🍰 🍕 🥓`, "packName": "Foodie", "price": "8000", "type": "silver"},
	{"index": 6, "packEmoji": `🎆 🎇 ✨ 🧨 🎉 🎊 🎫 💍 🎩 🧸 🛒`, "packName": "Party", "price": "16000", "type": "silver"},
	{"index": 7, "packEmoji": `🥈 🥇 🎰 💣 🕹 🎮 🔮 📍 🏹 🎶 📻`, "packName": "Games", "price": "32000", "type": "silver"},
	{"index": 8, "packEmoji": `🌑 🌕 🎴 🛑 ☄ ⚡ 🌸 🏮 💠 🐲 ⛩`, "packName": "Japan", "price": "400", "type": "gold"},
	{"index": 9, "packEmoji": `🌑 🌕 ☀️ ⭐ 🌟 🌠 🌀 ☄️ 💫 ⚡ ✨`, "packName": "Infinity", "price": "600", "type": "gold"},
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

        profileData = await profileModel.findOne({ userID: uid });
        let userCoins = profileData.silverCoins;
        let userGoldCoins = profileData.goldCoins;

        let inActionData = await actionModel.findOne({ userID: uid });
		let inAction = !inActionData ? (newInActionUser = await actionModel.create({ userID: uid, inAction: 0 }), newInActionUser.save(), 0) : (inActionData.inAction);

        invData = await invModel.findOne({ userID: uid });
        if (!invData) {
			inv = await invModel.create({
				userID: uid,
			});
			//сохранение документа
			inv.save();
		}

		let cmdError = new Discord.MessageEmbed()
		.setColor(`${config.errColor}`)
		.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
		.setDescription(`Неизвестная команда.\n\nПример:\n` + '`' + `.buy role <1-${roles.length}>` + '`\n' + '`' + `.buy emoji <1-${emojiShop.length}>` + '`')
		.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
		.setTimestamp();
        //.buy role <index>
        //.buy emoji <index>
        if (args[0] == "role") {
        	if (!args[1] || isNaN(args[1]) || (args[1] <= 0) || (args[1] > roles.length)) return message.channel.send(cmdError);

        	invData = await invModel.findOne({ userID: uid });
			userRoles = invData.invRoles;

			index = args[1]-1;
			roleIndex = roles[index].index;
			roleId = roles[index].roleID;
			rolePrice = roles[index].price;
			roleType = roles[index].type;

			let success = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин ролей◞`)
            .setDescription(`Роль <@&${roleId}> была куплена и добавлена в Ваш инвентарь!`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let canceled = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин ролей◞`)
            .setDescription(`Покупка была отменена!`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let alreadyHave = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин ролей◞`)
            .setDescription(`У Вас уже есть роль <@&${roleId}>`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let errorCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно серебра.\nВаш баланс: ${userCoins} ${config.silverCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

			let errorGoldCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно золота.\nВаш баланс: ${userGoldCoins} ${config.goldCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

			let conf = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин ролей◞`)
            .setDescription(`${rUser} Вы уверены, что хотите купить роль <@&${roleId}>`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            if (userRoles.find(x => x.index === roleIndex)) return message.channel.send(alreadyHave);

            //не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			const msg = await message.channel.send(conf);
            await msg.react("✅");
            await msg.react("❌");
            await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"),{max: 1, time:60000})
            .then(async collected => {
                if(collected.first().emoji.name == "✅"){

                    msg.reactions.removeAll();

                    if (roleType == "gold") {
						if (rolePrice > userGoldCoins) return message.channel.send(errorGoldCoins);

						profileData = await profileModel.updateOne({
							userID: uid,
						},{
							$inc: {
								goldCoins: -rolePrice
							}
						});
					} else if (roleType == "silver") {
						if (rolePrice > userCoins) return message.channel.send(errorCoins);

						profileData = await profileModel.updateOne({
							userID: uid,
						},{
							$inc: {
								silverCoins: -rolePrice
							}
						});
					}

					const newRoleBuy = {
						index: roleIndex,
						id: roleId,
						type: roleType
					}

					invData = await invModel.updateOne({
			        	userID: uid,
				    }, {
				    	$push: {
				    		invRoles: newRoleBuy,
				    	}
				    });

				    msg.edit(success);
				    await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return;
                } else if(collected.first().emoji.name == "❌"){
                    msg.edit(canceled);
                    msg.reactions.removeAll();
                    await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return;
                } else {
                	await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return console.log("Ошибка реакции");
                }
            }).catch(async err => {
                msg.edit(canceled);
                console.log("It's fine... " + err);
                msg.reactions.removeAll();
                await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                return;
            });
        } else if (args[0] == "emoji") {
        	if (!args[1] || isNaN(args[1]) || (args[1] <= 0) || (args[1] > emojiShop.length)) return message.channel.send(cmdError);

        	invData = await invModel.findOne({ userID: uid });
			userEmoji = invData.invEmoji;

			index = args[1]-1;
			emojiIndex = emojiShop[index].index;
			emojiPack = emojiShop[index].packEmoji;
			emojiName = emojiShop[index].packName;
			emojiPrice = emojiShop[index].price;
			emojiType = emojiShop[index].type;

			let success = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин эмоджи◞`)
            .setDescription(`Пак эмоджи <${emojiName}> был куплен и добавлен в Ваш инвентарь`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let canceled = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин эмоджи◞`)
            .setDescription(`Покупка была отменена!`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let alreadyHave = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин эмоджи◞`)
            .setDescription(`У Вас уже есть пак <${emojiName}>`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            let errorCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно серебра.\nВаш баланс: ${userCoins} ${config.silverCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

			let errorGoldCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно золота.\nВаш баланс: ${userGoldCoins} ${config.goldCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

			let conf = new Discord.MessageEmbed()
            .setTitle(`⸝⸝ ♡₊˚ Магазин эмоджи◞`)
            .setDescription(`${rUser} Вы уверены, что хотите купить пак эмоджи <${emojiName}> в который входят: <${emojiPack}>`)
            .setColor(config.defaultColor)
            .setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({ dynamic: true })}`)
            .setTimestamp();

            if (userEmoji.find(x => x.index === emojiIndex)) return message.channel.send(alreadyHave);

            //не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			const msg = await message.channel.send(conf);
            await msg.react("✅");
            await msg.react("❌");
            await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"),{max: 1, time:60000})
            .then(async collected => {
                if(collected.first().emoji.name == "✅"){

                    msg.reactions.removeAll();

                    if (emojiType == "gold") {
						if (emojiPrice > userGoldCoins) {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return message.channel.send(errorGoldCoins);
						}

						profileData = await profileModel.updateOne({
							userID: uid,
						},{
							$inc: {
								goldCoins: -emojiPrice
							}
						});
					} else if (emojiType == "silver") {
						if (emojiPrice > userCoins) {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return message.channel.send(errorCoins);
						}

						profileData = await profileModel.updateOne({
							userID: uid,
						},{
							$inc: {
								silverCoins: -emojiPrice
							}
						});
					}

					const newEmojiBuy = {
						index: emojiIndex,
						name: emojiName,
						emojis: emojiPack,
						type: emojiType
					}

					invData = await invModel.updateOne({
			        	userID: uid,
				    }, {
				    	$push: {
				    		invEmoji: newEmojiBuy,
				    	}
				    });

				    msg.edit(success);
				    await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return;
                } else if(collected.first().emoji.name == "❌"){
                    msg.edit(canceled);
                    msg.reactions.removeAll();
                    await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return;
                } else {
                	await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                    return console.log("Ошибка реакции");
                }
            }).catch(async err => {
                msg.edit(canceled);
                console.log("It's fine... " + err);
                msg.reactions.removeAll();
                await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
                return;
            });
        } else {
        	message.channel.send(cmdError);
        	return;
        }

	} catch(err) {
		if(err.name === "ReferenceError")
		console.log("У вас ошибка")
		console.log(`1.${err.name}\n2.${err.message}\n3.${err.stack}`);
	}
};

module.exports.help = {
	name: "buy"
};