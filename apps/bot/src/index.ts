import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import { createGameCatalog } from '@cozyt/core';
import { getBotConfig } from './config.js';

const botConfig = getBotConfig();
const { token, clientId, guildId } = botConfig;
const catalog = createGameCatalog();

const gamesCommand = new SlashCommandBuilder()
  .setName('games')
  .setDescription('CozyTで遊べるゲームを表示します');

const debugMessageCommand = new SlashCommandBuilder()
  .setName('debug-message')
  .setDescription('テストGuildに仮のメッセージを送信します')
  .addStringOption((option) => option
    .setName('message')
    .setDescription('送信するメッセージ')
    .setRequired(false));

const debugStatusCommand = new SlashCommandBuilder()
  .setName('debug-status')
  .setDescription('Botのテスト環境情報を表示します');

const rest = new REST({ version: '10' }).setToken(token);
const commandRoute = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`CozyT bot is ready as ${readyClient.user.tag} (${botConfig.environment})`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'debug-message') {
    await handleDebugMessage(interaction);
    return;
  }

  if (interaction.commandName === 'debug-status') {
    await handleDebugStatus(interaction);
    return;
  }

  if (interaction.commandName !== 'games') return;

  const games = catalog.list();
  const lines = games.map((game) => {
    const status = game.availability === 'available' ? 'プレイ可能' : '準備中';
    return `${game.icon} **${game.name}** - ${status}\n${game.description}`;
  });

  await interaction.reply({
    content: `**CozyT Game Portal**\n\n${lines.join('\n\n')}\n\nWebポータル: ${botConfig.webUrl}`,
    ephemeral: true
  });
});

async function handleDebugMessage(interaction: ChatInputCommandInteraction) {
  if (botConfig.environment !== 'test') {
    await interaction.reply({ content: 'このコマンドはテスト環境でのみ利用できます。', ephemeral: true });
    return;
  }

  const message = interaction.options.getString('message')?.trim() || 'CozyT debug message';
  if (!interaction.channel || !interaction.channel.isSendable()) {
    await interaction.reply({ content: 'このチャンネルにはメッセージを送信できません。', ephemeral: true });
    return;
  }

  const sentMessage = await interaction.channel.send(`🧪 **CozyT test message**\n${message}`);
  await interaction.reply({
    content: `テストメッセージを送信しました: ${sentMessage.url}`,
    ephemeral: true
  });
}

async function handleDebugStatus(interaction: ChatInputCommandInteraction) {
  if (botConfig.environment !== 'test') {
    await interaction.reply({ content: 'このコマンドはテスト環境でのみ利用できます。', ephemeral: true });
    return;
  }

  await interaction.reply({
    content: `環境: \`test\`\n登録Guild: \`${botConfig.debugGuildId}\`\nWeb URL: ${botConfig.webUrl}`,
    ephemeral: true
  });
}

async function start() {
  const commands = [gamesCommand.toJSON()];
  if (botConfig.environment === 'test') {
    commands.push(debugMessageCommand.toJSON(), debugStatusCommand.toJSON());
  }
  await rest.put(commandRoute, { body: commands });
  await client.login(token);
}

start().catch((error: unknown) => {
  console.error('Failed to start CozyT bot', error);
  process.exit(1);
});
