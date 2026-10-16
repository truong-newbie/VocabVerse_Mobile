import { queryKeys } from '@/lib/queryKeys';

describe('queryKeys (phase 2 surface)', () => {
  it('collections() takes a single object with consistent shape', () => {
    const key = queryKeys.collections({ q: 'x', mine: true });
    expect(key).toEqual(['collections', { q: 'x', mine: true }]);
  });

  it('vocabulary(id) is distinct from vocabularies(collectionId, params)', () => {
    expect(queryKeys.vocabulary('v-1')).toEqual(['vocabulary', 'v-1']);
    expect(queryKeys.vocabularies('c-1', { q: 'x' })).toEqual([
      'vocabularies',
      'c-1',
      { q: 'x' },
    ]);
  });

  it('reviewSettings(collectionId) is its own key', () => {
    expect(queryKeys.reviewSettings('c-1')).toEqual(['review-settings', 'c-1']);
  });
});
