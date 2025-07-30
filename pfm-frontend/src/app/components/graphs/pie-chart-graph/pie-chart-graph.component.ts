import { Component, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { SpendingAnalyticsGroup, SpendingAnalyticsService } from '../../../services/spending-analytics.service';
import { EChartsOption } from 'echarts';
import type { ECharts } from 'echarts/core';

@Component({
  selector: 'app-pie-chart-graph',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './pie-chart-graph.component.html',
  styleUrls: ['./pie-chart-graph.component.scss'],
})
export class PieChartGraphComponent {
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() direction?: 'c' | 'd';
  @Input() refreshTrigger: number = 0;

  public echartsInstance?: ECharts;
  public chartOptions: EChartsOption = {};
  private currentCategory: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private analyticsService: SpendingAnalyticsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['startDate'] ||
      changes['endDate'] ||
      changes['direction'] ||
      changes['refreshTrigger']
    ) {
      this.currentCategory = null;
      this.loadData();
    }
  }

  onChartInit(ec: ECharts) {
    this.echartsInstance = ec;

    ec.on('legendselectchanged', (params: any) => {
      if (params.name) {
        const selectedCat = this.categories.find(c => c.name === params.name && !c.parentCode);
          if (selectedCat && selectedCat.code !== this.currentCategory) {
          this.currentCategory = selectedCat.code;
          this.loadData();
        }
      }
    });
  }

  private getCategoryNameFromCode(code: string): string {
    const found = this.categories.find(c => c.code === code);
    if (!found) return code;
    if (!found.parentCode) return found.name;

    const parent = this.categories.find(c => c.code === found.parentCode);
    return parent?.name || code;
  }

  public loadData(): void {
    const isMobile = window.innerWidth <= 768;

    this.analyticsService
      .getAnalytics({
        catcode: this.currentCategory ?? undefined,
        startDate: this.startDate,
        endDate: this.endDate,
        direction: this.direction,
      })
      .subscribe((groups) => {
        const validGroups = groups.filter(g => g.catcode !== null);

        if (!this.currentCategory) {
          const rootMap = new Map<string, number>();

          validGroups.forEach(group => {
            const category = this.categories.find(c => c.code === group.catcode);
            if (category) {
              const rootCode = category.parentCode || category.code;
              rootMap.set(rootCode, (rootMap.get(rootCode) || 0) + group.amount);
            }
          });

          const data = Array.from(rootMap.entries())
            .map(([code, amount]) => {
              const category = this.categories.find(c => c.code === code && !c.parentCode);
              return {
                name: category?.name || code,
                value: amount,
              };
            })
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value); 

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
              pageTextStyle: { color: '#fff' },
              selectedMode: 'multiple',
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
        } else {
          const subcategories = this.categories.filter(c => c.parentCode === this.currentCategory);
          const data = subcategories
            .filter(cat => validGroups.some(g => g.catcode === cat.code))
            .map(cat => {
              const group = validGroups.find(g => g.catcode === cat.code);
              return {
                name: cat.name,
                value: group?.amount || 0,
              };
            })
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value); 

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
                top: '90%',
                style: {
                  text: '< Back',
                  fill: '#3D58ED',
                  font: 'bold 14px sans-serif',
                },
                onclick: () => {
                  this.currentCategory = null;
                  this.loadData();
                },
              },
            ],
          };
        }

        this.cdr.detectChanges();
      });
  }
}