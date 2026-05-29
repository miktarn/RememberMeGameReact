export interface GameState {
    cardsLayout: Array<number>
    removedCards: Array<number>
    playerScore: Array<Player>
    activePlayerName: string
    timer: number
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

export function getNextActivePlayerName(playerScore: Array<Player>, activePlayerName: string): string {
    for (let i = 0; i < playerScore.length; i++) {
        if (playerScore[i].name === activePlayerName) {
            const isLast = i === playerScore.length - 1;
            if (isLast) {
                return playerScore[0].name
            } else {
                return playerScore[i + 1].name
            }
        }
    }
    throw new Error("Next player not found. Array len is " + playerScore.length)
}