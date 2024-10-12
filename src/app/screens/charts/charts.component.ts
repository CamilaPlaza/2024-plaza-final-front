import { Component, OnInit } from '@angular/core';
import { ChartService } from '../../services/chart_service';  // Import the service

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
    // Separar data y options para diferentes gráficas
    categoryData: any;
    categoryOptions: any;
    monthlyData: any;
    monthlyOptions: any;
    public scrollHeight: string='';

    constructor(private chartService: ChartService) { }

    ngOnInit() {
        this.loadCategoryRevenue();  // Cargar datos para la gráfica de categoría
        this.loadMonthlyRevenue();  // Cargar datos para la gráfica mensual
        this.setScrollHeight();
        window.addEventListener('resize', () => {
          this.setScrollHeight();
        });

        // Obtener el estilo del componente
        const documentStyle = getComputedStyle(this.getHostElement());
        const textColor = documentStyle.getPropertyValue('--text-color');

        // Opciones de gráficos compartidas (puedes personalizarlas más adelante)
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

    getHostElement(): HTMLElement {
        const hostElement = document.querySelector('app-charts');
        if (!hostElement) {
            throw new Error('Host element not found');
        }
        return hostElement as HTMLElement; // Type assertion
    }

    loadCategoryRevenue() {
      const storedCategoryData = localStorage.getItem('categoryRevenue');
      if (storedCategoryData) {
          // Si los datos ya están en el local storage, úsalos
          this.categoryData = JSON.parse(storedCategoryData);
      } else {
          // Si no están en local storage, haz la llamada a la base de datos
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
  
                      // Guardar los datos en el local storage
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
        // Si los datos ya están en el local storage, úsalos
        this.monthlyData = JSON.parse(storedMonthlyData);
    } else {
        // Si no están en local storage, haz la llamada a la base de datos
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
                    const documentStyle = getComputedStyle(this.getHostElement());
                    const colorKeys = [
                        'light-cream', 'light-tan', 'beige', 'light-brown', 'medium-brown',
                        'brown', 'dark-brown', 'darker-brown', 'deep-brown', 'deepest-brown'
                    ];
                    const lineColors = colorKeys.map(key => documentStyle.getPropertyValue(`--${key}`));
                    let colorIndex = 0;

                    Object.keys(years).forEach(year => {
                        const monthsInYear = Object.keys(years[year]).sort((a, b) => parseInt(a) - parseInt(b));
                        const revenueData = monthsInYear.map(month => years[year][month]);

                        datasets.push({
                            label: `Revenue ${year}`,
                            data: revenueData,
                            fill: false,
                            borderColor: lineColors[colorIndex % lineColors.length],
                            tension: 0.4
                        });

                        colorIndex++;
                    });

                    const orderedMonthNames = Object.keys(monthNames).sort((a, b) => parseInt(a) - parseInt(b)).map(month => monthNames[month]);

                    this.monthlyData = {
                        labels: orderedMonthNames,
                        datasets: datasets
                    };

                    // Guardar los datos en el local storage
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

    setScrollHeight() {
        if (window.innerWidth <= 768) {
            this.scrollHeight = '800px';
        } else {
            this.scrollHeight = '400px';
        }
    }
}
