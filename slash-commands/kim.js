const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kim')
    .setDescription('Mesaide olanları göster'),
  async run({ interaction,client }) {
    try {
      // Sadece belirli bir role sahip kullanıcılar bu komutu kullanabilir
      const allowedRole = interaction.guild.roles.cache.find(role => role.name === '🏴');

      if (!interaction.member.roles.cache.has(allowedRole.id)) {
        // Kullanıcı yetkili rolüne sahip değilse, işlemi reddet
        return interaction.reply('Bu komutu kullanmaya yetkiniz yok.');
      }

      // Sunucudaki tüm üyeleri al
      const guildMembers = interaction.guild.members.cache;

      // Mesaide olan üyeleri filtrele
      const mesaideOlanlar = guildMembers.filter(member => {
        // Üyenin mesai durumu 1 ise mesaide
        const mesaiData = loadMesaiData(member.user.id);
        return mesaiData && mesaiData.mesaiDurumu === 1;
      });

      // Mesaide olan üyelerin listesini oluştur
      const mesaideList = mesaideOlanlar.map(member => {
        return `• ${member.user}`;
      });

      // Kullanıcıların mesaide olup olmadığını kontrol et
      if (mesaideList.length > 0) {
        // Mesaide olan üyelerin sayısını ekleyerek bir embed oluştur
        const embed = {
          title: 'Mesaide Olan Üyeler',
          description: `Toplam ${mesaideList.length} üye mesaide:\n${mesaideList.join('\n')}`,
          color: 0x00ff00, // Embed rengini dilediğiniz gibi değiştirin
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        // Mesaide olan üye bulunmuyorsa bilgi veren bir embed oluştur
        const embed = {
          title: 'Mesaide Olan Üyeler',
          description: 'Mesaide olan üye bulunmuyor.',
          color: 0xff0000, // Embed rengini dilediğiniz gibi değiştirin
        };

        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Mesaide olan üyeleri görüntülerken bir hata oluştu.');
    }
  },
};

// Kullanıcının mesai bilgilerini yükler
const loadMesaiData = (userId) => {
  try {
    const data = fs.readFileSync(`./mesai/${userId}.json`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Eğer dosya bulunamazsa veya okuma hatası olursa, yeni bir veri oluştur
  }
};
