import { EnumDef } from '../types';

export function generateGoEnum(enumDef: EnumDef): string {
  return `// ${enumDef.enumName} represents the possible values for ${enumDef.enumName.toLowerCase()}
type ${enumDef.enumName} int

// ${enumDef.enumName} constants
const (
${enumDef.values
  .map((value, index) => {
    const goValue = `${enumDef.enumName}${value}`;
    return index === 0 ? `\t${goValue} ${enumDef.enumName} = iota` : `\t${goValue}`;
  })
  .join('\n')}
)

// String returns the string representation of ${enumDef.enumName}
func (e ${enumDef.enumName}) String() string {
\tswitch e {
${enumDef.values
  .map((value) => {
    return `\tcase ${enumDef.enumName}${value}:\n\t\treturn "${value}"`;
  })
  .join('\n')}
\tdefault:
\t\treturn "Unknown"
\t}
}

`;
}
