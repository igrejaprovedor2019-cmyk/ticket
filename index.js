require('dotenv').config();

const {
  Client, GatewayIntentBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ChannelType,
  PermissionsBitField, EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
  console.log(`🔥 Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {

  if (interaction.isButton() && interaction.customId === 'abrir_ticket') {

    const select = new StringSelectMenuBuilder()
      .setCustomId('produto')
      .setPlaceholder('Escolha seu plano')
      .addOptions([
        { label: 'Android - 1 dia', description: 'R$17,90', value: '17.90' },
        { label: 'Android - 7 dias', description: 'R$25,90', value: '25.90' },
        { label: 'Android - 10 dias', description: 'R$35,90', value: '35.90' },
        { label: 'Android - 30 dias', description: 'R$55,90', value: '55.90' }
      ]);

    return interaction.reply({
      content: '📦 Selecione seu plano:',
      components: [new ActionRowBuilder().addComponents(select)],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'produto') {

    const valor = interaction.values[0];

    const canal = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel]
        }
      ]
    });

    const botaoConfirmar = new ButtonBuilder()
      .setCustomId('confirmar_pagamento')
      .setLabel('Confirmar Pagamento')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botaoConfirmar);

    const embedPix = new EmbedBuilder()
      .setTitle('💰 Pagamento via PIX')
      .setDescription(`💵 Valor: R$${valor}\n\n📲 Chave PIX:\n${process.env.PIX}\n\n📌 Após pagar, aguarde confirmação do dono`)
      .setImage('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png')
      .setColor(0x00ff88);

    await canal.send({
      content: `🎟️ Ticket de ${interaction.user}`,
      embeds: [embedPix],
      components: [row]
    });

    return interaction.reply({
      content: `✅ Ticket criado: ${canal}`,
      ephemeral: true
    });
  }

  if (interaction.isButton() && interaction.customId === 'confirmar_pagamento') {

    if (interaction.user.id !== process.env.DONO_ID) {
      return interaction.reply({
        content: '❌ Apenas o dono pode confirmar!',
        ephemeral: true
      });
    }

    await interaction.channel.send('✅ Pagamento confirmado! Envie a key ao cliente.');

    await interaction.reply({
      content: '✔️ Confirmado!',
      ephemeral: true
    });
  }

});

client.on('messageCreate', async (message) => {
  if (message.content === '!painel') {

    const embed = new EmbedBuilder()
      .setTitle('🔥😈 Adquira seu Painel ANDROID 😈🔥')
      .setDescription('💎 Clique abaixo para comprar')
      .setImage('https://media.discordapp.net/attachments/1482528899903782932/1484254280088027216/file_000000008530720eb8922a615208f883.png')
      .setColor(0x00ff88);

    const botao = new ButtonBuilder()
      .setCustomId('abrir_ticket')
      .setLabel('Comprar Agora')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    message.channel.send({
      embeds: [embed],
      components: [row]
    });
  }
});

client.login(process.env.TOKEN);
