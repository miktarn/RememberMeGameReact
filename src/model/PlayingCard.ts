export enum CardSuit {
    Heart = "♥",
    Clubs = "♣",
    Spades = "♠",
    Diamonds = "♦",
}

export enum CardValue {
    Two = "2",
    Three = "3",
    Four = "4",
    Five = "5",
    Six = "6",
    Seven = "7",
    Eight = "8",
    Nine = "9",
    Ten = "10",
    Jack = "J",
    Queen = "Q",
    King = "K",
    Ace = "A"
}

export class PlayingCard {
    constructor(
        public suit: CardSuit,
        public value: CardValue
    ) {}

    isMatchingSuit(other: PlayingCard): boolean {
        return this.suit === other.suit;
    }

    isMatchingValue(other: PlayingCard): boolean {
        return this.value === other.value;
    }
    toString(): string {
        return `${this.value}${this.suit}`;
    }

    isRed(): Boolean {
        return this.suit === CardSuit.Heart || this.suit === CardSuit.Diamonds;
    }
}

export const deck: PlayingCard[] = Object.values(CardSuit).flatMap((suit) =>
    Object.values(CardValue).map((value) => new PlayingCard(suit, value))
);