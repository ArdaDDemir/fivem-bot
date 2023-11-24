const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js'); // Assuming you have EmbedBuilder class, use the correct import


module.exports = {
  data: new SlashCommandBuilder()
    .setName('bilgi')
    .setDescription('Kullanıcı mesai bilgilerini görüntüle')
    .addUserOption(option => 
      option.setName('kullanici')
        .setDescription('Mesai bilgilerini görmek istediğiniz kullanıcı')
        .setRequired(true)
    ),
  async run({ interaction }) {
    try {
      const targetUser = interaction.options.getUser('kullanici');
      const targetUserId = targetUser.id;
      const mesaiFile = `./mesai/${targetUserId}.json`;

    

      // Dosyadan bilgileri oku
      const mesaiData = loadMesaiData(targetUserId);
        // Calculate hours, minutes, and remaining seconds
            const totalTimeInSeconds = mesaiData.totalTime / 1000;

      const hours = Math.floor(totalTimeInSeconds / 3600);
      const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
      const seconds = Math.floor(totalTimeInSeconds % 60);
const embed = new EmbedBuilder()
 .setColor('#3498db') 
 .setTitle(`Mesai Bilgileri`)
        .setDescription(`Kullanıcı Adı: ${targetUser}\nToplam Mesai Süresi: ${hours} saat, ${minutes} dakika, ${seconds} saniye \n Mesai Durumu: ${mesaiData.mesaiDurumu === 1 ? 'Mesaide' : 'Mesai dışında'}`);

   await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Hata oluştu:', error);
      interaction.reply('Mesai bilgilerine ulaşılamıyor. Kullanıcı mesai girişi yapmalı.');
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
