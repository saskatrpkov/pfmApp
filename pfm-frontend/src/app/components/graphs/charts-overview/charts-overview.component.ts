import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges
} from '@angular/core';
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
export class ChartsOverviewComponent implements OnChanges {
  @Input() transactions: Transaction[] = [];
  @Input() categories: { code: string; name: string; parentCode?: string | null }[] = [];
  @Input() selectedCategoryCode?: string;
  @Input() pendingFromDate?: string;
  @Input() pendingToDate?: string;
  @Input() selectedDirection: 'c' | 'd' = 'd';
  @Input() refreshTrigger: number = 0;

  @ViewChild(TreemapGraphComponent) treemapComponent?: TreemapGraphComponent;
  @ViewChild(PieChartGraphComponent) pieChartComponent?: PieChartGraphComponent;

  showCards = false;
  selectedChart: string = 'treemap';
  isMobile: boolean = false;

  chartTypes = [
    { value: 'treemap', label: 'Treemap' },
    { value: 'pie', label: 'Pie Chart' },
  ];

  constructor(
    private chartsService: ChartService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.chartsService.showCards$.subscribe(value => {
      this.showCards = value;
      this.forceRefreshChart();
    });

    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
        if (this.isMobile) {
          this.selectedChart = 'pie';
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger']) {
      this.forceRefreshChart();
    }
  }

  private forceRefreshChart(): void {
    setTimeout(() => {
      if (this.selectedChart === 'treemap') {
        this.treemapComponent?.fetchAnalytics();
        this.treemapComponent?.echartsInstance?.resize();
      } else if (this.selectedChart === 'pie') {
        this.pieChartComponent?.loadData();
        this.pieChartComponent?.echartsInstance?.resize();
      }
    }, 100);
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
