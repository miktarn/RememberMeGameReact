import {render, screen} from '@testing-library/react'
import '@testing-library/jest-dom'
import {TestComponent} from "./TestComponent";

test('Should render loading screen', async () => {
    // ARRANGE
    render(<TestComponent/>)

    // ACT

    // ASSERT
    expect(screen.getByText('This is test component')).toBeInTheDocument();
})