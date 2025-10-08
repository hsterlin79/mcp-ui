import { LightningElement } from 'lwc';

export default class App extends LightningElement {

    flightData = [];

    connectedCallback() {
        //Sample data to test the flight details component getting rendered. 
        this.flightData = [
            {
                flightId: 'AA123',
                price: 350.50,
                discountPercentage: 10,
                durationInMin: 255, // 4h 15m in minutes
                numLayovers: 1,
                isPetAllowed: true
            },
            {
                flightId: 'UA456',
                price: 520.00,
                discountPercentage: 5,
                durationInMin: 390, // 6h 30m in minutes
                numLayovers: 0,
                isPetAllowed: false
            },
            {
                flightId: 'DL789',
                price: 289.99,
                discountPercentage: 15,
                durationInMin: 175, // 2h 55m in minutes
                numLayovers: 0,
                isPetAllowed: true
            },
            {
                flightId: 'SW011',
                price: 410.75,
                discountPercentage: 0,
                durationInMin: 440, // 7h 20m in minutes
                numLayovers: 2,
                isPetAllowed: false
            }
        ];
    }

}
