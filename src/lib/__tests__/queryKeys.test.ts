import { queryKeys } from '@/lib/queryKeys';

describe('queryKeys', () => {
  it('returns stable tuple shapes', () => {
    expect(queryKeys.me()).toEqual(['me']);
    expect(queryKeys.collection('c-1')).toEqual(['collection', 'c-1']);
    expect(queryKeys.vocabularies('c-1', { page: 0 })).toEqual([
      'vocabularies',
      'c-1',
      { page: 0 },
    ]);
    expect(queryKeys.reviewSettings('c-1')).toEqual(['review-settings', 'c-1']);
  });

  it('different params produce different keys', () => {
    expect(queryKeys.dashboard()).not.toEqual(
      queryKeys.dashboardLearningStatus()
    );
    expect(queryKeys.reviewToday({ page: 0 })).not.toEqual(
      queryKeys.reviewToday({ page: 1 })
    );
  });
});
