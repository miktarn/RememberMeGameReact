import {useEffect, useState} from "react";


export const useCountdown = (maxAmountOfSeconds: number)=> {
    const [seconds, setSeconds] = useState<number>(maxAmountOfSeconds)

    useEffect(() => {
        if (seconds <= 0) return;

        const timeoutId = setTimeout(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () =>  clearTimeout(timeoutId);
    }, [seconds, maxAmountOfSeconds]);

    function resetCountdown() {
        setSeconds(maxAmountOfSeconds);
    }

    return {seconds, resetCountdown}
}