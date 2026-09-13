import { useSchematicStore } from './src/store/useSchematicStore';
import transformerStepdown from './src/examples/transformer_stepdown.json' with { type: 'json' };

const store = useSchematicStore.getState();
console.log('Components before:', store.components.length);
store.importState(JSON.stringify(transformerStepdown));
console.log('Components after:', useSchematicStore.getState().components.length);
