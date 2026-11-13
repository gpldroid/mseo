import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const catalog = await readJson('data/ai-catalog.json');
const schema = await readJson('data/schemas/ai-catalog.schema.json');
const toolSchema = await readJson('data/schemas/webmcp-tool.schema.json');

function validateSchema(value, definition, path = '

assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(toolSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.match(catalog.version, /^\d+\.\d+\.\d+$/);
assert.ok(catalog.site && catalog.site.url === 'https://fastseo.site/');
assert.ok(Array.isArray(catalog.tools) && catalog.tools.length >= 1);
assert.ok(Array.isArray(catalog.forms));

const names = new Set();
for (const tool of catalog.tools) {
  assert.match(tool.name, /^[a-z][a-z0-9_]{2,63}$/);
  assert.ok(tool.description.length >= 10, tool.name + ': missing description');
  assert.ok(tool.page.startsWith('/'), tool.name + ': page must be root-relative');
  assert.equal(tool.inputSchema.type, 'object', tool.name + ': inputSchema must be an object');
  assert.ok(tool.inputSchema.properties && typeof tool.inputSchema.properties === 'object');
  assert.ok(!names.has(tool.name), 'Duplicate WebMCP tool: ' + tool.name);
  names.add(tool.name);
  for (const [key, property] of Object.entries(tool.inputSchema.properties)) {
    assert.ok(property.description && property.description.trim(), tool.name + '.' + key + ': missing parameter description');
  }
  for (const key of tool.inputSchema.required || []) {
    assert.ok(Object.hasOwn(tool.inputSchema.properties, key), tool.name + ': required parameter is not declared: ' + key);
  }
}

const home = await readFile(new URL('index.html', root), 'utf8');
const shared = await readFile(new URL('assets/js/site.js', root), 'utf8');
for (const form of catalog.forms) {
  const source = form.source === 'index.html' ? home : form.source === 'assets/js/site.js' ? shared : '';
  assert.ok(source, form.id + ': unsupported form source');
  assert.ok(source.includes(form.toolName), form.id + ': WebMCP tool name missing from source');
  assert.ok(source.includes('tooldescription'), form.id + ': form description annotation missing');
  assert.ok(source.includes('toolparamdescription'), form.id + ': parameter description annotation missing');
  if (form.source === 'index.html') assert.ok(source.includes('class="workbench-search"'), 'Homepage search form is missing');
  if (form.source === 'assets/js/site.js') assert.ok(source.includes('data-webmcp-search'), 'Shared header search form is missing its coverage marker');
}
assert.ok(shared.includes('document.modelContext') || (await readFile(new URL('assets/js/webmcp.js', root), 'utf8')).includes('document.modelContext'));
const runtime = await readFile(new URL('assets/js/webmcp.js', root), 'utf8');
assert.ok(runtime.includes('registerTool('), 'Imperative WebMCP registration is missing');
assert.ok(runtime.includes('new AbortController()'), 'Tool lifecycle cleanup signal is missing');
assert.ok(runtime.includes('fastseo_search_articles') && runtime.includes('fastseo_list_site_tools'));
console.log('AI catalog and WebMCP checks passed: ' + catalog.tools.length + ' tool schemas; ' + catalog.forms.length + ' declared search forms.');
) {
  if (definition.$ref) {
    assert.equal(definition.$ref, './webmcp-tool.schema.json', path + ': unexpected external schema reference');
    return validateSchema(value, toolSchema, path);
  }
  const type = definition.type;
  if (type === 'object') {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), path + ': expected object');
    for (const key of definition.required || []) assert.ok(Object.hasOwn(value, key), path + ': missing ' + key);
    for (const [key, child] of Object.entries(value)) {
      if (definition.properties && Object.hasOwn(definition.properties, key)) validateSchema(child, definition.properties[key], path + '.' + key);
      else if (definition.additionalProperties === false) assert.fail(path + ': unexpected property ' + key);
      else if (definition.additionalProperties && typeof definition.additionalProperties === 'object') validateSchema(child, definition.additionalProperties, path + '.' + key);
    }
  } else if (type === 'array') {
    assert.ok(Array.isArray(value), path + ': expected array');
    if (definition.minItems !== undefined) assert.ok(value.length >= definition.minItems, path + ': too few items');
    if (definition.items) value.forEach((item, index) => validateSchema(item, definition.items, path + '[' + index + ']'));
  } else if (type === 'string') {
    assert.equal(typeof value, 'string', path + ': expected string');
    if (definition.minLength !== undefined) assert.ok(value.length >= definition.minLength, path + ': string too short');
    if (definition.pattern) assert.ok(new RegExp(definition.pattern).test(value), path + ': pattern mismatch');
    if (definition.format === 'uri') assert.doesNotThrow(() => new URL(value), path + ': invalid URI');
  } else if (type === 'integer') {
    assert.ok(Number.isInteger(value), path + ': expected integer');
  } else if (type === 'boolean') {
    assert.equal(typeof value, 'boolean', path + ': expected boolean');
  }
  if (definition.const !== undefined) assert.equal(value, definition.const, path + ': const mismatch');
  if (definition.enum) assert.ok(definition.enum.includes(value), path + ': enum mismatch');
}
validateSchema(catalog, schema);


assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(toolSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.match(catalog.version, /^\d+\.\d+\.\d+$/);
assert.ok(catalog.site && catalog.site.url === 'https://fastseo.site/');
assert.ok(Array.isArray(catalog.tools) && catalog.tools.length >= 1);
assert.ok(Array.isArray(catalog.forms));

const names = new Set();
for (const tool of catalog.tools) {
  assert.match(tool.name, /^[a-z][a-z0-9_]{2,63}$/);
  assert.ok(tool.description.length >= 10, tool.name + ': missing description');
  assert.ok(tool.page.startsWith('/'), tool.name + ': page must be root-relative');
  assert.equal(tool.inputSchema.type, 'object', tool.name + ': inputSchema must be an object');
  assert.ok(tool.inputSchema.properties && typeof tool.inputSchema.properties === 'object');
  assert.ok(!names.has(tool.name), 'Duplicate WebMCP tool: ' + tool.name);
  names.add(tool.name);
  for (const [key, property] of Object.entries(tool.inputSchema.properties)) {
    assert.ok(property.description && property.description.trim(), tool.name + '.' + key + ': missing parameter description');
  }
  for (const key of tool.inputSchema.required || []) {
    assert.ok(Object.hasOwn(tool.inputSchema.properties, key), tool.name + ': required parameter is not declared: ' + key);
  }
}

const home = await readFile(new URL('index.html', root), 'utf8');
const shared = await readFile(new URL('assets/js/site.js', root), 'utf8');
for (const form of catalog.forms) {
  const source = form.source === 'index.html' ? home : form.source === 'assets/js/site.js' ? shared : '';
  assert.ok(source, form.id + ': unsupported form source');
  assert.ok(source.includes(form.toolName), form.id + ': WebMCP tool name missing from source');
  if (form.source === 'index.html') assert.ok(source.includes('class="workbench-search"'), 'Homepage search form is missing');
  if (form.source === 'assets/js/site.js') assert.ok(source.includes('data-webmcp-search'), 'Shared header search form is missing its coverage marker');
}
assert.ok(shared.includes('document.modelContext') || (await readFile(new URL('assets/js/webmcp.js', root), 'utf8')).includes('document.modelContext'));
const runtime = await readFile(new URL('assets/js/webmcp.js', root), 'utf8');
assert.ok(runtime.includes('registerTool('), 'Imperative WebMCP registration is missing');
assert.ok(runtime.includes('new AbortController()'), 'Tool lifecycle cleanup signal is missing');
assert.ok(runtime.includes('fastseo_search_articles') && runtime.includes('fastseo_list_site_tools'));
console.log('AI catalog and WebMCP checks passed: ' + catalog.tools.length + ' tool schemas; ' + catalog.forms.length + ' declared search forms.');
