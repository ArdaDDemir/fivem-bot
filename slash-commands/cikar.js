const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('çıkar')
    .setDescription('Bir kullanıcıyı mesaiden çıkar')
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Mesaiden çıkarmak istediğiniz kullanıcı')
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

      // Kullanıcının mesai durumunu kontrol et
      const mesaiData = loadMesaiData(targetUserId);

      if (mesaiData.mesaiDurumu === 0) {
        return interaction.reply('Bu kullanıcı zaten mesai içinde değil.');
      }

      // Mesai durumunu güncelle
      mesaiData.mesaiDurumu = 0;

      // Mesai çıkışı zamanını kaydet
      const exitTime = Date.now();
      const elapsedTime = exitTime - mesaiData.startTime;
      mesaiData.totalTime += elapsedTime;

      // Veriyi dosyaya yaz
      saveMesaiData(targetUserId, mesaiData);

      await interaction.reply(`${targetUser.username} mesaiden çıkarıldı. Toplam mesai süresi: ${elapsedTime / 1000} saniye.`);
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Kullanıcıyı mesaiden çıkarırken bir hata oluştu.');
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

// Kullanıcının mesai bilgilerini kaydeder
const saveMesaiData = (userId, mesaiData) => {
  fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData, null, 2));
};
