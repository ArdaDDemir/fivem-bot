const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesaiekle')
    .setDescription('Bir kullanıcının mesai süresinden belirli bir süreyi ekle')
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Mesai süresinden eklemek istediğiniz kullanıcı')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('saniye')
        .setDescription('Eklencek süre (saniye)')
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
      const eksiltilecekSure = interaction.options.getInteger('saniye');

      // Kullanıcının mesai bilgilerini kontrol et
      const mesaiData = loadMesaiData(targetUserId);

      // Eğer mesai içinde değilse, mesai durumunu başlat
      if (mesaiData.mesaiDurumu === 0) {
        mesaiData.mesaiDurumu = 1;
        mesaiData.startTime = Date.now();
      }

      // Eksiltilecek süreyi kontrol et
      if (eksiltilecekSure < 0) {
        return interaction.reply('Lütfen geçerli bir saniye miktarı girin (0 veya daha büyük).');
      }

      // Geçerli mesai süresinden eksiltilecek süreyi çıkar
      const currentTime = Date.now();
      const elapsedTime = currentTime - mesaiData.startTime;
      const yeniTotalTime = Math.max(0, mesaiData.totalTime + eksiltilecekSure * 1000);

      // Yeni mesai süresini kaydet
      mesaiData.totalTime = yeniTotalTime;
      mesaiData.startTime = new Date(currentTime - elapsedTime);

      // Veriyi dosyaya yaz
      saveMesaiData(targetUserId, mesaiData);

      await interaction.reply(`${targetUser.username}'ın mesai süresine ${eksiltilecekSure} saniye eklendi. Yeni toplam mesai süresi: ${yeniTotalTime / 1000} saniye.`);
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Kullanıcının mesai süresine eklerken bir hata oluştu.');
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
    return { mesaiDurumu: 0, startTime: null, totalTime: 0 };
  }
};

// Kullanıcının mesai bilgilerini kaydeder
const saveMesaiData = (userId, mesaiData) => {
  fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData, null, 2));
};
