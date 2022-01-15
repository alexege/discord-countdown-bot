const config = require('dotenv').config();

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var conf = { prefix: "!" }

let timerIndex = 0;
let timersDict = {};
let timeLeft = 0;
let alertList = [];
// let destinationDate = null;

client.on("ready", () => {
    console.log(`Bot has started. Logged in as: ${client.user.tag}`);
});

// !timer test 04:20:00
client.on("messageCreate", message => {
    const arguments = message.content.slice(conf.prefix.length).trim().split(' ');
    const command = arguments.shift().toLowerCase();

    if (arguments.length >= 1) {
        timerName = "default";
        duration = arguments[0];
    }
    if (arguments.length == 2) {
        timerName = arguments[0];
        duration = arguments[1];
    }

    if (command === 'commands' || command === 'help'){
        message.channel.send(
            "```=========== Bot Commands ===========\n\n" + 
            "commands:\t\t Lists all possible commands\n" +
            "timer <timerName> <duration>:\t\t Creates a timer with a name you provide for the duration you set.\nLeave name blank for a default name.\n" +
            "cancel <timerName>:\t\t Cancels the specified timer.\n" + 
            "vote:\t\t Pulls up link for voting on Arkforever.com\n" + 
            "servers:\t\t Pulls up link for server list for ArkForever.com\n" + 
            "status:\t\t Displays a list of all active/inactive timers.```"
        )
    }

    if (command === 'timer'){
        createNewTimer(timerName, duration, message);
    }

    if (command === 'alltimers'){
        let allTimers = '';
        for (var i in timersDict){
            allTimers += "\n" + Object.values(timersDict[i]);
        }
        message.reply(`${allTimers}`);
    }

    if (command == 'cancel'){
        clearInterval(arguments[0]);
        delete timersDict[arguments[0]]
        console.log(timersDict.toString());
        message.reply(`Timer ${arguments[0].toString()} canceled!`);
    }

    if (command == 'addAlert'){
        let timer = arguments[0];
        let names = [];
        names.push(arguments[1]);
        // timersDict[name].alertList = alertList;
    }

    if (command == 'vote'){
        message.reply('https://ark-servers.net/server/277519/vote/');
    }

    if (command == 'servers'){
        message.reply('https://discord.com/channels/689807338839736342/692716072650014810/692716597344862228');
    }

    if (command === 'status'){
        let dictPrintOut = 'No active timers.';
        for (var i in timersDict){
            if(timersDict[i]){
                let timeleftHHMMSS = convertDifferenceToHHMMSS(timersDict[i].timeLeft.toString());
                dictPrintOut = "\n" + timersDict[i].name + " : " + convertDifferenceToHHMMSS(timersDict[i].timeLeft.toString());
            }
        }
        message.reply(`${dictPrintOut}`);
    }
});

//timerName = {
//      difference: 10000
//      duration: '0:10'
//      index: 2
//      name: 'app'
//      timeLeft: '0:00:00:10'
//}

// name: 'app', duration: '1:00'
function createNewTimer(name, duration, message) {
    console.log("Creating a new timer!");
    timerIndex++;
    timersDict[name] = { 
        index: timerIndex,
        name: name,
        duration: duration,
        destinationDate: stringToDate(duration),
        difference: calcTimeDelta(stringToDate(duration)),
        timeLeft: convertDifferenceToHHMMSS(stringToDate(duration)),
        alertList: null,
        expired: false
    };

    let timerName = "Timer_" + name;
    timerName = setInterval(function(){
        if(timersDict[name] !== undefined){
            timersDict[name].difference = calcTimeDelta(timersDict[name].destinationDate);
            timersDict[name].timeLeft = new Date(Date.parse(new Date()) + timersDict[name].difference);
            console.log(`${name}: ${convertDifferenceToHHMMSS(timersDict[name].timeLeft.toString())}`);

        if(parseInt(timersDict[name].difference) <= 0){
            clearInterval(timerName);
            timersDict[name].timeLeft = "Expired";
            return message.reply(`${name} timer is up!`);
        }
        }   
    }, 750);
}

