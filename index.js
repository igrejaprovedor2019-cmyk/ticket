const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// CARGOS STAFF (assumir)
const CARGOS_SUPORTE = [
  '1484272650795880709',
  '1484275813477122278',
  '1484276434586566756',
  '1484273613430460576'
];

client.once('clientReady', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

// COMANDO !MG
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content === '!MG') {

    const embed = new EmbedBuilder()
      .setTitle('📋 Painel de Atendimento')
      .setDescription('Clique abaixo para abrir um ticket')
      .setColor(0x2b2d31);

    const botao = new ButtonBuilder()
      .setCustomId('abrir_painel')
      .setLabel('Abrir Ticket')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// INTERAÇÕES
client.on('interactionCreate', async (interaction) => {

  // ABRIR MENU
  if (interaction.isButton() && interaction.customId === 'abrir_painel') {

    const select = new StringSelectMenuBuilder()
      .setCustomId('tipo_ticket')
      .setPlaceholder('Selecione o tipo de ticket')
      .addOptions([
        { label: 'Suporte', value: 'suporte' },
        { label: 'Dúvidas', value: 'duvidas' },
        { label: 'Denúncia', value: 'denuncia' },
        { label: 'Outros', value: 'outros' }
      ]);

    return interaction.reply({
      content: 'Escolha uma opção:',
      components: [new ActionRowBuilder().addComponents(select)],
      ephemeral: true
    });
  }

  // CRIAR TICKET (APENAS UM!)
  if (interaction.isStringSelectMenu() && interaction.customId === 'tipo_ticket') {

    const tipo = interaction.values[0];

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    // EMBED ESTILO VIDEO
    const embedTicket = new EmbedBuilder()
      .setTitle('🎟️ TICKET DE SUPORTE')
      .setDescription(`
Seja bem-vindo ao ticket.

Aguarde um membro da equipe responder.
      `)
      .setColor(0x2b2d31);

    // BOTÕES
    const assumir = new ButtonBuilder()
      .setCustomId('assumir_ticket')
      .setLabel('Assumir Ticket')
      .setStyle(ButtonStyle.Success);

    const staff = new ButtonBuilder()
      .setCustomId('painel_staff')
      .setLabel('Painel Staff')
      .setStyle(ButtonStyle.Secondary);

    const sair = new ButtonBuilder()
      .setCustomId('sair_ticket')
      .setLabel('Sair do Ticket')
      .setStyle(ButtonStyle.Danger);

    const fechar = new ButtonBuilder()
      .setCustomId('fechar_ticket')
      .setLabel('Fechar Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(assumir, staff, sair, fechar);

    await canal.send(`📌 ${interaction.user} abriu um ticket\n📂 Tipo: ${tipo}`);

    await canal.send({
      embeds: [embedTicket],
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });
  }

  // ASSUMIR
  if (interaction.isButton() && interaction.customId === 'assumir_ticket') {

    const membro = interaction.member;

    const temPermissao = membro.roles.cache.some(role => 
      CARGOS_SUPORTE.includes(role.id)
    );

    if (!temPermissao) {
      return interaction.reply({ content: '❌ Sem permissão!', ephemeral: true });
    }

    if (interaction.channel.topic === 'assumido') {
      return interaction.reply({ content: '❌ Já assumido!', ephemeral: true });
    }

    await interaction.channel.setTopic('assumido');

    await interaction.channel.send(`✅ ${interaction.user} assumiu o ticket.`);

    interaction.reply({ content: '✔️ Assumido!', ephemeral: true });
  }

  // SAIR
  if (interaction.isButton() && interaction.customId === 'sair_ticket') {

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: false
    });

    interaction.reply({ content: '🚪 Você saiu do ticket!', ephemeral: true });
  }

  // FECHAR (TODOS PODEM)
  if (interaction.isButton() && interaction.customId === 'fechar_ticket') {

    await interaction.reply({
      content: '❌ Fechando ticket...',
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }

  // STAFF
  if (interaction.isButton() && interaction.customId === 'painel_staff') {
    interaction.reply({
      content: '⚙️ Painel staff...',
      ephemeral: true
    });
  }

});

client.login(process.env.TOKEN);
