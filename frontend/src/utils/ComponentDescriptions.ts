export interface ComponentMetadata {
  title: string;
  category: string;
  description: string;
  parameters: string;
  default?: string;
}

export const componentDescriptions: Record<string, ComponentMetadata> = {
  // Sources
  DCSource: {
    title: "DC Voltage Source",
    category: "Sources",
    description: "An ideal direct current (DC) voltage source. It provides a constant voltage regardless of the current flowing through it. Used to simulate batteries or steady power rails.",
    parameters: "Enter the voltage value. Example: '5V' or '12'."
  },
  DCCurrent: {
    title: "DC Current Source",
    category: "Sources",
    description: "An ideal direct current (DC) source. It forces a constant current to flow through a branch regardless of the voltage across it. Useful for biasing transistor circuits.",
    parameters: "Enter the current value. Example: '1A' or '10mA'."
  },
  ACSource: {
    title: "AC Voltage Source",
    category: "Sources",
    description: "An ideal alternating current (AC) sinusoidal voltage generator. Used to simulate mains power, audio signals, or RF carriers.",
    parameters: "Format: '[Amplitude]Vpk [Frequency]Hz'. Example: '1Vpk 1kHz'. Note: Vpk is peak voltage, not RMS."
  },
  ACCurrent: {
    title: "AC Current Source",
    category: "Sources",
    description: "An ideal alternating current (AC) sinusoidal current generator. It pushes a sinusoidal current wave through the circuit.",
    parameters: "Format: '[Amplitude]Apk [Frequency]Hz'. Example: '1Apk 1kHz'."
  },
  ClockVoltage: {
    title: "Clock Voltage Source",
    category: "Sources",
    description: "A digital square wave generator. It outputs a rapidly alternating high and low voltage signal with very fast rise and fall times. Ideal for driving digital logic gates and flip-flops.",
    parameters: "Enter the peak logic high voltage. Example: '5V' or '3.3V'. (Frequency defaults to 1kHz in simulation)."
  },
  PulseVoltage: {
    title: "Pulse Voltage Source",
    category: "Sources",
    description: "A generic pulse generator that allows precise control over timing. You can control the initial delay, rise time, fall time, pulse width, and total period.",
    parameters: "Format: SPICE PULSE syntax 'V1 V2 TD TR TF PW PER'. Example: '0 5 0 1n 1n 0.5m 1m'."
  },
  StepVoltage: {
    title: "Step Voltage Source",
    category: "Sources",
    description: "A step generator that transitions from 0V to a target voltage at exactly t=0 (or after a slight delay) and stays there. Essential for testing the transient response (step response) of RLC circuits and filters.",
    parameters: "Default is a 0 to 5V step at 1ms. Enter target voltage. Example: '5V'."
  },
  AMVoltage: {
    title: "Amplitude Modulation (AM) Source",
    category: "Sources",
    description: "Generates an Amplitude Modulated signal where a high-frequency carrier wave's amplitude is varied by a lower-frequency modulating signal. Useful for RF communications.",
    parameters: "Currently uses default SPICE AM(1 1 1k 10k). Modify netlister for custom params."
  },
  FMVoltage: {
    title: "Frequency Modulation (FM) Source",
    category: "Sources",
    description: "Generates a Frequency Modulated (SFFM) signal where a carrier wave's frequency is varied by a modulating signal.",
    parameters: "Currently uses default SPICE SFFM(0 1 10k 5 1k)."
  },
  ThermalNoise: {
    title: "Thermal Noise Generator",
    category: "Sources",
    description: "A random noise generator (TRN) that simulates thermal/Johnson-Nyquist noise in resistors or semiconductor channels.",
    parameters: "Default SPICE TRN params injected into engine."
  },

  // Passives
  Resistor: {
    title: "Resistor",
    category: "Passives",
    description: "An ideal resistor. It opposes the flow of electric current, creating a voltage drop proportional to the current (Ohm's Law: V=IR).",
    parameters: "Format: '[Resistance]'\nExample: '1k', '4.7Meg', '100'\nNote: Use standard SPICE suffixes (m=milli, k=kilo, Meg=mega, u=micro).",
    default: "1k"
  },
  Load: {
    title: "Generic Load",
    category: "Passives",
    description: "A generic resistive load for testing power supplies and circuit outputs.",
    parameters: "Format: '[Resistance]'\nExample: '1k', '4.7Meg', '100'\nNote: Use standard SPICE suffixes (m=milli, k=kilo, Meg=mega, u=micro).",
    default: "1k"
  },
  Capacitor: {
    title: "Capacitor",
    category: "Passive Components",
    description: "An ideal capacitor. It stores electrical energy in an electric field. It blocks DC current but allows AC current to pass, making it essential for filtering and decoupling.",
    parameters: "Enter capacitance in Farads. Use multipliers: 'u' (micro), 'n' (nano), 'p' (pico). Example: '10u' or '100n'."
  },
  Inductor: {
    title: "Inductor",
    category: "Passive Components",
    description: "An ideal inductor. It stores electrical energy in a magnetic field. It blocks high-frequency AC but allows DC to pass. Used in filters, transformers, and buck/boost converters.",
    parameters: "Enter inductance in Henrys. Use multipliers: 'm' (milli), 'u' (micro). Example: '100m' or '10u'."
  },
  Transformer1P1S: {
    title: "1P 1S Transformer",
    category: "Transformers",
    description: "Two inductively coupled coils with one primary (1P) and one secondary (1S) winding. Transfers electrical energy between two circuits through electromagnetic induction.",
    parameters: "Currently modeled visually. SPICE coupling requires 'K L1 L2 ratio'."
  },
  Transformer1P1S_CT: {
    title: "1P 1S Center Tapped Transformer",
    category: "Transformers",
    description: "A standard 1P 1S transformer where the secondary coil has an additional connection exactly at its halfway point (the center tap). Often used in full-wave rectifiers and push-pull amplifiers.",
    parameters: "Currently modeled visually."
  },
  Transformer1P2S: {
    title: "1P 2S Transformer",
    category: "Transformers",
    description: "A transformer with one primary winding and two fully isolated secondary windings. Useful for providing multiple isolated voltage rails (e.g. +15V and +5V) from a single input.",
    parameters: "Currently modeled visually."
  },
  Transformer2P1S: {
    title: "2P 1S Transformer",
    category: "Transformers",
    description: "A transformer with two primary windings and one secondary winding. The dual primaries can be wired in series for 240V mains or in parallel for 120V mains.",
    parameters: "Currently modeled visually."
  },
  Transformer2P2S: {
    title: "2P 2S Transformer",
    category: "Transformers",
    description: "A highly versatile transformer featuring dual primary and dual secondary windings. Supports series/parallel configurations on both the input and output stages.",
    parameters: "Currently modeled visually."
  },

  // Diodes
  Diode: {
    title: "PN Junction Diode",
    category: "Semiconductors",
    description: "A standard PN junction diode (like a 1N4148 or 1N4007). It allows current to flow easily in one direction (forward bias) but blocks it in the reverse direction. Used for rectification and clipping.",
    parameters: "No value needed. SPICE model is standard D."
  },
  DiodeZener: {
    title: "Zener Diode",
    category: "Semiconductors",
    description: "A special diode designed to reliably allow current to flow backwards when a certain reverse breakdown voltage (Zener voltage) is reached. Used to create stable reference voltages.",
    parameters: "Defaults to 5.1V Zener breakdown model in engine."
  },
  DiodeSchottky: {
    title: "Schottky Diode",
    category: "Semiconductors",
    description: "A diode with a very low forward voltage drop (0.15V-0.45V) and extremely fast switching action. Ideal for high-frequency applications and power supplies.",
    parameters: "Uses a low-barrier Schottky SPICE model."
  },
  LED: {
    title: "Light Emitting Diode (LED)",
    category: "Semiconductors",
    description: "A specialized diode that emits light when forward biased. It typically has a higher forward voltage drop (e.g. 2V to 3.3V) than a standard silicon diode.",
    parameters: "Defaults to a standard Red LED model (Vf ≈ 2.1V)."
  },
  BridgeRectifier: {
    title: "Bridge Rectifier",
    category: "Semiconductors",
    description: "A full-wave bridge rectifier consisting of four diodes arranged in a bridge circuit. Converts AC input into pulsed DC output.",
    parameters: "Modeled as 4 discrete standard diodes."
  },

  // Transistors
  TransistorNPN: {
    title: "NPN Bipolar Junction Transistor",
    category: "Semiconductors",
    description: "An NPN BJT. A small current entering the Base controls a much larger current flowing from Collector to Emitter. Used for amplification and switching.",
    parameters: "Uses standard NPN SPICE model. Default: 2N3904."
  },
  TransistorPNP: {
    title: "PNP Bipolar Junction Transistor",
    category: "Semiconductors",
    description: "A PNP BJT. Works opposite to NPN: a small current pulled out of the Base controls a large current from Emitter to Collector.",
    parameters: "Uses standard PNP SPICE model. Default: 2N3906."
  },
  MosfetN: {
    title: "N-Channel MOSFET",
    category: "Semiconductors",
    description: "An N-Channel Enhancement-mode MOSFET. A voltage applied to the insulated Gate controls the current between Drain and Source. Extremely common in digital logic and power switching.",
    parameters: "Uses Level-1 NMOS SPICE model. Default: 2N7000."
  },
  MosfetP: {
    title: "P-Channel MOSFET",
    category: "Semiconductors",
    description: "A P-Channel Enhancement-mode MOSFET. Turns on when the Gate voltage is lower than the Source voltage.",
    parameters: "Uses Level-1 PMOS SPICE model. Default: BSS84."
  },
  JFET: {
    title: "Junction FET (N-Channel)",
    category: "Semiconductors",
    description: "An N-Channel Junction Field Effect Transistor. A depletion-mode device that is normally on when Gate is 0V.",
    parameters: "Uses JFET SPICE model. Default: J201."
  },
  IGBT: {
    title: "Insulated-Gate Bipolar Transistor",
    category: "Semiconductors",
    description: "An IGBT combines the simple gate-drive characteristics of MOSFETs with the high-current and low-saturation-voltage capability of bipolar transistors.",
    parameters: "Uses IGBT SPICE model. Default: FGA25N120."
  },
  
  // Switches
  SwitchSPST: {
    title: "SPST Switch",
    category: "Switches",
    description: "Single-Pole Single-Throw switch. A simple on/off mechanical switch. In simulation, it is modeled as a voltage-controlled switch or dynamic resistor.",
    parameters: "No value needed."
  },
  PushButton: {
    title: "Push Button",
    category: "Switches",
    description: "A momentary push button switch that is normally open. Closed only while pressed.",
    parameters: "No value needed."
  },
  
  // Default fallback
  Default: {
    title: "Component",
    category: "Unknown",
    description: "A schematic component.",
    parameters: "Enter standard value if applicable."
  }
};

export function getComponentMetadata(type: string): ComponentMetadata {
  return componentDescriptions[type] || componentDescriptions['Default'];
}
