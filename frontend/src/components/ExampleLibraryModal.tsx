import { X, Activity, Zap, Cpu, Waves } from 'lucide-react';
import { useSchematicStore } from '../store/useSchematicStore';

// Static imports for the example JSON files
import lowPassFilter from '../examples/low_pass_filter.json';
import bridgeRectifier from '../examples/bridge_rectifier.json';
import invertingOpamp from '../examples/inverting_opamp.json';
import astable555 from '../examples/astable_555.json';

const EXAMPLES = [
  {
    id: 'lpf',
    name: 'RC Low-Pass Filter',
    description: 'A basic first-order passive filter that passes low-frequency signals and attenuates high frequencies.',
    icon: <Waves size={24} className="text-blue-500" />,
    data: lowPassFilter
  },
  {
    id: 'rectifier',
    name: 'Bridge Rectifier',
    description: 'Converts alternating current (AC) to direct current (DC) using four diodes in a bridge configuration.',
    icon: <Zap size={24} className="text-yellow-500" />,
    data: bridgeRectifier
  },
  {
    id: 'opamp',
    name: 'Inverting Amplifier',
    description: 'An operational amplifier circuit that outputs a signal which is out of phase with its input by 180 degrees.',
    icon: <Activity size={24} className="text-green-500" />,
    data: invertingOpamp
  },
  {
    id: '555',
    name: '555 Astable Oscillator',
    description: 'A classic 555 timer circuit configured to generate a continuous square wave (clock pulse).',
    icon: <Cpu size={24} className="text-purple-500" />,
    data: astable555
  }
];

export function ExampleLibraryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { components, importState } = useSchematicStore();

  if (!isOpen) return null;

  const handleSelect = (data: any) => {
    if (components.length > 0) {
      if (!window.confirm("Loading this example will overwrite your current circuit. Continue?")) {
        return;
      }
    }
    importState(JSON.stringify(data));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Example Circuits Library</h2>
            <p className="text-sm text-gray-500 mt-1">Select a template to instantly load a pre-built circuit.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLES.map(ex => (
              <div 
                key={ex.id}
                onClick={() => handleSelect(ex.data)}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group flex gap-4 items-start"
              >
                <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {ex.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{ex.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-snug">{ex.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
