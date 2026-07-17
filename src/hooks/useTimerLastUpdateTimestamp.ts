import {useEffect, useState} from "react";
import {onValue, ref, set} from "firebase/database";
import {rtdb} from "../config/firebase";

export const useTimerLastUpdateTimestamp = (currentGameId: string) => {
    const [timerLastUpdateTimestamp, setTimerLastUpdateTimestamp] = useState<number>(0);

    useEffect(() => {
        console.log("Current game ID: " + currentGameId)
        const dataRef = ref(rtdb, `rooms/${currentGameId}/timer-last-update-timestamp`);

        const unsubscribe = onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTimerLastUpdateTimestamp(data);
            } else {
                updateTimestamp()
            }
        });

        return () => unsubscribe();
    }, [currentGameId]);


    const updateTimestamp = () => {
        const dataRef = ref(rtdb, `rooms/${currentGameId}/timer-last-update-timestamp`)
        return set(dataRef, Date.now())
    }

    return {timerLastUpdateTimestamp, resetTimestamp: updateTimestamp}
}