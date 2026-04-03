const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

client.once(Events.ClientReady, () => {
  console.log(`✅ Online como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === '!criar') {
    await interaction.reply({ content: '🚀 obrigado por compra o produto...', ephemeral: true });

    const guild = interaction.guild;

    // =====================
    // 🎭 CARGOS
    // =====================
    const cargos = {};

    async function criarCargo(nome, cor) {
      const cargo = await guild.roles.create({ name: nome, color: cor });
      cargos[nome] = cargo;
      return cargo;
    }

    // Staff
    await criarCargo('👑 DONO', 'Gold');
    await criarCargo('👑 SUB DONO', 'Yellow');
    await criarCargo('GERENTE', 'Orange');
    await criarCargo('ΔSTAFF', 'Red');
    await criarCargo('[🛠️ SUPORTE 🛠️]', 'Blue');

    // Clientes
    await criarCargo('💠 MEMBRO', 'Grey');
    await criarCargo('🖥️ CLIENTE APK MOD', 'Blue');
    await criarCargo('🖥️ CLIENTE PAINEL IOS', 'Purple');
    await criarCargo('🖥️ CLIENTE HS WIFI', 'Yellow');
    await criarCargo('🖥️ CLIENTE HOLOGRAMA', 'Aqua');
    await criarCargo('🖥️ CLIENTE CONTA', 'Green');
    await criarCargo('🖥️ CLIENTE DRIP', 'DarkPurple');

    const verificado = await criarCargo('✔️ VERIFICADO', 'Green');

    // =====================
    // 🔒 PERMISSÃO BASE
    // =====================
    await guild.roles.everyone.setPermissions([]);

    // =====================
    // ✅ CANAL VERIFICAÇÃO
    // =====================
    const canalVerificacao = await guild.channels.create({
      name: '✅・verificação',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ Verificação')
      .setDescription('Clique no botão abaixo para liberar seu acesso ao servidor.\n\n🔒 Sistema de segurança ativo')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/7398/7398228.png')
      .setColor('#2b2d31');

    const botao = new ButtonBuilder()
      .setCustomId('verificar')
      .setLabel('Verificar')
      .setStyle(ButtonStyle.Success);

    await canalVerificacao.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(botao)]
    });

    // =====================
    // 📥 CATEGORIA DOWNLOAD
    // =====================
    const downloads = await guild.channels.create({
      name: '📥・downloads',
      type: ChannelType.GuildCategory
    });

    async function criarCanalPrivado(nome, cargo) {
      await guild.channels.create({
        name: nome,
        type: ChannelType.GuildText,
        parent: downloads.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: verificado.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: cargo.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });
    }

    await criarCanalPrivado('✅・download-android', cargos['🖥️ CLIENTE APK MOD']);
    await criarCanalPrivado('✅・download-ios', cargos['🖥️ CLIENTE PAINEL IOS']);
    await criarCanalPrivado('✅・download-wifi', cargos['🖥️ CLIENTE HS WIFI']);
    await criarCanalPrivado('✅・download-holograma', cargos['🖥️ CLIENTE HOLOGRAMA']);
    await criarCanalPrivado('✅・download-conta', cargos['🖥️ CLIENTE CONTA']);
    await criarCanalPrivado('✅・download-drip', cargos['🖥️ CLIENTE DRIP']);

    // =====================
    // 💬 CANAL GERAL
    // =====================
    await guild.channels.create({
      name: '💬・chat',
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: verificado.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    await interaction.followUp({
      content: '✅ Sistema completo criado!',
      ephemeral: true
    });
  }
});

// =====================
// 🔘 BOTÃO VERIFICAÇÃO
// =====================
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'verificar') {
    const cargo = interaction.guild.roles.cache.find(r => r.name === '✔️ VERIFICADO');

    await interaction.member.roles.add(cargo);

    await interaction.reply({
      content: '✅ Você foi verificado!',
      ephemeral: true
    });
  }
});

client.login(TOKEN);
