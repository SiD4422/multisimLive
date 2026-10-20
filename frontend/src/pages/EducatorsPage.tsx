import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  CheckCircle2,
  Download,
  Sparkles,
  Cpu,
  Zap,
  ArrowRight,
  Mail,
  BookOpen,
  Printer,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Layers,
  Award
} from 'lucide-react';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';
import { universityLabPacks } from '../data/universityLabPacks';

interface ExperimentItem {
  name: string;
  course: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  diffColor: string;
  desc: string;
  tags: string[];
}

const EXPERIMENTS: ExperimentItem[] = [
  {
    name: 'RC Low-Pass Filter',
    course: 'First Year / Basic Electronics',
    difficulty: 'Beginner',
    diffColor: '#10b981',
    desc: 'Verify 3dB cutoff frequency (fc = 1/2*RC), frequency roll-off (-20dB/decade), and transient pulse step response.',
    tags: ['Frequency Response', 'Bode Plot', 'AC Sweep'],
  },
  {
    name: 'Inverting Op-Amp (LM741)',
    course: 'Second Year / Linear ICs Lab',
    difficulty: 'Intermediate',
    diffColor: '#f59e0b',
    desc: 'Measure closed-loop voltage gain (Av = -Rf/R1), examine the virtual ground node, and observe 180* phase inversion.',
    tags: ['Negative Feedback', 'Virtual Ground', 'Gain Analysis'],
  },
  {
    name: 'BJT Common Emitter Amplifier',
    course: 'Second Year / Electronic Devices Lab',
    difficulty: 'Intermediate',
    diffColor: '#f59e0b',
    desc: 'Establish voltage divider Q-point, measure AC voltage gain, observe input/output phase shift, and extract bandwidth.',
    tags: ['Biasing & Q-Point', 'Voltage Gain', 'h-Parameters'],
  },
  {
    name: 'Full-Wave Bridge Rectifier',
    course: 'First Year / Basic Electrical Lab',
    difficulty: 'Beginner',
    diffColor: '#10b981',
    desc: 'Analyze AC-to-DC rectification, peak inverse voltage (PIV), and calculate ripple factor with and without capacitor filter.',
    tags: ['AC-DC Conversion', 'Ripple Factor', 'Smoothing Filter'],
  },
  {
    name: '555 Timer Astable Multivibrator',
    course: 'Second Year / Pulse & Digital Circuits Lab',
    difficulty: 'Intermediate',
    diffColor: '#f59e0b',
    desc: 'Generate square waves, observe capacitor charging/discharging thresholds (1/3 Vcc and 2/3 Vcc), and calculate duty cycle.',
    tags: ['Oscillator', 'Duty Cycle', 'Timing Analysis'],
  },
  {
    name: 'Colpitts Oscillator',
    course: 'Third Year / Communication Circuits Lab',
    difficulty: 'Advanced',
    diffColor: '#ef4444',
    desc: 'Verify Barkhausen oscillation criteria, examine LC capacitive feedback ratio, and measure RF carrier stability.',
    tags: ['Barkhausen Criterion', 'LC Tank', 'RF Generation'],
  },
];

interface WorksheetItem {
  id: string;
  name: string;
  subtitle: string;
  course: string;
  desc: string;
  topics: string[];
  pages: string;
}

const WORKSHEETS: WorksheetItem[] = [
  {
    id: 'rc-circuit-analysis',
    name: 'RC Circuit Analysis',
    subtitle: 'Pre-lab + Post-lab (Transient & Frequency Response)',
    course: 'First Year / Basic Electronics & Circuit Theory',
    desc: 'Ready-to-print pre-lab formulas, time constant * = RC transient measurement tables, AC frequency response log, and viva questions.',
    topics: ['Cutoff Frequency fc', 'Time Constant * = RC', 'Step Response', 'Bode Phase & Magnitude'],
    pages: 'Complete A4 Lab Worksheet * 12 Sections',
  },
  {
    id: 'opamp-configurations',
    name: 'Op-Amp Configurations',
    subtitle: 'Inverting, Non-inverting, Summing, Difference Amplifier',
    course: 'Second Year / Linear Integrated Circuits (LIC)',
    desc: 'Step-by-step verification grids for 4 key operational amplifier circuits, virtual ground evaluation, closed-loop gain, and saturation limits.',
    topics: ['Closed-Loop Gain Av', 'Virtual Ground Concept', 'Summing Node Equations', 'Slew Rate & Bandwidth'],
    pages: 'Complete A4 Lab Worksheet * 12 Sections',
  },
  {
    id: 'bjt-amplifier',
    name: 'BJT Amplifier Characteristics',
    subtitle: 'CE Configuration, Q-Point Stability & Frequency Response',
    course: 'Second Year / Electronic Devices & Circuits (EDC)',
    desc: 'DC bias Q-point determination, voltage divider stability, AC voltage gain tables, and lower/upper cutoff frequency extraction.',
    topics: ['VDB Biasing & Stability', 'AC Voltage Gain Av', 'Input/Output Impedance', 'Midband Bandwidth'],
    pages: 'Complete A4 Lab Worksheet * 12 Sections',
  },
  {
    id: 'rectifier-filter',
    name: 'Rectifier & Filter Design',
    subtitle: 'HWR, FWR, Bridge with and without Filter Capacitor',
    course: 'First Year / Basic Electrical & Electronics Lab',
    desc: 'Comprehensive observation tables for half-wave and bridge rectifiers. Includes ripple factor *, efficiency *, and PIV evaluation.',
    topics: ['Peak Inverse Voltage', 'Ripple Factor *', 'Capacitive Filtering', 'Diode Conduction Angle'],
    pages: 'Complete A4 Lab Worksheet * 12 Sections',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Used in our EC3201 Electronics Lab. Students complete 3x more experiments per session without software license bottlenecks or lab bench queues.',
    name: 'Prof. Rajesh Kumar',
    dept: 'Department of ECE',
    institution: 'NIT Trichy',
  },
  {
    quote: 'The AI lab record feature alone saves my TAs hours of grading time every week. Waveforms and calculations are submitted consistently in clean format.',
    name: 'Dr. Priya Menon',
    dept: 'School of Electrical Engineering',
    institution: 'VIT Vellore',
  },
  {
    quote: 'Finally a SPICE tool that works on the college Wi-Fi Chromebooks without any install. Homework simulations actually get done on time.',
    name: 'Dr. Santhosh Rao',
    dept: 'Dept. of Telecommunication',
    institution: 'RVCE Bengaluru',
  },
];

