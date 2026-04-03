import { EnumDef } from '../types';

export function generateGoEnum(enumDef: EnumDef): string {
  return `type ${enumDef.enumName} int

const (
${enumDef.values
  .map((value, index) => {
    const goValue = `${enumDef.enumName}${value}`;
    return index === 0 ? `\t${goValue} ${enumDef.enumName} = iota` : `\t${goValue}`;
  })
  .join('\n')}
)

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
