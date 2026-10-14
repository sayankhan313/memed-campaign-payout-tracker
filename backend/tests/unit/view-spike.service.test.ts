
import { assessViewSpike } from '../../src/modules/payout/view-spike.service.js';

describe('View Spike Detection', () => {
  describe('Milestone Demo', () => {
    it('does not flag 0 to 10,000 views', () => {
      expect(assessViewSpike(0, 10000, 'MILESTONE_DEMO')).toBeNull();
    });

    it('does not flag 10,000 to 50,000 views', () => {
      expect(assessViewSpike(10000, 50000, 'MILESTONE_DEMO')).toBeNull();
    });

    it('does not flag 50,000 to 100,000 views', () => {
      expect(assessViewSpike(50000, 100000, 'MILESTONE_DEMO')).toBeNull();
    });

    it('does not flag large jumps in milestone mode', () => {
      expect(assessViewSpike(0, 200000, 'MILESTONE_DEMO')).toBeNull();
    });
  });

  describe('Spike Detection Demo', () => {
    it('flags an increase of exactly 100,000 views', () => {
      const result = assessViewSpike(50000, 150000, 'SPIKE_DEMO');

      expect(result).toEqual({
        previousViews: 50000,
        newViews: 150000,
        deltaViews: 100000,
        source: 'SPIKE_DEMO',
        reason: expect.stringContaining('100,000'),
      });
    });

    it('flags an increase of 200,000 views', () => {
      const result = assessViewSpike(0, 200000, 'SPIKE_DEMO');

      expect(result?.deltaViews).toBe(200000);
      expect(result?.source).toBe('SPIKE_DEMO');
    });

    it('does not flag an increase below 100,000 views', () => {
      expect(assessViewSpike(0, 99999, 'SPIKE_DEMO')).toBeNull();
    });
  });

  describe('Simulated Platform Updates', () => {
    it('flags an unusually large view increase', () => {
      const result = assessViewSpike(10000, 150000, 'SIMULATED_PLATFORM');

      expect(result?.previousViews).toBe(10000);
      expect(result?.newViews).toBe(150000);
      expect(result?.deltaViews).toBe(140000);
      expect(result?.source).toBe('SIMULATED_PLATFORM');
    });

    it('ignores ordinary view increases', () => {
      expect(assessViewSpike(10000, 50000, 'SIMULATED_PLATFORM')).toBeNull();
    });
  });

  describe('Invalid and Repeated Updates', () => {
    it('does not flag identical view counts', () => {
      expect(assessViewSpike(100000, 100000, 'SPIKE_DEMO')).toBeNull();
    });

    it('does not flag decreasing views', () => {
      expect(assessViewSpike(200000, 100000, 'SPIKE_DEMO')).toBeNull();
    });

    it('does not flag negative view counts', () => {
      expect(assessViewSpike(-1, 100000, 'SPIKE_DEMO')).toBeNull();
    });

    it('does not flag fractional view counts', () => {
      expect(assessViewSpike(0, 100000.5, 'SPIKE_DEMO')).toBeNull();
    });

    it('does not flag unsafe integers', () => {
      expect(assessViewSpike(0, Number.MAX_SAFE_INTEGER + 1, 'SPIKE_DEMO')).toBeNull();
    });
  });
});
