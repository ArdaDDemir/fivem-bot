const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, Permissions, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mesai')
    .setDescription('Mesai ile ilgili işlemler')
    .addSubcommand(subcommand =>
      subcommand
        .setName('giris')
        .setDescription('Mesai girişi yapın')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cikis')
        .setDescription('Mesai çıkışı yapın')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('bilgilerim')
        .setDescription('Toplam mesai bilgilerinizi görüntüleyin')
    ),

  async run({ interaction }) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    switch (subcommand) {
      case 'giris':
         const mesaiFile = fs.readFileSync(`./mesai/${userId}.json`);
          const mesaiData = JSON.parse(mesaiFile);
        if(mesaiData.mesaiDurumu!=1){
        try {
         

          mesaiData.startTime = Date.now();
          mesaiData.mesaiDurumu = 1;
          fs.writeFileSync(`./mesai/${userId}.json`, JSON.stringify(mesaiData));

          const girisEmbed = new EmbedBuilder()
            .setColor('#2ecc71') // Renk
            .setTitle('Mesai Girişi')
            .setDescription('Yeni mesai başladı. İyi çalışmalar!')
            .setImage('https://i.imgur.com/FEeF7QS.png');

          await interaction.reply({ embeds: [girisEmbed] });
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

          await interaction.reply({ embeds: [hataEmbed] });

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

        break;

      case 'cikis':
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
            await interaction.reply({ embeds: [cikisEmbed] });
          } else {
            const hataEmbed = new EmbedBuilder()
              .setColor('#e74c3c') // Hata rengi
              .setTitle('Hata Oluştu')
              .setDescription('Mesai çıkışı yapmak için önce mesai girişi yapmalısınız.');

            await interaction.reply({ embeds: [hataEmbed] });
          }
        } catch (error) {
          const hataEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Hata rengi
            .setTitle('Hata Oluştu')
            .setDescription('Mesai çıkışı yapılırken bir hata oluştu.');

          console.error('Hata oluştu:', error);
          await interaction.reply({ embeds: [hataEmbed] });
        }
        break;

      case 'bilgilerim':
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

          await interaction.reply({ embeds: [bilgilerimEmbed] });
        } catch (error) {
          const hataEmbed = new EmbedBuilder()
            .setColor('#e74c3c') // Hata rengi
            .setTitle('Hata Oluştu')
            .setDescription('Mesai bilgilerinize ulaşılamıyor. Mesai girişi yapmalısınız.');

          console.error('Hata oluştu:', error);
          await interaction.reply({ embeds: [hataEmbed] });
        }
        break;

      default:
        break;
    }
  },
};
