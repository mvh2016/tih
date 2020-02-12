const Discord = require('discord.js');
const prefix = '!';
const token = process.env.token;
const client = new Discord.Client();
const roblox = require('noblox.js');
const request = require('request')
const snekfetch = require('snekfetch');
const firebaseURL = process.env.firebaseURL;
const firebase = require('firebase');
const firebaseConfig = {
    databaseURL: `${firebaseURL}`
}
firebase.initializeApp(firebaseConfig)

client.once('ready', () => {
    console.log('Bot is running!')
    client.user.setActivity('The Imperial Hotel', { type: "WATCHING" })
})

client.on('message', async message => {

    if (message.author.bot) return;
    
    if (message.content === `${prefix}verify`){
        var {body} = await snekfetch.get(`${firebaseURL}/users/${message.author.id}.json`);
        if (!body) {
            const firstEmbed = new Discord.RichEmbed()
            .setDescription('We couldn\'t find you in our database! Let\'s start from the beginning.\nWhat\'s your username?\nYou can cancel this command by entering `cancel`.')
            .setAuthor(message.member.displayName, message.author.avatarURL)
            .setFooter('This message will expire shortly, so please do this quickly! | DM Canadian#3155 for help')
            message.channel.send(firstEmbed).then(message => message.delete(20000))
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { max:1, time:20000 });
            let counter = 0;
            collector.on('collect', message => {
                console.log('Collected message: '+message.content)
                counter++;
                if(counter == 1) {
                    collector.stop();
                    if (message.content.toString().toLowerCase() === 'cancel') {
                        message.channel.send('Cancelled command.')
                    }
                    else {
                        function makeRandomBlurb() {
                            var text = "";
                            var selectBlurb = ['oof','and','cup','chocolate','llama','roblox','cool','canadian','judgement']
                            text += selectBlurb[Math.floor(Math.random() * selectBlurb.length)];
                            return text;
                        }
                        roblox.getIdFromUsername(message.content).then(foundId => {
                            const id = foundId
                            const correctBlurb = makeRandomBlurb() + ' ' + makeRandomBlurb() + ' ' + makeRandomBlurb() + ' ' + makeRandomBlurb() + ' ' + makeRandomBlurb()
                            console.log(id)
                            console.log(correctBlurb)
                        const foundUsername = new Discord.RichEmbed()
                            .setDescription('Insert the following into your Roblox STATUS - not your blurb. \n`'+correctBlurb+'`\n**Reply `done` when you have done so!')
                            .setAuthor(message.member.displayName, message.author.avatarURL)
                            .setFooter('This message will expire shortly, so please do this quickly! | DM Canadian#3155 for help')
                        message.channel.send(foundUsername)
                        const collector2 = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { max:1, time:300000 });
                        let counter2 = 0;
                        collector2.on('collect', msg => {
                            counter2++;
                            if(counter2 == 1) {
                                if (msg.toString().toLowerCase() === 'done' && msg.author.id == message.author.id) {
                                    roblox.getStatus(id).then(status => {
                                        console.log('Status found: '+status)
                                        if (status.includes(correctBlurb)) {
                                            try {
                                                message.member.setNickname(message.content)
                                                const verifiedEmbed = new Discord.RichEmbed()
                                                .setDescription('You have been successfully verified as '+message.content+'!\nNote: If your nickname has **NOT** changed, contact a server moderator to have it changed manually. Permissions may be set wrong.')
                                                .setAuthor(message.member.displayName, message.author.avatarURL)
                                                .setColor("GREEN")
                                                message.channel.send(verifiedEmbed)
                                                var Discordid = message.author.id
                                                firebase.database().ref(`users/${message.author.id}`).set({id: `${id}`, username: `${message.content}`})
                                                if (message.member.roles.has('606779249017487361')) {
                                                    ;
                                                }
                                                else {
                                                    message.member.addRole('606779249017487361', 'Verifying')
                                                }
                                            }
                                            catch {
                                                const nicknamefailEmbed = new Discord.RichEmbed()
                                                .setDescription('You were not able to be verified. Please try again or contact Canadian#3155.')
                                                .setAuthor(message.member.displayName, message.author.avatarURL)
                                                .setColor("RED")
                                                message.channel.send(nicknamefailEmbed)
                                            }
                                        }
                                        else {
                                            const nonVerifiedEmbed = new Discord.RichEmbed()
                                            .setDescription('You were not able to be verified. Please try again or contact Canadian#3155.')
                                            .setAuthor(message.member.displayName, message.author.avatarURL)
                                            .setColor("RED")
                                            message.channel.send(nonVerifiedEmbed)
                                        }
                                    })
                                }
                            }
                        })
                        collector2.on('end', collected => {
                            ;
                        })
                        }).catch(function(err){
                            const nonVerifiedEmbed = new Discord.RichEmbed()
                            .setDescription('Your username may be invalid. Perhaps you typed it wrong? \nPlease try again or contact Canadian#3155.')
                            .setAuthor(message.member.displayName, message.author.avatarURL)
                            .setColor("RED")
                            message.channel.send(nonVerifiedEmbed)
                        })
                    }  
                }
            });
            collector.on('end', collected => {
                ;
            });
            }
        else {
            console.log(body)
            var id = body.id
            roblox.getUsernameFromId(id).then(username => {
                message.member.setNickname(username)
                const verifiedEmbed2 = new Discord.RichEmbed()
                .setDescription('You have been successfully verified as '+username+'!\nNote: If your nickname has **NOT** changed, contact a server moderator to have it changed manually. Permissions may be set wrong.')
                .setAuthor(message.member.displayName, message.author.avatarURL)
                .setColor("GREEN")
                message.channel.send(verifiedEmbed2)
                var rank = roblox.getRankInGroup(5097935, id).then(async rank => {
                    var verifyRequest = await snekfetch.get(`${firebaseURL}/bindings/${rank}.json`).then(response => {
                        var outcome = response.body.role
                        console.log(outcome)
                        message.member.addRole(outcome)
                    })
                })
            })
        }
    }

    if (message.content.startsWith(`${prefix}bind`)) {
        var arguments = message.content.split(' ')
        if (arguments.length != 3) {
            ;
        }
        else if (arguments.length === 3) {
            var { body2 } = await snekfetch.get(`${firebaseURL}/bindings/${arguments[1]}.json`).then(response => {
                console.log(response.body)
                if (!response.body) {
                    arguments.shift()
                    var roleInDiscord = arguments[0]
                    var roleInGroup = arguments[1]
                    firebase.database().ref(`bindings/${roleInGroup}`).set({role: `${roleInDiscord}`})
                    const bindSuccess = new Discord.RichEmbed()
                        .setDescription('Binding added successfully with role id '+roleInDiscord+' and group role '+roleInGroup+'.')
                        .setAuthor(message.member.displayName, message.author.avatarURL)
                        .setColor("GREEN")
                    message.channel.send(bindSuccess)
                }
                else {
                    console.log(response.body.role)
                    arguments.shift()
                    var roleInDiscord = arguments[0]
                    var roleInGroup = arguments[1]
                    firebase.database().ref(`bindings/${roleInGroup}`).set({role: (`${response.body.role}`+','+`${roleInDiscord}`)})
                    const bindSuccess = new Discord.RichEmbed()
                        .setDescription('Binding added successfully with role id '+roleInDiscord+' and group role '+roleInGroup+'.')
                        .setAuthor(message.member.displayName, message.author.avatarURL)
                        .setColor("GREEN")
                    message.channel.send(bindSuccess)
                }
            });
        }
        }


})


client.login(token)

