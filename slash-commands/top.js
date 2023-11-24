const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Top 10 mesai yapanları göster'),

  async run({ interaction,client }) {
    try {
      // Dosyadan içeriği oku
      const fileContent = fs.readFileSync('./mesaiTopList.txt', 'utf-8');

      // EmbedBuilder kullanarak embed oluştur
      const embed = new EmbedBuilder()
        .setColor('#3498db') // Renk kodu (isteğe bağlı)
        .setTitle('Top 10 Mesai Yapanlar')
        .setDescription(`${fileContent}`);

      // Embedli mesajı gönder
      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Top 10 mesai yapanları gösterirken bir hata oluştu.');
    }
  },
};
