const Discord = require('discord.js');
const fs = require('fs');
let config = require("../botconfig.json");
//mongoose
const mongoose = require('mongoose');
const profileModel = require('../schemas/profileSchema.js');
const vctimeModel = require('../schemas/vctimeSchema.js');
const warnModel = require('../schemas/warnSchema.js');
const invModel = require('../schemas/inventorySchema.js');
const actionModel = require('../schemas/actionSchema.js');
module.exports.run = async (bot, message, args) => {
	try {
		//Цены
		const bannerCost = 2000;
		const lineCost = 800;
		const statusCost = 200;

		let rUser = message.author;
		let uid = message.author.id;
		let mUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
		if (mUser) {
			rUser = mUser.user;
			uid = mUser.user.id;
		}

		if (message.channel.id == config.mainChannel || message.channel.id == config.toxicChannel || message.channel.id == config.selfiesChannel) {
            bot.channels.cache.get(config.floodChannel).send(`Ещё раз привет, ${rUser}! Ты не можешь отправлять команды в общие чаты для общения! Для этого есть чат <#${config.floodChannel}>!`);
            message.delete();
            return;
        }

		let inActionData = await actionModel.findOne({ userID: uid });
		let inAction = !inActionData ? (newInActionUser = await actionModel.create({ userID: uid, inAction: 0 }), newInActionUser.save(), 0) : (inActionData.inAction);

		profileData = await profileModel.findOne({
			userID: uid
		});
		let userCoins = profileData.silverCoins;
		let userGoldCoins = profileData.goldCoins;
		let userPStatus = profileData.profileStatus;
		let userPBanner = profileData.profileBanner;
		let userPLine = profileData.profileLine;
		let userRep = profileData.reputation;
		let userMsgs = profileData.msgs;
		let userXP = profileData.xp;
		let userLvl = profileData.lvl;
		let userAchievements = profileData.achievements;
		let userClan = profileData.clan;
		let userMarriage = profileData.marriage;
		if (!(userMarriage == "" || userMarriage == " " || userMarriage == null || userMarriage == "Нет")) {
			userMarriage = bot.users.cache.get(userMarriage).tag;
		}

		vctimeData = await vctimeModel.findOne({
			userID: uid
		});
		let userVCTime = vctimeData.vctime;

		let userWarns = 0;
		warnData = await warnModel.findOne({
			userID: uid
		});
		if (warnData) {
			userWarns = warnData.warnsNumber;
		}

		let cantOpenNewDialogue = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Сначала закройте Ваше последнее диалогове окно.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let errorCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно серебра.\nВаш баланс: ${userCoins} ${config.silverCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let buyErr = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Ошибка покупки.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let buySuccess = new Discord.MessageEmbed()
			.setColor(`${config.defaultColor}`)
			.setTitle("⸝⸝ ♡₊˚ Профиль◞")
			.setDescription(`Покупка совершена!`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let buyCancel = new Discord.MessageEmbed()
			.setColor(`${config.defaultColor}`)
			.setTitle("⸝⸝ ♡₊˚ Профиль◞")
			.setDescription(`Покупка отменена.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		function isHexColor(h) {
			var a = parseInt(h, 16);
			return (a.toString(16) === h)
		}

		if (!args[0] || mUser) {
			const seconds = Math.floor((userVCTime / 1000) % 60);
			const minutes = Math.floor((userVCTime / 1000 / 60) % 60);
			const hours = Math.floor((userVCTime / 1000 / 60 / 60) % 24);
			const days = Math.floor(userVCTime / 1000 / 60 / 60 / 24);

			invData = await invModel.findOne({
				userID: uid
			});
			eqEmoji = 0;
			userEmoji = "";
			if (!invData) {
				inv = await invModel.create({
					userID: uid,
					eqEmoji: 0
				});
				//сохранение документа
				inv.save();
			} else {
				eqEmoji = invData.eqEmoji;
				userEmoji = invData.invEmoji;
			}

			if (eqEmoji > 0) {
				emojiList = userEmoji.find(x => x.index == eqEmoji).emojis;

				let [silverE, goldE, chatE, warnsE, xpE, lvlE, repE, marE, clanE, voiceE, achievE] = emojiList.split(" ");


				let profileembed = new Discord.MessageEmbed()
					.setColor(`${userPLine}`)
					.setTitle(`⸝⸝ ♡₊˚ Профиль◞`)
					.setDescription(`${userPStatus}`)
					.addField(`${silverE} Серебро`, '```' + userCoins + '```', inline = true)
					.addField(`${goldE} Золото`, '```' + userGoldCoins + '```', inline = true)
					.addField(`${chatE} Чат актив`, '```' + userMsgs + '```', inline = true)
					.addField(`${warnsE} Варны`, '```' + userWarns + '```', inline = true)
					.addField(`${xpE} Опыт`, '```' + userXP + `/` + 100 * userLvl + '```', inline = true)
					.addField(`${lvlE} Уровень`, '```' + userLvl + '```', inline = true)
					.addField(`${repE} Репутация`, '```' + userRep + '```', inline = false)
					.addField(`${marE} Брак`, '```' + userMarriage + '```', inline = true)
					.addField(`${clanE} Клан`, '```' + userClan + '```', inline = true)
					.addField(`${voiceE} Войс актив`, '```' + `${days}д. ${hours}ч. ${minutes}м. ${seconds}с.` + '```', inline = false)
					.addField(`${achievE} Знаки отличия`, '```' + userAchievements + '```', inline = false)
					.setThumbnail(`${rUser.displayAvatarURL({dynamic: true})}`)
					.setImage(`${userPBanner}`)
					.setTimestamp(message.createdAt)
					.setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL({dynamic: true})}`);

				message.channel.send(profileembed);
			} else {
				let profileembed = new Discord.MessageEmbed()
					.setColor(`${userPLine}`)
					.setTitle(`⸝⸝ ♡₊˚ Профиль◞`)
					.setDescription(`${userPStatus}`)
					.addField(`Серебро`, '```' + userCoins + '```', inline = true)
					.addField(`Золото`, '```' + userGoldCoins + '```', inline = true)
					.addField("Чат актив", '```' + userMsgs + '```', inline = true)
					.addField("Варны", '```' + userWarns + '```', inline = true)
					.addField("Опыт", '```' + userXP + `/` + 100 * userLvl + '```', inline = true)
					.addField("Уровень", '```' + userLvl + '```', inline = true)
					.addField("Репутация", '```' + userRep + '```', inline = false)
					.addField("Брак", '```' + userMarriage + '```', inline = true)
					.addField("Клан", '```' + userClan + '```', inline = true)
					.addField("Войс актив", '```' + `${days}д. ${hours}ч. ${minutes}м. ${seconds}с.` + '```', inline = false)
					.addField("Знаки отличия", '```' + userAchievements + '```', inline = false)
					.setThumbnail(`${rUser.displayAvatarURL({dynamic: true})}`)
					.setImage(`${userPBanner}`)
					.setTimestamp(message.createdAt)
					.setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL({dynamic: true})}`);

				message.channel.send(profileembed);
			}


		} else if (args[0] == "banner") {
			if (userCoins >= bannerCost) {
				let errorLink = new Discord.MessageEmbed()
					.setColor(`${config.errColor}`)
					.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
					.setDescription(`Ссылка указана неверно.`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				let msg = message.content.toLowerCase();
				if (message.content.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) == null && !(msg.includes('://tenor.com'))) return message.channel.send(errorLink);
				//не давать открыть диалоговое окно, если прошлое не закрыто
				if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
				await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
				let buyBannerEmbed = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Профиль◞")
					.setDescription(`❕` + "`" + `Перед установкой баннера убедитесь, что ваша ссылка работает.` + "`\n" + `❕` + "`" + `Рекомендуемый размер баннера: 540x200 и более.` + "`" + `\n\nВы уверены, что хотите установить баннер? Стоимость ${bannerCost} ${config.silverCoin}\nВаш баланс: ${userCoins} ${config.silverCoin}`)
					.setImage(args[1])
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				let bannerMsg = await message.channel.send(buyBannerEmbed);
				await bannerMsg.react("✅");
				await bannerMsg.react("❌");
				await bannerMsg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 20000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							bannerMsg.reactions.removeAll();
							bannerMsg.edit(buySuccess);

							if (!args[1]) {
								let errorLink = new Discord.MessageEmbed()
									.setColor(`${config.errColor}`)
									.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
									.setDescription(`Укажите ссылку на баннер своего профиля.`)
									.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
									.setTimestamp();
								message.channel.send(errorLink);

								bannerMsg.edit(buyErr);
								await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
								return;
							} else {
								if (message.content.toLowerCase().includes("https://media.") || message.content.toLowerCase().includes("https://tenor.com/") || message.content.toLowerCase().includes("http://tenor.com/") || message.content.toLowerCase().includes("http://media.") || message.content.toLowerCase().includes("https://images-ext-2.discordapp.net") || message.content.toLowerCase().includes("https://images-ext-1.discordapp.net") || message.content.toLowerCase().includes("http://images-ext-2.discordapp.net") || message.content.toLowerCase().includes("https://cdn.discordapp.com") || message.content.toLowerCase().includes("http://cdn.discordapp.com") || message.content.toLowerCase().includes("https://i.imgur.com") || message.content.toLowerCase().includes("http://i.imgur.com")) {
									profileData = await profileModel.updateOne({
										userID: uid,
									}, {
										profileBanner: args[1].toLowerCase(),
									});

									let profileBanner = new Discord.MessageEmbed()
										.setColor(`${config.defaultColor}`)
										.setTitle("⸝⸝ ♡₊˚ Профиль◞")
										.setDescription(`Баннер вашего профиля:`)
										.setImage(`${args[1].toLowerCase()}`)
										.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
										.setTimestamp();
									message.channel.send(profileBanner);
									profileData = await profileModel.updateOne({
										userID: uid,
									}, {
										$inc: {
											silverCoins: -bannerCost
										}
									});
									await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
									return;
								} else {
									profileData = await profileModel.updateOne({
										userID: uid,
									}, {
										profileBanner: config.defaultPBanner,
									});

									let errorLink = new Discord.MessageEmbed()
										.setColor(`${config.errColor}`)
										.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
										.setDescription(`Ссылка указана неверно.`)
										.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
										.setTimestamp();
									message.channel.send(errorLink);
									bannerMsg.edit(buyErr);
									await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
									return;
								}
							}
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							bannerMsg.reactions.removeAll();
							bannerMsg.edit(buyCancel);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return bannerMsg.edit(buyErr);
						}
					}).catch(async () => {
						bannerMsg.edit(buyCancel);
						bannerMsg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			} else {
				message.channel.send(errorCoins);
			}
		} else if (args[0] == "status") {
			if (userCoins >= statusCost) {
				let statusInvalid = new Discord.MessageEmbed()
					.setColor(`${config.errColor}`)
					.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
					.setDescription(`Статус не может быть больше 512 символов или менее 1`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				if (args.slice(1).join(' ').length > 512 || args.slice(1).join(' ').length < 1) return message.channel.send(statusInvalid);
				//не давать открыть диалоговое окно, если прошлое не закрыто
				if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
				await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
				let buyStatusEmbed = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Профиль◞")
					.setDescription(`Вы уверены, что хотите установить статус "${args.slice(1).join(' ')}"? Стоимость ${statusCost} ${config.silverCoin}\nВаш баланс: ${userCoins} ${config.silverCoin}`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				let statusMsg = await message.channel.send(buyStatusEmbed);
				await statusMsg.react("✅");
				await statusMsg.react("❌");
				await statusMsg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 20000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							statusMsg.reactions.removeAll();
							statusMsg.edit(buySuccess);

							if (!args[1]) {
								let errorStatus = new Discord.MessageEmbed()
									.setColor(`${config.errColor}`)
									.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
									.setDescription(`Укажите свой статус.`)
									.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
									.setTimestamp();
								message.channel.send(errorStatus);
								statusMsg.edit(buyErr);
								await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
								return;
							} else {
								profileData = await profileModel.updateOne({
									userID: uid,
								}, {
									profileStatus: args.slice(1).join(' '),
								});
								let profileStatus = new Discord.MessageEmbed()
									.setColor(`${config.defaultColor}`)
									.setTitle("⸝⸝ ♡₊˚ Профиль◞")
									.setDescription(`Ваш статус: ` + args.slice(1).join(' '))
									.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
									.setTimestamp();
								message.channel.send(profileStatus);
								profileData = await profileModel.updateOne({
									userID: uid,
								}, {
									$inc: {
										silverCoins: -statusCost
									}
								});
								await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
								return;
							}
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							statusMsg.reactions.removeAll();
							statusMsg.edit(buyCancel);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return statusMsg.edit(buyErr);
						}
					}).catch(async () => {
						statusMsg.edit(buyCancel);
						statusMsg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			} else {
				message.channel.send(errorCoins);
			}
		} else if (args[0] == "line") {
			if (userCoins >= lineCost) {
				//не давать открыть диалоговое окно, если прошлое не закрыто
				if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
				await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
				let buyLineEmbed = new Discord.MessageEmbed()
					.setColor(`${args.slice(1).join(' ')}`)
					.setTitle("⸝⸝ ♡₊˚ Профиль◞")
					.setDescription(`Вы уверены, что хотите установить цвет линии "${args.slice(1).join(' ')}"? Стоимость ${lineCost} ${config.silverCoin}\nВаш баланс: ${userCoins} ${config.silverCoin}`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				let lineMsg = await message.channel.send(buyLineEmbed);
				await lineMsg.react("✅");
				await lineMsg.react("❌");
				await lineMsg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 20000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							lineMsg.reactions.removeAll();
							lineMsg.edit(buySuccess);

							if (!args[1] || isHexColor(args.slice(1).join(' '))) {
								let errorLine = new Discord.MessageEmbed()
									.setColor(`${config.errColor}`)
									.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
									.setDescription(`Укажите HEX код линии.`)
									.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
									.setTimestamp();
								message.channel.send(errorLine);

								statusMsg.edit(buyErr);
								await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
								return;
							} else {
								profileData = await profileModel.updateOne({
									userID: uid,
								}, {
									profileLine: args.slice(1).join(' '),
								});

								let profileLine = new Discord.MessageEmbed()
									.setColor(args.slice(1).join(' '))
									.setTitle("⸝⸝ ♡₊˚ Профиль◞")
									.setDescription(`Цвет вашей линии: ` + args.slice(1).join(' '))
									.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
									.setTimestamp();
								message.channel.send(profileLine);
								profileData = await profileModel.updateOne({
									userID: uid,
								}, {
									$inc: {
										silverCoins: -lineCost
									}
								});
								await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
								return;
							}
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							lineMsg.reactions.removeAll();
							lineMsg.edit(buyCancel);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return lineMsg.edit(buyErr);
						}
					}).catch(async () => {
						lineMsg.edit(buyCancel);
						lineMsg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			} else {
				message.channel.send(errorCoins);
			}
		} else {
			let allCommands = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Команды профиля◞")
				.setDescription(`**.profile banner <ссылка на баннер>** - установить баннер профиля за ${bannerCost} ${config.silverCoin}\n> Пример: ` + '`' + '.p banner https://imgur.com/H4ygT50.gif' + '`' + `\n\n**.profile status <ваш статус>** - установиться статус в профиле за ${statusCost} ${config.silverCoin}\n> Пример: ` + '`' + '.p status Привет, это мой статус!' + '`' + `\n\n**.profile line <#HEX>** - указать цвет линии профиля за ${lineCost} ${config.silverCoin}\n> Пример: ` + '`' + '.p line #5b2076' + '`' + `\n\n**.profile help** - данное сообщение.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			message.channel.send(allCommands);
		}
	} catch (err) {
		if (err.name === "ReferenceError")
			console.log("У вас ошибка")
		console.log(`1.${err.name}\n2.${err.message}\n3.${err.stack}`);
	}
};

module.exports.help = {
	name: "profile",
	alias: "p"
};