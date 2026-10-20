import { create } from 'zustand';

export interface LabExperiment {
  id: string;
  experimentNo: number;
  title: string;
  aim: string;
  university: string;
  courseCode: string;
  courseName: string;
  circuitId: string; // references an existing circuit in circuitExamples.ts / exampleCircuits.ts
  theory: string; // 2-3 sentence theory
  expectedObservations: string;
  vivaQuestions: string[];
}

export interface UniversityLabPack {
  id: string;
  universityName: string;
  courseCode: string;
  courseName: string;
  semester: string;
  experiments: LabExperiment[];
}

export const CIRCUIT_ID_ALIASES: Record<string, string> = {
  'inverting-op-amp': 'opamp',
  'rc-low-pass-filter': 'lpf',
  'zener-regulator': 'zener_reg',
  'common-emitter-amplifier': 'ce_amp',
  'wien-bridge-oscillator': 'wien_bridge',
  'wien': 'wien_bridge',
  'bridge-rectifier': 'rectifier',
};

export function resolveCircuitId(id: string): string {
  return CIRCUIT_ID_ALIASES[id] || id;
}

export const universityLabPacks: UniversityLabPack[] = [
  {
    id: 'anna-univ-ec3201',
    universityName: 'Anna University',
    courseCode: 'EC3201',
    courseName: 'Electronic Devices and Circuits Laboratory',
    semester: '3rd Semester B.E. ECE',
    experiments: [
      {
        id: 'au-ec3201-exp1',
        experimentNo: 1,
        title: 'Inverting Amplifier using Op-Amp',
        aim: 'To design and simulate an inverting amplifier using LM741 op-amp and verify the voltage gain.',
        university: 'Anna University',
        courseCode: 'EC3201',
        courseName: 'Electronic Devices and Circuits Laboratory',
        circuitId: 'opamp', // matched to example circuit ID
        theory: 'An inverting amplifier uses negative feedback through a resistor network. The output is 180° out of phase with the input. Gain = -Rf/Rin.',
        expectedObservations: 'Output waveform is inverted. Gain = -Rf/Rin = -10 for Rf=100kΩ, Rin=10kΩ.',
        vivaQuestions: [
          'What is the phase relationship between input and output in an inverting amplifier?',
          'Why is a feedback resistor necessary in op-amp circuits?',
          'What happens when the gain is too high (open-loop)?',
          'Define CMRR and its significance.',
          'What is the slew rate of an op-amp?'
        ]
      },
      {
        id: 'au-ec3201-exp2',
        experimentNo: 2,
        title: 'RC Low Pass Filter',
        aim: 'To design and simulate a first-order RC low-pass filter and plot its frequency response.',
        university: 'Anna University',
        courseCode: 'EC3201',
        courseName: 'Electronic Devices and Circuits Laboratory',
        circuitId: 'lpf', // matched to example circuit ID
        theory: 'An RC low-pass filter passes signals below the cutoff frequency fc = 1/(2πRC) and attenuates higher frequencies at -20 dB/decade.',
        expectedObservations: 'AC sweep shows -3dB point at cutoff frequency. Output voltage drops above fc.',
        vivaQuestions: [
          'What is the cutoff frequency formula for an RC filter?',
          'What is the slope of the magnitude response above cutoff?',
          'Difference between passive and active filters?',
          'What is a Bode plot?',
          'Define -3dB frequency.'
        ]
      },
      {
        id: 'au-ec3201-exp3',
        experimentNo: 3,
        title: 'Zener Diode Voltage Regulator',
        aim: 'To simulate a Zener diode shunt voltage regulator and observe load regulation.',
        university: 'Anna University',
        courseCode: 'EC3201',
        courseName: 'Electronic Devices and Circuits Laboratory',
        circuitId: 'zener_reg', // matched to example circuit ID
        theory: 'A Zener diode maintains a constant voltage across its terminals when reverse biased beyond the Zener breakdown voltage Vz.',
        expectedObservations: 'Output voltage remains constant at Vz despite input voltage variations within operating range.',
        vivaQuestions: [
          'What is Zener breakdown voltage?',
          'Difference between Zener and avalanche breakdown?',
          'What is load regulation?',
          'Why is a series resistor required?',
          'What is the power dissipation in the Zener diode?'
        ]
      }
    ]
  },
  {
    id: 'vtu-22ecl35',
    universityName: 'VTU (Visvesvaraya Technological University)',
    courseCode: '22ECL35',
    courseName: 'Analog Circuits Laboratory',
    semester: '3rd Semester B.E. ECE',
    experiments: [
      {
        id: 'vtu-22ecl35-exp1',
        experimentNo: 1,
        title: 'Common Emitter Amplifier',
        aim: 'To design and simulate a BJT common emitter amplifier and measure voltage gain, input/output impedance.',
        university: 'VTU',
        courseCode: '22ECL35',
        courseName: 'Analog Circuits Laboratory',
        circuitId: 'ce_amp', // matched to example circuit ID
        theory: 'A common emitter amplifier provides voltage amplification with 180° phase inversion. The voltage gain Av = -gm × RC where gm is the transconductance.',
        expectedObservations: 'Voltage gain of approximately 50-100 depending on bias point. Output phase is inverted.',
        vivaQuestions: [
          'What is the DC operating point (Q-point)?',
          'Why is the bypass capacitor used across the emitter resistor?',
          'Define voltage gain and current gain.',
          'What is the effect of load resistance on gain?',
          'What is the difference between h-parameter and re model?'
        ]
      },
      {
        id: 'vtu-22ecl35-exp2',
        experimentNo: 2,
        title: 'Wien Bridge Oscillator',
        aim: 'To design and simulate a Wien bridge RC oscillator using an op-amp and verify the frequency of oscillation.',
        university: 'VTU',
        courseCode: '22ECL35',
        courseName: 'Analog Circuits Laboratory',
        circuitId: 'wien_bridge', // matched to example circuit ID
        theory: 'The Wien bridge oscillator uses an op-amp with a frequency-selective RC positive feedback network. Oscillation occurs when the Barkhausen criteria are satisfied: loop gain = 1 and total phase shift = 0°. Frequency f = 1/(2πRC). The non-inverting gain must be exactly 3 (Rf = 2R1) to sustain oscillation.',
        expectedObservations: 'Stable sinusoidal oscillation at frequency f = 1/(2πRC) ≈ 1.59 kHz for R = 10 kΩ and C = 10 nF.',
        vivaQuestions: [
          'What are the Barkhausen criteria for oscillation?',
          'Why must the gain be exactly 3 in a Wien bridge oscillator?',
          'How does the Wien bridge RC network provide 0° phase shift at f₀?',
          'Difference between Wien bridge and RC phase shift oscillator?',
          'What is frequency stability and how is it improved?'
        ]
      }
    ]
  },
  {
    id: 'jntu-eel',
    universityName: 'JNTU (Jawaharlal Nehru Technological University)',
    courseCode: 'EEL',
    courseName: 'Electronic Engineering Laboratory',
    semester: '2nd Semester B.Tech EEE',
    experiments: [
      {
        id: 'jntu-eel-exp1',
        experimentNo: 1,
        title: 'Half Wave and Full Wave Rectifier',
        aim: 'To simulate half-wave and full-wave rectifier circuits and observe the effect of filter capacitor.',
        university: 'JNTU',
        courseCode: 'EEL',
        courseName: 'Electronic Engineering Laboratory',
        circuitId: 'rectifier', // matched to example circuit ID
        theory: 'A rectifier converts AC to pulsating DC. A full-wave bridge rectifier uses 4 diodes and provides output on both half-cycles. Ripple factor = Vrms/Vdc.',
        expectedObservations: 'Full-wave rectified output shows two humps per AC cycle. Adding a filter capacitor reduces ripple significantly.',
        vivaQuestions: [
          'What is ripple factor?',
          'How does a filter capacitor reduce ripple?',
          'What is peak inverse voltage (PIV) of a diode?',
          'Difference between half-wave and full-wave rectifiers?',
          'What is efficiency of rectification?'
        ]
      }
    ]
  }
];

interface ActiveExperimentState {
  activeExperiment: LabExperiment | null;
  setActiveExperiment: (exp: LabExperiment | null) => void;
}

export const useActiveExperimentStore = create<ActiveExperimentState>((set) => ({
  activeExperiment: null,
  setActiveExperiment: (exp) => set({ activeExperiment: exp }),
}));
