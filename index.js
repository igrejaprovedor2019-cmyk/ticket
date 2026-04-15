const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.login(process.env.TOKEN);

// ================= 🎨 EMBED PREMIUM =================
const roxo = "#6a00ff";
const embed = (titulo, desc) =>
  new EmbedBuilder()
    .setColor(roxo)
    .setTitle(`✨ ${titulo}`)
    .setDescription(desc)
    .setFooter({ text: "GBZ BLOXER • Sistema Oficial" })
    .setTimestamp();

// ================= 👋 BOAS-VINDAS =================
client.on("guildMemberAdd", async (member) => {
  const canal = member.guild.channels.cache.find(c => c.name === "📢┃boas-vindas");
  const cargo = member.guild.roles.cache.find(r => r.name === "👥┃membros");

  if (cargo) await member.roles.add(cargo).catch(() => {});

  if (canal) {
    canal.send({
      embeds: [
        embed(
          "Novo membro!",
          `👤 ${member}\nSeja muito bem-vindo ao servidor!\n\n🚀 Aproveite tudo que temos aqui!`
        ).setImage("https://assetsio.gnwcdn.com/roblox-blox-fruits-codes-list.jpg")
      ]
    });
  }
});

// ================= ⚙️ CRIAR SERVIDOR =================
client.on("messageCreate", async (msg) => {
  if (!msg.guild) return;

  if (msg.content === "!criar") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return msg.reply("❌ Você precisa ser administrador.");

    const g = msg.guild;

    if (g.channels.cache.find(c => c.name === "📌┃informações"))
      return msg.reply("⚠️ Já foi configurado.");

    // ================= 🎭 CARGOS =================
    const cargos = {};
    cargos.dono = await g.roles.create({ name: "𓆩♛𓆪 DONO", color: "#000000", permissions: ["Administrator"] });
    cargos.sub = await g.roles.create({ name: "🜲 SUB DONO", color: "#aaaaaa" });
    cargos.staff = await g.roles.create({ name: "⚒️┃STAFF", color: "#ff0000" });
    cargos.suporte = await g.roles.create({ name: "🛡️┃SUPORTE", color: "#00008b" });
    cargos.crew = await g.roles.create({ name: "🏴‍☠️┃CREW", color: "#00ffff" });
    cargos.membro = await g.roles.create({ name: "👥┃MEMBROS", color: "#0099ff" });

    // ================= 📁 INFORMAÇÕES =================
    const info = await g.channels.create({ name: "📌┃informações", type: ChannelType.GuildCategory });

    await g.channels.create({ name: "📢┃boas-vindas", type: ChannelType.GuildText, parent: info.id });
    await g.channels.create({ name: "📜┃regras", type: ChannelType.GuildText, parent: info.id });
    await g.channels.create({ name: "🤝┃parcerias", type: ChannelType.GuildText, parent: info.id });
    await g.channels.create({ name: "💬┃chat", type: ChannelType.GuildText, parent: info.id });

    // ================= 🍍 BLOX FRUITS =================
    const blox = await g.channels.create({ name: "🍍┃blox-fruits", type: ChannelType.GuildCategory });

    const textos = [
      "🔄┃trade-frutas",
      "🧬┃trial-raça",
      "🐉┃leviathan",
      "🌋┃ilha-vulcão",
      "🌊┃evento-marinho",
      "🦊┃kitsune",
      "🔒┃privado",
      "🏴‍☠️┃crews"
    ];

    for (let t of textos) {
      await g.channels.create({ name: t, type: ChannelType.GuildText, parent: blox.id });
    }

    // ================= 🎤 CALLS =================
    const calls = await g.channels.create({ name: "🎤┃calls", type: ChannelType.GuildCategory });

    const voz = [
      "🔊┃call-1",
      "🔊┃call-2",
      "🧬┃trial",
      "🐉┃leviathan",
      "🌋┃vulcão",
      "🦊┃kitsune",
      "🌊┃evento"
    ];

    for (let v of voz) {
      await g.channels.create({ name: v, type: ChannelType.GuildVoice, parent: calls.id });
    }

    // ================= 🎫 SUPORTE =================
    const suporteCat = await g.channels.create({ name: "🎫┃suporte", type: ChannelType.GuildCategory });

    const painel = await g.channels.create({
      name: "🎟️┃abrir-ticket",
      type: ChannelType.GuildText,
      parent: suporteCat.id
    });

    const botao = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket")
        .setLabel("🎫 Abrir Suporte")
        .setStyle(ButtonStyle.Primary)
    );

    await painel.send({
      embeds: [
        embed(
          "Central de Atendimento",
`📩 Precisa de ajuda?

Abra um ticket clicando no botão abaixo.

🔒 Atendimento privado  
⏳ Resposta por ordem de chegada  
🚫 Não marque staff`
        )
      ],
      components: [botao]
    });

    msg.reply("🚀 Servidor PROFISSIONAL criado!");
  }

  // ================= 🔒 LOCK =================
  if (msg.content === "+lock") {
    msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: false });
    msg.reply("🔒 Canal trancado.");
  }

  if (msg.content === "+unlock") {
    msg.channel.permissionOverwrites.edit(msg.guild.roles.everyone, { SendMessages: true });
    msg.reply("🔓 Canal liberado.");
  }
});

// ================= 🎫 SISTEMA DE TICKET =================
client.on("interactionCreate", async (i) => {
  if (!i.isButton()) return;

  if (i.customId === "ticket") {
    const suporteRole = i.guild.roles.cache.find(r => r.name.includes("SUPORTE"));

    const canal = await i.guild.channels.create({
      name: `🎫┃${i.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: suporteRole?.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("assumir").setLabel("👨‍💻 Assumir").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("fechar").setLabel("🗑️ Fechar").setStyle(ButtonStyle.Danger)
    );

    canal.send({
      embeds: [
        embed(
          "Ticket Aberto",
`👋 Olá ${i.user}

📌 Descreva seu problema com detalhes.

⏳ Aguarde um suporte assumir.

🚫 Não marque equipe`
        )
      ],
      components: [botoes]
    });

    i.reply({ content: `✅ Ticket criado: ${canal}`, ephemeral: true });
  }

  if (i.customId === "fechar") {
    if (!i.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
      return i.reply({ content: "❌ Sem permissão", ephemeral: true });

    i.channel.delete();
  }

  if (i.customId === "assumir") {
    i.reply("👨‍💻 Ticket assumido!");
  }
});