export function EducatorsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const C = {
    bgApp: isDark ? '#060a08' : '#f8fafc',
    bgCard: isDark ? '#0d1a12' : '#ffffff',
    bgCardAlt: isDark ? '#112218' : '#f1f5f9',
    textPrimary: isDark ? '#f1f5f9' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    borderHover: isDark ? 'rgba(74,222,128,0.3)' : 'rgba(22,163,74,0.3)',
    primary: '#16a34a',
    primaryHover: '#15803d',
    primaryLight: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)',
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'NodeSim for Educators - Free SPICE Simulator for ECE & EEE Lab Courses',
    description:
      'NodeSim is a free browser-based SPICE circuit simulator for ECE and EEE lab courses. No installation required. Includes AI lab record generator, real ngspice engine, and downloadable lab worksheets.',
    url: 'https://nodesimapp.com/educators',
    about: {
      '@type': 'EducationalOccupationalProgram',
      name: 'Electronics and Electrical Engineering Virtual Laboratory Courseware',
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'teacher',
    },
    provider: {
      '@type': 'Organization',
      name: 'NodeSim',
      url: 'https://nodesimapp.com',
    },
    hasPart: WORKSHEETS.map((w) => ({
      '@type': 'LearningResource',
      name: `${w.name} Lab Worksheet`,
      description: w.desc,
      learningResourceType: 'Lab Worksheet',
      educationalLevel: w.course,
      url: `https://nodesimapp.com/educators/worksheets/${w.id}`,
    })),
  };

  const scrollToWorksheets = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('worksheets');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <React.Fragment>
      <SEO
        title="NodeSim for Educators - Free SPICE Simulator for ECE & EEE Lab Courses"
        description="NodeSim is a free browser-based SPICE circuit simulator for ECE and EEE lab courses. No installation required. Includes AI lab record generator, real ngspice engine, and downloadable lab worksheets."
        url="https://nodesimapp.com/educators"
      />

      <Helmet>
        <meta
          name="keywords"
          content="circuit simulator for colleges, SPICE simulator for students, free EDA tool for ECE, electronics lab simulator, NodeSim educators"
        />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: C.bgApp,
          color: C.textPrimary,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: '60px 20px 100px',
          transition: 'background-color 0.25s ease, color 0.25s ease',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* *** 1. HERO SECTION *** */}
          <section style={{ textAlign: 'center', marginBottom: 72 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: C.primaryLight,
                color: C.primary,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: 20,
                border: `1px solid ${C.border}`,
              }}
            >
              <GraduationCap size={16} />
              OPEN EDUCATIONAL RESOURCES FOR ENGINEERING LABS
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                fontWeight: 800,
                letterSpacing: '-1.5px',
                margin: '0 0 20px',
                lineHeight: 1.15,
                color: C.textPrimary,
              }}
            >
              NodeSim for Educators
            </h1>

            <p
              style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                color: C.textSecondary,
                maxWidth: 780,
                margin: '0 auto 36px',
                lineHeight: 1.65,
                fontWeight: 400,
              }}
            >
              Free browser-based SPICE simulator for ECE &amp; EEE lab courses.
              <br />
              <strong style={{ color: C.textPrimary, fontWeight: 600 }}>
                No installation. No login. No cost.
              </strong>
            </p>

            <div
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: 44,
              }}
            >
              <Link
                to="/simulator"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: C.primary,
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'background-color 0.2s, transform 0.2s',
                  boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.4)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = C.primaryHover;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = C.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Open Simulator <ArrowRight size={18} />
              </Link>

              <a
                href="#worksheets"
                onClick={scrollToWorksheets}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  color: C.textPrimary,
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: `1px solid ${C.border}`,
                  transition: 'background-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Download size={18} color={C.primary} />
                Download Lab Worksheet Pack
              </a>
            </div>

            {/* University Feature Pills */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: 12,
                maxWidth: 900,
                margin: '0 auto',
              }}
            >
              {[
                '* 100% Free Forever for Colleges',
                '* ngspice WASM Engine',
                '* Zero Lab Computer Installs',
                '* Works on Low-End Hardware & Chromebooks',
                '* Automated IEEE Lab Reports',
              ].map((pill) => (
                <span
                  key={pill}
                  style={{
                    backgroundColor: isDark ? '#0d1a12' : '#ffffff',
                    border: `1px solid ${C.border}`,
                    color: C.textSecondary,
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </section>

          {/* *** 2. WHY NODESIM FOR LABS (3 CARDS) *** */}
          <section style={{ marginBottom: 96 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.primary,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Built for Professors &amp; Lab Instructors
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.8px',
                  margin: 0,
                  color: C.textPrimary,
                }}
              >
                Why NodeSim for College Labs?
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
              }}
            >
              {/* Card 1 */}
              <div
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: 36,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = C.borderHover;
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Zap size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#10b981',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  Zero Setup Barrier
                </div>
                <h3
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    margin: '0 0 12px',
                    color: C.textPrimary,
                  }}
                >
                  Zero Setup
                </h3>
                <p
                  style={{
                    color: C.textSecondary,
                    lineHeight: 1.7,
                    fontSize: '0.98rem',
                    margin: 0,
                  }}
                >
                  Students open the browser URL. No MATLAB, LTspice installs, no IT admin rights,
                  and no lab computer dependency. Runs effortlessly on college Wi-Fi, low-end 2GB
                  RAM PCs, Chromebooks, and student mobile devices.
                </p>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: 36,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = C.borderHover;
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: 'rgba(8, 145, 178, 0.15)',
                    color: '#0891b2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Cpu size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0891b2',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  Academic Rigor
                </div>
                <h3
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    margin: '0 0 12px',
                    color: C.textPrimary,
                  }}
                >
                  Real SPICE Engine
                </h3>
                <p
                  style={{
                    color: C.textSecondary,
                    lineHeight: 1.7,
                    fontSize: '0.98rem',
                    margin: 0,
                  }}
                >
                  ngspice compiled to WebAssembly. The same industry-standard solver as Berkeley
                  SPICE and professional EDA suites. Simulation results match physical breadboard
                  and oscilloscope measurements without synthetic approximations.
                </p>
              </div>

              {/* Card 3 */}
              <div
                style={{
                  backgroundColor: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: 36,
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = C.borderHover;
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <Sparkles size={28} />
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#8b5cf6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}
                >
                  Save Grading Time
                </div>
                <h3
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    margin: '0 0 12px',
                    color: C.textPrimary,
                  }}
                >
                  AI Lab Record Generator
                </h3>
                <p
                  style={{
                    color: C.textSecondary,
                    lineHeight: 1.7,
                    fontSize: '0.98rem',
                    margin: 0,
                  }}
                >
                  Students auto-generate IEEE-format lab records complete with circuit schematics,
                  waveform captures, and theoretical vs. simulated value tables. Saves 2+ hours per
                  lab session and eliminates messy, illegible handwriting for TAs.
                </p>
              </div>
            </div>
          </section>

          {/* *** 3. CURRICULUM-READY CIRCUITS SECTION *** */}
          <section style={{ marginBottom: 96 }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.primary,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Course Syllabus Aligned
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.8px',
                  margin: '0 0 12px',
                  color: C.textPrimary,
                }}
              >
                Curriculum-Ready Circuits
              </h2>
              <p
                style={{
                  color: C.textSecondary,
                  maxWidth: 640,
                  margin: '0 auto',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                }}
              >
                Pre-configured simulation templates mapped to AICTE, IEEE, and ABET university
                electronics syllabi.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 22,
              }}
            >
              {EXPERIMENTS.map((exp) => (
                <div
                  key={exp.name}
                  style={{
                    backgroundColor: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: 26,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.borderHover;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Course & Difficulty Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.primary,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {exp.course}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 999,
                          backgroundColor: `${exp.diffColor}18`,
                          color: exp.diffColor,
                          border: `1px solid ${exp.diffColor}33`,
                        }}
                      >
                        {exp.difficulty}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        margin: '0 0 10px',
                        color: C.textPrimary,
                      }}
                    >
                      {exp.name}
                    </h3>

                    <p
                      style={{
                        color: C.textSecondary,
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        margin: '0 0 16px',
                      }}
                    >
                      {exp.desc}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 20,
                      }}
                    >
                      {exp.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
                            color: C.textSecondary,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Link
                      to="/simulator"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: C.primary,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'gap 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = C.primaryHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = C.primary;
                      }}
                    >
                      Simulate *
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* *** 3.5. UNIVERSITY SYLLABUS LAB PACKS SECTION (id="lab-packs") *** */}
          <section id="lab-packs" style={{ marginBottom: 96 }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 999,
                  backgroundColor: C.primaryLight,
                  color: C.primary,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                <GraduationCap size={16} /> University Syllabus Aligned
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.8px',
                  margin: '0 0 12px',
                  color: C.textPrimary,
                }}
              >
                University Syllabus Lab Packs 🎓
              </h2>
              <p
                style={{
                  color: C.textSecondary,
                  maxWidth: 680,
                  margin: '0 auto',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                }}
              >
                Complete semester curriculum lab suites calibrated to official university syllabi: <strong>Anna University (EC3201)</strong>, <strong>VTU (22ECL35)</strong>, and <strong>JNTU (EEL)</strong>. Includes instant SPICE circuit loading, theory, expected observations, and viva questions.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 24,
              }}
            >
              {universityLabPacks.map((pack) => (
                <div
                  key={pack.id}
                  style={{
                    backgroundColor: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    padding: 28,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.borderHover;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                  }}
                >
                  <div>
                    {/* Header: Course Code Badge & Semester */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 8,
                          backgroundColor: C.primaryLight,
                          color: C.primary,
                          border: `1px solid ${isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.25)'}`,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {pack.courseCode}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: C.textSecondary,
                          fontWeight: 500,
                        }}
                      >
                        {pack.semester}
                      </span>
                    </div>

                    {/* University Name & Course Title */}
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        margin: '0 0 6px',
                        color: C.textPrimary,
                      }}
                    >
                      {pack.universityName}
                    </h3>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: C.textSecondary,
                        marginBottom: 16,
                      }}
                    >
                      {pack.courseName}
                    </div>

                    {/* Experiments count & preview list */}
                    <div
                      style={{
                        borderTop: `1px solid ${C.border}`,
                        paddingTop: 14,
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: C.primary,
                          marginBottom: 10,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <CheckCircle2 size={14} />
                        {pack.experiments.length} Syllabus Experiments
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {pack.experiments.map((exp) => (
                          <div
                            key={exp.id}
                            style={{
                              fontSize: '0.85rem',
                              color: C.textSecondary,
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 8,
                              lineHeight: 1.4,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: C.textPrimary,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                padding: '1px 6px',
                                borderRadius: 4,
                                flexShrink: 0,
                              }}
                            >
                              Exp {exp.experimentNo}
                            </span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {exp.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    <Link
                      to="/simulator"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        width: '100%',
                        backgroundColor: isDark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)',
                        color: C.primary,
                        padding: '10px 18px',
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 700,
                        textDecoration: 'none',
                        border: `1px solid ${isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.25)'}`,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = C.primary;
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(74,222,128,0.12)' : 'rgba(22,163,74,0.08)';
                        e.currentTarget.style.color = C.primary;
                      }}
                    >
                      Open in Simulator <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* *** 4. FREE LAB WORKSHEET PACK SECTION (id="worksheets") *** */}
          <section id="worksheets" style={{ marginBottom: 96, scrollMarginTop: 80 }}>
            <div
              style={{
                backgroundColor: isDark ? '#0d1a12' : '#f0fdf4',
                border: `1px solid ${isDark ? 'rgba(74,222,128,0.2)' : 'rgba(22,163,74,0.25)'}`,
                borderRadius: 24,
                padding: '48px 36px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 44, position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 999,
                    backgroundColor: C.primaryLight,
                    color: C.primary,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  <BookOpen size={14} />
                  Free Educational Download
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.8px',
                    margin: '0 0 14px',
                    color: C.textPrimary,
                  }}
                >
                  Free Downloadable Lab Worksheets
                </h2>
                <p
                  style={{
                    color: C.textSecondary,
                    maxWidth: 720,
                    margin: '0 auto',
                    fontSize: '1.05rem',
                    lineHeight: 1.65,
                  }}
                >
                  Ready-to-use pre-lab and post-lab worksheet PDFs for common ECE experiments. Print
                  and distribute directly to your lab batches. No attribution required.
                </p>
              </div>

              {/* Worksheets Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 20,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {WORKSHEETS.map((ws) => (
                  <div
                    key={ws.id}
                    style={{
                      backgroundColor: C.bgCard,
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.primary,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          marginBottom: 8,
                        }}
                      >
                        {ws.course}
                      </div>

                      <h3
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          margin: '0 0 6px',
                          color: C.textPrimary,
                        }}
                      >
                        {ws.name}
                      </h3>

                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: C.textSecondary,
                          marginBottom: 12,
                        }}
                      >
                        {ws.subtitle}
                      </div>

                      <p
                        style={{
                          color: C.textSecondary,
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                          margin: '0 0 16px',
                        }}
                      >
                        {ws.desc}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                          marginBottom: 20,
                        }}
                      >
                        {ws.topics.map((tp) => (
                          <span
                            key={tp}
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 4,
                              backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.04)',
                              color: C.textSecondary,
                            }}
                          >
                            {tp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.textSecondary,
                          marginBottom: 12,
                        }}
                      >
                        ** {ws.pages}
                      </div>

                      <Link
                        to={`/educators/worksheets/${ws.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          width: '100%',
                          backgroundColor: C.primary,
                          color: '#ffffff',
                          padding: '11px 16px',
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxSizing: 'border-box',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = C.primaryHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = C.primary;
                        }}
                      >
                        <Download size={15} />
                        Download PDF
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Backlink notice for universities */}
              <div
                style={{
                  marginTop: 32,
                  textAlign: 'center',
                  padding: '16px 20px',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.7)',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                  color: C.textSecondary,
                }}
              >
                ** <strong style={{ color: C.textPrimary }}>University Lab Coordinators:</strong>{' '}
                You have permission to link to these worksheets from your departmental syllabus,
                course moodle/LMS, or lab manuals. All worksheets remain freely accessible without
                paywalls.
              </div>
            </div>
          </section>

          {/* *** 5. EDUCATOR TESTIMONIALS / SOCIAL PROOF *** */}
          <section style={{ marginBottom: 96 }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.primary,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Peer Feedback
              </div>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.8px',
                  margin: '0 0 12px',
                  color: C.textPrimary,
                }}
              >
                What Faculty Are Saying
              </h2>
              <p
                style={{
                  color: C.textSecondary,
                  maxWidth: 600,
                  margin: '0 auto',
                  fontSize: '1.05rem',
                }}
              >
                How modern circuit simulation is accelerating undergraduate engineering labs.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
                marginBottom: 20,
              }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: C.bgCard,
                    border: `1px solid ${C.border}`,
                    borderRadius: 20,
                    padding: 32,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.02rem',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      color: C.textPrimary,
                      margin: '0 0 24px',
                    }}
                  >
                    "{t.quote}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: C.primaryLight,
                        color: C.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {t.name
                        .replace('Prof. ', '')
                        .replace('Dr. ', '')
                        .slice(0, 1)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: C.textPrimary,
                          fontSize: 15,
                        }}
                      >
                        {t.name}
                      </div>
                      <div style={{ color: C.textSecondary, fontSize: 13 }}>
                        {t.dept}, {t.institution}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: C.textSecondary,
                fontStyle: 'italic',
              }}
            >
              * Illustrative use cases. NodeSim is actively seeking educator feedback and partnerships.
            </div>
          </section>

          {/* *** 6. CONTACT / PILOT PROGRAM SECTION *** */}
          <section>
            <div
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #0d2818, #07170e)'
                  : 'linear-gradient(135deg, #e6f4ea, #d1fae5)',
                border: `1px solid ${isDark ? 'rgba(74,222,128,0.25)' : 'rgba(22,163,74,0.3)'}`,
                borderRadius: 28,
                padding: '56px 36px',
                textAlign: 'center',
                boxShadow: isDark
                  ? '0 20px 40px rgba(0,0,0,0.5)'
                  : '0 10px 30px rgba(22,163,74,0.1)',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 14px',
                  borderRadius: 999,
                  backgroundColor: C.primaryLight,
                  color: C.primary,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                <Award size={15} />
                2025-2026 Academic Pilot Program
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  letterSpacing: '-1px',
                  margin: '0 0 18px',
                  color: C.textPrimary,
                }}
              >
                Apply for Free Educator Access
              </h2>

              <p
                style={{
                  fontSize: '1.15rem',
                  color: C.textSecondary,
                  maxWidth: 720,
                  margin: '0 auto 36px',
                  lineHeight: 1.7,
                }}
              >
                We're working with 10 pilot colleges for the 2025-26 academic year. Get priority
                support, custom example circuits for your syllabus, and co-authorship on academic
                case studies.
              </p>

              {/* What pilot colleges receive */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 16,
                  maxWidth: 900,
                  margin: '0 auto 36px',
                  textAlign: 'left',
                }}
              >
                {[
                  'Custom syllabus circuit templates tailored to your course',
                  'Dedicated faculty & TA onboarding webinar',
                  'Feature request fast-tracking for specific lab requirements',
                  'Academic co-authorship on virtual lab publication',
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : '#ffffff',
                      padding: 16,
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <CheckCircle2 size={18} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13, lineHeight: 1.5, color: C.textPrimary }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href="mailto:educators@nodesimapp.com?subject=NodeSim%20Educator%20Pilot%20Application&body=Hello%20NodeSim%20Team%2C%0A%0AI%20am%20interested%20in%20the%20NodeSim%20Educator%20Pilot%20Program%20for%20our%20department.%0A%0AInstitution%20Name%3A%20%0ADepartment%3A%20%0ACourses%20Taught%3A%20%0AEstimated%20Number%20of%20Students%3A%20%0A%0AThank%20you!"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    backgroundColor: C.primary,
                    color: '#ffffff',
                    padding: '16px 36px',
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background-color 0.2s, transform 0.2s',
                    boxShadow: '0 12px 24px -6px rgba(22, 163, 74, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.primaryHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = C.primary;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Mail size={20} />
                  Apply Now * educators@nodesimapp.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </React.Fragment>
  );
}

