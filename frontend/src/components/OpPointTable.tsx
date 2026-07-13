import React, { useState } from 'react';
import { useSchematicStore } from '../store/useSchematicStore';
import { Download } from 'lucide-react';

function formatEngineering(value: number): string {
  if (value === 0) return '0.00 ';
  const absVal = Math.abs(value);
  if (absVal < 1e-12) return value.toExponential(2) + ' ';
  if (absVal < 1e-9) return (value * 1e12).toFixed(2) + ' p';
  if (absVal < 1e-6) return (value * 1e9).toFixed(2) + ' n';
  if (absVal < 1e-3) return (value * 1e6).toFixed(2) + ' µ';
  if (absVal < 1) return (value * 1e3).toFixed(2) + ' m';
  if (absVal < 1e3) return value.toFixed(3) + ' ';
  if (absVal < 1e6) return (value / 1e3).toFixed(2) + ' k';
  if (absVal < 1e9) return (value / 1e6).toFixed(2) + ' M';
  return value.toExponential(2) + ' ';
}

export const OpPointTable: React.FC = () => {
  const { opData } = useSchematicStore();
  const [sortField, setSortField] = useState<'node' | 'value'>('node');
  const [sortDesc, setSortDesc] = useState<boolean>(false);

  if (!opData || opData.length === 0) return null;

  const sortedData = [...opData].sort((a, b) => {
    if (sortField === 'node') {
      const cmp = a.node.localeCompare(b.node);
      return sortDesc ? -cmp : cmp;
    } else {
      const cmp = Math.abs(a.value) - Math.abs(b.value);
      return sortDesc ? -cmp : cmp;
    }
  });

  const toggleSort = (field: 'node' | 'value') => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(field === 'value'); // Default to descending for value
    }
  };

  const handleExport = () => {
    const csv = "Node/Branch,Value,Unit\n" + opData.map(d => `${d.node},${d.value},${d.unit}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'operating_point.csv';
    a.click();
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '18px' }}>DC Operating Point</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Steady-state voltages and currents</p>
        </div>
        <button 
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
              <th onClick={() => toggleSort('node')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Node / Branch {sortField === 'node' && (sortDesc ? '▼' : '▲')}
              </th>
              <th onClick={() => toggleSort('value')} style={{ padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}>
                Value Magnitude {sortField === 'value' && (sortDesc ? '▼' : '▲')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', color: '#111827', fontWeight: 500, fontFamily: 'monospace' }}>
                  {row.node}
                </td>
                <td style={{ padding: '12px 16px', color: '#4b5563', fontFamily: 'monospace' }}>
                  {formatEngineering(row.value)}{row.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
