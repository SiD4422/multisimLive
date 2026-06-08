import re

# Update App.tsx
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_disabled(m):
    full = m.group(0)
    inner = m.group(1)
    comp_type = inner.replace(' ', '').replace('...', '').replace('-', '')
    if comp_type == 'More': return full # don't activate 'More' button
    new_div = re.sub(r' disabled(?: bg-gray-200)?', '', full)
    new_div = new_div.replace('<div className="flyout-item"', f'<div className="flyout-item" onClick={{() => handleSelectComponent(\'{comp_type}\', \'\')}}')
    return new_div

pattern = r'<div className="flyout-item disabled(?: bg-gray-200)?">.*?<span>(.*?)</span></div>'
new_content = re.sub(pattern, replace_disabled, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Update SchematicEditor.tsx
with open('src/components/SchematicEditor.tsx', 'r', encoding='utf-8') as f:
    sch = f.read()

mappings = '''
    else if (comp.type === 'LED') el = <KiCadSymbol {...sharedProps} symbolName="LED" />;
    else if (comp.type === 'BridgeRectifier') el = <KiCadSymbol {...sharedProps} symbolName="D_Bridge_+AA-" />;
    else if (comp.type === 'JFET') el = <KiCadSymbol {...sharedProps} symbolName="Q_NJFET_DGS" />;
    else if (comp.type === 'IGBT') el = <KiCadSymbol {...sharedProps} symbolName="Q_NIGBT_CEG" />;
    else if (comp.type === 'SPDTSwitch') el = <KiCadSymbol {...sharedProps} symbolName="SW_SPDT" />;
    else if (comp.type === 'PushButton') el = <KiCadSymbol {...sharedProps} symbolName="SW_Push" />;
    else if (comp.type === 'Relay') el = <KiCadSymbol {...sharedProps} symbolName="Relay_SPDT" />;
    else if (comp.type === 'Transformers') el = <KiCadSymbol {...sharedProps} symbolName="Transformer_1P_1S" />;
    else if (comp.type === 'CoupledInductors') el = <KiCadSymbol {...sharedProps} symbolName="Transformer_1P_1S" />;
    else if (comp.type === 'Resistors') el = <KiCadSymbol {...sharedProps} symbolName="R_Pack04" />;
    else if (comp.type === 'Connector') el = <KiCadSymbol {...sharedProps} symbolName="Conn_01x01" />;
    else if (comp.type === 'Junction') el = <Ground {...sharedProps} />;
    else if (comp.type.includes('Voltage') || comp.type.includes('Current') || comp.type.includes('Noise') || comp.type.includes('Phase')) el = <ACSource {...sharedProps} />;
    else if (comp.type.includes('Probe') || comp.type.includes('Digital')) el = <VoltageProbe {...sharedProps} />;
'''

sch = sch.replace('else if (comp.type === \'SwitchSPST\') el = <KiCadSymbol {...sharedProps} symbolName="SW_SPST" />;', 'else if (comp.type === \'SwitchSPST\') el = <KiCadSymbol {...sharedProps} symbolName="SW_SPST" />;' + mappings)

with open('src/components/SchematicEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(sch)
