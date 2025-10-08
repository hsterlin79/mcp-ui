/*
 * Copyright 2022 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 */

import { LightningElement, api } from 'lwc';

export default class FlightDetails extends LightningElement {

   @api value
   flightData = [];

    // Method to convert duration from minutes to hours and minutes
    formattedDuration(durationInMin) {
        if (durationInMin) {
            const hours = Math.floor(durationInMin / 60); // Get whole hours
            const minutes = durationInMin % 60; // Get remaining minutes
            return `${hours} hr ${minutes} min`
        }
        return;
    }

    // Method to calculate arrival time based on departure time and duration
    arrivalTime(durationInMin) {
        const hours = 7, minutes = 0;
        const departureDate = new Date(2025, 0, 1, hours, minutes); // Sample date for calculation

        const arrivalDate = new Date(departureDate.getTime() + durationInMin * 60000); // Add duration to departure time

        const arrivalHours = String(arrivalDate.getHours()).padStart(2, '0');
        const arrivalMinutes = String(arrivalDate.getMinutes()).padStart(2, '0');

        return `${arrivalHours}:${arrivalMinutes}`;
    }

    connectedCallback() {
        // Check if data is provided via window object (from URL parameters)
        let flights = [];
        
        if (window.componentData) {
            // Data from URL parameters
            flights = Array.isArray(window.componentData) ? window.componentData : (window.componentData?.flights || []);
        } else if (this.value) {
            // Data from parent component
            flights = Array.isArray(this.value) ? this.value : (this.value?.flights || []);
        }
        
        this.flightData = flights.map((flight) => ({
            ...flight,
            petAllowedStatus: flight.isPetAllowed ? 'Yes' : 'No',
            durationInHr: this.formattedDuration(flight.durationInMin),
            departureTime: '07:00',
            arrivalInHr: this.arrivalTime(flight.durationInMin)
        }));
    }

    handleBookFlight(event) {
        const flightId = event.target.dataset.flightId;
        console.log(`Booking flight: ${flightId}`);
        // Add your booking logic here
    }

}
