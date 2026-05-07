import {JSX, useState} from 'react';
import  { PlayingCard,CardSuit, CardValue} from "./PlayingCard";

export default function Game(): JSX.Element {
    const [score, setScore] = useState(0);
    const [isMatchingBySuit, setIsMatchingBySuit] = useState(true)

    function addScore(points: number) {
        setScore(score + points);
    }

    return (
        <div className="game">
            <div className="board">
                <Board addScore={addScore} isMatchingBySuit={isMatchingBySuit}/>
            </div>
            <div className="game-info">
                <div className="status">
                    Your score is <span className="score">{score}</span>
                </div>
                <button className="change-matching-rule" onClick={() => setIsMatchingBySuit(!isMatchingBySuit)}>
                    {isMatchingBySuit ? "Change to match by value" : "Change to match by suit"}
                </button>
            </div>
        </div>
    );
}

const revealTimeout = 700;

interface BoardProps {
    addScore: (points: number) => void,
    isMatchingBySuit: Boolean;
}

function Board({addScore, isMatchingBySuit} : BoardProps): JSX.Element {
    const [cards, setCards] = useState<PlayingCard[]>(cardsInitialState);
    const [isFlipped, setIsFlipped] = useState(Array());
    const [isRemoved, setIsRemoved] = useState(Array());
    const [isLocked, setIsLocked] = useState(false);

    function checkIfMatching(updatedFlipped: any[]) {
        const firstCard = cards[updatedFlipped[0]];
        const secondCard = cards[updatedFlipped[1]];

        if (isMatchingBySuit && firstCard.isMatchingSuit(secondCard)) {
            addScore(1);
            setTimeout(() => {
                setIsRemoved([...isRemoved, ...updatedFlipped]);
                setIsFlipped(Array())
                setIsLocked(false)
            }, revealTimeout);
        } else if (!isMatchingBySuit && firstCard.isMatchingValue(secondCard)){
            addScore(2);
            setTimeout(() => {
                setIsRemoved([...isRemoved, ...updatedFlipped]);
                setIsFlipped(Array())
                setIsLocked(false)
            }, revealTimeout);
        } else {
            setTimeout(() => {
                setIsFlipped(Array());
                setIsLocked(false)
            }, revealTimeout);
        }
    }

    function handleClick(index: number) {
        if (isLocked) {return;}
        const updatedFlipped = [...isFlipped, index];
        setIsFlipped(updatedFlipped);

        console.log("You chose " + cards[index].toString() + ", amount of flipped is " + updatedFlipped.length)
        if (updatedFlipped.length === 2) {
            setIsLocked(true)
            checkIfMatching(updatedFlipped);
        }
    }

    function buildCardProps(index: number): CardProps {
        return {
            card: cards[index],
            isFlipped: isFlipped.includes(index),
            isRemoved: isRemoved.includes(index),
            onClick: () => handleClick(index),
        };
    }

    return (
        <>
            <div className="board-row">
                <Card {...buildCardProps(0)}/>
                <Card {...buildCardProps(1)}/>
                <Card {...buildCardProps(2)}/>
                <Card {...buildCardProps(3)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(4)}/>
                <Card {...buildCardProps(5)}/>
                <Card {...buildCardProps(6)}/>
                <Card {...buildCardProps(7)}/>
            </div>
            <div className="board-row">
                <Card {...buildCardProps(8)}/>
                <Card {...buildCardProps(9)}/>
                <Card {...buildCardProps(10)}/>
                <Card {...buildCardProps(11)}/>
            </div>
        </>
    );
}



interface CardProps {
    onClick: () => void,
    isFlipped: Boolean,
    isRemoved: Boolean,
    card: PlayingCard;
}

function Card({isFlipped, isRemoved, card, onClick}: CardProps): JSX.Element {
    if (isRemoved) {
        return <div className="card" />
    }
    return (
        <button className="card" onClick={onClick}>
            {isFlipped ? card.toString() : "***"}
        </button>
    );
}

const cardsInitialState: PlayingCard[] = [
    new PlayingCard(CardSuit.Spades, CardValue.Two),
    new PlayingCard(CardSuit.Heart, CardValue.Two),
    new PlayingCard(CardSuit.Spades, CardValue.Ace),
    new PlayingCard(CardSuit.Heart, CardValue.Ace),
    new PlayingCard(CardSuit.Spades, CardValue.King),
    new PlayingCard(CardSuit.Heart, CardValue.King),
    new PlayingCard(CardSuit.Spades, CardValue.Queen),
    new PlayingCard(CardSuit.Heart, CardValue.Queen),
    new PlayingCard(CardSuit.Spades, CardValue.Nine),
    new PlayingCard(CardSuit.Heart, CardValue.Nine),
    new PlayingCard(CardSuit.Spades, CardValue.Ten),
    new PlayingCard(CardSuit.Heart, CardValue.Ten),
];