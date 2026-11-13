import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const readJson = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const catalog = await readJson('data/ai-catalog.json');
const schema = await readJson('data/schemas/ai-catalog.schema.json');
const toolSchema = await readJson('data/schemas/webmcp-tool.schema.json');

function validateSchema(value, definition, location = 'root') {
  if (definition.$ref) {
    assert.equal(definition.$ref, './webmcp-tool.schema.json', location + ': unsupported schema reference');
    return validateSchema(value, toolSchema, location);
  }
  if (definition.type === 'object') {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), location + ': expected object');
    for (const key of definition.required || []) assert.ok(Object.hasOwn(value, key), location + ': missing ' + key);
    for (const [key, child] of Object.entries(value)) {
      if (definition.properties && Object.hasOwn(definition.properties, key)) validateSchema(child, definition.properties[key], location + '.' + key);
      else if (definition.additionalProperties === false) assert.fail(location + ': unexpected property ' + key);
      else if (definition.additionalProperties && typeof definition.additionalProperties === 'object') validateSchema(child, definition.additionalProperties, location + '.' + key);
    }
  } else if (definition.type === 'array') {
    assert.ok(Array.isArray(value), location + ': expected array');
    if (definition.minItems !== undefined) assert.ok(value.length >= definition.minItems, location + ': too few items');
    if (definition.items) value.forEach((item, index) => validateSchema(item, definition.items, location + '[' + index + ']'));
  } else if (definition.type === 'string') {
    assert.equal(typeof value, 'string', location + ': expected string');
    if (definition.minLength !== undefined) assert.ok(value.length >= definition.minLength, location + ': string too short');
    if (definition.pattern) assert.ok(new RegExp(definition.pattern).test(value), location + ': pattern mismatch');
    if (definition.format === 'uri') assert.doesNotThrow(() => new URL(value), location + ': invalid URI');
  } else if (definition.type === 'integer') {
    assert.ok(Number.isInteger(value), location + ': expected integer');
  } else if (definition.type === 'boolean') {
    assert.equal(typeof value, 'boolean', location + ': expected boolean');
  }
  if (definition.const !== undefined) assert.equal(value, definition.const, location + ': const mismatch');
  if (definition.enum) assert.ok(definition.enum.includes(value), location + ': enum mismatch');
}

assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(toolSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
validateSchema(catalog, schema);
assert.match(catalog.version, /^\d+\.\d+\.\d+$/);

const names = new Set();
for (const tool of catalog.tools) {
  assert.ok(!names.has(tool.name), 'Duplicate WebMCP tool: ' + tool.name);
  names.add(tool.name);
  assert.equal(tool.inputSchema.type, 'object');
  for (const [key, property] of Object.entries(tool.inputSchema.properties)) {
    assert.ok(property.description && property.description.trim(), tool.name + '.' + key + ': missing parameter description');
  }
  for (const key of tool.inputSchema.required || []) {
    assert.ok(Object.hasOwn(tool.inputSchema.properties, key), tool.name + ': undeclared required parameter ' + key);
  }
}

const home = await readFile(new URL('index.html', root), 'utf8');
const shared = await readFile(new URL('assets/js/site.js', root), 'utf8');
for (const form of catalog.forms) {
  const source = form.source === 'index.html' ? home : form.source === 'assets/js/site.js' ? shared : '';
  assert.ok(source, form.id + ': unsupported form source');
  assert.ok(source.includes(form.toolName), form.id + ': WebMCP tool name missing');
  assert.ok(source.includes('tooldescription'), form.id + ': form description annotation missing');
  assert.ok(source.includes('toolparamdescription'), form.id + ': parameter description annotation missing');
}
const runtime = await readFile(new URL('assets/js/webmcp.js', root), 'utf8');
assert.ok(runtime.includes('const modelContext = document.modelContext') && runtime.includes('modelContext.registerTool('), 'Imperative registration API is missing');
assert.ok(runtime.includes('new AbortController()'), 'AbortSignal lifecycle handling is missing');
assert.ok(runtime.includes('fastseo_search_articles') && runtime.includes('fastseo_list_site_tools'));
console.log('AI catalog and WebMCP checks passed: ' + catalog.tools.length + ' tool schemas; ' + catalog.forms.length + ' declared search forms.');