// *****************************************************************************
// WORKSHEET STUB / PRINTABLE PAGE COMPONENT
// *****************************************************************************

interface WorksheetData {
  title: string;
  course: string;
  aim: string;
  components: string[];
  theory: string[];
  procedure: string[];
  tableHeaders: string[];
  sampleRows: string[][];
  vivaQuestions: string[];
}

const WORKSHEET_DETAILS: Record<string, WorksheetData> = {
  'rc-circuit-analysis': {
    title: 'RC Circuit Analysis - Transient and Frequency Response',
    course: 'Basic Electronics / Circuit Theory Lab',
    aim: 'To investigate the transient step response and frequency response characteristics of an RC low-pass network and determine its 3dB cutoff frequency.',
    components: [
      'Resistor: 1 k* (1/4 W)',
      'Capacitor: 0.1 *F (Ceramic/Film)',
      'Function Generator / Pulse Source (NodeSim or Hardware)',
      'Dual Channel Oscilloscope',
      'Connecting Probes and Breadboard',
    ],
    theory: [
      'The cutoff frequency (half-power frequency) of an RC low-pass filter is given by fc = 1 / (2*RC).',
      'For R = 1 k* and C = 0.1 *F, theoretical cutoff frequency is fc = 1 / (2* * 1000 * 0.1*10**) * 1.59 kHz.',
      'The time constant * = R * C = 100 *s. During charging, Vc(t) = Vin(1 - e^(-t/*)). At t = *, Vc reaches 63.2% of final value.',
      'In the frequency domain, the voltage transfer function is H(j*) = 1 / (1 + j*RC), with a phase shift of * = -arctan(*RC). At fc, gain drops to -3dB and phase is -45*.',
    ],
    procedure: [
      '1. Open NodeSim (or assemble the physical breadboard) with R = 1 k* in series with C = 0.1 *F connected to ground.',
      '2. Transient Analysis: Apply a 1 kHz square wave (0V to 5V). Observe the charging curve on Channel 2.',
      '3. Measure the rise time (10% to 90%) and determine the time constant * from the waveform.',
      '4. AC Frequency Sweep: Set input to a 2V peak-to-peak sinusoidal wave. Vary frequency from 100 Hz to 100 kHz.',
      '5. Record the output peak-to-peak voltage and phase angle at each frequency in the observation table.',
      '6. Plot Gain in dB vs. Frequency on semi-log graph paper and locate the -3dB cutoff point.',
    ],
    tableHeaders: ['Freq (Hz)', 'Vin (Vp-p)', 'Vout (Vp-p)', 'Gain (Vout/Vin)', 'Gain (dB = 20logAv)', 'Phase * (deg)'],
    sampleRows: [
      ['100 Hz', '2.00 V', '1.99 V', '0.995', '-0.04 dB', '-3.6*'],
      ['500 Hz', '2.00 V', '1.91 V', '0.954', '-0.41 dB', '-17.4*'],
      ['1.00 kHz', '2.00 V', '1.69 V', '0.846', '-1.45 dB', '-32.1*'],
      ['1.59 kHz (fc)', '2.00 V', '1.41 V', '0.707', '-3.01 dB', '-45.0*'],
      ['5.00 kHz', '2.00 V', '0.61 V', '0.303', '-10.37 dB', '-72.3*'],
      ['10.0 kHz', '2.00 V', '0.31 V', '0.157', '-16.08 dB', '-81.0*'],
    ],
    vivaQuestions: [
      '1. Why is the RC circuit called a low-pass filter? Explain its behavior at * = 0 and * * *.',
      '2. What is the relationship between the time constant * and the 10%-90% rise time tr?',
      '3. How does capacitor ESR affect the high-frequency attenuation of this filter?',
      '4. What is the roll-off rate of a first-order RC filter in dB per decade and dB per octave?',
    ],
  },
  'op-amp-configurations': {
    title: 'Operational Amplifier Configurations - Inverting, Non-Inverting, and Summing',
    course: 'Linear Integrated Circuits (LIC) Lab',
    aim: 'To design, simulate, and verify inverting, non-inverting, and summing operational amplifier configurations using LM741 / ideal SPICE op-amp.',
    components: [
      'Operational Amplifier IC (LM741 or OP07)',
      'Resistors: R1 = 10 k*, Rf = 100 k*, 47 k*, 22 k* (1/4 W)',
      'Dual DC Power Supply (*15 V)',
      'Audio / Function Signal Generator',
      'Dual Channel Digital Storage Oscilloscope (DSO)',
    ],
    theory: [
      'An ideal op-amp exhibits infinite open-loop gain (Aol * *), infinite input impedance (Rin * *), and zero output impedance (Rout = 0).',
      'Inverting Amplifier: The non-inverting terminal is grounded. Due to negative feedback, node V- is maintained at virtual ground (V- * 0V). Voltage gain is Av = -Rf / R1.',
      'Non-Inverting Amplifier: The input is applied directly to V+. The closed-loop gain is Av = 1 + (Rf / R1), with zero phase inversion.',
      'Summing Amplifier: Multiple input currents are summed at the inverting virtual ground node: Vout = -Rf * (V1/R1 + V2/R2 + ...).',
    ],
    procedure: [
      '1. Inverting Setup: Connect dual supplies *15V to pins 7 and 4 of LM741. Connect R1 = 10 k* to inverting pin 2 and Rf = 100 k* across pins 2 and 6.',
      '2. Ground pin 3 through a compensating resistor Rcomp = R1 || Rf * 9.1 k*.',
      '3. Apply a 1 kHz, 100 mVp-p sine wave at the input. Measure Vout and verify Av = -10.',
      '4. Non-Inverting Setup: Connect input to pin 3. Connect R1 from pin 2 to ground and Rf from pin 2 to pin 6. Measure gain and phase.',
      '5. Increase input amplitude until clipping occurs to observe the positive and negative output voltage saturation limits.',
    ],
    tableHeaders: ['Configuration', 'R1 (k*)', 'Rf (k*)', 'Theoretical Av', 'Vin (mVp-p)', 'Vout (Vp-p)', 'Measured Av', 'Phase Shift'],
    sampleRows: [
      ['Inverting (Gain 5)', '10 k*', '47 k*', '-4.7', '200 mV', '0.94 V', '-4.70', '180*'],
      ['Inverting (Gain 10)', '10 k*', '100 k*', '-10.0', '100 mV', '1.00 V', '-10.0', '180*'],
      ['Non-Inverting (Gain 5)', '10 k*', '39 k*', '+4.9', '200 mV', '0.98 V', '+4.90', '0*'],
      ['Non-Inverting (Gain 11)', '10 k*', '100 k*', '+11.0', '100 mV', '1.10 V', '+11.0', '0*'],
    ],
    vivaQuestions: [
      '1. What is the physical meaning of "Virtual Ground" and why does it not draw current?',
      '2. Why is a compensating resistor placed at the non-inverting terminal in bipolar op-amps?',
      '3. What defines the Slew Rate of an op-amp and how does it distort high-frequency square waves?',
      '4. How do supply rails *Vcc constrain the maximum undistorted peak-to-peak output swing?',
    ],
  },
  'bjt-amplifier': {
    title: 'BJT Common Emitter Amplifier - Biasing & Frequency Response',
    course: 'Electronic Devices & Circuits (EDC) Lab',
    aim: 'To design a voltage divider biased NPN Common Emitter (CE) amplifier, establish its Q-point, and evaluate its frequency response and midband voltage gain.',
    components: [
      'NPN Transistor: 2N2222 or BC547B',
      'Resistors: R1 = 47 k*, R2 = 10 k*, Rc = 2.2 k*, Re = 1 k*, RL = 10 k*',
      'Capacitors: Cin = 10 *F, Cout = 10 *F, Bypass Ce = 100 *F',
      'DC Power Supply: +12 V',
      'Function Generator & Digital Oscilloscope',
    ],
    theory: [
      'Voltage divider biasing provides stable operating point (Q-point) against transistor temperature drift and * variation.',
      'Base voltage VB = Vcc * R2 / (R1 + R2). Emitter voltage VE = VB - VBE (where VBE * 0.7 V). Collector current IC * IE = VE / Re.',
      'The bypass capacitor Ce shorts the AC emitter degeneration, providing high midband voltage gain Av * -gm(Rc || RL) = -(IC / 26mV) * (Rc || RL).',
      'At low frequencies, coupling capacitors Cin and Cout and bypass capacitor Ce roll off gain (fL). At high frequencies, internal parasitic capacitances Cbe and Cbc reduce gain (fH).',
    ],
    procedure: [
      '1. DC Q-Point Check: Apply Vcc = +12V without AC signal. Measure DC voltages VB, VE, VC with DMM or NodeSim operating point probe.',
      '2. Calculate collector-emitter voltage VCE = VC - VE and collector current IC = (Vcc - VC) / Rc.',
      '3. AC Gain Measurement: Inject a 1 kHz, 20 mVp-p sine wave into Cin. Observe Vout at RL and compute Av = Vout / Vin.',
      '4. Frequency Response: Sweep input frequency from 20 Hz to 2 MHz. Maintain constant Vin = 20 mVp-p.',
      '5. Record Vout at each decade, identify lower cutoff fL and upper cutoff fH, and determine bandwidth BW = fH - fL.',
    ],
    tableHeaders: ['Frequency', 'Vin (mVp-p)', 'Vout (Vp-p)', 'Voltage Gain Av', 'Gain in dB (20logAv)', 'Remarks'],
    sampleRows: [
      ['50 Hz', '20 mV', '0.22 V', '11.0', '20.8 dB', 'Low Freq Roll-off'],
      ['200 Hz', '20 mV', '0.98 V', '49.0', '33.8 dB', 'Lower 3dB Cutoff (fL)'],
      ['1.0 kHz', '20 mV', '1.40 V', '70.0', '36.9 dB', 'Midband Region'],
      ['10.0 kHz', '20 mV', '1.40 V', '70.0', '36.9 dB', 'Midband Region'],
      ['100 kHz', '20 mV', '1.38 V', '69.0', '36.8 dB', 'Midband Region'],
      ['500 kHz', '20 mV', '0.99 V', '49.5', '33.9 dB', 'Upper 3dB Cutoff (fH)'],
    ],
    vivaQuestions: [
      '1. Why is the Common Emitter amplifier the most widely used configuration for voltage amplification?',
      '2. What happens to voltage gain and stability if the emitter bypass capacitor Ce is removed?',
      '3. Explain the Miller effect on capacitor Cbc and its influence on upper cutoff frequency fH.',
      '4. What conditions must be satisfied for a transistor to operate in the linear active region?',
    ],
  },
  'rectifier-and-filter': {
    title: 'Diode Rectifiers & Capacitor Smoothing Filter Design',
    course: 'Basic Electrical & Electronics Engineering Lab',
    aim: 'To compare the rectification efficiency, ripple factor, and peak inverse voltage of Half-Wave and Full-Wave Bridge Rectifiers with and without C-filter.',
    components: [
      'Silicon Diodes: 4* 1N4007 (1A, 1000V PIV)',
      'Step-Down Center-Tapped Transformer: 230V to 12-0-12V AC (or AC source in NodeSim)',
      'Load Resistors: 1 k*, 2.2 k* (2 W)',
      'Filter Capacitors: 47 *F, 470 *F, 1000 *F (25V Electrolytic)',
      'DSO and True-RMS Digital Multimeter',
    ],
    theory: [
      'A rectifier converts alternating current (AC) into pulsating direct current (DC).',
      'Half-Wave Rectifier: Conduction occurs for only 180* of the input AC cycle. Theoretical ripple factor * = 1.21, maximum efficiency * = 40.6%. PIV = Vm.',
      'Full-Wave Bridge Rectifier: Conduction occurs during both half cycles through alternating diode pairs (D1-D2 and D3-D4). Theoretical ripple factor * = 0.482, efficiency * = 81.2%. PIV = Vm.',
      'Capacitor Smoothing Filter: The capacitor charges to peak voltage Vm and discharges slowly into RL during diode non-conduction. Ripple factor with filter: * * 1 / (4*3 * f * C * RL) for full-wave.',
    ],
    procedure: [
      '1. Half-Wave Circuit: Connect a 12V RMS 50Hz AC source through 1N4007 diode into RL = 1 k*.',
      '2. Measure DC output voltage Vdc and AC ripple voltage Vac using True-RMS multimeter and DSO.',
      '3. Full-Wave Bridge: Assemble 4 diodes in bridge formation. Measure Vdc, Vac ripple, and observe the 100Hz ripple frequency.',
      '4. Connect filter capacitor C = 470 *F in parallel with RL. Note reduction in ripple voltage and increase in average Vdc.',
      '5. Calculate practical ripple factor * = Vac(rms) / Vdc and compare with theoretical predictions.',
    ],
    tableHeaders: ['Rectifier Type', 'Filter Cap', 'Vin (Vrms)', 'Vdc (V)', 'Vac Ripple (Vrms)', 'Ripple Factor *', 'Efficiency * (%)'],
    sampleRows: [
      ['Half-Wave', 'None', '12.0 V', '5.20 V', '6.30 V', '1.21', '38.5%'],
      ['Half-Wave', '470 *F', '12.0 V', '14.8 V', '0.85 V', '0.057', '82.0%'],
      ['Full-Wave Bridge', 'None', '12.0 V', '10.5 V', '5.10 V', '0.485', '78.2%'],
      ['Full-Wave Bridge', '47 *F', '12.0 V', '15.1 V', '1.10 V', '0.073', '88.5%'],
      ['Full-Wave Bridge', '470 *F', '12.0 V', '15.8 V', '0.22 V', '0.014', '94.2%'],
    ],
    vivaQuestions: [
      '1. Why is the ripple factor of a full-wave rectifier significantly lower than a half-wave rectifier?',
      '2. Why is the Peak Inverse Voltage (PIV) rating of bridge rectifier diodes half that of center-tapped transformers?',
      '3. Explain the relationship between load current, filter capacitance, and ripple voltage.',
      '4. What causes the high initial surge current when the filter capacitor is energized at peak AC voltage?',
    ],
  },
};

