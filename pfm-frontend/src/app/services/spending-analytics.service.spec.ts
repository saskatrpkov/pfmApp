import { TestBed } from '@angular/core/testing';

import { SpendingAnalyticsService } from './spending-analytics.service';

describe('SpendingAnalyticsService', () => {
  let service: SpendingAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpendingAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
