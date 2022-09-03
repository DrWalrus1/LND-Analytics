import lnService from 'ln-service';
import bitcoin from 'bitcoin';
import * as dotenv from 'dotenv'
dotenv.config();

let client = new bitcoin.Client({
    host: process.env.BTCHOST,
    port: process.env.BTCPORT,
    user: process.env.RPCUSER,
    pass: process.env.RPCPASS,
});

export function getChannelAge(transactionID) {
        client.getRawTransaction(transactionID)
}

export function calculateChannelNumbers(channel) {
    channel.feesEarned = CalculateTotalFeesEarned(channel.outgoing_forwards);
    channel.totalForwarded = CalculateTotalForwardAmount(channel.outgoing_forwards);
    channel.averageFeeEarned = (channel.feesEarned / channel.outgoing_forwards.length).toLocaleString();
    channel.averageForwardAmount = (channel.totalForwarded / channel.outgoing_forwards.length).toLocaleString();
    if (!channel.is_partner_initiated)
    // TODO: Fix when blockchain is synced -> get onchain fee by getting raw transaction
        channel.current_profit = channel.feesEarned - 213;
    else
        channel.current_profit = channel.feesEarned;

    return channel;
}