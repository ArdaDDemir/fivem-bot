const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topmesai')
    .setDescription('Top 10 mesai yapanları göster'),

 async run({ interaction,client }) {
    try {
      // Sadece belirli bir role sahip kullanıcılar bu komutu kullanabilir
      const allowedRole = interaction.guild.roles.cache.find(role => role.name === '🏴');

      if (!interaction.member.roles.cache.has(allowedRole.id)) {
        // Kullanıcı yetkili rolüne sahip değilse, işlemi reddet
        return interaction.reply('Bu komutu kullanmaya yetkiniz yok.');
      }

      const mesaiFolder = './mesai/';
      const outputFilePath = './mesaiTopList.txt';

      const files = fs.readdirSync(mesaiFolder);

      if (files.length === 0) {
        return interaction.reply('Henüz hiç mesai bilgisi bulunmuyor.');
      }

      const totalTimes = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const mesaiData = JSON.parse(fs.readFileSync(`${mesaiFolder}${file}`));
          const total = mesaiData.totalTime || 0;
          totalTimes.push({ id: file.split('.')[0], total });
        }
      }

      const sortedTimes = totalTimes.sort((a, b) => b.total - a.total);

      // Dosyaya yazma işlemi
      const fileContent = generateFileContent(sortedTimes);
      fs.writeFileSync(outputFilePath, fileContent);

      interaction.reply(`Top 10 mesai yapanlar listesi oluşturuldu ve [burada](${outputFilePath}) bulunabilir.`);
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Top 10 mesai yapanları alırken bir hata oluştu.');
    }
  },
};

const generateFileContent = (sortedTimes) => {
  let content = 'Top Mesai Yapanlar\n\n';

  for (let i = 0; i < Math.min(sortedTimes.length, 10); i++) {
    const user = `<@${sortedTimes[i].id}>`;
    const totalTime = formatTime(sortedTimes[i].total);

    content += `${i + 1}. ${user} - ${totalTime}\n`;
  }

  return content;
};

const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours} saat ${minutes % 60} dakika ${seconds % 60} saniye`;
};
