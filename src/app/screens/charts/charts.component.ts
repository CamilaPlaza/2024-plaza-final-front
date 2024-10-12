import { Component, OnInit } from '@angular/core';
import { ChartService } from '../../services/chart_service';  // Import the service

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
    data: any;
    options: any;

    constructor(private chartService: ChartService) { }

    ngOnInit() {
        this.loadCategoryRevenue();  // Call the function to load the chart data on init

        // Get the current component's styles
        const documentStyle = getComputedStyle(this.getHostElement());

        const textColor = documentStyle.getPropertyValue('--text-color');

        this.options = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    // Helper function to get the root element of this component
    getHostElement(): HTMLElement {
        const hostElement = document.querySelector('app-charts');
        if (!hostElement) {
            throw new Error('Host element not found');
        }
        return hostElement as HTMLElement; // Type assertion
    }

    loadCategoryRevenue() {
        this.chartService.getCategoryRevenue().subscribe(
            (response) => {
                // Check if the response is not empty
                if (response && Object.keys(response).length > 0) {
                    const categories = Object.keys(response);  // ['1', '2', '3', ...]
                    const revenues = Object.values(response);  // [1800, 2500, 3200, ...]

                    // Get component-scoped styles
                    const documentStyle = getComputedStyle(this.getHostElement());

                    // Define an array of CSS variable names
                    const colorKeys = [
                        'light-cream', 'light-tan', 'beige', 'light-brown', 'medium-brown',
                        'brown', 'dark-brown', 'darker-brown', 'deep-brown', 'deepest-brown'
                    ];

                    // Map color variables to their actual values
                    const backgroundColors = colorKeys.map(key => documentStyle.getPropertyValue(`--${key}`));

                    // Set the data for the pie chart
                    this.data = {
                        labels: categories,
                        datasets: [
                            {
                                data: revenues,  // [1800, 2500, 3200, ...]
                                backgroundColor: backgroundColors
                            }
                        ]
                    };
                } else {
                    console.warn('No revenue data available');
                    // Optionally set default data if needed
                    this.data = {
                        labels: [],
                        datasets: []
                    };
                }
            },
            (error) => {
                console.error('Error fetching category revenue', error);
            }
        );
    }
}
