import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../../models/transaction';
import { TreemapGraphComponent } from '../treemap-graph/treemap-graph.component';
import { MatIcon } from '@angular/material/icon';
import { PieChartGraphComponent } from '../pie-chart-graph/pie-chart-graph.component';
import { ChartService } from '../../../services/chart.service';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';

@Component({
  selector: 'app-charts-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    TreemapGraphComponent,
    PieChartGraphComponent,
    LayoutModule
  ],
  templateUrl: './charts-overview.component.html',
  styleUrl: './charts-overview.component.scss'
})
export class ChartsOverviewComponent {
  @Input() transactions: Transaction[] = [];
  @ViewChild(TreemapGraphComponent) treemapComponent?: TreemapGraphComponent;
  @ViewChild(PieChartGraphComponent) pieChartComponent?: PieChartGraphComponent;
  @Input() categories: { code: string; name: string; parentCode?: string |null }[] = [];
  showCards = false;
  selectedChart: string = 'treemap'; // default
  isMobile: boolean = false;
  refreshTrigger: number = 0;
  
  chartTypes = [
    { value: 'treemap', label: 'Treemap' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'bar', label: 'Bar Chart' }
  ];

  constructor(
    private chartsService: ChartService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.chartsService.showCards$.subscribe(value => {
      this.showCards = value;

      setTimeout(() => {
        if (this.selectedChart === 'treemap') {
          this.treemapComponent?.echartsInstance?.resize();
        } else if (this.selectedChart === 'pie') {
          this.pieChartComponent?.echartsInstance?.resize();
        }
      }, 100);
    });

    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.selectedChart = 'pie';
        }
      });
  }

  onChartChange(): void {
    console.log('Chart changed to:', this.selectedChart);
  }

  get selectedChartLabel(): string {
    return this.chartTypes.find(ct => ct.value === this.selectedChart)?.label ?? '';
  }

  get hasDataToDisplay(): boolean {
    return this.transactions.some(t => t.category && !t.isSplit);
  }
}
