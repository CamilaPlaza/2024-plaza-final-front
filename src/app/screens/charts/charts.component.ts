import { Component, OnInit } from '@angular/core';
import { ChartService } from '../../services/chart_service';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
    selectedYear: string | undefined;
    selectedMonth: string | undefined;
    availableYears: string[] = ['2022', '2023', '2024'];
    availableMonths: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    categoryData: any;
    categoryOptions: any;
    monthlyData: any;
    monthlyOptions: any;
    averagePerPersonData: any;
    averagePerPersonOptions: any;
    averagePerTicketData: any;
    averagePerTicketOptions: any;
    noDataMessage: string = '';
    public scrollHeight: string = '';
    fechaActual = new Date();
    yearActual = this.fechaActual.getFullYear()
    monthActual = this.fechaActual.getMonth() + 1

    constructor(private chartService: ChartService) {
        this.selectedYear = this.yearActual.toString();
        this.selectedMonth = this.monthActual.toString();
    }

    ngOnInit() {
        this.loadCategoryRevenue();
        this.loadMonthlyRevenue();
        this.loadDefaultData();
        this.setScrollHeight();

        window.addEventListener('resize', () => {
            this.setScrollHeight();
        });

        // Estilos del gráfico
        const documentStyle = getComputedStyle(this.getHostElement());
        const textColor = documentStyle.getPropertyValue('--text-color');

        this.categoryOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };

        this.monthlyOptions = {
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

    onDateChange(): void {
        this.loadAveragePerPersonData();
        this.loadAveragePerTicketData();
    }

    getHostElement(): HTMLElement {
        const hostElement = document.querySelector('app-charts');
        if (!hostElement) {
            throw new Error('Host element not found');
        }
        return hostElement as HTMLElement;
    }

    loadCategoryRevenue() {
        const storedCategoryData = localStorage.getItem('categoryRevenue');
        if (storedCategoryData) {
            this.categoryData = JSON.parse(storedCategoryData);
        } else {
            this.chartService.getCategoryRevenue().subscribe(
                (response) => {
                    if (response && Object.keys(response).length > 0) {
                        const categories = Object.keys(response);
                        const revenues = Object.values(response);

                        const documentStyle = getComputedStyle(this.getHostElement());
                        const colorKeys = [
                            'light-cream', 'light-tan', 'beige', 'light-brown', 'medium-brown',
                            'brown', 'dark-brown', 'darker-brown', 'deep-brown', 'deepest-brown'
                        ];
                        const backgroundColors = colorKeys.map(key => documentStyle.getPropertyValue(`--${key}`));

                        this.categoryData = {
                            labels: categories,
                            datasets: [
                                {
                                    data: revenues,
                                    backgroundColor: backgroundColors
                                }
                            ]
                        };

                        localStorage.setItem('categoryRevenue', JSON.stringify(this.categoryData));
                    } else {
                        console.warn('No revenue data available');
                        this.categoryData = {
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

    loadMonthlyRevenue() {
    const storedMonthlyData = localStorage.getItem('monthlyRevenue');
    if (storedMonthlyData) {
        this.monthlyData = JSON.parse(storedMonthlyData);
    } else {
        this.chartService.getMonthlyRevenue().subscribe(
            (response) => {
                if (response && Object.keys(response).length > 0) {
                    const monthNames: { [key: string]: string } = {
                        "01": "Jan",
                        "02": "Feb",
                        "03": "Mar",
                        "04": "Apr",
                        "05": "May",
                        "06": "Jun",
                        "07": "Jul",
                        "08": "Aug",
                        "09": "Sep",
                        "10": "Oct",
                        "11": "Nov",
                        "12": "Dec"
                    };

                    const years: { [year: string]: { [month: string]: number } } = {};

                    Object.keys(response).forEach(date => {
                        const [year, month] = date.split('-');
                        if (!years[year]) {
                            years[year] = {};
                        }
                        years[year][month] = response[date];
                    });

                    const datasets: { label: string, data: number[], fill: boolean, borderColor: string, tension: number }[] = [];
                    
                    // Definir los colores de las líneas
                    const lineColors = ['#0000FF', '#8B4513']; // Azul y Marrón

                    Object.keys(years).forEach((year, index) => {
                        const monthsInYear = Object.keys(years[year]).sort((a, b) => parseInt(a) - parseInt(b));
                        const revenueData = monthsInYear.map(month => years[year][month]);

                        // Asignar el color correspondiente (azul para el primer año, marrón para el segundo)
                        const borderColor = index === 0 ? lineColors[0] : lineColors[1];

                        datasets.push({
                            label: `Revenue ${year}`,
                            data: revenueData,
                            fill: false,
                            borderColor: borderColor,
                            tension: 0.4
                        });
                    });

                    const orderedMonthNames = Object.keys(monthNames).sort((a, b) => parseInt(a) - parseInt(b)).map(month => monthNames[month]);

                    this.monthlyData = {
                        labels: orderedMonthNames,
                        datasets: datasets
                    };

                    localStorage.setItem('monthlyRevenue', JSON.stringify(this.monthlyData));
                } else {
                    console.warn('No monthly revenue data available');
                    this.monthlyData = {
                        labels: [],
                        datasets: []
                    };
                }
            },
            (error) => {
                console.error('Error fetching monthly revenue', error);
            }
        );
    }
}

    loadAveragePerPersonData() {
        const year = this.selectedYear ?? this.yearActual.toString();
        const month = this.selectedMonth ?? this.monthActual.toString();

        this.chartService.getAveragePerPerson(year, month).subscribe(data => {
            const total = (Object.values(data) as number[]).reduce((sum, value) => sum + value, 0); // Sumar valores
        
            if (total === 0) {
                this.noDataMessage = "No data available for this year and month.";
            } else {
                this.noDataMessage = ''; // Limpiar el mensaje si hay datos
                this.averagePerPersonData = {
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: 'Average Per Person',
                            data: Object.values(data),
                            fill: false,
                            borderColor: '#565656',
                            tension: 0.4
                        }
                    ]
                };
            }
        });
    }
    
    loadAveragePerTicketData() {
        const year = this.selectedYear ?? this.yearActual.toString();
        const month = this.selectedMonth ?? this.monthActual.toString();
        
        this.chartService.getAveragePerTicket(year, month).subscribe(data => {
            const total = (Object.values(data) as number[]).reduce((sum, value) => sum + value, 0); // Sumar valores
    
            if (total === 0) {
                this.noDataMessage = "No data available for this year and month.";
            } else {
                this.noDataMessage = ''; // Limpiar el mensaje si hay datos
                this.averagePerTicketData = {
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: 'Average Per Ticket',
                            data: Object.values(data),
                            fill: false,
                            borderColor: '#734f38',
                            tension: 0.4
                        }
                    ]
                };
            }
        });
    }

    loadDefaultData(){
        const year = this.yearActual.toString();
        const month = this.monthActual.toString();

        this.chartService.getAveragePerPerson(year, month).subscribe(data => {
            console.log(data);
            this.averagePerPersonData = {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: 'Average Per Person',
                        data: Object.values(data),
                        fill: false,
                        borderColor: '#734f38',
                        tension: 0.4
                    }
                ]
            };
        });
        this.chartService.getAveragePerTicket(year, month).subscribe(data => {
            console.log(data);
            this.averagePerTicketData = {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: 'Average Per Ticket',
                        data: Object.values(data),
                        fill: false,
                        borderColor: '#734f38',
                        tension: 0.4
                    }
                ]
            };
        });
    }

    setScrollHeight() {
        if (window.innerWidth <= 768) {
            this.scrollHeight = '800px';
        } else {
            this.scrollHeight = '400px';
        }
    }
}
