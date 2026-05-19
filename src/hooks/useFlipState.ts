import {rtdb} from "../config/firebase";
import {onValue, ref, set} from "firebase/database";
import {useEffect, useState} from "react";

export const useFlipState = (currentGameId: string) =>{
    const [flipped, setFlipped] = useState<number[]>(Array());

    useEffect(() => {
        const hoversRef = ref(rtdb, `rooms/${currentGameId}/flips`);

        const unsubscribe = onValue(hoversRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setFlipped(Object.keys(data).map(Number));
            } else {
                setFlipped(Array());
            }
        });

        return () => unsubscribe();
    }, [currentGameId]);

    const handleFlipStart = (cardIndex: number) => {
        const playerFlipRef = ref(rtdb, `rooms/${currentGameId}/flips/${cardIndex}`);
        set(playerFlipRef, true);
    };

    const handleFlipEnd = () => {
        const playerFlipRef = ref(rtdb, `rooms/${currentGameId}/flips`);
        set(playerFlipRef, null);
    };

    return {flipped, handleFlipStart, handleFlipEnd}
}