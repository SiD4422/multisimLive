// spiceErrorParser.ts
// Parses raw ngspice error text into structured, user-friendly error objects.

export interface SmartSpiceError {
  title: string;
  message: string;
  hints: string[];
  fixSteps: string[];
  offendingNode?: string;   // SPICE node name if extractable (e.g. '3', 'vout')
  offendingModel?: string;  // SPICE model name if extractable
  raw: string;              // Original raw error string
}

interface ErrorPattern {
  pattern: RegExp;
  title: string;
  message: string;
  hints: string[];
  fixSteps: string[];
  extractNode?: (m: RegExpMatchArray) => string | undefined;
  extractModel?: (m: RegExpMatchArray) => string | undefined;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /singular matrix/i,
    title: '🔴 Singular Matrix — Circuit Cannot Be Solved',
    message: 'SPICE could not solve the circuit equations. The most common cause is a missing Ground node.',
    hints: [
      'Every SPICE circuit must have at least one GND (Ground) component',
      'A loop of only voltage sources (no resistance) also causes this',
      'Two wires that look connected but are not touching on the canvas',
    ],
    fixSteps: [
      'Add a Ground component from the component palette',
      'Ensure at least one wire connects to the Ground',
      'Check that all wire endpoints are snapped to the same grid point',
    ],
  },
  {
    pattern: /node (\S+) is unconnected|floating node[:\s]+(\S+)|node[:\s]+(\S+) is floating/i,
    title: '⚠️ Floating Node — Unconnected Pin',
    message: 'A circuit node has no DC path to ground. SPICE needs every node to be reachable from GND.',
    hints: [
      'All component pins must be connected to a wire',
      'A component pin touching a wire visually may still be unconnected if not snapped to the grid',
      'Op-amp or transistor outputs need a load or feedback path to function',
    ],
    fixSteps: [
      'Connect the floating pin to a wire',
      'Add a large pull-down resistor (e.g. 1GΩ) from the floating node to GND as a temporary fix',
    ],
    extractNode: (m) => m[1] || m[2] || m[3],
  },
  {
    pattern: /unknown model[:\s]+(\S+)|model (\S+) not found|can't find model (\S+)/i,
    title: '❌ Unknown Component Model',
    message: 'A component references a SPICE model that is not defined in the netlist.',
    hints: [
      'The component type may not be fully supported yet',
      'Try replacing it with the nearest equivalent from the component palette',
    ],
    fixSteps: [
      'Delete the offending component and re-add it from the palette',
      'Check the component value field for typos in the model name',
    ],
    extractModel: (m) => m[1] || m[2] || m[3],
  },
  {
    pattern: /time step too small|timestep too small|internal timestep too small/i,
    title: '⏱️ Timestep Too Small — Simulation Unstable',
    message: 'The simulator had to shrink the time step so much it gave up. This usually means the circuit is switching too fast or has an instability.',
    hints: [
      'Sharp switching components (e.g. ideal switches) can cause this',
      'Very small capacitors combined with large resistors create fast time constants',
      'Missing snubber resistors on inductors',
    ],
    fixSteps: [
      'In Analysis Settings, increase the Step Time (e.g. from 0.01ms to 0.1ms)',
      'Add a small series resistor (0.1Ω–1Ω) to any inductors',
      'Replace ideal switches with a resistor toggle (1mΩ closed, 1GΩ open)',
    ],
  },
  {
    pattern: /no convergence|convergence failure|failed to converge/i,
    title: '🔁 Convergence Failure',
    message: "SPICE's iterative Newton-Raphson solver couldn't reach a stable solution within the allowed number of iterations.",
    hints: [
      'Highly nonlinear circuits (many diodes/transistors) are prone to this',
      'Initial conditions far from the DC operating point can cause divergence',
      'Very stiff circuits with components spanning many decades of value',
    ],
    fixSteps: [
      'In Analysis Settings, reduce the End Time and use a smaller Step Time',
      'Try DC Operating Point analysis first to find initial conditions',
      'Add small resistors (1kΩ) in series with diodes to stabilize convergence',
    ],
  },
  {
    pattern: /could not find .* in library|subcircuit .* not found|not found in library/i,
    title: '📦 Subcircuit Not Found',
    message: 'The netlist references a subcircuit or model that is not built into this simulator.',
    hints: [
      'Custom subcircuits from external SPICE tools are not automatically available',
      'The component may use a vendor-specific model not included in the built-in library',
    ],
    fixSteps: [
      'Replace the component with a supported equivalent from the component palette',
      'Check the available components in the 555 Timer, Op-Amp, and Transistor categories',
    ],
  },
  {
    pattern: /division by zero|divide by zero/i,
    title: '➗ Division by Zero',
    message: 'The circuit has a mathematical singularity — likely a zero-value component or open circuit where SPICE expected a value.',
    hints: [
      'A resistor with value 0Ω creates a short circuit loop that SPICE cannot solve',
      'An inductor in series with a current source at DC can cause this',
    ],
    fixSteps: [
      'Check component values — resistors should never be exactly 0Ω (use 1mΩ minimum)',
      'Replace ideal short circuits with a very small resistance',
    ],
  },
];

// Fallback for unrecognized errors
const GENERIC_ERROR: Omit<SmartSpiceError, 'raw'> = {
  title: '⚠️ Simulation Error',
  message: 'The SPICE engine returned an error. See the details below.',
  hints: [
    'Check that all components have valid values',
    'Ensure your circuit has a Ground component',
    'Try a simpler circuit first to isolate the issue',
  ],
  fixSteps: [
    'Add a Ground component if you haven\'t already',
    'Double-check all component values for typos',
  ],
};

/**
 * Parses a raw ngspice error string into a structured SmartSpiceError.
 * Always returns a valid object — falls back to a generic message if no pattern matches.
 */
export function parseSpiceError(rawError: string): SmartSpiceError {
  const normalized = rawError.replace(/\r\n/g, '\n').trim();

  for (const ep of ERROR_PATTERNS) {
    const match = normalized.match(ep.pattern);
    if (match) {
      return {
        title: ep.title,
        message: ep.message,
        hints: ep.hints,
        fixSteps: ep.fixSteps,
        offendingNode: ep.extractNode ? ep.extractNode(match) : undefined,
        offendingModel: ep.extractModel ? ep.extractModel(match) : undefined,
        raw: rawError,
      };
    }
  }

  // No pattern matched — return generic error with the raw message visible
  return {
    ...GENERIC_ERROR,
    raw: rawError,
  };
}

/**
 * Returns true if the raw error string contains a known fatal simulation error.
 */
export function isKnownSpiceError(rawError: string): boolean {
  return ERROR_PATTERNS.some(ep => ep.pattern.test(rawError));
}
