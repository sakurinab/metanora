//  _____       _ _     _                  _                       
// |  __ \     (_) |   | |                | |                      
// | |  \/_   _ _| | __| |   ___ _   _ ___| |_ ___ _ __ ___        
// | | __| | | | | |/ _` |  / __| | | / __| __/ _ \ '_ ` _ \       
// | |_\ \ |_| | | | (_| |  \__ \ |_| \__ \ ||  __/ | | | | |      
//  \____/\__,_|_|_|\__,_|  |___/\__, |___/\__\___|_| |_| |_|      
//                                __/ |                            
//  _              _   __     _  |___/             _               
// | |            | | / /    (_)   | |            | |              
// | |__  _   _   | |/ / _ __ _ ___| |_ ___  _ __ | |__   ___ _ __ 
// | '_ \| | | |  |    \| '__| / __| __/ _ \| '_ \| '_ \ / _ \ '__|
// | |_) | |_| |  | |\  \ |  | \__ \ || (_) | |_) | | | |  __/ |   
// |_.__/ \__, |  \_| \_/_|  |_|___/\__\___/| .__/|_| |_|\___|_|   
//         __/ |                            | |                    
//        |___/       _____         ___     |_|                    
//         /  |      / __  \       /   |                           
// __   __ `| |      `' / /'      / /| |                           
// \ \ / /  | |        / /       / /_| |                           
//  \ V /  _| |_  _  ./ /___  _  \___  |                           
//   \_/   \___/ (_) \_____/ (_)     |_/                           
//
//
const Discord = require('discord.js');
const fs = require('fs');
const derabbit = require('../package.json');
const config = require('../botconfig.json');
//mongoose
const mongoose = require('mongoose');
const clanModel = require('../schemas/clanSchema.js');
const profileModel = require('../schemas/profileSchema.js');
const deposeModel = require('../schemas/clanDepositSchema.js');
const actionModel = require('../schemas/actionSchema.js');
//цены
const clanCost = 50000;
const lvlMultiCost = 70000;
const coinMultiCost = 100000;
const xplvlmult = 4320;
const clanDepositLimit = 15000;
const deposeCooldown = 43200000; //ms
const setColorCost = 5000;
const clanDescCost = 5000;
const clanSymbolCost = 15000;
const clanSetImageCost = 30000;
const clanRenameCost = 10000;
const clanSlotsCost = 60000;
const bombCost = 800;
const bombCooldown = 1000 * 60 * 60 * 4;
const robCost = 300;
const robCooldown = 1000 * 60 * 60 * 2;

function isHexColor(h) {
	var a = parseInt(h, 16);
	return (a.toString(16) === h)
}

