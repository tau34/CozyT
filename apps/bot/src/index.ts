import 'dotenv/config';
import { Client, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { createGameCatalog } from '@cozyt/core';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const catalog = createGameCatalog();

if (!token || !clientId) {
  console.error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required to start the bot.');
  process.exit(1);
}

const gamesCommand = new SlashCommandBuilder()
  .setName('games')
  .setDescription('CozyTで遊べるゲームを表示します');

const rest = new REST({ version: '10' }).setToken(token);
const commandRoute = guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`CozyT bot is ready as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'games') return;

  const games = catalog.list();
  const lines = games.map((game) => {
    const status = game.availability === 'available' ? 'プレイ可能' : '準備中';
    return `${game.icon} **${game.name}** - ${status}\n${game.description}`;
  });

  await interaction.reply({
    content: `**CozyT Game Portal**\n\n${lines.join('\n\n')}\n\nWebポータル: https://cozyt.example.com`,
    ephemeral: true
  });
});

async function start() {
  await rest.put(commandRoute, { body: [gamesCommand.toJSON()] });
  await client.login(token);
}

start().catch((error: unknown) => {
  console.error('Failed to start CozyT bot', error);
  process.exit(1);
});
