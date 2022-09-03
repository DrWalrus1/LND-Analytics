import lnService from 'ln-service';
import * as dotenv from 'dotenv';
dotenv.config();
import { CalculateTotalFeesEarned, CalculateTotalForwardAmount } from './src/forwards.js';
import { getChannelAge } from './src/channels.js';

const { lnd } = lnService.authenticatedLndGrpc({
    cert: process.env.CERT,
    macaroon: process.env.MACAROON,
    socket: process.env.SOCKET,
});

const { channels } = (await lnService.getChannels({ lnd }));

const afterDate = new Date('1 August 2022 00:00 GMT+10').toISOString();
const beforeDate = new Date('31 August 2022 23:59 GMT+10').toISOString();

const forwards = (await lnService.getForwards({ after: afterDate, before: beforeDate, lnd: lnd, limit: 1000 })).forwards.reverse();

for (let i = 0; i < channels.length; i++) {
    channels[i].partner_alias = (await (lnService.getNode({ public_key: channels[i].partner_public_key, lnd }))).alias;
    channels[i].incoming_forwards = forwards.filter(function (element) {
        return element.incoming_channel == channels[i].id;
    });
    channels[i].outgoing_forwards = forwards.filter(function (element) {
        return element.outgoing_channel == channels[i].id;
    });
}

let totalFeesEarned = 0;
let totalOutgoing = 0;
// Calculate total fees and forwarding amount
for (let i = 0; i < channels.length; i++) {
    channels[i].feesEarned = CalculateTotalFeesEarned(channels[i].outgoing_forwards);
    channels[i].totalForwarded = CalculateTotalForwardAmount(channels[i].outgoing_forwards);
    channels[i].averageFeeEarned = (channels[i].feesEarned / channels[i].outgoing_forwards.length).toLocaleString();
    channels[i].averageForwardAmount = (channels[i].totalForwarded / channels[i].outgoing_forwards.length).toLocaleString();
    totalFeesEarned += channels[i].feesEarned;
    totalOutgoing += channels[i].outgoing_forwards.length;
};

// Sort channels from least fees earned to most fees earned
channels.sort(function (a, b) {return a.feesEarned - b.feesEarned});

for (let i = 0; i < channels.length; i++) {
    console.log(`${channels[i].partner_alias}:
    Incoming Forwards: ${channels[i].incoming_forwards.length}
    Outgoing Forwards: ${channels[i].outgoing_forwards.length}
    Total Amount Forwarded: ${channels[i].totalForwarded.toLocaleString()} sats
    Total Fees Earned: ${channels[i].feesEarned.toLocaleString()} sats
    Average Fee per Forward: ${channels[i].averageFeeEarned}
    Average Forward Amount: ${channels[i].averageForwardAmount}`);
}

console.log(`Total Fees Earned: ${totalFeesEarned} sats`);
console.log(`Total Forwards: ${totalOutgoing}`);