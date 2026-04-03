import { UnionDef } from '../types';

export function generateGoUnion(unionDef: UnionDef): string {
  return `type ${unionDef.unionName} interface {
\tIs${unionDef.unionName}()
}

${unionDef.types
  .map((typeName) => {
    return `func (m *${typeName}) Is${unionDef.unionName}() {}`;
  })
  .join('\n')}

`;
}
