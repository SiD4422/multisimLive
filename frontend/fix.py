import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('{/* Dynamic Flyout Menu */}')
if idx != -1:
    content = content[:idx] + """{/* Dynamic Flyout Menu */}
              {activeCategory && activeCategory !== 'search' && (
                <div className="sidebar-flyout" style={{ '--arrow-top': `${arrowTop}px`, top: `calc(${arrowTop}px - 20px)` } as React.CSSProperties}>
                  {activeCategory === 'analysis' && (
                    <>
                      <div className="flyout-header">Analysis and annotation</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('ProbeVoltage', '')}><IconProbeVoltage size={48} /><span>Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ProbeCurrent', '')}><IconProbeCurrent size={48} /><span>Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('VoltageandCurrent', '')}><IconProbeVA size={48} /><span>Voltage and Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('VoltageReference', '')}><IconProbeRef size={48} /><span>Voltage Reference</span></div>
                        <div className="flyout-item disabled"><span className="text-green-500 font-bold mt-1 text-2xl">E</span><span className="text-gray-500 mt-2">Expression</span></div>
                        <div className="flyout-item disabled"><span className="text-green-500 font-bold mt-1 text-2xl">D</span><span className="text-gray-500 mt-2">Data</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TextAnnotation', 'Text')}><span className="text-blue-500 font-bold mt-1 text-2xl">Abc</span><span className="text-gray-700 mt-2">Text Annotation</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Digital', '')}><IconProbeDigital size={48} /><span>Digital</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'connectors' && (
                    <>
                      <div className="flyout-header">Schematic connectors</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Ground', '0')}><IconGround size={48} /><span>Ground</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Connector', '')}><IconConnector size={48} /><span>Connector</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Junction', '')}><IconJunction size={48} /><span>Junction</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'sources' && (
                    <>
                      <div className="flyout-header">Sources</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('ACSource', '1Vpk 1kHz')}><IconACVoltage size={48} /><span>AC Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ACCurrent', '1A')}><IconACVoltage size={48} /><span>AC Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ClockVoltage', '5V')}><IconPulseVoltage size={48} /><span>Clock Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ClockCurrent', '')}><IconPulseVoltage size={48} /><span>Clock Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TriangularVoltage', '')}><IconACVoltage size={48} /><span>Triangular Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TriangularCurrent', '')}><IconACVoltage size={48} /><span>Triangular Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DCSource', '5V')}><IconDCVoltage size={48} /><span>DC Voltage (VCC)</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DCCurrent', '1A')}><IconDCVoltage size={48} /><span>DC Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('StepVoltage', '')}><IconPulseVoltage size={48} /><span>Step Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('StepCurrent', '')}><IconPulseVoltage size={48} /><span>Step Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PulseVoltage', '5V')}><IconPulseVoltage size={48} /><span>Pulse Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PulseCurrent', '')}><IconPulseVoltage size={48} /><span>Pulse Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('AMVoltage', '')}><IconACVoltage size={48} /><span>AM Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('FMVoltage', '')}><IconACVoltage size={48} /><span>FM Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('FMCurrent', '')}><IconACVoltage size={48} /><span>FM Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ChirpVoltage', '')}><IconPulseVoltage size={48} /><span>Chirp Voltage</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ChirpCurrent', '')}><IconPulseVoltage size={48} /><span>Chirp Current</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThermalNoise', '')}><IconACVoltage size={48} /><span>Thermal Noise</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryVoltageSource', '')}><IconACVoltage size={48} /><span>Arbitrary Voltage Source</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ArbitraryCurrentSource', '')}><IconACVoltage size={48} /><span>Arbitrary Current Source</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseDelta', '')}><IconACVoltage size={48} /><span>Three Phase Delta</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('ThreePhaseWye', '')}><IconACVoltage size={48} /><span>Three Phase Wye</span></div>
                        <div className="flyout-item disabled"><Search size={48} color="#6b7280" /><span>More</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'passives' && (
                    <>
                      <div className="flyout-header">Passive</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Resistor', '1k')}><IconResistor size={48} /><span>Resistor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Capacitor', '1µF')}><IconCapacitor size={48} /><span>Capacitor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Inductor', '1mH')}><IconInductor size={48} /><span>Inductor</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Potentiometer', '10k')}><IconPotentiometer size={48} /><span>Potentiometer</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Fuse', '')}><IconFuse size={48} /><span>Fuse</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Transformers', '')}><IconTransformers size={48} /><span>Transformers...</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('CoupledInductors', '')}><IconCoupledInductors size={48} /><span>Coupled Inductors</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LossyTransmissionLine', '')}><IconLossyTransmissionLine size={48} /><span>Lossy Transmission Line</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LosslessTransmissionLine', '')}><IconLosslessTransmissionLine size={48} /><span>Lossless Transmission Line</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Resistors', '')}><IconResistorsPack size={48} /><span>Resistors...</span></div>
                      </div>
                    </>
                  )}

                  {activeCategory === 'analog' && (
                    <>
                      <div className="flyout-header">Analog</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamp', 'LM324')}><IconOpamp size={48} /><span>3 Terminal Opamp</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamp5', 'LM741')}><IconOpamp size={48} /><span>5 Terminal Opamp</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Comparator', 'LM311')}><IconOpamp size={48} /><span>Ideal Comparator</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Timer555', 'NE555')}><IconOpamp size={48} /><span>555 Timer</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Opamps', '')}><IconOpamp size={48} /><span>Opamps...</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Comparators', '')}><IconOpamp size={48} /><span>Comparators...</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'diodes' && (
                    <>
                      <div className="flyout-header">Diodes</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('Diode', '1N4148')}><IconDiode size={48} /><span>Diode</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DiodeZener', '1N4728A')}><IconDiode size={48} /><span>Zener Diode</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('DiodeSchottky', 'BAT54')}><IconDiode size={48} /><span>Schottky Diode</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('LED', '')}><IconDiode size={48} /><span>LED</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('BridgeRectifier', '')}><IconDiode size={48} /><span>Bridge Rectifier</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'transistors' && (
                    <>
                      <div className="flyout-header">Transistors</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('TransistorNPN', '2N3904')}><IconTransistor size={48} /><span>NPN BJT</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('TransistorPNP', '2N3906')}><IconTransistor size={48} /><span>PNP BJT</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('MosfetN', '2N7000')}><IconTransistor size={48} /><span>N-Ch MOSFET</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('MosfetP', 'BSS84')}><IconTransistor size={48} /><span>P-Ch MOSFET</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('JFET', '')}><IconTransistor size={48} /><span>JFET</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('IGBT', '')}><IconTransistor size={48} /><span>IGBT</span></div>
                      </div>
                    </>
                  )}
                  
                  {activeCategory === 'switches' && (
                    <>
                      <div className="flyout-header">Switches</div>
                      <div className="flyout-grid">
                        <div className="flyout-item" onClick={() => handleSelectComponent('SwitchSPST', 'SW1')}><IconSwitch size={48} /><span>SPST Switch</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('SPDTSwitch', '')}><IconSwitch size={48} /><span>SPDT Switch</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('PushButton', '')}><IconSwitch size={48} /><span>Push Button</span></div>
                        <div className="flyout-item" onClick={() => handleSelectComponent('Relay', '')}><IconSwitch size={48} /><span>Relay</span></div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Canvas Area */}
          <div className="canvas-container flex-1 flex flex-col md:flex-row overflow-hidden">
            {(activeView === 'schematic' || activeView === 'split') && (
              <div className={`canvas-wrapper relative ${activeView === 'split' ? 'w-1/2 border-r border-gray-300' : 'w-full'}`} id="canvas-wrapper">
                
                <div className="floating-toolbar">
                  <FileCode size={20} className="cursor-pointer hover:text-black" onClick={handleExportNetlist} />
                  <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  <Undo size={20} className={`cursor-pointer ${past.length > 0 ? 'hover:text-black' : 'opacity-30 cursor-not-allowed'}`} onClick={undo} />
                  <Redo size={20} className={`cursor-pointer ${future.length > 0 ? 'hover:text-black' : 'opacity-30 cursor-not-allowed'}`} onClick={redo} />
                  <div style={{ width: '1px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                  
                  {/* Zoom Controls */}
                  <ZoomOut size={20} className="cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(Math.max(0.5, scale - 0.1))} />
                  <span className="text-sm font-semibold w-12 text-center select-none cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(1)}>{Math.round(scale * 100)}%</span>
                  <ZoomIn size={20} className="cursor-pointer hover:text-green-600 transition-colors" onClick={() => setScale(Math.min(2, scale + 0.1))} />
                </div>

                <SchematicEditor />
              </div>
            )}
            
            {(activeView === 'grapher' || activeView === 'split') && (
              <div className={`relative ${activeView === 'split' ? 'w-1/2' : 'w-full'} h-full bg-white`}>
                <Grapher />
              </div>
            )}
          </div>

          {/* Right Configuration Panel */}
          <ComponentInspectorPanel />
        </div>
      </div>
    </div>
  );
}

export default App;
"""
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
