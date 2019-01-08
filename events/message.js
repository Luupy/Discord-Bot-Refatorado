const { DefaultPrefix }      = require("../setup/config.js"),
      path                   = require("path"),
      { RichEmbed }          = require("discord.js")
      CommandCooldown = new Set()

exports.run = async function(client, message){
  if(message.guild) {
    var userid = message.author.id;
    client.db.get(`SELECT * FROM users WHERE usr_id = ?`, [userid], (err, row) => {
     if (err) {
        console.log(err.message)
     }
     if (!row) {
      client.db.run(`INSERT INTO users(xp, usr_id, balance) VALUES(?, ?, ?)`, [1, userid, 1], function(err) {
            if (err) {
              return console.log(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
          });
          return;
    }
      var exp = row.xp + 1;
      client.db.run(`UPDATE users SET xp = ? WHERE usr_id = ?`, [exp, userid], function(err) {
        if (err) {
          return console.error(err.message);
        }
        client.db.get(`SELECT * FROM users WHERE usr_id = ?`, [userid], (err, row2) => {
          if (row2.xp > row2.level * 10) {
            var levelup = row2.level + 1
            var moremoney = row.balance + row.level * 10
            client.db.run(`UPDATE users SET xp = ?, level = ?, balance = ? WHERE usr_id = ?`, [1, levelup, moremoney, userid], (err) => {
                  if (err) return console.log(`Error in MESSAGE event : line 17`)
                  var serverid = message.guild.id;
                  client.db.get(`SELECT * FROM servers WHERE server_id =?`, [serverid], (err, row3) => {
                    if (!row3) {
                      client.db.run(`INSERT INTO servers(server_id) VALUES(?)`, [serverid], function(err) {
                          if (err) {
                            return console.log(err.message);
                          }
                          console.log(`A row has been inserted with rowid ${this.lastID}`);
                        });
                        return;
                  }
                    if (row3.leveling == 1) {
                      message.reply("You are now level " + levelup)
                    }
                  });
                })
             }
        });
      });
    })
    client.db.get(`SELECT * FROM servers WHERE server_id = ?`, [message.guild.id], (err, row) => {
    if (err) {
       console.log(err.message)
    }
    let prefix;

    if (row) {
      if (row.prefix == null) {
        prefix = DefaultPrefix
      } else {
        prefix = row.prefix
      }
    } else {
      prefix = DefaultPrefix
    }

  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const level = client.permlevel(message);

  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) return;

  if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

  if (level < client.levelCache[cmd.conf.permLevel]) {
    if (settings.systemNotice === "true") {
      return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find(l => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    } else {
      return;
    }
  }

  message.author.permLevel = level;

  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }
  cmd.run(client, message, args, level);
});
  }
}
