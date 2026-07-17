import {useContext, useEffect, useState} from "react";
import {useTimerLastUpdateTimestamp} from "./useTimerLastUpdateTimestamp";
import {GameContext} from "../GameContext";


export const useCountdown = (maxAmountOfSeconds: number | undefined) => {
    const {gameId} = useContext(GameContext)
    const {timerLastUpdateTimestamp, resetTimestamp} = useTimerLastUpdateTimestamp(gameId)
    const [seconds, setSeconds] = useState<number>(-1)

    function resetCountdown() {
        return resetTimestamp()
    }

    useEffect(() => {
        if (maxAmountOfSeconds) {
            setSeconds(maxAmountOfSeconds - getSecondsSince(timerLastUpdateTimestamp))
        }
    }, [maxAmountOfSeconds, timerLastUpdateTimestamp]);

    useEffect(() => {
        if (maxAmountOfSeconds) {
            if (seconds <= 0) return;

            const timeoutId = setTimeout(() => {
                setSeconds(maxAmountOfSeconds - getSecondsSince(timerLastUpdateTimestamp));
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [seconds]);

    useEffect(() => {
        if (maxAmountOfSeconds) {
            if (timerLastUpdateTimestamp > 0) {
                setSeconds(maxAmountOfSeconds - getSecondsSince(timerLastUpdateTimestamp))
            }
        }
    }, [timerLastUpdateTimestamp]);

    return {seconds, resetCountdown}
}

function getSecondsSince(timestamp: number) {
    const duration = Math.round((Date.now() - timestamp) / 1000)
    return duration > 0 ? duration : 0
}