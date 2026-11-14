import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const readJson = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'));
const readText = file => readFile(new URL(file, root), 'utf8');
const catalog = await readJson('data/ai-catalog.json');
const schema = await readJson('data/schemas/ai-catalog.schema.json');
const toolSchema = await readJson('data/schemas/webmcp-tool.schema.json');
function validateSchema(value, definition, location='root') {
  if (definition.$ref) { assert.equal(definition.$ref,'./webmcp-tool.schema.json',location+': unsupported schema reference'); return validateSchema(value,toolSchema,location); }
  if (definition.type==='object') {
    assert.ok(value!==null&&typeof value==='object'&&!Array.isArray(value),location+': expected object');
    for(const key of definition.required||[]) assert.ok(Object.hasOwn(value,key),location+': missing '+key);
    for(const [key,child] of Object.entries(value)) {
      if(definition.properties&&Object.hasOwn(definition.properties,key)) validateSchema(child,definition.properties[key],location+'.'+key);
      else if(definition.additionalProperties===false) assert.fail(location+': unexpected property '+key);
      else if(definition.additionalProperties&&typeof definition.additionalProperties==='object') validateSchema(child,definition.additionalProperties,location+'.'+key);
    }
  } else if(definition.type==='array') { assert.ok(Array.isArray(value),location+': expected array'); if(definition.minItems!==undefined) assert.ok(value.length>=definition.minItems,location+': too few items'); if(definition.items) value.forEach((item,i)=>validateSchema(item,definition.items,location+'['+i+']')); }
  else if(definition.type==='string') { assert.equal(typeof value,'string',location+': expected string'); if(definition.minLength!==undefined) assert.ok(value.length>=definition.minLength,location+': string too short'); if(definition.pattern) assert.ok(new RegExp(definition.pattern).test(value),location+': pattern mismatch'); if(definition.format==='uri') assert.doesNotThrow(()=>new URL(value),location+': invalid URI'); }
  else if(definition.type==='integer') { assert.ok(Number.isInteger(value),location+': expected integer'); if(definition.minimum!==undefined) assert.ok(value>=definition.minimum,location+': below minimum'); if(definition.maximum!==undefined) assert.ok(value<=definition.maximum,location+': above maximum'); }
  else if(definition.type==='boolean') assert.equal(typeof value,'boolean',location+': expected boolean');
  if(definition.const!==undefined) assert.equal(value,definition.const,location+': const mismatch');
  if(definition.enum) assert.ok(definition.enum.includes(value),location+': enum mismatch');
}
assert.equal(schema.$schema,'https://json-schema.org/draft/2020-12/schema');
assert.equal(toolSchema.$schema,'https://json-schema.org/draft/2020-12/schema');
validateSchema(catalog,schema);
assert.match(catalog.version,/^\d+\.\d+\.\d+$/);
const runtime=await readText('assets/js/webmcp.js');
const runtimeNames=[...runtime.matchAll(/^    (fastseo_[a-z0-9_]+):/gm)].map(match=>match[1]);
const declared=new Set();
for(const tool of catalog.tools) {
  assert.ok(!declared.has(tool.name),'Duplicate WebMCP tool: '+tool.name); declared.add(tool.name);
  assert.ok(runtimeNames.includes(tool.name),tool.name+': missing execution handler');
  assert.equal(tool.inputSchema.type,'object');
  for(const [key,property] of Object.entries(tool.inputSchema.properties||{})) assert.ok(property.description&&property.description.trim(),tool.name+'.'+key+': missing parameter description');
  for(const key of tool.inputSchema.required||[]) assert.ok(Object.hasOwn(tool.inputSchema.properties,key),tool.name+': undeclared required parameter '+key);
  await access(new URL(tool.page==='/'?'index.html':tool.page.replace(/^\//,''),root));
}
for(const form of catalog.forms) {
  const source=await readText(form.source);
  const selectorFound=form.selector.includes('#') ? source.includes('id="'+form.selector.split('#')[1]+'"') : form.selector.includes('[') ? source.includes(form.selector.slice(form.selector.indexOf('['),form.selector.indexOf(']')+1).replace('[','').replace(']','')) : source.includes(form.selector.slice(form.selector.indexOf('.')+1));
  assert.ok(selectorFound,form.id+': form selector not found in source');
  assert.ok(source.includes('toolname="'+form.toolName+'"'),form.id+': toolname annotation missing');
  assert.ok(source.includes('tooldescription'),form.id+': form description annotation missing');
  assert.ok(source.includes('toolparamdescription'),form.id+': parameter annotation missing');
  assert.ok(declared.has(form.toolName),form.id+': form references undeclared tool');
}
assert.ok((await readText('assets/js/tools-catalog.js')).includes('window.MSEOToolsCatalog = tools.map'),'Structured tools catalog export is missing');
assert.ok(runtime.includes('new DOMParser()'),'SEO analyzer execution handler is missing');
assert.ok(runtime.includes("document.modelContext") && runtime.includes("registerTool"),'Native document.modelContext registration is missing');
assert.ok(runtime.includes("readOnlyHint: true") && runtime.includes("untrustedContentHint: true"),'Read-only and untrusted-content annotations are missing');
assert.ok(runtime.includes("pagehide") && runtime.includes("controller.abort()"),'WebMCP registrations must be cleaned up with their page lifecycle');
assert.ok(runtime.includes("1000000") && runtime.includes("query.length > 200"),'WebMCP input size and query bounds are missing');
const sharedSite = await readText('assets/js/site.js');
assert.ok(sharedSite.includes('assets/js/webmcp.js?v=20261114-webmcp-hardening'),'Shared public pages must load the versioned WebMCP runtime');
assert.ok(sharedSite.includes('data-webmcp-search') && sharedSite.includes('toolname="fastseo_search_articles"'),'Shared header article search must retain its declarative WebMCP form annotations');

const css=await readText('assets/css/style.css');
assert.ok(css.includes('[data-site-header],[data-home-header]')&&css.includes('min-height:82px'),'Header CLS reservation is missing');
assert.ok(css.includes('.mseo-ad-placement')&&css.includes('min-height:280px'),'Ad-slot CLS reservation is missing');
assert.ok((await readText('pages/seo-analyzer.html')).includes('width="1200" height="560"'),'SEO analyzer image intrinsic dimensions are missing');
console.log('AI catalog and WebMCP checks passed: '+catalog.tools.length+' executable tools; '+catalog.forms.length+' annotated forms. CLS safeguards: header and ad slots reserve layout space.');
