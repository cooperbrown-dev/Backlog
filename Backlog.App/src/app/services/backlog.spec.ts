import { TestBed } from '@angular/core/testing';

import { Backlog } from './backlog';

describe('Backlog', () => {
  let service: Backlog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Backlog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
