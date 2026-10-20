import { describe, it, expect } from 'vitest';
import { evaluateMathExpression } from '../Grapher';

describe('evaluateMathExpression', () => {
  const probeMap: Record<string, string> = {
    PRB1: 'n001',
    PRB2: 'n002',
    probe1: 'n001',
  };

  const row: Record<string, number> = {
    time: 0.001,
    'v(n001)': 5.0,
    'v(n002)': 2.0,
  };

  it('evaluates basic difference between probes: V(PRB1) - V(PRB2)', () => {
    const res = evaluateMathExpression('V(PRB1) - V(PRB2)', row, probeMap);
    expect(res).toBeCloseTo(3.0);
  });

  it('evaluates scalar multiplication: V(PRB1) * 2', () => {
    const res = evaluateMathExpression('V(PRB1) * 2', row, probeMap);
    expect(res).toBeCloseTo(10.0);
  });

  it('evaluates nested expressions with parentheses: (V(PRB1) + V(PRB2)) / 2', () => {
    const res = evaluateMathExpression('(V(PRB1) + V(PRB2)) / 2', row, probeMap);
    expect(res).toBeCloseTo(3.5);
  });

  it('handles lowercase and mixed case probe names', () => {
    const res = evaluateMathExpression('v(prb1) - v(prb2)', row, probeMap);
    expect(res).toBeCloseTo(3.0);
  });

  it('handles ground node V(0) as 0', () => {
    const res = evaluateMathExpression('V(PRB1) - V(0)', row, probeMap);
    expect(res).toBeCloseTo(5.0);
  });

  it('handles direct node names if present in row', () => {
    const directRow = { time: 0.001, n001: 4.5, n002: 1.5 };
    const res = evaluateMathExpression('V(n001) + V(n002)', directRow, {});
    expect(res).toBeCloseTo(6.0);
  });

  it('handles scientific notation numbers in expressions', () => {
    const res = evaluateMathExpression('V(PRB1) * 1e-3', row, probeMap);
    expect(res).toBeCloseTo(0.005);
  });

  it('safely rejects malicious or unsafe code injections', () => {
    expect(evaluateMathExpression('alert(1)', row, probeMap)).toBeNull();
    expect(evaluateMathExpression('window.location', row, probeMap)).toBeNull();
    expect(evaluateMathExpression('process.exit(1)', row, probeMap)).toBeNull();
    expect(evaluateMathExpression('console.log("hello")', row, probeMap)).toBeNull();
  });

  it('returns null for unresolvable probes', () => {
    const res = evaluateMathExpression('V(UNKNOWN_NODE) + 1', row, probeMap);
    expect(res).toBeNull();
  });

  it('returns null on division by zero resulting in non-finite value', () => {
    const res = evaluateMathExpression('V(PRB1) / 0', row, probeMap);
    expect(res).toBeNull();
  });
});
