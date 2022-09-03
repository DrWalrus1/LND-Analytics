// 1000 msats = 1 sat

/**
 * 
 * @param {Array<Object>} forwards 
 */
 export function CalculateTotalForwardAmount(forwards) {
    if (forwards.length == 0) {
        return 0;
    } else {
        let total = forwards.reduce((previousValue, currentValue) => {
            return previousValue + parseInt(currentValue.mtokens)
        }, 0);
        return total / 1000;
    }
}

/**
 * 
 * @param {Array<Object>} forwards 
 */
export function CalculateTotalFeesEarned(forwards) {
    if (forwards.length == 0) {
        return 0;
    } else {
        let total = forwards.reduce((previousValue, currentValue) => {
            return previousValue + parseInt(currentValue.fee_mtokens)
        }, 0);
        return total / 1000;
    }
}
