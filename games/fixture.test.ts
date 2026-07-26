import { fixture } from './fixture';

const context = { round: 1 };

describe('fixture score', () => {
  it('rewards an exact call with a base plus a per-trick bonus', () => {
    expect(fixture.score({ bid: 0, taken: 0 }, context)).toBe(20);
    expect(fixture.score({ bid: 3, taken: 3 }, context)).toBe(50);
  });

  it('penalises the distance from the call, in either direction', () => {
    expect(fixture.score({ bid: 3, taken: 1 }, context)).toBe(-20);
    expect(fixture.score({ bid: 1, taken: 3 }, context)).toBe(-20);
  });

  it('treats a missing field as zero rather than producing NaN', () => {
    expect(fixture.score({}, context)).toBe(20);
    expect(fixture.score({ bid: 2 }, context)).toBe(-20);
  });
});
