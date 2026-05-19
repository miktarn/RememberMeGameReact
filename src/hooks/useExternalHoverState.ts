import {useEffect, useMemo, useState} from "react";
import debounce from "lodash.debounce";
import {onValue, ref, set} from "firebase/database";
import {rtdb} from "../config/firebase";

export const useExternalHoverState = (currentGameId: string, cardIndex: number) => {
    const [isExternalHover, setExternalHover] = useState(false)

    useEffect(() => {
        const hoversRef = ref(rtdb, `rooms/${currentGameId}/hover/${cardIndex}`);

        const unsubscribe = onValue(hoversRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setExternalHover(true);
            } else {
                setExternalHover(false);
            }
        });

        return () => unsubscribe();
    }, [currentGameId]);

    const debouncedHoverStart = useMemo(() => {
        return debounce(() => {
            const playerFlipRef = ref(rtdb, `rooms/${currentGameId}/hover/${cardIndex}`);
            set(playerFlipRef, true);
        }, 100);
    }, [currentGameId]);

    const handleHoverStart = () => {
        debouncedHoverStart();
    };

    const handleHoverEnd = () => {
        debouncedHoverStart.cancel();

        const playerFlipRef = ref(rtdb, `rooms/${currentGameId}/hover/${cardIndex}`);
        set(playerFlipRef, null);
    };

    return {isExternalHover, handleHoverStart, handleHoverEnd}
}