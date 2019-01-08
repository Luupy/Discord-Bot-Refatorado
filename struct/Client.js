let { Client } = require("discord.js"),
    fs         = require('fs'),
    Enmap      = require("enmap"),
    { promisify } = require("util"),
    readdir = promisify(require("fs").readdir);

const client = new Client()

client.commands = new Enmap();
client.aliases = new Enmap();

client.config  = require("../setup/config.js")
client.db = require("../modules/DB")

client.levelCache = {};
for (let i = 0; i < client.config.permLevels.length; i++) {
  const thisLevel = client.config.permLevels[i];
  client.levelCache[thisLevel.name] = thisLevel.level;
}

require("../modules/functions.js")(client)

client.login(client.TOKEN).then(loginSuccess)

async function loginSuccess() {
  console.log("Foi!")
  if(client.shard) {
    console.log("Shard: " + (1+client.shard.id) + "/" + client.shard.count)
    client.user.setPresence({ game: { name: "Shard: " + (1+client.shard.id) + "/" + client.shard.count, type: 0} })
  }
  const cmdFiles = await readdir("./commands/");
  console.log(`${cmdFiles.length} Comandos carregados.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });
}

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    delete require.cache[require.resolve(`../events/${file}`)]
    let eventor = require(`../events/${file}`)
    let eventide = file.split(".")[0]
    client.on(eventide, (...args) => eventor.run(client, ...args))
  })
})
