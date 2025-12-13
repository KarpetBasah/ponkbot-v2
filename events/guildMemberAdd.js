// events/guildMemberAdd.js
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === 'general'); // Atau ID channel Anda
        if (welcomeChannel && welcomeChannel.isTextBased()) {
            
            // Pinkie Pie's SUPER excited welcome messages!
            const welcomeMessages = [
                `🎉 **OMG OMG OMG!** WELCOME TO THE PARTY, ${member}! *throws confetti everywhere* This is like... the BEST day ever! A new friend! WHEEEEE! 🎈`,
                `🧁 **GASP!** ${member}! *bounces excitedly* You found our super-duper-special friendship party server! Time to celebrate with cupcakes and giggles! �`,
                `🎊 **SURPRISE!** ${member}! *spins around with joy* Welcome to the most FUN place in all of Discord! Let's throw you a welcome party! 🎂`,
                `🎈 **OH BOY OH BOY!** ${member}! *does a happy dance* A new friend means it's time for a spontaneous friendship celebration! This calls for CAKE! �`,
                `� **WOW WOW WOW!** ${member}! *giggles uncontrollably* You just made my Pinkie Sense tingle with excitement! Welcome to our amazing friendship family! 💖`,
                `🎪 **PARTY ALERT!** ${member}! *throws streamers* Somepony new just joined our super-special-awesome community! Time for the Welcome Wagon! 🌈`
            ];
            
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            
            // Create Pinkie's super-exciting welcome embed
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#ff1493') // Pinkie's signature hot pink
                .setTitle('🎉 WELCOME TO PINKIE\'S FRIENDSHIP PARTY! 🎉')
                .setDescription(randomWelcome)
                .addFields(
                    { 
                        name: '� PARTY RULES (They\'re super fun!)', 
                        value: '🧁 • Be as sweet as cupcakes to everypony!\n🎈 • Share smiles and giggles everywhere!\n🎊 • Make friends and throw parties!\n🌈 • Remember: Every day is a reason to celebrate!\n💖 • Friendship is the BEST magic ever!', 
                        inline: false 
                    },
                    { 
                        name: '� LET\'S GET THIS PARTY STARTED!', 
                        value: '🎭 Try `/ping` for a ping party!\n🧠 Use `/pony-trivia` for brain-tickling fun!\n🎪 Check out all my super-duper commands!\n🎈 And remember: If you need help, just ask! I LOVE helping friends!', 
                        inline: false 
                    },
                    {
                        name: '🍰 PINKIE\'S WELCOME GIFT',
                        value: '*hands you a virtual cupcake* 🧁\nHere\'s a friendship cupcake just for you! It\'s made with extra sprinkles and giggles!',
                        inline: false
                    }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Party Member #${member.guild.memberCount} • Every friend makes the party better! 🎂` })
                .setTimestamp();

            await welcomeChannel.send({ 
                content: `${member} 🌈`, 
                embeds: [welcomeEmbed] 
            });
        } else {
            console.log(`🚨 Cannot find 'general' channel or channel is not text-based in server ${member.guild.name}.`);
        }
    },
};