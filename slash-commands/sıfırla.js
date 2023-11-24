const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesaisıfırla')
    .setDescription('Bir kullanıcının mesai bilgilerini sıfırla')
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Mesai bilgilerini sıfırlamak istediğiniz kullanıcı')
        .setRequired(true)
    ),
  async run({ interaction,client }) {
    try {
      // Sadece belirli bir role sahip kullanıcılar bu komutu kullanabilir
      const allowedRole = interaction.guild.roles.cache.find(role => role.name === '🏴');

      if (!interaction.member.roles.cache.has(allowedRole.id)) {
        // Kullanıcı yetkili rolüne sahip değilse, işlemi reddet
        return interaction.reply('Bu komutu kullanmaya yetkiniz yok.');
      }

      const targetUser = interaction.options.getUser('kullanici');
      const targetUserId = targetUser.id;

      // Kullanıcının mesai bilgilerini sıfırla
      fs.unlinkSync(`./mesai/${targetUserId}.json`);

      await interaction.reply(`${targetUser.username}'ın mesai bilgileri başarıyla sıfırlandı.`);
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Kullanıcının mesai bilgilerini sıfırlarken bir hata oluştu.');
    }
  },
};
