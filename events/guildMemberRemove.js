// events/guildMemberRemove.js
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const farewellChannel = member.guild.channels.cache.find(channel => channel.name === 'general'); // Atau ID channel Anda
        if (farewellChannel && farewellChannel.isTextBased()) {
            
            // Pinkie Pie's emotional but still hopeful farewell messages
            const farewellMessages = [
                `😢 **${member.user.tag}** *sniffles* has left our party... But wait! *brightens up* That just means they're starting a NEW adventure! I hope they throw AMAZING parties wherever they go! 🎈`,
                `💔 Aww... **${member.user.tag}** won't be at our friendship parties anymore... *wipes away a tear* But you know what? The memories we made are like cupcakes - they last forever in our hearts! 🧁`,
                `😭 OH NO! **${member.user.tag}** is gone! *dramatically falls to the ground* But... *pops back up* maybe they'll come back for a surprise party someday! I'll keep a cupcake ready! 🎂`,
                `🥺 **${member.user.tag}** has trotted away from our party... *sighs sadly* I'll miss their giggles and smiles! But friendship is FOREVER, even when friends are far away! 💖`,
                `😢 *deflates like a sad balloon* **${member.user.tag}** won't be bouncing around with us anymore... But hey! *inflates back up* They taught us that every friend makes us better! 🎪`,
                `� **${member.user.tag}** has galloped off to new adventures... *tears up* I hope they find lots of new friends and throw the most SPECTACULAR parties! 🌈`
            ];
            
            const randomFarewell = farewellMessages[Math.floor(Math.random() * farewellMessages.length)];
            
            // Pinkie Pie's bittersweet quotes about friendship and goodbyes
            const characterQuotes = [
                { quote: "Goodbye is just... see you later! Because real friends always find their way back to each other!", character: "Pinkie Pie" },
                { quote: "Sometimes friends go away, but the giggles they gave us stay FOREVER in our hearts! *sniffles happily*", character: "Pinkie Pie" },
                { quote: "Even when the party ends, the memories keep the music playing in our hearts! Isn't that magical?", character: "Pinkie Pie" },
                { quote: "Friends might trot away, but they take a piece of our party with them - and leave a piece of theirs with us!", character: "Pinkie Pie" },
                { quote: "Every friend is like a special ingredient in the recipe of life - once they're added, they change the flavor forever!", character: "Pinkie Pie" },
                { quote: "Saying goodbye is like... the last bite of your favorite cupcake. Sad, but OH SO sweet to remember!", character: "Pinkie Pie" }
            ];
            
            const randomQuote = characterQuotes[Math.floor(Math.random() * characterQuotes.length)];
            
            // Create Pinkie's bittersweet farewell embed
            const farewellEmbed = new EmbedBuilder()
                .setColor('#ff69b4') // Still Pinkie pink, but softer
                .setTitle('😢 FAREWELL PARTY (The Sad Kind...) 😢')
                .setDescription(randomFarewell)
                .addFields(
                    { 
                        name: '� Pinkie\'s Wisdom About Goodbyes', 
                        value: `*"${randomQuote.quote}"*\n— ${randomQuote.character}`, 
                        inline: false 
                    },
                    { 
                        name: '🎈 Promise from Pinkie', 
                        value: 'I\'ll keep a party hat ready for you, just in case you come back! And I\'ll never forget all the smiles we shared! 🎂', 
                        inline: false 
                    },
                    {
                        name: '🧁 Memory Cupcake',
                        value: '*places a virtual memory cupcake on the table*\nThis cupcake will stay here forever, just like our friendship memories!',
                        inline: false
                    }
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: `${member.guild.memberCount} friends still at the party • But we'll always remember our ${member.guild.memberCount + 1}th friend! 🎈` })
                .setTimestamp();

            await farewellChannel.send({ embeds: [farewellEmbed] });
        } else {
            console.log(`🚨 Cannot find 'general' channel or channel is not text-based in server ${member.guild.name}.`);
        }
    },
};