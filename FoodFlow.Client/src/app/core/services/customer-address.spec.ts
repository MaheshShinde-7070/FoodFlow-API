import { TestBed } from '@angular/core/testing';

import { CustomerAddress } from './customer-address';

describe('CustomerAddress', () => {
  let service: CustomerAddress;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerAddress);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
