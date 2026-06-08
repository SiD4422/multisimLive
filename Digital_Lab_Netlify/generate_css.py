import base64
import os

svgs = {
    'Wire': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M2 12h20" stroke="#475569" stroke-width="2" fill="none"/></svg>',
    'Resistor': '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#475569" stroke-width="1.8" fill="none" stroke-linejoin="bevel" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 h4 l2 -5 l4 10 l4 -10 l4 10 l2 -5 h2" /></svg>',
    'Capacitor': '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#475569" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v7 m-6 0h12 m-12 4h12 m-6 0v7" /><path d="M6 5 h4 m-2 -2 v4" stroke-width="1.5" /></svg>',
    'Inductor': '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#475569" stroke-width="2" fill="none" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 h3 c0 -3.5 4 -3.5 4 0 c0 -3.5 4 -3.5 4 0 c0 -3.5 4 -3.5 4 0 h5" /></svg>',
    'Ground': '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#475569" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5 v7 m-5 0 h10 m-3 4 h6" /><circle cx="12" cy="19.5" r="1" fill="#475569" stroke="none" /></svg>',
    'Diode': '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#475569" stroke-width="2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 h6 m0 -5 v10 l8 -5 l-8 -5 m8 0 v10 m0 -5 h6" /></svg>',
    
    'Current Source': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M12 17 v-10 m-3 3 l3 -3 l3 3" stroke="#475569" stroke-width="2" fill="none"/></svg>',
    'Potentiometer': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M2 16 h3 l2 -5 l4 10 l4 -10 l4 10 l2 -5 h3" stroke="#475569" stroke-width="1.8" fill="none" stroke-linejoin="bevel"/><path d="M12 2 v9 m-3 -3 l3 3 l3 -3" stroke="#475569" stroke-width="1.8" fill="none"/></svg>',
    'Transformer': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 4 c-3.5 0 -3.5 4 0 4 c-3.5 0 -3.5 4 0 4 c-3.5 0 -3.5 4 0 4 c-3.5 0 -3.5 4 0 4 M17 4 c3.5 0 3.5 4 0 4 c3.5 0 3.5 4 0 4 c3.5 0 3.5 4 0 4 c3.5 0 3.5 4 0 4 M11 4v16 M13 4v16" stroke="#475569" stroke-width="1.5" fill="none"/></svg>',
    'Fuse': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="9" width="12" height="6" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h20" stroke="#475569" stroke-width="2"/></svg>',
    'LED': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h5 m0 -5v10 l7 -5 l-7 -5 m7 0v10 m0 -5h5 M14 7 l3 -3 m0 0 v3 m0 -3 h-3 M18 9 l3 -3 m0 0 v3 m0 -3 h-3" stroke="#475569" stroke-width="1.8" fill="none"/></svg>',
    'Lamp': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2 M8 8 l8 8 M8 16 l8 -8" stroke="#475569" stroke-width="2" fill="none"/></svg>',
    'Text': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M5 6 h14 M12 6 v14" stroke="#475569" stroke-width="2.5" fill="none"/></svg>',
    
    'Voltmeter/Scope': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16.5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">V</text></svg>',
    'Ohmmeter': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16.5" font-family="sans-serif" font-size="15" font-weight="bold" fill="#475569" text-anchor="middle">Ω</text></svg>',
    'Ammeter': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16.5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">A</text></svg>',
    'Wattmeter': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16.5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">W</text></svg>',
    
    'DC Motor': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><path d="M2 12 h2 m16 0 h2" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16.5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#475569" text-anchor="middle">M</text></svg>',
    '3-Phase Motor': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="16" font-family="sans-serif" font-size="10" font-weight="bold" fill="#475569" text-anchor="middle">3~</text></svg>',
    
    'Voltage Source (2-terminal)': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 h8 M14 12 h8 M10 6 v12 M14 8 v8" stroke="#475569" stroke-width="2" fill="none"/></svg>',
    'Voltage Source (1-terminal)': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 20 v-12 l-3 3 m3 -3 l3 3" stroke="#475569" stroke-width="2" fill="none"/><text x="12" y="7" font-family="sans-serif" font-size="8" font-weight="bold" fill="#475569" text-anchor="middle">+V</text></svg>',
    'Switch': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M2 12 h4 M18 12 h4 M6 12 l10 -4" stroke="#475569" stroke-width="2" fill="none"/><circle cx="6" cy="12" r="1.5" fill="#475569"/><circle cx="17" cy="12" r="1.5" fill="#475569"/></svg>',
    'Op Amp': '<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M5 4 l12 8 l-12 8 z" stroke="#475569" stroke-width="2" fill="none"/><path d="M1 8 h4 m-4 8 h4 m12 -4 h5 M7 8 h2 M7 16 h2 M8 15 v2" stroke="#475569" stroke-width="2" fill="none"/></svg>'
}

css_rules = """
    /* Absolute Foolproof CSS Base64 SVG Replacement - TARGETING INLINE SVG */
"""

# First hide all the original SVGs
for name in svgs.keys():
    css_rules += f'    .toolbar-icon-button[title*="{name}"] svg,\n'

# Remove the trailing comma and newline, and add the block
css_rules = css_rules.rstrip(',\n') + """ {
        opacity: 0 !important;
    }
"""

# Now apply the background images
for name, svg in svgs.items():
    b64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    css_rules += f"""
    .toolbar-icon-button[title*="{name}"] {{
        background-image: url('data:image/svg+xml;base64,{b64}') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: 26px !important;
    }}
"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Completely remove ANY previous CSS replacements
while True:
    start1 = content.find('/* Absolute Foolproof CSS Base64 SVG Replacement')
    if start1 == -1:
        break
    end1 = content.find('</style>', start1)
    content = content[:start1] + content[end1:]

# Insert the new CSS rules before </style>
content = content.replace('</style>', css_rules + '\n    </style>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Expanded CSS with 26px injected successfully!")
