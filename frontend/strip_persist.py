import re

with open('src/store/useSchematicStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace export const useSchematicStore = create<SchematicState>()(persist((set, get) => ({
content = re.sub(
    r'export const useSchematicStore = create<SchematicState>\(\)\(\s*persist\(\s*\(set, get\) => \(\{',
    'export const useSchematicStore = create<SchematicState>()((set, get) => ({',
    content
)

# Remove the bottom wrapper part:
# }),
# {
#   name: 'multisim-storage',
#   partialize: (state) => ({ 
#     ...
#   }),
# }
# ));
target_bottom = r"""}),
{
  name: 'multisim-storage',
  partialize: (state) => ({ 
    components: state.components, 
    wires: state.wires, 
    probes: state.probes,
    stagePos: state.stagePos,
    scale: state.scale
  }),
}
));"""
content = content.replace(target_bottom, "})\n);")

with open('src/store/useSchematicStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