// Input: 5:00:00
// Output: December 5th 2021 8:00:00 UTC
function stringToDate(stringDate){
    var years, months, days, hours, minutes, seconds = 0;

    let splitDate = stringDate.split(':');

    //#region Parse the stringDate into appropriate pieces
    switch(splitDate.length) {
        case 6:
            years   = parseInt(splitDate[0]);
            months  = parseInt(splitDate[1]);
            days    = parseInt(splitDate[2]);
            hours   = parseInt(splitDate[3]);
            minutes = parseInt(splitDate[4]);
            seconds = parseInt(splitDate[5]);
            break;
        case 5:
            years   = 0;
            months  = parseInt(splitDate[0]);
            days    = parseInt(splitDate[1]);
            hours   = parseInt(splitDate[2]);
            minutes = parseInt(splitDate[3]);
            seconds = parseInt(splitDate[4]);
            break;
        case 4:
            years   = 0;
            months  = 0;
            days    = parseInt(splitDate[0]);
            hours   = parseInt(splitDate[1]);
            minutes = parseInt(splitDate[2]);
            seconds = parseInt(splitDate[3]);
            break;
        case 3:
            years   = 0;
            months  = 0;
            days    = 0;
            hours   = parseInt(splitDate[0]);
            minutes = parseInt(splitDate[1]);
            seconds = parseInt(splitDate[2]);
            break;
        case 2:
            years   = 0;
            months  = 0;
            days    = 0;
            hours   = 0;
            minutes = parseInt(splitDate[0]);
            seconds = parseInt(splitDate[1]);
            break;
        case 1:
            years   = 0;
            months  = 0;
            days    = 0;
            hours   = 0;
            minutes = 0;
            seconds = parseInt(splitDate[0]);
            break;
    }
    // console.log(`${years}:Years, ${months}:Months, ${days}:Days, ${hours}:Hours, ${minutes}:Minutes, ${seconds}:Seconds`);
    //#endregion

    //#region Add new properties to the Date object constructor
    Date.prototype.addSeconds = function(seconds) {
        this.setSeconds(this.getSeconds() + seconds);
        return this;
    };

    Date.prototype.addMinutes = function(minutes) {
        this.setMinutes(this.getMinutes() + minutes);
        return this;
    };

    Date.prototype.addHours = function(hours) {
        this.setHours(this.getHours() + hours);
        return this;
    };

    Date.prototype.addDays = function(days) {
        this.setDate(this.getDate() + days);
        return this;
    };

    Date.prototype.addWeeks = function(weeks) {
        this.addDays(weeks*7);
        return this;
    };

    Date.prototype.addMonths = function (months) {
        var dt = this.getDate();
        this.setMonth(this.getMonth() + months);
        var currDt = this.getDate();
        if (dt !== currDt) {  
            this.addDays(-currDt);
        }
        return this;
    };

    Date.prototype.addYears = function(years) {
        var dt = this.getDate();
        this.setFullYear(this.getFullYear() + years);
        var currDt = this.getDate();
        if (dt !== currDt) {  
            this.addDays(-currDt);
        }
        return this;
    };
    //#endregion

    // Now take the date pieces and use it to convert a date.

    //Add the new timer values to the current date
    //Ex. Sun Dec 05 2021 18:44:46 GMT-0800 (Pacific Standard Time)
    return new Date().addYears(years).addMonths(months).addDays(days).addHours(hours).addMinutes(minutes).addSeconds(seconds);

    // const convertedTimeDelta = convertDifferenceToHHMMSS(destinationDate);
    // return convertedTimeDelta;
}

// For viewing functionality, we want the user to be able to see time left with status command
// Input: Sun Dec 05 2021 23:08:31 GMT-0800 (Pacific Standard Time)
// Output: 04:20:20:01
function convertDifferenceToHHMMSS(date) {
        var difference = calcTimeDelta(date);
        var sec_num = parseInt(difference / 1000);
        var days = Math.floor(sec_num / (3600 * 24));
        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
        var seconds = sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60);
    
        //Account for single digit numbers
        if (hours < 10) {hours = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}

        timeLeft = days+':'+hours+':'+minutes+':'+seconds;
        // console.log("TimeLeft: ", timeLeft);

        return timeLeft;
}

// Calculates difference between Date and Now
// Input: Mon Dec 06 2021 15:43:48 GMT-0800 (Pacific Standard Time)
// Output: 58966000
function calcTimeDelta(destinationDate){
    return Date.parse(destinationDate) - Date.parse(new Date());
}

client.login(process.env.BOT_TOKEN);