import { fixture } from './fixture';

describe('fixture score', () => {
  it('rewards an exact call with a base plus a per-trick bonus', () => {
    expect(fixture.score({ bid: 0, taken: 0 })).toBe(20);
    expect(fixture.score({ bid: 3, taken: 3 })).toBe(50);
  });

  it('penalises the distance from the call, in either direction', () => {
    expect(fixture.score({ bid: 3, taken: 1 })).toBe(-20);
    expect(fixture.score({ bid: 1, taken: 3 })).toBe(-20);
  });

  it('treats a missing field as zero rather than producing NaN', () => {
    expect(fixture.score({})).toBe(20);
    expect(fixture.score({ bid: 2 })).toBe(-20);
  });
});
