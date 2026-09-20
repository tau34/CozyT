import { describe, expect, it } from 'vitest';
import { createGameCatalog } from './index.js';

describe('game catalog', () => {
  it('lists every registered game by default', () => {
    const catalog = createGameCatalog();

    expect(catalog.list()).toHaveLength(5);
  });

  it('filters games by category and availability', () => {
    const catalog = createGameCatalog();

    expect(catalog.list({ category: 'casino' })).toEqual([
      expect.objectContaining({ id: 'cozy-casino', availability: 'coming-soon' })
    ]);
    expect(catalog.list({ availability: 'available' })).toEqual([
      expect.objectContaining({ id: 'cozy-room' })
    ]);
  });

  it('returns undefined for an unknown game', () => {
    expect(createGameCatalog().getById('missing-game')).toBeUndefined();
  });
});