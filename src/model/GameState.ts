
export interface GameState {
    cardsLayout: Array<number>
    removedCards: Array<number>
    playerScore: Array<Player>
}

export interface Player {
    name: string,
    score: number
}

export function increasePoints(playerScore: Array<Player>, playerName: string, points: number): Player[] {
    const nextPlayers = playerScore.slice();
    for (let i = 0; i < nextPlayers.length; i++) {
        if (nextPlayers[i].name === playerName) {
            nextPlayers[i].score += points;
            return nextPlayers;
        }
    }
    throw new Error("Player " + playerName + " is not found")
}