module.exports.run = async (bot, message, args) => {
	try {
		let rUser = message.author;
		let uid = message.author.id;
		let mUser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[1]));

		if (message.channel.id == config.mainChannel || message.channel.id == config.toxicChannel || message.channel.id == config.selfiesChannel) {
            bot.channels.cache.get(config.floodChannel).send(`Ещё раз привет, ${rUser}! Ты не можешь отправлять команды в общие чаты для общения! Для этого есть чат <#${config.floodChannel}>!`);
            message.delete();
            return;
        }

		profileData = await profileModel.findOne({
			userID: uid
		});
		let userCoins = profileData.silverCoins;
		let userClan = profileData.clan;

		//Основные эмбеды
		let systemInfo = new Discord.MessageEmbed()
			.setColor(`${config.defaultColor}`)
			.setTitle("⸝⸝ ♡₊˚ Система◞")
			.setDescription(`Информация о системе кланов:`)
			.addField(`Автор: `, '```' + `Kristopher` + '```', inline = true)
			.addField(`Версия: `, '```' + `1.2.4` + '```', inline = true)
			.addField(`Обновлено: `, '```' + `09.05.2021` + '```', inline = true)
			.addField(`Сервер: `, '```' + `Derabbit.` + '```', inline = true)
			.setFooter(`© Dead Rabbit ☕ by Kristopher`)
			.setTimestamp();

		let userNoMember = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Данный пользователь не является участником Вашего клана.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let errorCoins = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Недостаточно серебра.\nВаш баланс: ${userCoins} ${config.silverCoin}`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let notInClan = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`К сожалению, Вы не состоите в клане.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noOwnClan = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`К сожалению, Вы не владеете кланом.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noPerms = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы не являетесь офицером или владельцем клана, чтобы сделать это.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let cancel = new Discord.MessageEmbed()
			.setColor(`${config.defaultColor}`)
			.setTitle("⸝⸝ ♡₊˚ Кланы◞")
			.setDescription(`Действие было отменено.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noMUser = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Укажите пользователя.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let urself = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы не можете сделать это на себе.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let userInClan = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Пользователь уже находится в клане.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noArgMoney = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы забыли указать количество монет.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let invalidHex = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Неверно указан цвет.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noClanMoney = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`На балансе клана не хватает денег.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noNameArg = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы забыли указать имя клана.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noDescArg = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы забыли указать описание клана.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noSymbArg = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы забыли указать символ(ы) клана.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let noBannerLink = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Ссылка на баннер указана неверно.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let invalidBannerLink = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Ссылка на баннер клана указана неверно.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let kernelError = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ X ₊˚ Критическая ошибка◞")
			.setDescription(`Информация о клане отсутствует в базе данных. Пожалуйста, обратитесь к администрации сервера.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let clanIsUnderAttackRn = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы не можете сделать это. Ваш клан атакуют!`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let youMustDeleteUrClan = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Вы не можете покинуть свой клан.\n\nЧтобы покинуть свой клан - Вам нужно удалить его.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let cantOpenNewDialogue = new Discord.MessageEmbed()
			.setColor(`${config.errColor}`)
			.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
			.setDescription(`Сначала закройте Ваше последнее диалогове окно.`)
			.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
			.setTimestamp();

		let inActionData = await actionModel.findOne({ userID: uid });
		let inAction = !inActionData ? (newInActionUser = await actionModel.create({ userID: uid, inAction: 0 }), newInActionUser.save(), 0) : (inActionData.inAction);

		if (!args[0]) {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				name: userClan
			});
			if (!clanData) return message.channel.send(kernelError);
			let clanName = clanData.name;
			let clanMembers = clanData.members;
			if (clanMembers <= 0) clanMembers = [];
			let clanRole = clanData.clanRole;
			let clanOwner = clanData.userID;
			let clanOfficers = clanData.officers;
			if (clanOfficers <= 0) clanOfficers = [];
			let clanDescription = clanData.description;
			let clanLvl = clanData.level;
			let clanXp = clanData.xp;
			let clanMoney = clanData.balance;
			let clanBanner = clanData.banner;
			let clanPrize = clanData.prize;
			let clanSign = clanData.clanSign;
			let clanCreated = clanData.clanCreateDate;
			let clanSlots = clanData.clanSlots;
			let clanColor = message.guild.roles.cache.get(clanRole).color;

			var dateStamp = new Date(clanCreated),
				createDate = [dateStamp.getDate(),
					dateStamp.getMonth() + 1,
					dateStamp.getFullYear()
				].join('/') + ' ' + [dateStamp.getHours(),
					dateStamp.getMinutes()
				].join(':');

			let memberAmount = clanMembers.length + clanOfficers.length;
			let clanxpmult = 1;
			if (Math.floor(memberAmount / 2) > 0) {
				clanxpmult = Math.floor(memberAmount / 2);
			}

			let membersField = "Нет";
			if (clanMembers.length > 0) {
				membersField = "";
				clanMembers.slice(-7).forEach(async user => {
					membersField += `<@${user.memberID}>\n`
				})
				if ((clanMembers.length - 7) > 0) {
					membersField += `И ${clanMembers.length-7} ещё...`
				}
			}
			let officersField = "Нет";
			if (clanOfficers.length > 0) {
				officersField = "";
				clanOfficers.slice(-7).forEach(async user => {
					officersField += `<@${user.memberID}>\n`
				})
				if ((clanOfficers.length - 7) > 0) {
					officersField += `И ${clanOfficers.length-7} ещё...`
				}
			}

			let isBanner = "Да";
			if (clanBanner == "" || clanBanner == " " || clanBanner == null) {
				isBanner = "Нет";
			}

			let coinBoost = clanData.coinMultiply;
			let lvlBoost = clanData.lvlMultiply;

			var clanDataEmbed = new Discord.MessageEmbed()
				.setColor(clanColor)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setDescription(`**⸝⸝ ♡₊˚ Клан : <@&${clanRole}> ${clanSign}◞**\n${clanDescription}`)
				.addField(`👤 Кол-во слотов`, '```' + `${memberAmount}/${clanSlots}` + '```', inline = true)
				.addField(`🏆 Трофеи`, '```' + `${clanPrize}` + '```', inlite = true)
				.addField(`📆 Дата основания`, '```' + `${createDate}` + '```', inline = true)
				.addField(`🌟 Уровень`, '```' + `${clanLvl}` + '```', inline = true)
				.addField(`⭐ Опыт`, '```' + `${clanXp}/${xplvlmult * clanLvl * clanxpmult}` + '```', inline = true)
				.addField(`${config.silverCoin} Баланс`, '```' + `${clanMoney}` + '```', inlite = true)
				.addField(`☄️ Буст серебра`, '```' + `x${coinBoost}` + '```', inlite = true)
				.addField(`🎴 Баннер`, '```' + `${isBanner}` + '```', inlite = true)
				.addField(`🔮 Буст уровня`, '```' + `x${lvlBoost}` + '```', inlite = true)
				.addField(`୨୧ ・ Основатель:`, `<@${clanOwner}>`, inline = true)
				.addField(`୨୧ ・ Офицеры:`, `${officersField}`, inline = true)
				.addField(`୨୧ ・ Участники:`, `${membersField}`, inline = true)
				.setTimestamp();

			if (!(clanBanner == "" || clanBanner == " " || clanBanner == null)) {
				clanDataEmbed.setImage(clanBanner);
			}

			message.channel.send(clanDataEmbed);

		} else if (args[0] == "create") {
			clanName = args.slice(1).join(' ').replace(/[^a-zа-яA-ZА-Я0-9 ]/g, "");
			if (!clanName || clanName.length < 3 || clanName.length > 48) return message.channel.send(noNameArg);
			let clanExist = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клан '${clanName}' уже существует. Попробуйте придумать другое имя.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (!(message.guild.roles.cache.find(x => x.name.toLowerCase() === clanName.toLowerCase()) == undefined)) return message.channel.send(clanExist);
			if (userCoins < clanCost) return message.channel.send(errorCoins);
			let youInClan = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Для того, чтобы создать свой клан - покиньте текущий.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (!(userClan == "" || userClan == " " || userClan == null || userClan == "Нет")) return message.channel.send(youInClan);

			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let confCreate = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите создать клан '${clanName}' за ${clanCost} ${config.silverCoin}?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			const msg = await message.channel.send(confCreate);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 60000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanData = await clanModel.findOne({
							userID: uid
						});
						if (!clanData) {
							clan = await clanModel.create({
								userID: uid,
								balance: 0,
								clanCreateDate: Date.now(),
								description: config.clanDescription,
								lvlMultiply: 1,
								coinMultiply: 1,
								banner: "",
								name: clanName,
								level: 1,
								xp: 0,
								prize: 0,
								clanSign: "",
								clanSlots: 10,
								lastBomb: 0,
								lastRob: 0,
								underAttack: 0,
							});
							//сохранение документа
							clan.save();
						}
						message.guild.roles.create({
							data: {
								name: clanName,
								position: 58,
							},
						}).then(async role => {
							message.member.roles.add(role);
							message.member.roles.add(config.clanLeaderRole);
							clanData = await clanModel.updateOne({
								userID: uid
							}, {
								$set: {
									clanRole: role.id
								}
							});
						}).catch(console.error);

						profileData = await profileModel.updateOne({
							userID: uid,
						}, {
							$set: {
								clan: clanName
							},
							$inc: {
								silverCoins: -clanCost
							}
						});

						message.member.guild.channels.create(clanName, {
							type: 'voice',
							userLimit: 10,
							parent: config.clanCategory,
							permissionOverwrites: [{
								id: uid,
								allow: ['VIEW_CHANNEL', 'CONNECT', 'SPEAK']
							}, {
								id: config.everyoneID,
								deny: ['CONNECT', 'SPEAK'],
							}, {
								id: config.nonverifiedUserRole,
								deny: ['CONNECT']
							}]
						}).then(async voice => {
							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$set: {
									clanVoice: voice.id
								}
							});
							message.member.guild.channels.create(clanName, {
								type: 'text',
								parent: config.clanCategory,
								permissionOverwrites: [{
									id: uid,
									allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES', 'EMBED_LINKS']
								}, {
									id: config.everyoneID,
									deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
								}, {
									id: config.nonverifiedUserRole,
									deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
								}]
							}).then(async chat => {
								clanData = await clanModel.updateOne({
									userID: uid,
								}, {
									$set: {
										clanChat: chat.id
									}
								});
							})
						})

						let clanCreateSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Клан '${clanName}' был успешно сформирован!\n\nВаш баланс: ${userCoins - clanCost} ${config.silverCoin}`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(clanCreateSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });

						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});

		} else if (args[0] == "delete") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;
			let clanRoleId = clanData.clanRole;
			let clanName = clanData.name;
			let clanChat = clanData.clanChat;
			let clanVoice = clanData.clanVoice;

			let confDelete = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите удалить свой клан <@&${clanRoleId}>?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confDelete);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanDeleteResponce = await clanModel.deleteOne({
							userID: uid
						});

						profileData = await profileModel.updateOne({
							userID: uid,
						}, {
							$set: {
								clan: "Нет"
							}
						});

						if (clanMembers.length > 0) {
							clanMembers.forEach(async user => {
								profileData = await profileModel.updateOne({
									userID: user.memberID,
								}, {
									$set: {
										clan: "Нет"
									}
								});
							})
						}
						if (clanOfficers.length > 0) {
							clanOfficers.forEach(async user => {
								profileData = await profileModel.updateOne({
									userID: user.memberID,
								}, {
									$set: {
										clan: "Нет"
									}
								});
								bot.guilds.cache.get(config.serverId).members.cache.get(user.memberID).roles.remove(config.clanOfficerRole);
							})
						}

						message.member.roles.remove(config.clanLeaderRole);

						message.guild.roles.cache.get(clanRoleId).delete();

						bot.channels.cache.get(clanChat).delete();
						bot.channels.cache.get(clanVoice).delete();

						let deleteSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Клан '${clanName}' был успешно удалён!`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(deleteSuccess);

						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });

						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit("ignore");
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "invite") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				name: userClan
			});
			if (!clanData) return message.channel.send(kernelError);
			if (!(message.member.roles.cache.has(config.clanOfficerRole) || message.member.roles.cache.has(config.clanLeaderRole))) return message.channel.send(noPerms);
			if (!mUser || mUser.user.bot) return message.channel.send(noMUser);
			if (mUser == uid) return message.channel.send(urself);

			profileDataMUser = await profileModel.findOne({
				userID: mUser.id
			});
			let mUserClan = profileDataMUser.clan;
			if (!(mUserClan == "" || mUserClan == " " || mUserClan == null || mUserClan == "Нет")) return message.channel.send(userInClan);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;
			let clanRoleId = clanData.clanRole;
			let clanName = clanData.name;
			let clanChat = clanData.clanChat;
			let clanVoice = clanData.clanVoice;

			let clanInvite = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`${mUser}, Вы были приглашены в клан <@&${clanRoleId}>!`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(clanInvite);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == mUser.id && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						profileData = await profileModel.updateOne({
							userID: mUser.id,
						}, {
							$set: {
								clan: clanName
							}
						});

						let newMember = {
							memberID: mUser.id
						};

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$push: {
								members: newMember,
							}
						});

						bot.channels.cache.get(clanVoice).updateOverwrite(mUser.id, {
							CONNECT: true,
							SPEAK: true,
							VIEW_CHANNEL: true
						});
						bot.channels.cache.get(clanChat).updateOverwrite(mUser.id, {
							VIEW_CHANNEL: true,
							SEND_MESSAGES: true,
							VIEW_CHANNEL: true,
							SEND_MESSAGES: true,
							READ_MESSAGE_HISTORY: true,
							ATTACH_FILES: true,
							EMBED_LINKS: true
						});

						mUser.roles.add(clanRoleId);

						let clanInviteSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`${mUser}, теперь Вы участник клана <@&${clanRoleId}>!`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(clanInviteSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						let clanInviteCancel = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`${mUser} отказался вступить в клан <@&${clanRoleId}>`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(clanInviteCancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});

		} else if (args[0] == "kick") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				name: userClan
			});
			if (!clanData) return message.channel.send(kernelError);
			if (!(message.member.roles.cache.has(config.clanOfficerRole) || message.member.roles.cache.has(config.clanLeaderRole))) return message.channel.send(noPerms);
			if (!mUser) return message.channel.send(noMUser);
			if (mUser == uid) return message.channel.send(urself);

			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;
			let roleId = clanData.clanRole;
			let clanName = clanData.name;
			let clanChat = clanData.clanChat;
			let clanVoice = clanData.clanVoice;

			let membersArray = clanMembers;
			let officersArray = clanOfficers;

			let indexMember = membersArray.findIndex(x => x.memberID === mUser.id);
			let indexOfficer = officersArray.findIndex(x => x.memberID === mUser.id);

			if (indexMember == -1 && indexOfficer == -1) return message.channel.send(userNoMember);

			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let confKick = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите выгнать ${mUser} из клана?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confKick);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						profileData = await profileModel.updateOne({
							userID: mUser.id,
						}, {
							$set: {
								clan: "Нет"
							}
						});

						if (indexMember > -1) {
							membersArray.splice(indexMember, 1);
							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$set: {
									members: membersArray
								}
							});
						} else {
							officersArray.splice(indexOfficer, 1);
							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$set: {
									officers: officersArray
								}
							});
							bot.guilds.cache.get(config.serverId).members.cache.get(mUser.id).roles.remove(config.clanOfficerRole);
						}

						bot.channels.cache.get(clanVoice).permissionOverwrites.get(mUser.id).delete();
						bot.channels.cache.get(clanChat).permissionOverwrites.get(mUser.id).delete();

						message.guild.members.cache.get(mUser.id).roles.remove(roleId);

						let userKickSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Пользователь ${mUser} был выгнан из клана <@&${roleId}>`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(userKickSuccess)

						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });

						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "leave") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				name: userClan
			});
			if (!clanData) return message.channel.send(kernelError);
			if (message.member.roles.cache.has(config.clanLeaderRole)) return message.channel.send(youMustDeleteUrClan);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let clanName = clanData.name;
			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;
			let roleId = clanData.clanRole;

			let confLeave = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите покинуть клан <@&${roleId}>`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confLeave);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						let membersArray = clanMembers;
						let officersArray = clanOfficers;
						let clanChat = clanData.clanChat;
						let clanVoice = clanData.clanVoice;

						let indexMember = membersArray.findIndex(x => x.memberID === uid);
						let indexOfficer = officersArray.findIndex(x => x.memberID === uid);

						profileData = await profileModel.updateOne({
							userID: uid,
						}, {
							$set: {
								clan: "Нет"
							}
						});

						if (indexMember > -1) {
							membersArray.splice(indexMember, 1);
							clanData = await clanModel.updateOne({
								name: clanName,
							}, {
								$set: {
									members: membersArray
								}
							});
						} else {
							officersArray.splice(indexOfficer, 1);
							clanData = await clanModel.updateOne({
								name: clanName,
							}, {
								$set: {
									officers: officersArray
								}
							});
							bot.guilds.cache.get(config.serverId).members.cache.get(uid).roles.remove(config.clanOfficerRole);
						}


						bot.channels.cache.get(clanVoice).permissionOverwrites.get(uid).delete();
						bot.channels.cache.get(clanChat).permissionOverwrites.get(uid).delete();

						message.guild.members.cache.get(uid).roles.remove(roleId);

						let leaveSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Вы покинули клан <@&${roleId}>`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(leaveSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "officer") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			if (!mUser) return message.channel.send(noMUser);
			if (mUser == uid) return message.channel.send(urself);

			let clanName = clanData.name;
			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;

			let membersArray = clanMembers;
			let officersArray = clanOfficers;

			let indexMember = membersArray.findIndex(x => x.memberID === mUser.id);
			let indexOfficer = officersArray.findIndex(x => x.memberID === mUser.id);

			if (indexMember == -1 && indexOfficer == -1) return message.channel.send(userNoMember);
			if (indexOfficer > -1) {
				officersArray.splice(indexMember, 1);

				membersArray.push({
					memberID: mUser.id
				})

				clanData = await clanModel.updateOne({
					userID: uid,
				}, {
					$set: {
						members: membersArray
					}
				});

				clanData = await clanModel.updateOne({
					userID: uid,
				}, {
					$set: {
						officers: officersArray
					}
				});

				bot.guilds.cache.get(config.serverId).members.cache.get(mUser.id).roles.remove(config.clanOfficerRole);

				let notOffAnymore = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Кланы◞")
					.setDescription(`${mUser} больше не является офицером клана.`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();

				message.channel.send(notOffAnymore);
			} else {
				membersArray.splice(indexMember, 1);
				officersArray.push({
					memberID: mUser.id
				})

				clanData = await clanModel.updateOne({
					userID: uid,
				}, {
					$set: {
						members: membersArray
					}
				});

				clanData = await clanModel.updateOne({
					userID: uid,
				}, {
					$set: {
						officers: officersArray
					}
				});

				bot.guilds.cache.get(config.serverId).members.cache.get(mUser.id).roles.add(config.clanOfficerRole);

				let nowOfficer = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Кланы◞")
					.setDescription(`${mUser} теперь является офицером клана.`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();

				message.channel.send(nowOfficer);
			}
		} else if (args[0] == "deposit" || args[0] == "dep") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				name: userClan
			});
			if (!clanData) return message.channel.send(kernelError);
			deposeData = await deposeModel.findOne({
				userID: uid
			});
			if (!deposeData) {
				depose = await deposeModel.create({
					userID: uid,
					deposed: 0,
					lastDepose: 0,
				});
				//сохранение документа
				depose.save();
			}
			if (!args[1] || isNaN(args[1]) || (args[1] <= 0)) return message.channel.send(noArgMoney);

			let moneyToDeposit = parseInt(args[1]);

			if (userCoins < moneyToDeposit) return message.channel.send(errorCoins);
			deposeData = await deposeModel.findOne({
				userID: uid
			});
			let clanDeposed = deposeData.deposed;
			let clanLastDepose = deposeData.lastDepose;

			let timeOut = deposeCooldown - (Date.now() - clanLastDepose);

			const seconds = Math.floor((timeOut / 1000) % 60);
			const minutes = Math.floor((timeOut / 1000 / 60) % 60);
			const hours = Math.floor((timeOut / 1000 / 60 / 60) % 24);

			let timeoutDeposit = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уже вложили в клан ${clanDepositLimit} ${config.silverCoin} за последние 12 часов.\n\nДо следующего пополнения баланса клана: **${hours}ч. ${minutes}м. ${seconds}с.**`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (clanDeposed >= clanDepositLimit && (Date.now() - clanLastDepose) < deposeCooldown) return message.channel.send(timeoutDeposit);

			if ((Date.now() - clanLastDepose) > deposeCooldown) {
				clanDeposed = 0;
			}

			if ((clanDeposed + moneyToDeposit) > clanDepositLimit) {
				moneyToDeposit = clanDepositLimit - clanDeposed;
			}

			clanData = await clanModel.updateOne({
				name: userClan,
			}, {
				$inc: {
					balance: moneyToDeposit
				}
			});

			profileData = await profileModel.updateOne({
				userID: uid,
			}, {
				$inc: {
					silverCoins: -moneyToDeposit
				}
			});

			if ((Date.now() - clanLastDepose) > deposeCooldown) {
				deposeData = await deposeModel.updateOne({
					userID: uid,
				}, {
					$set: {
						deposed: moneyToDeposit,
						lastDepose: Date.now()
					}
				});
			} else {
				deposeData = await deposeModel.updateOne({
					userID: uid,
				}, {
					$set: {
						lastDepose: Date.now()
					},
					$inc: {
						deposed: moneyToDeposit
					}
				});
			}

			let deposedEmbed = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы пополнили баланс клана на ${moneyToDeposit} ${config.silverCoin}\n\nВаш баланс: ${userCoins-moneyToDeposit} ${config.silverCoin}`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			message.channel.send(deposedEmbed);
		} else if (args[0] == "color" || args[0] == "sc") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			if (!args[1] || isHexColor(args.slice(1).join(' '))) return message.channel.send(invalidHex);
			let clanBalance = clanData.balance;
			if (clanBalance < setColorCost) return message.channel.send(noClanMoney);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
			let clanRoleId = clanData.clanRole;
			let newColor = args.slice(1).join(' ');

			let confColor = new Discord.MessageEmbed()
				.setColor(newColor)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите установить цвет клана на ${newColor}?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confColor);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						message.guild.roles.cache.get(clanRoleId).setColor(newColor);

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$inc: {
								balance: -setColorCost
							}
						});

						let colorSuccess = new Discord.MessageEmbed()
							.setColor(newColor)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Новый цвет клана <@&${clanRoleId}> установлен.`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(colorSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "rename") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			if (!args[1]) return message.channel.send(noNameArg);
			let nameInvalid = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Новое имя клана длиннее 48 символов или менее 3`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (args.slice(1).join(' ').replace(/[^a-zA-Z ]/g, "").length > 48 || args.slice(1).join(' ').replace(/[^a-zA-Z ]/g, "").length < 3) return message.channel.send(nameInvalid);
			let clanExist = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клан '${args.slice(1).join(' ')}' уже существует. Попробуйте придумать другое имя.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (!(message.guild.roles.cache.find(x => x.name.toLowerCase() === args.slice(1).join(' ').toLowerCase() || x.name.replace(/\s/g, '-').toLowerCase() === args.slice(1).join(' ').toLowerCase()) == undefined)) return message.channel.send(clanExist);

			let clanBalance = clanData.balance;
			let clanName = clanData.name;
			let clanRoleId = clanData.clanRole;
			let clanMembers = clanData.members;
			let clanOfficers = clanData.officers;
			let clanChat = clanData.clanChat;
			let clanVoice = clanData.clanVoice;

			if (clanBalance < clanRenameCost) return message.channel.send(noClanMoney);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
			let newName = args.slice(1).join(' ').replace(/[^a-zA-Z ]/g, "");

			let confRename = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите переименовать свой клан в '${newName}'?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confRename);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$set: {
								name: newName
							},
							$inc: {
								balance: -clanRenameCost
							}
						});

						message.guild.roles.cache.get(clanRoleId).setName(newName);

						bot.channels.cache.get(clanVoice).setName(newName);
						bot.channels.cache.get(clanChat).setName(newName);

						profileData = await profileModel.updateOne({
							userID: uid,
						}, {
							$set: {
								clan: newName
							}
						});

						if (clanMembers.length > 0) {
							clanMembers.forEach(async user => {
								profileData = await profileModel.updateOne({
									userID: user.memberID,
								}, {
									$set: {
										clan: newName
									}
								});
							})
						}
						if (clanOfficers.length > 0) {
							clanOfficers.forEach(async user => {
								profileData = await profileModel.updateOne({
									userID: user.memberID,
								}, {
									$set: {
										clan: newName
									}
								});
							})
						}

						let renameSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Клан был переименован. Теперь клан называется <@&${clanRoleId}>`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(renameSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "description" || args[0] == "desc") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			let clanDesc = args.slice(1).join(' ');
			if (!clanDesc || clanDesc.length <= 0) return message.channel.send(noDescArg);
			let descriptionInvalid = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Описание клана длиннее 512 символов.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (args.slice(1).join(' ').length > 512) return message.channel.send(descriptionInvalid);
			let clanBalance = clanData.balance;
			if (clanBalance < clanDescCost) return message.channel.send(noClanMoney);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let confDesc = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите установить описание клана на: ${clanDesc}?`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confDesc);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$set: {
								description: clanDesc
							},
							$inc: {
								balance: -clanDescCost
							}
						});

						let clanDescEmbed = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Описание клана теперь: ${clanDesc}`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(clanDescEmbed)
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "symbol" || args[0] == "sym") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			let clanSymbol = args.slice(1).join(' ').replace(/[a-zA-Z0-9 `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g, "");
			if (!clanSymbol || clanSymbol.length <= 0 || clanSymbol.length > 8) return message.channel.send(noSymbArg);
			let clanBalance = clanData.balance;
			if (clanBalance < clanSymbolCost) return message.channel.send(noClanMoney);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let confSymbol = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы уверены, что хотите установить символ клана на: ${clanSymbol}`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confSymbol);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$set: {
								clanSign: clanSymbol
							},
							$inc: {
								balance: -clanSymbolCost
							}
						});

						let symbolSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Символом клана теперь является: ${clanSymbol}`)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(symbolSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "banner") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			let clanBalance = clanData.balance;
			let clanLvl = clanData.level;
			let lvltwoonly = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Установить баннер клана можно начиная со **второго** уровня.\n\nУровень вашего клана: ${clanLvl}`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (clanLvl < 2) return message.channel.send(lvltwoonly);
			if (clanBalance < clanSetImageCost) return message.channel.send(noClanMoney);
			if (!args[1]) return message.channel.send(noBannerLink);
			let newBanner = args[1];
			if (message.content.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) == null) return message.channel.send(invalidBannerLink);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });

			let confBanner = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`❕` + "`" + `Перед установкой баннера убедитесь, что ваша ссылка работает.` + "`\n" + `❕` + "`" + `Рекомендуемый размер баннера: 540x200 и более.` + "`" + `\n\nВы уверены, что хотите установить баннер клана?`)
				.setImage(newBanner)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			const msg = await message.channel.send(confBanner);
			await msg.react("✅");
			await msg.react("❌");
			await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
					max: 1,
					time: 30000
				})
				.then(async collected => {
					if (collected.first().emoji.name == "✅") {
						msg.reactions.removeAll();

						clanData = await clanModel.updateOne({
							userID: uid,
						}, {
							$set: {
								banner: newBanner
							},
							$inc: {
								balance: -clanSetImageCost
							}
						});

						let bannerSuccess = new Discord.MessageEmbed()
							.setColor(`${config.defaultColor}`)
							.setTitle("⸝⸝ ♡₊˚ Кланы◞")
							.setDescription(`Баннер клана был успешно установлен!`)
							.setImage(newBanner)
							.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
							.setTimestamp();

						msg.edit(bannerSuccess);
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else if (collected.first().emoji.name == "❌") {
						msg.edit(cancel);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					} else {
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(cancel);
					console.log("It's fine... " + err);
					msg.reactions.removeAll();
					await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
					return;
				});
		} else if (args[0] == "perks" || args[0] == "perk") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanCoinBoost = clanData.coinMultiply;
			let clanLvlBoost = clanData.lvlMultiply;
			let clanSlots = clanData.clanSlots;

			let perksEmbed = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.addField(`\u200b`, '**────── Буст серебра +100% ──────**', inline = false)
				.addField(`Индекс`, '`1`', inline = true)
				.addField(`Описание`, `Увеличивает количество получаемого серебра для участников клана в N раз.`, inline = true)
				.addField(`Цена`, `${coinMultiCost*clanCoinBoost} ${config.silverCoin}`, inline = true)
				.addField(`\u200b`, '**─────── Буст опыта +100% ───────**', inline = false)
				.addField(`Индекс`, '`2`', inline = true)
				.addField(`Описание`, `Увеличивает количество получаемого опыта для участников клана в N раз.`, inline = true)
				.addField(`Цена`, `${lvlMultiCost*clanLvlBoost} ${config.silverCoin}`, inline = true)
				.addField(`\u200b`, '**────── Дополнительные слоты ─────**', inline = false)
				.addField(`Индекс`, '`3`', inline = true)
				.addField(`Описание`, `Увеличивает общее количество слотов в клане на 5.`, inline = true)
				.addField(`Цена`, `${clanSlotsCost * Math.floor(clanSlots/10)} ${config.silverCoin}`, inline = true)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			message.channel.send(perksEmbed);
		} else if (args[0] == "upgrade") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);
			let clanIsUnderAttack = clanData.underAttack;
			if (clanIsUnderAttack == 1) return message.channel.send(clanIsUnderAttackRn);
			let clanLvl = clanData.level;
			let lvlthreeonly = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Покупать перки клана можно начиная с **третьего** уровня.\n\nУровень вашего клана: ${clanLvl}`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (clanLvl < 3) return message.channel.send(lvlthreeonly);

			let noIndexUp = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Индекс улучшения не указан.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (!args[1] || isNaN(args[1]) || (args[1] <= 0)) return message.channel.send(noIndexUp);
			let index = args[1];
			let invalidIndexUp = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Индекс улучшения не может быть больше 3`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (index > 3) return message.channel.send(invalidIndexUp);
			//не давать открыть диалоговое окно, если прошлое не закрыто
			if (inAction == 1) return message.channel.send(cantOpenNewDialogue);
			await actionModel.updateOne({ userID: uid }, { $set: {inAction: 1} });
			let clanCoinBoost = clanData.coinMultiply;
			let clanLvlBoost = clanData.lvlMultiply;
			let clanBalance = clanData.balance;
			if (index == 1) {
				if (clanBalance < (coinMultiCost * clanCoinBoost)) return message.channel.send(noClanMoney);
				let confCoinBoost = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Кланы◞")
					.setDescription(`Вы уверены, что хотите улучшить буст серебра до уровня ${clanCoinBoost+1}?`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				const msg = await message.channel.send(confCoinBoost);
				await msg.react("✅");
				await msg.react("❌");
				await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 30000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							msg.reactions.removeAll();

							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$inc: {
									coinMultiply: 1,
									balance: -(coinMultiCost * clanCoinBoost)
								}
							});

							let coinBoostSuccess = new Discord.MessageEmbed()
								.setColor(`${config.defaultColor}`)
								.setTitle("⸝⸝ ♡₊˚ Кланы◞")
								.setDescription(`Буст серебра был улучшен до уровня ${clanCoinBoost+1}.`)
								.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
								.setTimestamp();
							msg.edit(coinBoostSuccess);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							msg.edit(cancel);
							msg.reactions.removeAll();
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return console.log("Ошибка реакции");
						}
					}).catch(async err => {
						msg.edit(cancel);
						console.log("It's fine... " + err);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			} else if (index == 2) {
				if (clanBalance < (lvlMultiCost * clanLvlBoost)) return message.channel.send(noClanMoney);
				let confLevelBoost = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Кланы◞")
					.setDescription(`Вы уверены, что хотите улучшить буст опыта до уровня ${clanLvlBoost+1}?`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				const msg = await message.channel.send(confLevelBoost);
				await msg.react("✅");
				await msg.react("❌");
				await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 30000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							msg.reactions.removeAll();

							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$inc: {
									lvlMultiply: 1,
									balance: -(lvlMultiCost * clanLvlBoost)
								}
							});

							let levelBoostSuccess = new Discord.MessageEmbed()
								.setColor(`${config.defaultColor}`)
								.setTitle("⸝⸝ ♡₊˚ Кланы◞")
								.setDescription(`Буст опыта был улучшен до уровня ${clanLvlBoost+1}.`)
								.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
								.setTimestamp();

							msg.edit(levelBoostSuccess);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							msg.edit(cancel);
							msg.reactions.removeAll();
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return console.log("Ошибка реакции");
						}
					}).catch(async err => {
						msg.edit(cancel);
						console.log("It's fine... " + err);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			} else if (index == 3) {
				let clanSlots = clanData.clanSlots;
				if (clanBalance < (clanSlotsCost * (clanSlots / 10))) return message.channel.send(noClanMoney);
				let confSlots = new Discord.MessageEmbed()
					.setColor(`${config.defaultColor}`)
					.setTitle("⸝⸝ ♡₊˚ Кланы◞")
					.setDescription(`Вы уверены, что хотите купить дополнительные 5 слотов в клан?`)
					.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
					.setTimestamp();
				const msg = await message.channel.send(confSlots);
				await msg.react("✅");
				await msg.react("❌");
				await msg.awaitReactions((reaction, user) => user.id == uid && (reaction.emoji.name == "✅" || reaction.emoji.name == "❌"), {
						max: 1,
						time: 30000
					})
					.then(async collected => {
						if (collected.first().emoji.name == "✅") {
							msg.reactions.removeAll();

							clanData = await clanModel.updateOne({
								userID: uid,
							}, {
								$inc: {
									clanSlots: 5,
									balance: -(clanSlotsCost * Math.floor(clanSlots / 10))
								}
							});

							let slotsSuccess = new Discord.MessageEmbed()
								.setColor(`${config.defaultColor}`)
								.setTitle("⸝⸝ ♡₊˚ Кланы◞")
								.setDescription(`Были куплены новые 5 слотов в клан. Теперь в клане ${clanSlots+5} мест.`)
								.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
								.setTimestamp();

							msg.edit(slotsSuccess);
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else if (collected.first().emoji.name == "❌") {
							msg.edit(cancel);
							msg.reactions.removeAll();
							await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
							return;
						} else {
							return console.log("Ошибка реакции");
						}
					}).catch(async err => {
						msg.edit(cancel);
						console.log("It's fine... " + err);
						msg.reactions.removeAll();
						await actionModel.updateOne({ userID: uid }, { $set: {inAction: 0} });
						return;
					});
			}
		} else if (args[0] == "version") {
			message.channel.send(systemInfo);
		} else if (args[0] == "bomb") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);

			let clanBalance = clanData.balance;
			if (clanBalance < bombCost) return message.channel.send(noClanMoney);
			let clanRoleId = clanData.clanRole;
			let clanChat = clanData.clanChat;

			let clanBombNoAttackTo = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы не указали название клана, в который хотите подложить бомбу.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			let attackTo = args.slice(1).join(' ');
			if (!args[1]) return message.channel.send(clanBombNoAttackTo);

			let clanBombAttackToNotExist = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клана '${attackTo}' не существует. Возможно, что Вы допустили ошибку в названии.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (message.guild.roles.cache.find(x => x.name === attackTo) == undefined) return message.channel.send(clanBombAttackToNotExist);

			clanDataAttackTo = await clanModel.findOne({
				name: attackTo
			});

			let cantAttackYourClan = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы не можете атаковать свой клан.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			let clanName = clanData.name;
			if (clanName == attackTo) return message.channel.send(cantAttackYourClan);

			let clanLastBomb = clanData.lastBomb;

			let timeOut = (bombCooldown - (Date.now() - clanLastBomb));
			const seconds = Math.floor((timeOut / 1000) % 60);
			const minutes = Math.floor((timeOut / 1000 / 60) % 60);
			const hours = Math.floor((timeOut / 1000 / 60 / 60) % 24);

			let bombOnCooldown = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы сможете опять подложить кому-то бомбу через: **${hours}ч. ${minutes}м. ${seconds}с.**`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (Date.now() < (clanLastBomb + bombCooldown)) return message.channel.send(bombOnCooldown);

			let attackToChat = clanDataAttackTo.clanChat;
			let attackToRole = clanDataAttackTo.clanRole;
			let attackToBalance = clanDataAttackTo.balance;
			let attackToWillLost = Math.floor(attackToBalance / 100 * 8);

			let attackToUnderAttack = clanDataAttackTo.underAttack;
			let clanBombAttackToIsUnderAttack = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клан <@&${attackToRole}> уже атакуют, попробуйте немного позже!`)
				.setTimestamp();
			if (attackToUnderAttack == 1) return message.channel.send(clanBombAttackToIsUnderAttack);
			let attackToMembers = clanDataAttackTo.members;
			let attackToOfficers = clanDataAttackTo.officers;
			let attackToMembersNumber = attackToMembers.length + attackToOfficers.length;
			let membersNeeded = Math.floor(attackToMembersNumber / 100 * 60) + 1;
			let clanColor = message.guild.roles.cache.get(attackToRole).color;

			let clanBombEmbed = new Discord.MessageEmbed()
				.setColor(clanColor)
				.setTitle("⸝⸝ ♡₊˚ Вас атакуют!◞")
				.setDescription(`❕ Внимание! Клан <@&${clanRoleId}> тайно проник в ваше убежище и заложил в нём **большую бомбу**, установив таймер на 15 минут!\n\nУ вас есть всего **15 минут**, чтобы найти и обезвредить её, иначе ваш клан **потеряет** ${attackToWillLost} ${config.silverCoin}\n\n` + '`' + `Чтобы обезвредить бомбу - 60% (${membersNeeded}) участников клана должны нажать на реакцию 💣` + '`')
				.setTimestamp();

			let clanBombEmbedSuccessSend = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы успешно проникли в убежище клана <@&${attackToRole}> и заложили в нём **бобму**!\nТеперь у клана есть всего **15 минут**, чтобы обезвредить её.\n\nЕсли ваша бомба **не** будет разминирована вовремя, то ваш клан получит ${attackToWillLost} ${config.silverCoin}`)
				.setTimestamp();

			let clanBombEmbedToAttackDefuse = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Поздравляем!◞")
				.setDescription(`Вы успешно обезвредели бомбу от клана <@&${clanRoleId}> и смогли защитить ${attackToWillLost} ${config.silverCoin}, а также получили 1000 ${config.silverCoin} на счёт своего клана и 2 трофея 🏆!`)
				.setTimestamp();

			let clanBombAttackToEmbedNotdefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ 💥💥💥💥💥💥◞")
				.setDescription(`К сожалению, ваш клан не успел обезвредить бомбу от клана <@&${clanRoleId}> и потерял ${attackToWillLost} ${config.silverCoin} со своего счёта.`)
				.setTimestamp();

			let clanBombEmbedNotdefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Клан <@&${attackToRole}> не успел обезвредить вашу бомбу за 15 минут и она взорвалась!\n\nВы получили ${attackToWillLost} ${config.silverCoin} с их счёта и 6 трофеев 🏆!`)
				.setTimestamp();

			let clanBombEmbedDefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Клан <@&${attackToRole}> успел обезвредить вашу бомбу за 15 минут!\n\nВы потеряли ${bombCost} ${config.silverCoin} за бомбу.`)
				.setTimestamp();

			clanData = await clanModel.updateOne({
				userID: uid
			}, {
				$inc: {
					balance: -bombCost,
				}
			});

			clanDataAttackTo = await clanModel.updateOne({
				name: attackTo
			}, {
				$set: {
					underAttack: 1
				}
			});

			clanData = await clanModel.updateOne({
				userID: uid
			}, {
				$set: {
					lastBomb: Date.now()
				}
			});

			message.channel.send(clanBombEmbedSuccessSend);

			const msg = await bot.channels.cache.find(ch => ch.id == attackToChat).send(`<@&${attackToRole}>`, clanBombEmbed);
			await msg.react("💣");
			await msg.awaitReactions((reaction, user) => reaction.count >= (membersNeeded + 1) && (reaction.emoji.name == "💣"), {
					max: 1,
					time: 1000 * 60 * 15
				})
				.then(async collected => {
					if (collected.first().emoji.name == "💣") {
						msg.reactions.removeAll();
						msg.edit(clanBombEmbedToAttackDefuse);
						bot.channels.cache.find(ch => ch.id == clanChat).send(clanBombEmbedDefused);
						clanDataAttackTo = await clanModel.updateOne({
							name: attackTo
						}, {
							$set: {
								underAttack: 0
							},
							$inc: {
								balance: 1000,
								prize: 2,
							}
						});
						return;
					} else {
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(clanBombAttackToEmbedNotdefused);
					clanDataAttackTo = await clanModel.updateOne({
						name: attackTo
					}, {
						$set: {
							underAttack: 0
						},
						$inc: {
							balance: -attackToWillLost,
						}
					});
					clanData = await clanModel.updateOne({
						userID: uid
					}, {
						$inc: {
							balance: attackToWillLost,
							prize: 6,
						}
					});
					bot.channels.cache.find(ch => ch.id == clanChat).send(clanBombEmbedNotdefused);
					msg.reactions.removeAll();
					return;
				});
		} else if (args[0] == "rob") {
			if (userClan == "" || userClan == " " || userClan == null || userClan == "Нет") return message.channel.send(notInClan);
			clanData = await clanModel.findOne({
				userID: uid
			});
			if (!clanData) return message.channel.send(noOwnClan);

			let clanBalance = clanData.balance;
			if (clanBalance < robCost) return message.channel.send(noClanMoney);
			let clanRoleId = clanData.clanRole;
			let clanChat = clanData.clanChat;

			let clanRobNoAttackTo = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы не указали название клана, который хотите ограбить.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			let attackTo = args.slice(1).join(' ');
			if (!args[1]) return message.channel.send(clanRobNoAttackTo);

			let clanRobAttackToNotExist = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клана '${attackTo}' не существует. Возможно, что Вы допустили ошибку в названии.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (message.guild.roles.cache.find(x => x.name === attackTo) == undefined) return message.channel.send(clanRobAttackToNotExist);

			clanDataAttackTo = await clanModel.findOne({
				name: attackTo
			});

			let cantAttackYourClan = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы не можете ограбить свой клан.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			let clanName = clanData.name;
			if (clanName == attackTo) return message.channel.send(cantAttackYourClan);

			let clanLastRob = clanData.lastRob;

			let timeOut = (robCooldown - (Date.now() - clanLastRob));
			const seconds = Math.floor((timeOut / 1000) % 60);
			const minutes = Math.floor((timeOut / 1000 / 60) % 60);
			const hours = Math.floor((timeOut / 1000 / 60 / 60) % 24);

			let robOnCooldown = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Вы сможете опять ограбить кого-то через: **${hours}ч. ${minutes}м. ${seconds}с.**`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			if (Date.now() < (clanLastRob + robCooldown)) return message.channel.send(robOnCooldown);

			let attackToChat = clanDataAttackTo.clanChat;
			let attackToRole = clanDataAttackTo.clanRole;
			let attackToBalance = clanDataAttackTo.balance;
			let attackToWillLost = Math.floor(attackToBalance / 100 * 4);

			let attackToUnderAttack = clanDataAttackTo.underAttack;
			let clanRobAttackToIsUnderAttack = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клан ${attackTo} уже атакуют, попробуйте немного позже!`)
				.setTimestamp();
			if (attackToUnderAttack == 1) return message.channel.send(clanRobAttackToIsUnderAttack);
			let attackToMembers = clanDataAttackTo.members;
			let attackToOfficers = clanDataAttackTo.officers;
			let attackToMembersNumber = attackToMembers.length + attackToOfficers.length;
			let membersNeeded = Math.floor(attackToMembersNumber / 100 * 60) + 1;
			let clanColor = message.guild.roles.cache.get(attackToRole).color;

			let clanRobEmbed = new Discord.MessageEmbed()
				.setColor(clanColor)
				.setTitle("⸝⸝ ♡₊˚ Вас атакуют!◞")
				.setDescription(`❕ Внимание! Клан <@&${clanRoleId}> тайно проник в ваше убежище и пытается украсть у вас деньги. Разветчик атакующего клана убежит с деньгами через 10 минут!\n\nУ вас есть всего **10 минут**, чтобы найти лазутчика, иначе ваш клан **потеряет** ${attackToWillLost} ${config.silverCoin}\n\n` + '`' + `Чтобы найти лазутчика - 60% (${membersNeeded}) участников клана должны нажать на реакцию 👀` + '`')
				.setTimestamp();

			let clanRobEmbedSuccessSend = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Вы успешно проникли в убежище клана <@&${attackToRole}> и стараетесь пройти к их сейфу!\nТеперь у клана есть всего **10 минут**, чтобы обнаружить вас.\n\nЕсли Вас не обнаружат, то ваш клан получит ${attackToWillLost} ${config.silverCoin}`)
				.setTimestamp();

			let clanRobEmbedToAttackDefuse = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Поздравляем!◞")
				.setDescription(`Вы успешно обнаружили и наказали разветчика клана <@&${clanRoleId}> и смогли защитить свои ${attackToWillLost} ${config.silverCoin}, а также получили 500 ${config.silverCoin} на счёт своего клана и 1 трофей 🏆!`)
				.setTimestamp();

			let clanRobAttackToEmbedNotdefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ 🏃‍♂️💨💨💨◞")
				.setDescription(`К сожалению, ваш клан не успел найти разветчика клана <@&${clanRoleId}> и потерял ${attackToWillLost} ${config.silverCoin} со своего счёта.`)
				.setTimestamp();

			let clanRobEmbedNotdefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Клан <@&${attackToRole}> не успел поймать вашего разветчика за 10 минут и он смог убежать!\n\nВы получили ${attackToWillLost} ${config.silverCoin} с их счёта и 3 трофея 🏆!`)
				.setTimestamp();

			let clanRobEmbedDefused = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`Клан <@&${attackToRole}> успел найти вашего разветчика за 10 минут!\n\nВы потеряли ${robCost} ${config.silverCoin}.`)
				.setTimestamp();

			clanData = await clanModel.updateOne({
				userID: uid
			}, {
				$inc: {
					balance: -robCost,
				}
			});

			clanDataAttackTo = await clanModel.updateOne({
				name: attackTo
			}, {
				$set: {
					underAttack: 1
				}
			});

			clanData = await clanModel.updateOne({
				userID: uid
			}, {
				$set: {
					lastRob: Date.now()
				}
			});

			message.channel.send(clanRobEmbedSuccessSend);

			const msg = await bot.channels.cache.find(ch => ch.id == attackToChat).send(`<@&${attackToRole}>`, clanRobEmbed);
			await msg.react("👀");
			await msg.awaitReactions((reaction, user) => reaction.count >= (membersNeeded + 1) && (reaction.emoji.name == "👀"), {
					max: 1,
					time: 1000 * 60 * 10
				})
				.then(async collected => {
					if (collected.first().emoji.name == "👀") {
						msg.reactions.removeAll();
						msg.edit(clanRobEmbedToAttackDefuse);
						bot.channels.cache.find(ch => ch.id == clanChat).send(clanRobEmbedDefused);
						clanDataAttackTo = await clanModel.updateOne({
							name: attackTo
						}, {
							$set: {
								underAttack: 0
							},
							$inc: {
								balance: 500,
								prize: 1,
							}
						});
						return;
					} else {
						return console.log("Ошибка реакции");
					}
				}).catch(async err => {
					msg.edit(clanRobAttackToEmbedNotdefused);
					clanDataAttackTo = await clanModel.updateOne({
						name: attackTo
					}, {
						$set: {
							underAttack: 0
						},
						$inc: {
							balance: -attackToWillLost,
						}
					});
					clanData = await clanModel.updateOne({
						userID: uid
					}, {
						$inc: {
							balance: attackToWillLost,
							prize: 3,
						}
					});
					bot.channels.cache.find(ch => ch.id == clanChat).send(clanRobEmbedNotdefused);
					msg.reactions.removeAll();
					return;
				});
		} else if (args[0] == "top") {
			results = await clanModel.find({}).sort({
				prize: -1
			}).limit(5);

			var lbString = "";
			var lbPos = 1;
			var lbEmoji = "";

			for (let i = 0; i < results.length; i++) {
				const {
					clanRole,
					prize = 0
				} = results[i];

				switch (lbPos) {
					case 1:
						lbEmoji = "🥇"
						break;
					case 2:
						lbEmoji = "🥈"
						break;
					case 3:
						lbEmoji = "🥉"
						break;
					default:
						lbEmoji = ""
						break;
				}
				if (lbPos <= 3) {
					lbString += lbEmoji + ` <@&${clanRole}>\nТрофеев: ` + prize + ` 🏆\n\n`;
				} else {
					lbString += lbPos + `. ` + ` <@&${clanRole}>\nТрофеев: ` + prize + ` 🏆\n\n`;
				}
				lbPos++;
			}
			var lbEmbed = new Discord.MessageEmbed()
				.setColor(config.defaultColor)
				.setTitle("⸝⸝ ♡₊˚ Топ кланов◞")
				.setDescription("```Топ 5 с наибольшим количеством трофеев:```\n" + lbString)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			message.channel.send(lbEmbed);
		} else if (args[0] == "help") {
			let clanHelpEmbed = new Discord.MessageEmbed()
				.setColor(`${config.defaultColor}`)
				.setTitle("⸝⸝ ♡₊˚ Кланы◞")
				.setDescription(`**.clan** - информация о клане\n**.clan help** - данное сообщение\n**.clan create <название клана>** - создать клан за ${clanCost} ${config.silverCoin}\n**.clan delete** - удалить клан\n**.clan invite <@пользователь>** - пригласить пользователя в клан\n**.clan kick <@пользователь>** - выгнать пользователя из клана\n**.clan leave** - покинуть клан\n**.clan officer <@пользователь>** - назначить/убрать пользователя на/с должность(-и) офицер(-а)\n**.clan deposit <1-15000>** - пополнить счёт клана\n**.clan color <hex>** - установить цвет клана за ${setColorCost} ${config.silverCoin}\n**.clan symbol <emoji>** - установить символ(ы) клана за ${clanSymbolCost} ${config.silverCoin}\n**.clan description <описание>** - установить описание клана за ${clanDescCost} ${config.silverCoin}\n**.clan banner <ссылка>** - установить баннер клана за ${clanSetImageCost} ${config.silverCoin}\n**.clan rename <название клана>** - переименовать клан за ${clanRenameCost} ${config.silverCoin}\n**.clan perks** - посмотреть возможные улучшения для клана и их цены\n**.clan upgrade <индекс>** - улучшить клан\n**.clan bomb <название клана>** - заложить бомбу в клане\n**.clan rob <название клана>** - ограбить клан\n**.clan top** - топ кланов`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();

			message.channel.send(clanHelpEmbed);
		} else {
			let clanName = args.slice(0).join(' ');
			let clanNotExist = new Discord.MessageEmbed()
				.setColor(`${config.errColor}`)
				.setTitle("⸝⸝ ♡₊˚ Ошибка◞")
				.setDescription(`Клана '${clanName}' не существует. Возможно, что Вы допустили ошибку в названии.`)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setTimestamp();
			if (message.guild.roles.cache.find(x => x.name === clanName) == undefined) return message.channel.send(clanNotExist);
			clanData = await clanModel.findOne({
				name: clanName
			});
			if (!clanData) return message.channel.send(kernelError);
			let clanMembers = clanData.members;
			if (clanMembers <= 0) clanMembers = [];
			let clanRole = clanData.clanRole;
			let clanOwner = clanData.userID;
			let clanOfficers = clanData.officers;
			if (clanOfficers <= 0) clanOfficers = [];
			let clanDescription = clanData.description;
			let clanLvl = clanData.level;
			let clanXp = clanData.xp;
			let clanMoney = clanData.balance;
			let clanBanner = clanData.banner;
			let clanPrize = clanData.prize;
			let clanSign = clanData.clanSign;
			let clanCreated = clanData.clanCreateDate;
			let clanSlots = clanData.clanSlots;
			let clanColor = message.guild.roles.cache.get(clanRole).color;

			var dateStamp = new Date(clanCreated),
				createDate = [dateStamp.getDate(),
					dateStamp.getMonth() + 1,
					dateStamp.getFullYear()
				].join('/') + ' ' + [dateStamp.getHours(),
					dateStamp.getMinutes()
				].join(':');

			let memberAmount = clanMembers.length + clanOfficers.length;
			let clanxpmult = 1;
			if (Math.floor(memberAmount / 2) > 0) {
				clanxpmult = Math.floor(memberAmount / 2);
			}

			let membersField = "Нет";
			if (clanMembers.length > 0) {
				membersField = "";
				clanMembers.slice(-7).forEach(async user => {
					membersField += `<@${user.memberID}>\n`
				})
				if ((clanMembers.length - 7) > 0) {
					membersField += `И ${clanMembers.length-7} ещё...`
				}
			}
			let officersField = "Нет";
			if (clanOfficers.length > 0) {
				officersField = "";
				clanOfficers.slice(-7).forEach(async user => {
					officersField += `<@${user.memberID}>\n`
				})
				if ((clanOfficers.length - 7) > 0) {
					officersField += `И ${clanOfficers.length-7} ещё...`
				}
			}

			let isBanner = "Да";
			if (clanBanner == "" || clanBanner == " " || clanBanner == null) {
				isBanner = "Нет";
			}

			let coinBoost = clanData.coinMultiply;
			let lvlBoost = clanData.lvlMultiply;

			var clanDataEmbed = new Discord.MessageEmbed()
				.setColor(clanColor)
				.setFooter(`${rUser.username}`, `${rUser.displayAvatarURL({dynamic: true})}`)
				.setDescription(`**⸝⸝ ♡₊˚ Клан : <@&${clanRole}> ${clanSign}◞**\n${clanDescription}`)
				.addField(`👤 Кол-во слотов`, '```' + `${memberAmount}/${clanSlots}` + '```', inline = true)
				.addField(`🏆 Трофеи`, '```' + `${clanPrize}` + '```', inlite = true)
				.addField(`📆 Дата основания`, '```' + `${createDate}` + '```', inline = true)
				.addField(`🌟 Уровень`, '```' + `${clanLvl}` + '```', inline = true)
				.addField(`⭐ Опыт`, '```' + `${clanXp}/${xplvlmult * clanLvl * clanxpmult}` + '```', inline = true)
				.addField(`${config.silverCoin} Баланс`, '```' + `${clanMoney}` + '```', inlite = true)
				.addField(`☄️ Буст серебра`, '```' + `x${coinBoost}` + '```', inlite = true)
				.addField(`🎴 Баннер`, '```' + `${isBanner}` + '```', inlite = true)
				.addField(`🔮 Буст уровня`, '```' + `x${lvlBoost}` + '```', inlite = true)
				.addField(`୨୧ ・ Основатель:`, `<@${clanOwner}>`, inline = true)
				.addField(`୨୧ ・ Офицеры:`, `${officersField}`, inline = true)
				.addField(`୨୧ ・ Участники:`, `${membersField}`, inline = true)
				.setTimestamp();

			if (!(clanBanner == "" || clanBanner == " " || clanBanner == null)) {
				clanDataEmbed.setImage(clanBanner);
			}

			message.channel.send(clanDataEmbed);
		}

	} catch (err) {
		if (err.name === "ReferenceError")
			console.log("У вас ошибка")
		console.log(`1.${err.name}\n2.${err.message}\n3.${err.stack}`);
	}
};

module.exports.help = {
	name: "clan"
};