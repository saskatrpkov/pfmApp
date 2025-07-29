import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { ChartService } from './services/chart.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [
  RouterOutlet,
  RouterModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatToolbarModule,
  MatButtonModule,
  CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  
})
export class AppComponent {
  title = 'pfm-frontend';
  isExpanded = false;

  menuItems = [
    { icon: 'home', label: 'Home', route: '/' },
    { icon: 'account_balance_wallet', label: 'My Accounts' },
    { icon: 'payments', label: 'Payments' },
    { icon: 'credit_card',label: 'Cards'},
    { icon: 'currency_exchange', label: 'Currency Exchange'},
    { icon: 'description', label: 'Product Catalogue' },
    { icon: 'insights', label: 'PFM', route: '/transactions' },
    { icon: 'settings', label: 'Self Care' },
    { icon: 'support_agent', label: 'Support'},
  ];

  constructor(private chartsService: ChartService) {}

  toggleCardsInCharts() {
    this.chartsService.toggleCards(); 
  }

  isMobile = false;
  sidebarVisible = false;

  ngOnInit() {
    this.checkScreenWidth();
    window.addEventListener('resize', () => this.checkScreenWidth());
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarVisible = true; 
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
