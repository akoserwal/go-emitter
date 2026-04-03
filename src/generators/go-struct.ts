import { ModelDef, EmitterConfig } from '../types';
import { mapTypeSpecTypeToGo } from '../core/type-mapper';

export function generateGoStruct(
  model: ModelDef,
  knownEnums: string[],
  config: EmitterConfig
): string {
  const requiredFields = model.fields.filter((f) => !f.optional);

  let goCode = generateStructDeclaration(model, knownEnums);
  goCode += generateConstructor(model, requiredFields, knownEnums);

  if (config.generateValidation) {
    goCode += generateValidation(model);
  }

  if (config.generateJSON) {
    goCode += generateJSONMethods(model);
  }

  if (config.generateBuilders) {
    goCode += generateBuilder(model, knownEnums);
  }

  return goCode;
}

function generateStructDeclaration(model: ModelDef, knownEnums: string[]): string {
  return `type ${model.modelName} struct {
${model.fields
  .map((field) => {
    let goType = mapTypeSpecTypeToGo(field.type, knownEnums);
    if (field.optional) {
      goType = `*${goType}`;
    }
    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    return `\t${capitalizedName} ${goType} \`json:"${field.name}"\``;
  })
  .join('\n')}
}

`;
}

function generateConstructor(model: ModelDef, requiredFields: any[], knownEnums: string[]): string {
  return `func New${model.modelName}(${requiredFields
    .map((field) => {
      const goType = mapTypeSpecTypeToGo(field.type, knownEnums);
      return `${field.name} ${goType}`;
    })
    .join(', ')}) *${model.modelName} {
\treturn &${model.modelName}{
${requiredFields
  .map((field) => {
    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    return `\t\t${capitalizedName}: ${field.name},`;
  })
  .join('\n')}
\t}
}

`;
}

function generateValidation(model: ModelDef): string {
  const stringFields = model.fields.filter((f) => !f.optional && f.type === 'string');
  const arrayFields = model.fields.filter((f) => !f.optional && f.type.endsWith('[]'));

  if (stringFields.length === 0 && arrayFields.length === 0) {
    return '';
  }

  return `func (m *${model.modelName}) Validate() error {
${stringFields
  .map((field) => {
    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    return `\tif m.${capitalizedName} == "" {\n\t\treturn fmt.Errorf("${field.name} is required")\n\t}`;
  })
  .join('\n')}
${arrayFields
  .map((field) => {
    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    return `\tif len(m.${capitalizedName}) == 0 {\n\t\treturn fmt.Errorf("${field.name} cannot be empty")\n\t}`;
  })
  .join('\n')}
\treturn nil
}

`;
}

function generateJSONMethods(model: ModelDef): string {
  return `func (m *${model.modelName}) ToJSON() ([]byte, error) {
\treturn json.Marshal(m)
}

func (m *${model.modelName}) FromJSON(data []byte) error {
\treturn json.Unmarshal(data, m)
}

`;
}

function generateBuilder(model: ModelDef, knownEnums: string[]): string {
  return `type ${model.modelName}Builder struct {
\tinstance *${model.modelName}
}

func New${model.modelName}Builder() *${model.modelName}Builder {
\treturn &${model.modelName}Builder{
\t\tinstance: &${model.modelName}{},
\t}
}

${model.fields
  .map((field) => {
    let goType = mapTypeSpecTypeToGo(field.type, knownEnums);
    if (field.optional) {
      goType = `*${goType}`;
    }
    const capitalizedName = field.name.charAt(0).toUpperCase() + field.name.slice(1);
    return `func (b *${model.modelName}Builder) ${capitalizedName}(${field.name} ${goType}) *${model.modelName}Builder {
\tb.instance.${capitalizedName} = ${field.name}
\treturn b
}`;
  })
  .join('\n\n')}

func (b *${model.modelName}Builder) Build() *${model.modelName} {
\treturn b.instance
}

`;
}
