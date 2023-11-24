const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle,EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai-ayarla')
    .setDescription('Mesai butonları'),

  async run({ interaction }) {
       const userId = interaction.user.id;
    const mesaiGirisiButton = new ButtonBuilder()
      .setCustomId('mesaiGirisi')
      .setLabel('Mesai Girişi')
      .setStyle(ButtonStyle.Primary);

    const mesaiCikisiButton = new ButtonBuilder()
      .setCustomId('mesaiCikisi')
      .setLabel('Mesai Çıkışı')
      .setStyle(ButtonStyle.Danger);

    const bilgilerimButton = new ButtonBuilder()
      .setCustomId('mesaiBilgilerim')
      .setLabel('Bilgilerim')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
      .addComponents(mesaiGirisiButton, mesaiCikisiButton, bilgilerimButton);

    await interaction.channel.send({
      content: 'Lütfen aşağıdaki butonlardan birini seçin:',
      components: [row],
    });

    // Buton fonksiyonları için event listener
    const filter = i => {
      i.deferUpdate();
      return i.customId.startsWith('mesai') && i.user.id === interaction.user.id;
    };

    const collector = interaction.channel.createMessageComponentCollector({ filter });

    collector.on('collect', async i => {
      // Butonların customId'lerini kontrol et

      if (i.customId === 'mesaiGirisi') {
            const mesaiFile = fs.readFileSync(`./mesai/${userId}.json`);
          const mesaiData = JSON.parse(mesaiFile);
        if(mesaiData.mesaiDurumu!=1){
         try{
          const mesaiFile = fs.readFileSync(`./mesai/${userId}.json`);
          const mesaiData = JSON.parse(mesaiFile);

          mesaiData.startTime = Date.now();
          mesaiData.mesaiDurumu = 1;
          fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData));

          const girisEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Renk
            .setTitle('Mesai Girişi')
            .setDescription('Yeni mesai başladı. İyi çalışmalar!')
            .setImage('https://i.imgur.com/FEeF7QS.png');


          await interaction.channel.send({ embeds: [girisEmbed] });
        } catch (error) {
          // Mesai başlamamışsa yeni bir mesai başlat
          const startTime = Date.now();
          const mesaiData = {
            userId,
            startTime,
            totalTime: 0,
            mesaiDurumu: 1,
          };

          fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData));

          const hataEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Renk
            .setTitle('Mesai Girişi')
            .setDescription('Yeni mesai başladı. İyi çalışmalar!')
            .setImage('https://i.imgur.com/FEeF7QS.png');

          await interaction.channel.send({embeds: [hataEmbed] });
          }

        }
        else{
          const mesaiEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Renk
            .setTitle('Mesai Girişi')
            .setDescription('Zaten Mesaidesin!')
            .setImage('https://i.imgur.com/FEeF7QS.png');

          await interaction.channel.send({embeds: [mesaiEmbed] });
        }
      } else if (i.customId === 'mesaiCikisi') {
        try {
          const mesaiFile = fs.readFileSync(`./mesai/${userId}.json`);
          const mesaiData = JSON.parse(mesaiFile);

          if (mesaiData.startTime) {
            const exitTime = Date.now();
            const totalTime = exitTime - mesaiData.startTime;
            mesaiData.totalTime += totalTime;
            mesaiData.startTime = null;
            mesaiData.mesaiDurumu = 0;
            fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData));

            const hours = Math.floor(totalTime / (1000 * 60 * 60));
            const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

            const cikisEmbed = new EmbedBuilder()
              .setColor('#e74c3c') // Renk
              .setTitle('Mesai Çıkışı')
              .setDescription(`Mesai çıkışı yapıldı. Toplam çalışma süreniz: ${hours} saat, ${minutes} dakika, ${seconds} saniye.`)
              .setImage('https://i.imgur.com/26Tm66x.png');
            await interaction.channel.send({ embeds: [cikisEmbed] });
          } else {
            const hataEmbed = new EmbedBuilder()
              .setColor('#e74c3c') // Hata rengi
              .setTitle('Hata Oluştu')
              .setDescription('Mesai çıkışı yapmak için önce mesai girişi yapmalısınız.');

            await interaction.channel.send({ embeds: [hataEmbed] });
          }
        } catch (error) {
          const hataEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Hata rengi
            .setTitle('Hata Oluştu')
            .setDescription('Mesai çıkışı yapılırken bir hata oluştu.');

          console.error('Hata oluştu:', error);
          await interaction.channel.send({ embeds: [hataEmbed] });
        }
      } else if (i.customId === 'mesaiBilgilerim') {
        try {
          const mesaiFile = fs.readFileSync(`./mesai/${userId}.json`);
          const mesaiData = JSON.parse(mesaiFile);

          const hours = Math.floor(mesaiData.totalTime / (1000 * 60 * 60));
          const minutes = Math.floor((mesaiData.totalTime % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((mesaiData.totalTime % (1000 * 60)) / 1000);

          const bilgilerimEmbed = new EmbedBuilder()
            .setColor('#3498db') // Renk
            .setTitle('Mesai Bilgileriniz')
            .setDescription(`Toplam mesai süreniz: ${hours} saat, ${minutes} dakika, ${seconds} saniye.`)
            .setImage('https://i.imgur.com/Un5qehg.png');

          await interaction.channel.send({ embeds: [bilgilerimEmbed] });
        } catch (error) {
          const hataEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Hata rengi
            .setTitle('Hata Oluştu')
            .setDescription('Mesai bilgilerinize ulaşılamıyor. Mesai girişi yapmalısınız.');

          console.error('Hata oluştu:', error);
          await interaction.channel.send({ embeds: [hataEmbed] });
        }
      }
    });

    collector.on('end', collected => {
      console.log(`Collected ${collected.size} interactions.`);
    });
  },
};
