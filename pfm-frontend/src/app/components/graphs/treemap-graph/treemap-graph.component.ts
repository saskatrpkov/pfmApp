import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import type { ECharts } from 'echarts/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { CommonModule } from '@angular/common';
import { SpendingAnalyticsService, SpendingAnalyticsGroup } from '../../../services/spending-analytics.service';

@Component({
  selector: 'app-treemap-graph',
  standalone: true,
  imports: [NgxEchartsModule, CommonModule],
  templateUrl: './treemap-graph.component.html',
  styleUrls: ['./treemap-graph.component.scss'],
})
export class TreemapGraphComponent implements OnChanges {
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];
  @Input() startDate?: string;
  @Input() endDate?: string;
  @Input() direction?: 'c' | 'd';
  @Input() refreshTrigger: number = 0;

  chartOptions: EChartsOption = {};
  public echartsInstance?: ECharts;

  private baseColors: string[] = [
    '#3D58ED', '#9B51E0', '#F299CA', '#2F80ED', '#56CCF2', '#EB5757',
    '#F2C94C', '#6FCF97', '#BB6BD9', '#8A8A8A', '#333333', '#D980FA',
    '#F8C471', '#B2BABB', '#AED6F1', '#D7BDE2', '#F5B7B1', '#CACFD2',
    '#F1948A', '#A569BD',
  ];

  constructor(private analyticsService: SpendingAnalyticsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['startDate'] || changes['endDate'] ||
      changes['direction'] || changes['refreshTrigger']
    ) {
      this.fetchAnalytics();
    }
  }

  onChartInit(instance: ECharts): void {
    this.echartsInstance = instance;
  }

  public fetchAnalytics(): void {
    this.analyticsService.getAnalytics({
      startDate: this.startDate,
      endDate: this.endDate,
      direction: this.direction
    }).subscribe((groups) => {
      const parentMap = new Map<string, SpendingAnalyticsGroup[]>();

      for (const group of groups) {
        const category = this.categories.find(c => c.code === group.catcode);
        const parentCode = category?.parentCode ?? group.catcode;

        if (!parentMap.has(parentCode!)) {
          parentMap.set(parentCode!, []);
        }
        parentMap.get(parentCode!)!.push(group);
      }

      const data = Array.from(parentMap.entries()).map(([parentCode, childrenGroups], index) => {
        const baseColor = this.baseColors[index % this.baseColors.length];

        const parentLabel = this.getCategoryName(parentCode);
        const children = childrenGroups.map((group, i) => ({
          name: this.getSubcategoryName(group.catcode!),
          value: group.amount,
          itemStyle: {
            color: this.shadeColor(baseColor, 20 + i * 8),
          },
        }));

        const totalAmount = children.reduce((acc, c) => acc + c.value, 0);

        return {
          name: parentLabel,
          value: totalAmount,
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
              },
            },
            nodeClick: 'zoomToNode',
            animation: false,
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
    });
  }

  private getCategoryName(code: string): string {
    return this.categories.find(c => c.code === code && !c.parentCode)?.name ?? code;
  }

  private getSubcategoryName(code: string): string {
    return this.categories.find(c => c.code === code)?.name ?? code;
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
