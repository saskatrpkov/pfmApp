import { Component, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';
import type { EChartsOption } from 'echarts';
import type { ECharts } from 'echarts/core';

@Component({
  selector: 'app-pie-chart-graph',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './pie-chart-graph.component.html',
  styleUrls: ['./pie-chart-graph.component.scss'],
})
export class PieChartGraphComponent {
  @Input() transactions: Transaction[] = [];
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];
  public echartsInstance?: ECharts;
  public chartOptions: EChartsOption = {};
  private currentCategory: string | null = null;
  @Input() refreshTrigger: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  private getCategoryNameFromCode(code: string): string {
  const found = this.categories.find(c => c.code === code);
  if (!found) return code;
  if (!found.parentCode) return found.name;

  const parent = this.categories.find(c => c.code === found.parentCode);
  return parent?.name || code;
}

  onChartInit(ec: ECharts) {
  this.echartsInstance = ec;

    ec.on('legendselectchanged', (params: any) => {
    if (params.name) {
      this.currentCategory = params.name;
      this.generateChart();
    }
  });
}


  ngOnChanges(changes: SimpleChanges): void {
  if ((changes['transactions'] || changes['categories'] || changes['refreshTrigger']) && this.transactions.length && this.categories.length) {
    this.generateChart();
  }
}

  generateChart(): void {
    const isMobile = window.innerWidth <= 768;

    if (!this.currentCategory) {
      const categoryMap = new Map<string, number>();
      for (const tx of this.transactions) {
        if (!tx.category) continue;
        categoryMap.set(tx.category, (categoryMap.get(tx.category) || 0) + tx.amount);
      }

      const data = Array.from(categoryMap.entries()).map(([catcode, value]) => ({
        name: this.getCategoryNameFromCode(catcode),
        value,
      }));

      this.chartOptions = {
        tooltip: {
          trigger: 'item' as const,
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          type: 'scroll',
          orient: isMobile ? 'horizontal' : 'vertical',
          bottom: isMobile ? 0 : undefined,
          left: isMobile ? 'center' : 'left',
          textStyle: { color: '#fff' },
          pageIconColor: '#3D58ED',        
          pageIconInactiveColor: '#8A8A8A',
          pageTextStyle: { color: '#fff' } 
        },
        series: [
          {
            name: 'Categories',
            type: 'pie',
            radius: ['40%', '70%'],
            label: { show: false },
            labelLine: { show: false },
            selectedMode: 'single',
            data,
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
          },
        ],
        graphic: [],
      };
      this.cdr.detectChanges(); // trigger render
    } else {
      const subMap = new Map<string, number>();

      for (const tx of this.transactions) {
        const categoryName = this.getCategoryNameFromCode(tx.category);
        if (categoryName !== this.currentCategory || tx.direction !== 'd') continue;

        const subCatCode = tx.subcategory?.trim();
        const key = subCatCode || tx.category; // Ako nema podkategorije, koristi kategoriju
        subMap.set(key, (subMap.get(key) || 0) + tx.amount);
      }

      const data = Array.from(subMap.entries()).map(([code, value]) => {
        const match = this.categories.find(c => c.code === code);
        const label = match?.name || 'Other';
        return { name: label, value };
      });

      this.chartOptions = {
        tooltip: {
          trigger: 'item' as const,
          formatter: '{b}: {c} ({d}%)',
        },
        title: {
          text: this.getCategoryNameFromCode(this.currentCategory),
          left: 'center',
          top: 10,
          textStyle: {
            color: '#fff',
            fontSize: 16,
          },
        },
        legend: {
          orient: isMobile ? 'horizontal' : 'vertical',
          bottom: isMobile ? 0 : undefined,
          left: isMobile ? 'center' : 'left',
          textStyle: { color: '#fff' },
          selectedMode: false
        },
        series: [
          {
            name: 'Subcategories',
            type: 'pie',
            radius: ['40%', '70%'],
            label: { show: false },
            labelLine: { show: false },
            data,
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
              },
            },
          },
        ],
        graphic: [
          {
            type: 'text',
            left: 'left',
            top:'90%',
            style: {
              text: '< Back',
              fill: '#3D58ED',
              font: 'bold 14px sans-serif',
            },
            onclick: () => {
              this.currentCategory = null;
              this.generateChart();
            },
          },
        ],
      };
      this.cdr.detectChanges(); 
    }
    
  }
}
