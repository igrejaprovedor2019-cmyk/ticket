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

// CARGOS STAFF
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
      .setDescription(`
🎫 **Regras Tickets** 🎫

• **Horário de Atendimento**  
Das 08:00 às 00:00, nossa equipe está disponível para atender suas necessidades.  
Após esse horário, as respostas podem levar mais tempo.

• **Abertura de Tickets**  
Seja objetivo e claro.  
Evite mensagens irrelevantes.

• **Tempo de Espera**  
Tempo máximo de espera: 1 hora.

• **Análise de Provas**  
Após análise, não serão aceitas discussões.

• **Revisão de Punição**  
Prazo: 3 horas ou menos.
      `)
      .setColor('#2b2d31')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const select = new StringSelectMenuBuilder()
      .setCustomId('menu_ticket')
      .setPlaceholder('Selecione o tipo de ticket que deseja abrir.')
      .addOptions([
        { label: 'Suporte', description: 'Precisa de ajuda', value: 'suporte' },
        { label: 'Reembolso', description: 'Solicitar reembolso', value: 'reembolso' },
        { label: 'Evento', description: 'Receber evento', value: 'evento' },
        { label: 'Mediador', description: 'Vaga de mediador', value: 'vaga' }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

// INTERAÇÕES
client.on('interactionCreate', async (interaction) => {

  // CRIAR TICKET (SEM DUPLICAR)
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_ticket') {

    const tipo = interaction.values[0];

    const existente = interaction.guild.channels.cache.find(c => 
      c.name === `ticket-${interaction.user.username}`
    );

    if (existente) {
      return interaction.reply({
        content: `❌ Você já tem um ticket aberto: ${existente}`,
        ephemeral: true
      });
    }

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
      ]
    });

    const embedTicket = new EmbedBuilder()
      .setTitle('🎟️ TICKET DE SUPORTE')
      .setDescription(`
Seja bem-vindo ao suporte.

Aguarde um atendente responder.
      `)
      .setColor('#2b2d31')
      .setThumbnail('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png');

    const assumir = new ButtonBuilder()
      .setCustomId('assumir')
      .setLabel('Assumir Ticket')
      .setStyle(ButtonStyle.Success);

    const sair = new ButtonBuilder()
      .setCustomId('sair')
      .setLabel('Sair do Ticket')
      .setStyle(ButtonStyle.Danger);

    const fechar = new ButtonBuilder()
      .setCustomId('fechar')
      .setLabel('Fechar Ticket')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(assumir, sair, fechar);

    await canal.send(`📌 ${interaction.user} abriu um ticket\n📂 Tipo: ${tipo}`);

    await canal.send({
      embeds: [embedTicket],
      components: [row]
    });

    interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });
  }

  // ASSUMIR
  if (interaction.isButton() && interaction.customId === 'assumir') {

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
  if (interaction.isButton() && interaction.customId === 'sair') {

    await interaction.channel.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: false
    });

    interaction.reply({ content: '🚪 Você saiu do ticket!', ephemeral: true });
  }

  // FECHAR (TODOS)
  if (interaction.isButton() && interaction.customId === 'fechar') {

    await interaction.reply({
      content: '❌ Fechando ticket...',
      ephemeral: true
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 2000);
  }

});

client.login(process.env.TOKEN);