// Aliases to handle alternate slug formats (e.g. opamp vs op-amp, rectifier-filter vs rectifier-and-filter)
WORKSHEET_DETAILS['opamp-configurations'] = WORKSHEET_DETAILS['op-amp-configurations'];
WORKSHEET_DETAILS['rectifier-filter'] = WORKSHEET_DETAILS['rectifier-and-filter'];

const SLUG_ALIASES: Record<string, string> = {
  'opamp-configurations': 'op-amp-configurations',
  'rectifier-filter': 'rectifier-and-filter',
};

export function WorksheetPage() {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const resolvedSlug = slug ? (SLUG_ALIASES[slug] || slug) : '';
  const validSlug = resolvedSlug && WORKSHEET_DETAILS[resolvedSlug] ? resolvedSlug : 'rc-circuit-analysis';
  const data = WORKSHEET_DETAILS[validSlug];

  const handlePrint = () => {
    window.print();
  };

  return (
    <React.Fragment>
      <SEO
        title={`${data.title} - Lab Worksheet | NodeSim`}
        description={`Download and print the official ECE/EEE lab worksheet for ${data.title}. Includes pre-lab calculations, schematic, observation tables, and post-lab viva questions.`}
        url={`https://nodesimapp.com/educators/worksheets/${validSlug}`}
      />

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .worksheet-container {
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Action / Navigation Bar (Hidden when printed) */}
      <div
        className="no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: isDark ? '#0d1a12' : '#ffffff',
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            to="/educators#worksheets"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} /> Back to Educators
          </Link>
          <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }}>|</span>
          <span style={{ color: isDark ? '#4ade80' : '#16a34a', fontSize: 13, fontWeight: 700 }}>
            {data.course}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/simulator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              color: isDark ? '#f1f5f9' : '#0f172a',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
            }}
          >
            Open in Simulator <ExternalLink size={14} />
          </Link>

          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
            }}
          >
            <Printer size={15} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet View */}
      <div
        style={{
          backgroundColor: isDark ? '#060a08' : '#f1f5f9',
          minHeight: '100vh',
          padding: '40px 16px 80px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#0f172a',
          transition: 'background-color 0.25s ease',
        }}
      >
        <div
          className="worksheet-container"
          style={{
            maxWidth: 880,
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #cbd5e1',
            padding: '48px 56px',
            boxSizing: 'border-box',
          }}
        >
          {/* Institution & Lab Header */}
          <div
            style={{
              borderBottom: '2px solid #0f172a',
              paddingBottom: 20,
              marginBottom: 28,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#16a34a',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              NodeSim Open Educational Resources * Department of ECE &amp; EEE
            </div>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                margin: '6px 0',
                color: '#0f172a',
              }}
            >
              {data.title}
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
              Course: {data.course} * Simulation &amp; Physical Lab Verification Sheet
            </div>
          </div>

          {/* Student Record Meta Box */}
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
                border: '1px solid #cbd5e1',
                minWidth: 480,
              }}
            >
            <tbody>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, width: '18%', backgroundColor: '#f8fafc' }}>
                  Student Name:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', width: '32%' }}></td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, width: '18%', backgroundColor: '#f8fafc' }}>
                  Roll / Reg No:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', width: '32%' }}></td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                  Department:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>ECE / EEE</td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                  Date of Lab:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                  Semester / Section:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                  Faculty Signature:
                </td>
                <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}></td>
              </tr>
            </tbody>
          </table>

          {/* Section 1: Aim */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
              1. Aim &amp; Objective
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#334155', margin: 0 }}>
              {data.aim}
            </p>
          </div>

          {/* Section 2: Components Required */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
              2. Components &amp; Apparatus Required
            </h2>
            <ul style={{ fontSize: 13, lineHeight: 1.6, color: '#334155', margin: 0, paddingLeft: 20 }}>
              {data.components.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Section 3: Theory & Formulae */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
              3. Theory &amp; Governing Equations
            </h2>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
              {data.theory.map((t, i) => (
                <p key={i} style={{ margin: '0 0 6px' }}>
                  * {t}
                </p>
              ))}
            </div>
          </div>

          {/* Section 4: Procedure */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
              4. Experimental Procedure
            </h2>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
              {data.procedure.map((p, i) => (
                <p key={i} style={{ margin: '0 0 6px' }}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Section 5: Observation Table */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 12 }}>
              5. Observation Table &amp; Results
            </h2>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
                border: '1px solid #0f172a',
                textAlign: 'center',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 700 }}>S.No</th>
                  {data.tableHeaders.map((th, i) => (
                    <th key={i} style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 700 }}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.sampleRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 600 }}>{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* 3 Empty Rows for Student Lab Measurements */}
                {[1, 2, 3].map((emptyIdx) => (
                  <tr key={`empty-${emptyIdx}`}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '12px 6px', fontWeight: 600 }}>
                      {data.sampleRows.length + emptyIdx}
                    </td>
                    {data.tableHeaders.map((_, i) => (
                      <td key={i} style={{ border: '1px solid #cbd5e1', padding: '12px 6px' }}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 6: Graph & Waveform Sketch Grid */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8 }}>
              6. Waveform / Response Curve Sketch
            </h2>
            <div
              style={{
                height: 180,
                border: '1px dashed #94a3b8',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: 12,
                backgroundColor: '#fafafa',
              }}
            >
              [ Attach NodeSim Waveform Screenshot or Draw Observed Oscilloscope Plot Here ]
            </div>
          </div>

          {/* Section 7: Post-Lab Viva Questions */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 12 }}>
              7. Post-Lab Viva &amp; Analysis Questions
            </h2>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
              {data.vivaQuestions.map((q, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 600 }}>{q}</p>
                  <div
                    style={{
                      height: 38,
                      borderBottom: '1px dotted #94a3b8',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer attribution */}
          <div
            style={{
              borderTop: '1px solid #cbd5e1',
              paddingTop: 16,
              fontSize: 11,
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>NodeSim Open Courseware * https://nodesimapp.com/educators</span>
            <span>Free for Academic Use * No Commercial Attribution Required</span>
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}

export default EducatorsPage;
