import { Component, Input, SimpleChanges } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { Transaction } from '../../../models/transaction';
import { EChartsOption } from 'echarts/types/dist/shared';
import { groupBy, sumBy } from 'lodash';
import type { ECharts } from 'echarts/core';

@Component({
  selector: 'app-treemap-graph',
  imports: [NgxEchartsModule],
  templateUrl: './treemap-graph.component.html',
  styleUrl: './treemap-graph.component.scss',
  standalone: true
})
export class TreemapGraphComponent {
  @Input() transactions: Transaction[] = [];
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];
  @Input() refreshTrigger: number = 0;

  chartOptions: EChartsOption = {};
  public echartsInstance?: ECharts;

  private latestTransactions: Transaction[] = [];
  private latestCategories: { code: string; name: string; parentCode?: string | null }[] = [];

  private baseColors: string[] = [
    '#3D58ED', '#9B51E0', '#F299CA', '#2F80ED', '#56CCF2', '#EB5757',
    '#F2C94C', '#6FCF97', '#BB6BD9', '#8A8A8A', '#333333', '#D980FA',
    '#F8C471', '#B2BABB', '#AED6F1', '#D7BDE2', '#F5B7B1', '#CACFD2',
    '#F1948A', '#A569BD',
  ];

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['transactions'] || changes['categories'] || changes['refreshTrigger']) {
    if (this.transactions?.length && this.categories?.length) {
      this.latestTransactions = this.transactions;
      this.latestCategories = this.categories;
      this.tryRenderChart();
    }
  }
}

  onChartInit(instance: ECharts): void {
    this.echartsInstance = instance;
    this.tryRenderChart();
  }

  private tryRenderChart(): void {
    if (
      this.echartsInstance &&
      this.latestTransactions?.length &&
      this.latestCategories?.length
    ) {
      this.updateChart(this.latestTransactions);
    }
  }

  getCategoryName(code: string): string {
    const category = this.categories.find(c => c.code === code);

    if (!category) return code;

    if (category.parentCode) {
      const parent = this.categories.find(c => c.code === category.parentCode && !c.parentCode);
      return parent?.name ?? category.name;
    }

    return category.name;
  }

  getSubcategoryName(code: string): string {
    const category = this.categories.find(c => c.code === code);
    return category?.name ?? code;
  }

  updateChart(transactions: Transaction[]): void {
    const filtered = transactions.filter(t => t.category && t.category.trim() !== '');

    const enriched = filtered.map(t => {
      const hasSub = t.subcategory && t.subcategory.trim() !== '';
      const catCode = t.category;

      const categoryObj = this.categories.find(c => c.code === catCode);
      const mainCategoryCode = categoryObj?.parentCode ?? catCode;

      return {
        ...t,
        subcategory: hasSub ? t.subcategory : t.category,
        mainCategoryCode
      };
    });


    const groupedByCategory = groupBy(enriched, 'mainCategoryCode');

    const data = Object.entries(groupedByCategory).map(([category, txns], index) => {
      const baseColor = this.baseColors[index % this.baseColors.length];

      const groupedBySub = groupBy(txns, 'subcategory');
      const children = Object.entries(groupedBySub).map(([sub, subTxns], subIndex) => ({
        name: this.getSubcategoryName(sub),
        value: sumBy(subTxns, 'amount'),
        itemStyle: {
          color: this.shadeColor(baseColor, 20 + subIndex * 8),
        },
      }));

      return {
        name: this.getCategoryName(category),
        value: sumBy(txns, 'amount'),
        children,
        itemStyle: {
          color: baseColor,
        },
      };
    });

    this.chartOptions = {
      tooltip: {
        formatter: (info: any) => `${info.name}: ${info.value.toFixed(2)} RSD`,
      },
      series: [
        {
          type: 'treemap',
          data,
          leafDepth: 1,
          roam: false,
          visibleMin: 0,
          label: {
            show: true,
            formatter: (params: any) => `${params.name}\n${params.value.toFixed(2)} RSD`,
            position: 'inside',
            color: '#fff',
            fontSize: 12,
          },
          labelLayout: { hideOverlap: false },
          breadcrumb: {
            show: true,
            top: 0,
            itemStyle: {
              color: '#3D58ED',
              borderColor: '#3D58ED',
              borderWidth: 1,
            },
            emphasis: {
              itemStyle: {
                color: '#3D58ED',
                borderColor: '#3D58ED',
              },
            },
          },
          nodeClick: 'zoomToNode',
          animation: false,
          animationDuration: 0,
          animationDurationUpdate: 0,
          animationEasing: 'linear',
          animationEasingUpdate: 'linear',
          levels: [
            {
              itemStyle: {
                borderColor: '#1a1a1a',
                borderWidth: 2,
                gapWidth: 3,
              },
            },
            {
              itemStyle: {
                gapWidth: 2,
                borderColorSaturation: 0.6,
              },
            },
          ],
        },
      ],
    };

    if (this.echartsInstance) {
      this.echartsInstance.setOption(this.chartOptions, true);
    }
  }

  private shadeColor(hex: string, percent: number): string {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    return `rgb(${r},${g},${b})`;
  }
}
