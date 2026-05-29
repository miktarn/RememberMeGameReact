import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {Card} from "../src/pages/GameScreen";
import {deck} from "../src/model/PlayingCard";


const CardProps = {
    onClick: () => {},
    isFlipped: false,
    isRemoved: false,
    card: deck[0],
    isPlayerTurn: true,
    cardIndex: 0
}

test('Should render loading screen', async () => {
    // ARRANGE
    render(<Card {...CardProps}/>)

    // ACT

    // ASSERT
    expect(screen.getByText('***')).toBeInTheDocument();
})