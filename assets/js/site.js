/*! DOMPurify 3.4.17 is bundled below under its upstream license. */
/*! @license DOMPurify 3.4.17 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.17/LICENSE */
(function(e,t){typeof exports==`object`&&typeof module<`u`?module.exports=t():typeof define==`function`&&define.amd?define([],t):(e=typeof globalThis<`u`?globalThis:e||self,e.DOMPurify=t())})(this,function(){"use strict";function e(e,t){this.v=e,this.k=t}function t(e,t){(t==null||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}function n(e){if(Array.isArray(e))return e}function r(e,t){var n=e==null?null:typeof Symbol<`u`&&e[Symbol.iterator]||e[`@@iterator`];if(n!=null){var r,i,a,o,s=[],c=!0,l=!1;try{if(a=(n=n.call(e)).next,t===0){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=a.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){l=!0,i=e}finally{try{if(!c&&n.return!=null&&(o=n.return(),Object(o)!==o))return}finally{if(l)throw i}}return s}}function i(){throw TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}
/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
function a(e,t){return n(e)||r(e,t)||o(e,t)||i()}function o(e,n){if(e){if(typeof e==`string`)return t(e,n);var r={}.toString.call(e).slice(8,-1);return r===`Object`&&e.constructor&&(r=e.constructor.name),r===`Map`||r===`Set`?Array.from(e):r===`Arguments`||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?t(e,n):void 0}}function s(t){var n,r;function i(n,r){try{var o=t[n](r),s=o.value,c=s instanceof e;Promise.resolve(c?s.v:s).then(function(e){if(c){var r=n===`return`&&s.k?n:`next`;if(!s.k||e.done)return i(r,e);e=t[r](e).value}a(!!o.done,e)},function(e){i(`throw`,e)})}catch(e){a(2,e)}}function a(e,t){e===2?n.reject(t):n.resolve({value:t,done:e}),(n=n.next)?i(n.key,n.arg):r=null}this._invoke=function(e,t){return new Promise(function(a,o){var s={key:e,arg:t,resolve:a,reject:o,next:null};r?r=r.next=s:(n=r=s,i(e,t))})},typeof t.return!=`function`&&(this.return=void 0)}s.prototype[typeof Symbol==`function`&&Symbol.asyncIterator||`@@asyncIterator`]=function(){return this},s.prototype.next=function(e){return this._invoke(`next`,e)},s.prototype.throw=function(e){return this._invoke(`throw`,e)},s.prototype.return=function(e){return this._invoke(`return`,e)};let c=Object.entries,l=Object.setPrototypeOf,u=Object.isFrozen,d=Object.getPrototypeOf,f=Object.getOwnPropertyDescriptor,p=Object.freeze,m=Object.seal,h=Object.create,ee=typeof Reflect<`u`&&Reflect,g=ee.apply,te=ee.construct;p||(p=function(e){return e}),m||(m=function(e){return e}),g||(g=function(e,t){var n=[...arguments].slice(2);return e.apply(t,n)}),te||(te=function(e){return new e(...[...arguments].slice(1))});let _=E(Array.prototype.forEach);Array.prototype.indexOf;let ne=E(Array.prototype.lastIndexOf),re=E(Array.prototype.pop),ie=E(Array.prototype.push),ae=E(Array.prototype.slice),oe=E(Array.prototype.splice),v=Array.isArray,se=D(Set),ce=E(Set.prototype.add),le=E(Set.prototype.has),y=E(String.prototype.toLowerCase),ue=E(String.prototype.toString),de=E(String.prototype.match),fe=E(String.prototype.replace),pe=E(String.prototype.indexOf),me=E(String.prototype.trim),he=E(Number.prototype.toString),b=E(Boolean.prototype.toString),x=typeof BigInt>`u`?null:E(BigInt.prototype.toString),ge=typeof Symbol>`u`?null:E(Symbol.prototype.toString),S=E(Object.prototype.hasOwnProperty),C=E(Object.prototype.toString),w=E(RegExp.prototype.test),T=D(TypeError);function E(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);var n=[...arguments].slice(1);return g(e,t,n)}}function D(e){return function(){return te(e,[...arguments])}}function O(e,t){let n=arguments.length>2&&arguments[2]!==void 0?arguments[2]:y;if(l&&l(e,null),!v(t))return e;let r=t.length;for(;r--;){let i=t[r];if(typeof i==`string`){let e=n(i);e!==i&&(u(t)||(t[r]=e),i=e)}e[i]=!0}return e}function _e(e){for(let t=0;t<e.length;t++)S(e,t)||(e[t]=null);return e}function k(e){let t=h(null);for(let r of c(e)){var n=a(r,2);let i=n[0],o=n[1];S(e,i)&&(t[i]=v(o)?_e(o):o&&typeof o==`object`&&o.constructor===Object?k(o):o)}return t}function ve(e){switch(typeof e){case`string`:return e;case`number`:return he(e);case`boolean`:return b(e);case`bigint`:return x?x(e):`0`;case`symbol`:return ge?ge(e):`Symbol()`;case`undefined`:return C(e);case`function`:case`object`:{if(e===null)return C(e);let t=e,n=A(t,`toString`);if(typeof n==`function`){let e=n(t);return typeof e==`string`?e:C(e)}return C(e)}default:return C(e)}}function A(e,t){for(;e!==null;){let n=f(e,t);if(n){if(n.get)return E(n.get);if(typeof n.value==`function`)return E(n.value)}e=d(e)}function n(){return null}return n}function ye(e,t){for(;e!==null;){let n=f(e,t);if(n)return n.get?E(n.get):null;e=d(e)}return null}function be(e){try{return w(e,``),!0}catch(e){return!1}}let xe=p(/* @__PURE__ */ `a.abbr.acronym.address.area.article.aside.audio.b.bdi.bdo.big.blink.blockquote.body.br.button.canvas.caption.center.cite.code.col.colgroup.content.data.datalist.dd.decorator.del.details.dfn.dialog.dir.div.dl.dt.element.em.fieldset.figcaption.figure.font.footer.form.h1.h2.h3.h4.h5.h6.head.header.hgroup.hr.html.i.img.input.ins.kbd.label.legend.li.main.map.mark.marquee.menu.menuitem.meter.nav.nobr.ol.optgroup.option.output.p.picture.pre.progress.q.rp.rt.ruby.s.samp.search.section.select.shadow.slot.small.source.spacer.span.strike.strong.style.sub.summary.sup.table.tbody.td.template.textarea.tfoot.th.thead.time.tr.track.tt.u.ul.var.video.wbr`.split(`.`)),Se=p(/* @__PURE__ */ `svg.a.altglyph.altglyphdef.altglyphitem.animatecolor.animatemotion.animatetransform.circle.clippath.defs.desc.ellipse.enterkeyhint.exportparts.filter.font.g.glyph.glyphref.hkern.image.inputmode.line.lineargradient.marker.mask.metadata.mpath.part.path.pattern.polygon.polyline.radialgradient.rect.stop.style.switch.symbol.text.textpath.title.tref.tspan.view.vkern`.split(`.`)),Ce=p([`feBlend`,`feColorMatrix`,`feComponentTransfer`,`feComposite`,`feConvolveMatrix`,`feDiffuseLighting`,`feDisplacementMap`,`feDistantLight`,`feDropShadow`,`feFlood`,`feFuncA`,`feFuncB`,`feFuncG`,`feFuncR`,`feGaussianBlur`,`feImage`,`feMerge`,`feMergeNode`,`feMorphology`,`feOffset`,`fePointLight`,`feSpecularLighting`,`feSpotLight`,`feTile`,`feTurbulence`]),we=p([`animate`,`color-profile`,`cursor`,`discard`,`font-face`,`font-face-format`,`font-face-name`,`font-face-src`,`font-face-uri`,`foreignobject`,`hatch`,`hatchpath`,`mesh`,`meshgradient`,`meshpatch`,`meshrow`,`missing-glyph`,`script`,`set`,`solidcolor`,`unknown`,`use`]),Te=p(/* @__PURE__ */ `math.menclose.merror.mfenced.mfrac.mglyph.mi.mlabeledtr.mmultiscripts.mn.mo.mover.mpadded.mphantom.mroot.mrow.ms.mspace.msqrt.mstyle.msub.msup.msubsup.mtable.mtd.mtext.mtr.munder.munderover.mprescripts`.split(`.`)),Ee=p([`maction`,`maligngroup`,`malignmark`,`mlongdiv`,`mscarries`,`mscarry`,`msgroup`,`mstack`,`msline`,`msrow`,`semantics`,`annotation`,`annotation-xml`,`mprescripts`,`none`]),De=p([`#text`]),Oe=p(/* @__PURE__ */ `accept.action.align.alt.autocapitalize.autocomplete.autopictureinpicture.autoplay.background.bgcolor.border.capture.cellpadding.cellspacing.checked.cite.class.clear.color.cols.colspan.command.commandfor.controls.controlslist.coords.crossorigin.datetime.decoding.default.dir.disabled.disablepictureinpicture.disableremoteplayback.download.draggable.enctype.enterkeyhint.exportparts.face.for.headers.height.hidden.high.href.hreflang.id.inert.inputmode.integrity.ismap.kind.label.lang.list.loading.loop.low.max.maxlength.media.method.min.minlength.multiple.muted.name.nonce.noshade.novalidate.nowrap.open.optimum.part.pattern.placeholder.playsinline.popover.popovertarget.popovertargetaction.poster.preload.pubdate.radiogroup.readonly.rel.required.rev.reversed.role.rows.rowspan.spellcheck.scope.selected.shape.size.sizes.slot.span.srclang.start.src.srcset.step.style.summary.tabindex.title.translate.type.usemap.valign.value.width.wrap.xmlns`.split(`.`)),ke=p(/* @__PURE__ */ `accent-height.accumulate.additive.alignment-baseline.amplitude.ascent.attributename.attributetype.azimuth.basefrequency.baseline-shift.begin.bias.by.class.clip.clippathunits.clip-path.clip-rule.color.color-interpolation.color-interpolation-filters.color-profile.color-rendering.cx.cy.d.dx.dy.diffuseconstant.direction.display.divisor.dominant-baseline.dur.edgemode.elevation.end.exponent.fill.fill-opacity.fill-rule.filter.filterunits.flood-color.flood-opacity.font-family.font-size.font-size-adjust.font-stretch.font-style.font-variant.font-weight.fx.fy.g1.g2.glyph-name.glyphref.gradientunits.gradienttransform.height.href.id.image-rendering.in.in2.intercept.k.k1.k2.k3.k4.kerning.keypoints.keysplines.keytimes.lang.lengthadjust.letter-spacing.kernelmatrix.kernelunitlength.lighting-color.local.marker-end.marker-mid.marker-start.markerheight.markerunits.markerwidth.maskcontentunits.maskunits.max.mask.mask-type.media.method.mode.min.name.numoctaves.offset.operator.opacity.order.orient.orientation.origin.overflow.paint-order.path.pathlength.patterncontentunits.patterntransform.patternunits.pointer-events.points.preservealpha.preserveaspectratio.primitiveunits.r.rx.ry.radius.refx.refy.repeatcount.repeatdur.restart.result.rotate.scale.seed.shape-rendering.slope.specularconstant.specularexponent.spreadmethod.startoffset.stddeviation.stitchtiles.stop-color.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-linecap.stroke-linejoin.stroke-miterlimit.stroke-opacity.stroke.stroke-width.style.surfacescale.systemlanguage.tabindex.tablevalues.targetx.targety.transform.transform-origin.text-anchor.text-decoration.text-orientation.text-rendering.textlength.type.u1.u2.unicode.values.vector-effect.viewbox.visibility.version.vert-adv-y.vert-origin-x.vert-origin-y.width.word-spacing.wrap.writing-mode.xchannelselector.ychannelselector.x.x1.x2.xmlns.y.y1.y2.z.zoomandpan`.split(`.`)),Ae=p(/* @__PURE__ */ `accent.accentunder.align.bevelled.close.columnalign.columnlines.columnspacing.columnspan.denomalign.depth.dir.display.displaystyle.encoding.fence.frame.height.href.id.largeop.length.linethickness.lquote.lspace.mathbackground.mathcolor.mathsize.mathvariant.maxsize.minsize.movablelimits.notation.numalign.open.rowalign.rowlines.rowspacing.rowspan.rspace.rquote.scriptlevel.scriptminsize.scriptsizemultiplier.selection.separator.separators.stretchy.subscriptshift.supscriptshift.symmetric.voffset.width.xmlns`.split(`.`)),je=p([`xlink:href`,`xml:id`,`xlink:title`,`xml:space`,`xmlns:xlink`]),Me=m(/{{[\w\W]*|^[\w\W]*}}/g),Ne=m(/<%[\w\W]*|^[\w\W]*%>/g),Pe=m(/\${[\w\W]*/g),Fe=m(/^data-[\-\w.\u00B7-\uFFFF]+$/),Ie=m(/^aria-[\-\w]+$/),Le=m(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),Re=m(/^(?:\w+script|data):/i),ze=m(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),Be=m(/^html$/i),Ve=m(/^[a-z][.\w]*(-[.\w]+)+$/i),He=m(/<[/\w!]/g),Ue=m(/<[/\w]/g),We=m(/<\/no(script|embed|frames)/i),Ge=m(/\/>/i),j={element:1,attribute:2,text:3,cdataSection:4,entityReference:5,entityNode:6,processingInstruction:7,comment:8,document:9,documentType:10,documentFragment:11,notation:12},Ke=p(O({},[`style`,`script`,`xmp`,`iframe`,`noembed`,`noframes`,`plaintext`,`noscript`])),qe=function(){return typeof window>`u`?null:window},Je=function(e,t){if(typeof e!=`object`||typeof e.createPolicy!=`function`)return null;let n=null,r=`data-tt-policy-suffix`;t&&t.hasAttribute(r)&&(n=t.getAttribute(r));let i=`dompurify`+(n?`#`+n:``);try{return e.createPolicy(i,{createHTML(e){return e},createScriptURL(e){return e}})}catch(e){return console.warn(`TrustedTypes policy `+i+` could not be created.`),null}},Ye=function(){return{afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},M=function(e,t,n,r){return S(e,t)&&v(e[t])?O(r.base?k(r.base):{},e[t],r.transform):n},Xe=function(e,t,n){let r=S(e,t)?e[t]:void 0;return r&&typeof r==`object`?k(r):n()};function Ze(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:qe(),t=e=>Ze(e);if(t.version=`3.4.17`,t.removed=[],!e||!e.document||e.document.nodeType!==j.document||!e.Element)return t.isSupported=!1,t;let n=e.document,r=n,i=r.currentScript;e.DocumentFragment;let a=e.HTMLTemplateElement,o=e.Node,s=e.Element,l=e.NodeFilter;e.NamedNodeMap===void 0&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;let u=e.DOMParser,d=e.trustedTypes,f=s.prototype,ee=A(f,`cloneNode`),g=A(f,`remove`),te=A(f,`removeAttributeNode`),he=A(f,`nextSibling`),b=A(f,`childNodes`),x=A(f,`parentNode`),ge=A(f,`shadowRoot`),C=A(f,`attributes`),E=o&&o.prototype?A(o.prototype,`nodeType`):null,D=o&&o.prototype?A(o.prototype,`nodeName`):null,_e=o&&o.prototype?A(o.prototype,`ownerDocument`):null,N=function(e){return E?E(e):e.nodeType},Qe=function(e){return D?D(e):e.nodeName},$e=ye(f,`namespaceURI`),et=function(e){return $e?$e(e):e.namespaceURI};if(typeof a==`function`){let e=n.createElement(`template`);e.content&&e.content.ownerDocument&&(n=e.content.ownerDocument)}let P,F=``,tt,nt=!1,rt=0,it=function(){if(rt>0)throw T(`A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.`)},at=function(e){it(),rt++;try{return P.createHTML(e)}finally{rt--}},ot=function(e){it(),rt++;try{return P.createScriptURL(e)}finally{rt--}},st=function(){return nt||(tt=Je(d,i),nt=!0),tt},ct=n,lt=ct.implementation,ut=ct.createNodeIterator,dt=ct.createDocumentFragment,ft=ct.getElementsByTagName,pt=r.importNode,I=Ye();t.isSupported=typeof c==`function`&&typeof x==`function`&&lt&&lt.createHTMLDocument!==void 0;let mt=Me,ht=Ne,gt=Pe,_t=Fe,vt=Ie,yt=Re,bt=ze,xt=Ve,St=Le,L=null,Ct=O({},[...xe,...Se,...Ce,...Te,...De]),R=null,wt=O({},[...Oe,...ke,...Ae,...je]),z=Object.seal(h(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Tt=null,Et=null,B=Object.seal(h(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}})),Dt=!0,Ot=!0,kt=!1,At=!0,V=!1,H=!0,U=!1,jt=!1,Mt=null,Nt=null,Pt=!1,W=!1,Ft=!1,It=!1,Lt=!0,Rt=!1,zt=`user-content-`,Bt=!0,Vt=!1,G=null,K={},q=null,Ht=O({},/* @__PURE__ */ `annotation-xml.audio.colgroup.desc.foreignobject.head.iframe.math.mi.mn.mo.ms.mtext.noembed.noframes.noscript.plaintext.script.selectedcontent.style.svg.template.thead.title.video.xmp`.split(`.`)),Ut=null,Wt=O({},[`audio`,`video`,`img`,`source`,`image`,`track`]),Gt=null,Kt=O({},[`alt`,`class`,`for`,`id`,`label`,`name`,`pattern`,`placeholder`,`role`,`summary`,`title`,`value`,`style`,`xmlns`]),qt=`http://www.w3.org/1998/Math/MathML`,Jt=`http://www.w3.org/2000/svg`,J=`http://www.w3.org/1999/xhtml`,Yt=J,Xt=!1,Zt=null,Qt=O({},[qt,Jt,J],ue),$t=p([`mi`,`mo`,`mn`,`ms`,`mtext`]),en=O({},$t),tn=p([`annotation-xml`]),nn=O({},tn),rn=O({},[`title`,`style`,`font`,`a`,`script`]),an=null,on=[`application/xhtml+xml`,`text/html`],Y=null,sn=null,cn=n.createElement(`form`),ln=function(e){return e instanceof RegExp||e instanceof Function},un=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};if(sn&&sn===e)return;(!e||typeof e!=`object`)&&(e={}),e=k(e),an=on.indexOf(e.PARSER_MEDIA_TYPE)===-1?`text/html`:e.PARSER_MEDIA_TYPE,Y=an===`application/xhtml+xml`?ue:y,L=M(e,`ALLOWED_TAGS`,Ct,{transform:Y}),R=M(e,`ALLOWED_ATTR`,wt,{transform:Y}),Zt=M(e,`ALLOWED_NAMESPACES`,Qt,{transform:ue}),Gt=M(e,`ADD_URI_SAFE_ATTR`,Kt,{transform:Y,base:Kt}),Ut=M(e,`ADD_DATA_URI_TAGS`,Wt,{transform:Y,base:Wt}),q=M(e,`FORBID_CONTENTS`,Ht,{transform:Y}),Tt=M(e,`FORBID_TAGS`,k({}),{transform:Y}),Et=M(e,`FORBID_ATTR`,k({}),{transform:Y}),K=S(e,`USE_PROFILES`)?e.USE_PROFILES&&typeof e.USE_PROFILES==`object`?k(e.USE_PROFILES):e.USE_PROFILES:!1,Dt=e.ALLOW_ARIA_ATTR!==!1,Ot=e.ALLOW_DATA_ATTR!==!1,kt=e.ALLOW_UNKNOWN_PROTOCOLS||!1,At=e.ALLOW_SELF_CLOSE_IN_ATTR!==!1,V=e.SAFE_FOR_TEMPLATES||!1,H=e.SAFE_FOR_XML!==!1,U=e.WHOLE_DOCUMENT||!1,W=e.RETURN_DOM||!1,Ft=e.RETURN_DOM_FRAGMENT||!1,It=e.RETURN_TRUSTED_TYPE||!1,Pt=e.FORCE_BODY||!1,Lt=e.SANITIZE_DOM!==!1,Rt=e.SANITIZE_NAMED_PROPS||!1,Bt=e.KEEP_CONTENT!==!1,Vt=e.IN_PLACE||!1,St=be(e.ALLOWED_URI_REGEXP)?e.ALLOWED_URI_REGEXP:Le,Yt=typeof e.NAMESPACE==`string`?e.NAMESPACE:J,en=Xe(e,`MATHML_TEXT_INTEGRATION_POINTS`,()=>O({},$t)),nn=Xe(e,`HTML_INTEGRATION_POINTS`,()=>O({},tn));let t=Xe(e,`CUSTOM_ELEMENT_HANDLING`,()=>h(null));if(z=h(null),S(t,`tagNameCheck`)&&ln(t.tagNameCheck)&&(z.tagNameCheck=t.tagNameCheck),S(t,`attributeNameCheck`)&&ln(t.attributeNameCheck)&&(z.attributeNameCheck=t.attributeNameCheck),S(t,`allowCustomizedBuiltInElements`)&&typeof t.allowCustomizedBuiltInElements==`boolean`&&(z.allowCustomizedBuiltInElements=t.allowCustomizedBuiltInElements),m(z),V&&(Ot=!1),Ft&&(W=!0),K&&(L=O({},De),R=h(null),K.html===!0&&(O(L,xe),O(R,Oe)),K.svg===!0&&(O(L,Se),O(R,ke),O(R,je)),K.svgFilters===!0&&(O(L,Ce),O(R,ke),O(R,je)),K.mathMl===!0&&(O(L,Te),O(R,Ae),O(R,je))),B.tagCheck=null,B.attributeCheck=null,S(e,`ADD_TAGS`)&&(typeof e.ADD_TAGS==`function`?B.tagCheck=e.ADD_TAGS:v(e.ADD_TAGS)&&(L===Ct&&(L=k(L)),O(L,e.ADD_TAGS,Y))),S(e,`ADD_ATTR`)&&(typeof e.ADD_ATTR==`function`?B.attributeCheck=e.ADD_ATTR:v(e.ADD_ATTR)&&(R===wt&&(R=k(R)),O(R,e.ADD_ATTR,Y))),S(e,`ADD_FORBID_CONTENTS`)&&v(e.ADD_FORBID_CONTENTS)&&(q===Ht&&(q=k(q)),O(q,e.ADD_FORBID_CONTENTS,Y)),Bt&&(L[`#text`]=!0),U&&O(L,[`html`,`head`,`body`]),L.table&&(O(L,[`tbody`]),delete Tt.tbody),e.TRUSTED_TYPES_POLICY){if(typeof e.TRUSTED_TYPES_POLICY.createHTML!=`function`)throw T(`TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.`);if(typeof e.TRUSTED_TYPES_POLICY.createScriptURL!=`function`)throw T(`TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.`);let t=P;P=e.TRUSTED_TYPES_POLICY;try{F=at(``)}catch(e){throw P=t,e}}else e.TRUSTED_TYPES_POLICY===null?(P=void 0,F=``):(P===void 0&&(P=st()),P&&typeof F==`string`&&(F=at(``)));p&&p(e),sn=e},dn=O({},[...Se,...Ce,...we]),fn=O({},[...Te,...Ee]),pn=function(e,t,n){return t.namespaceURI===J?e===`svg`:t.namespaceURI===qt?e===`svg`&&(n===`annotation-xml`||en[n]):!!dn[e]},mn=function(e,t,n){return t.namespaceURI===J?e===`math`:t.namespaceURI===Jt?e===`math`&&nn[n]:!!fn[e]},hn=function(e,t,n){return t.namespaceURI===Jt&&!nn[n]||t.namespaceURI===qt&&!en[n]?!1:!fn[e]&&(rn[e]||!dn[e])},gn=function(e){let t=et(e),n=y(Qe(e)),r=x(e),i,a;return r&&N(r)===j.element?(i={namespaceURI:et(r)},a=y(Qe(r))):(i={namespaceURI:Yt},a=`template`),Zt[t]?t===Jt?pn(n,i,a):t===qt?mn(n,i,a):t===J?hn(n,i,a):!!(an===`application/xhtml+xml`&&Zt[t]):!1},X=function(e){ie(t.removed,{element:e});try{x(e).removeChild(e)}catch(t){if(g(e),!x(e))throw T(`a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place`)}},_n=function(e,t,n){try{te(e,t)}catch(t){try{e.removeAttribute(n)}catch(e){}}},vn=function(e){Sn(e);let t=b(e);t&&_(ae(t),e=>{try{g(e)}catch(e){}});let n=N(e)===j.element?C(e):null;if(n)for(let t=n.length-1;t>=0;--t){let r=n[t],i=r&&r.name;typeof i==`string`&&_n(e,r,i)}},yn=function(e,n,r){if(!r)try{r=n.getAttributeNode(e)}catch(e){r=null}ie(t.removed,{attribute:r||null,from:n});try{r?te(n,r):n.removeAttribute(e)}catch(t){try{n.removeAttribute(e)}catch(e){}}if(e===`is`){if(W||Ft)try{X(n)}catch(e){}else try{n.setAttribute(e,``)}catch(e){}}},bn=function(e){let t=C(e);if(t)for(let n=t.length-1;n>=0;--n){let r=t[n],i=r&&r.name;typeof i!=`string`||R[Y(i)]||_n(e,r,i)}},xn=function(e,t){let n=arguments.length>2&&arguments[2]!==void 0&&arguments[2],r=[e];for(;r.length>0;){let e=r.pop();if(t(e)===!1)continue;if(n&&N(e)===j.element){let t=ge(e);Z(t)&&r.push(t)}let i=b(e);if(i)for(let e=i.length-1;e>=0;--e)r.push(i[e])}},Sn=function(e){xn(e,e=>{N(e)===j.element&&bn(e)})},Cn=function(e){let t=[];return xn(e,e=>{t.push(e)},!0),t},wn=function(e,t){let n=se();_(Cn(e),e=>{N(e)===j.element&&ce(n,e)}),_(t,e=>{N(e)===j.element&&!le(n,e)&&bn(e)})},Tn=function(e,n){let r=!1;return _(t.removed,t=>{t.element&&(r=r||t.element===e,Sn(t.element))}),wn(e,n),r},En=function(e,t){let n=G,r=null,i=()=>(r||(r=se(),_(t,e=>{ce(r,e)})),r);for(let t=0;;t++){let r=Cn(e),a=[e],o=!1;if(_(r,e=>{N(e)===j.documentFragment?ie(a,e):!o&&!le(n,e)&&(o=le(i(),e))}),!o)return;if(t>=8)throw T(`the tree kept changing during in-place sanitization; refusing to return it`);_(a,(t,n)=>{Dn(t,n>0,e,i())})}},Dn=function(e,t,n,r){let i=Mn(e),a;for(;a=i.nextNode();)le(r,a)&&!le(G,a)&&(t&&Q(I.uponSanitizeShadowNode,a,null),Hn(a,n),Yn(a,n),Z(a.content)&&Xn(a.content))},On=function(e){G&&ce(G,e)},kn=function(e,t){return H?e===`patchsrc`||e===`for`&&t!==`label`&&t!==`output`:!1},An=function(e){H&&xn(e,e=>{let t=N(e);if(t===j.processingInstruction||t===j.comment&&w(Ue,e.data)){try{g(e)}catch(e){}return!1}if(t===j.element){let t=e,n=Y(Qe(e));try{t.hasAttribute&&t.hasAttribute(`patchsrc`)&&t.removeAttribute(`patchsrc`),t.hasAttribute&&t.hasAttribute(`for`)&&kn(`for`,n)&&t.removeAttribute(`for`)}catch(e){}}return!0})},jn=function(e){let t=null,r=null;if(Pt)e=`<remove></remove>`+e;else{let t=de(e,/^[\r\n\t ]+/);r=t&&t[0]}an===`application/xhtml+xml`&&Yt===J&&(e=`<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>`+e+`</body></html>`);let i=P?at(e):e;if(Yt===J)try{t=new u().parseFromString(i,an)}catch(e){}if(!t||!t.documentElement){t=lt.createDocument(Yt,`template`,null);try{t.documentElement.innerHTML=Xt?F:i}catch(e){}}let a=t.body||t.documentElement;return e&&r&&a.insertBefore(n.createTextNode(r),a.childNodes[0]||null),Yt===J?ft.call(t,U?`html`:`body`)[0]:U?t.documentElement:a},Mn=function(e){let t=_e?_e(e):e.ownerDocument;return ut.call(t||e,e,l.SHOW_ELEMENT|l.SHOW_COMMENT|l.SHOW_TEXT|l.SHOW_PROCESSING_INSTRUCTION|l.SHOW_CDATA_SECTION,null)},Nn=function(e){return e=fe(e,mt,` `),e=fe(e,ht,` `),e=fe(e,gt,` `),e},Pn=function(e){var t;Fn(e);let n=(t=e.querySelectorAll)==null?void 0:t.call(e,`template`);n&&_(n,e=>{Z(e.content)&&Pn(e.content)})},Fn=function(e){e.normalize();let t=_e?_e(e):e.ownerDocument,n=ut.call(t||e,e,l.SHOW_TEXT|l.SHOW_COMMENT|l.SHOW_CDATA_SECTION|l.SHOW_PROCESSING_INSTRUCTION,null),r=n.nextNode();for(;r;)r.data=Nn(r.data),r=n.nextNode()},In=function(e){let t=D?D(e):null;return typeof t!=`string`||Y(t)!==`form`?!1:typeof e.nodeName!=`string`||typeof e.textContent!=`string`||typeof e.removeChild!=`function`||e.attributes!==C(e)||typeof e.removeAttribute!=`function`||typeof e.removeAttributeNode!=`function`||typeof e.getAttributeNode!=`function`||typeof e.setAttribute!=`function`||typeof e.namespaceURI!=`string`||typeof e.insertBefore!=`function`||typeof e.hasChildNodes!=`function`||e.nodeType!==E(e)||e.childNodes!==b(e)},Z=function(e){if(!E||typeof e!=`object`||!e)return!1;try{return E(e)===j.documentFragment}catch(e){return!1}},Ln=function(e){if(!E||typeof e!=`object`||!e)return!1;try{return typeof E(e)==`number`}catch(e){return!1}};function Q(e,n,r){e.length!==0&&_(e,e=>{e.call(t,n,r,sn)})}let Rn=function(e,t){return!!(H&&e.hasChildNodes()&&!Ln(e.firstElementChild)&&w(He,e.textContent)&&w(He,e.innerHTML)||H&&Ke[t]&&N(e)===j.element&&et(e)===J&&(Ln(e.firstElementChild)||typeof e.textContent==`string`&&w(He,e.textContent))||e.nodeType===j.processingInstruction||H&&e.nodeType===j.comment&&w(Ue,e.data))},zn=function(e,t){return e instanceof RegExp?w(e,t):e instanceof Function&&!!e(t,...[...arguments].slice(2))},Bn=function(e,t,n){if(!Tt[t]&&Gn(t)&&zn(z.tagNameCheck,t))return!1;if(Bt&&!q[t]&&!q[y(t)]){let t=x(e),r=b(e);if(r&&t){let i=r.length;for(let a=i-1;a>=0;--a){let i=e===n?ee(r[a],!0):r[a];t.insertBefore(i,he(e))}}}return X(e),!0},Vn=function(e,t,n,r){return e.length===0?t:t===n||t===r?k(t):t},$=function(e,t){return e===t||x(e)!==null?!1:(Vt&&Sn(e),!0)},Hn=function(e,n){if(On(e),Q(I.beforeSanitizeElements,e,null),$(e,n))return!0;if(In(e))return X(e),!0;let r=Y(Qe(e));if(L=Vn(I.uponSanitizeElement,L,Ct,Mt),Q(I.uponSanitizeElement,e,{tagName:r,allowedTags:L}),$(e,n))return!0;if(Rn(e,r))return X(e),!0;if(Tt[r]||!(B.tagCheck instanceof Function&&B.tagCheck(r))&&!L[r]){let t=Bn(e,r,n);return t===!1&&(Q(I.afterSanitizeElements,e,null),$(e,n))?!0:t}if(N(e)===j.element&&!gn(e)||(r===`noscript`||r===`noembed`||r===`noframes`)&&w(We,e.innerHTML))return X(e),!0;if(V&&e.nodeType===j.text){let n=Nn(e.textContent);e.textContent!==n&&(ie(t.removed,{element:e.cloneNode()}),e.textContent=n)}return Q(I.afterSanitizeElements,e,null),$(e,n)},Un=function(e,t,r){if(Et[t]||kn(t,e)||Lt&&(t===`id`||t===`name`)&&(r in n||r in cn))return!1;let i=R[t]||B.attributeCheck instanceof Function&&B.attributeCheck(t,e);return Ot&&w(_t,t)||Dt&&w(vt,t)?!0:i?Gt[t]||w(St,fe(r,bt,``))||(t===`src`||t===`xlink:href`||t===`href`)&&e!==`script`&&pe(r,`data:`)===0&&Ut[e]||kt&&!w(yt,fe(r,bt,``))?!0:!r:Gn(e)&&zn(z.tagNameCheck,e)&&zn(z.attributeNameCheck,t,e)||t===`is`&&z.allowCustomizedBuiltInElements&&zn(z.tagNameCheck,r)},Wn=O({},[`annotation-xml`,`color-profile`,`font-face`,`font-face-format`,`font-face-name`,`font-face-src`,`font-face-uri`,`missing-glyph`]),Gn=function(e){return!Wn[y(e)]&&w(xt,e)},Kn=function(e,t,n,r){if(P&&typeof d==`object`&&typeof d.getAttributeType==`function`&&!n)switch(d.getAttributeType(e,t)){case`TrustedHTML`:return at(r);case`TrustedScriptURL`:return ot(r)}return r},qn=function(e,t,n,r){try{return n?e.setAttributeNS(n,t,r):e.setAttribute(t,r),!In(e)||(X(e),!1)}catch(n){return yn(t,e),!1}},Jn=function(e,t){return H&&w(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,t)?!0:y(e)===`attributename`&&de(t,`href`)!==null},Yn=function(e,n){if(Q(I.beforeSanitizeAttributes,e,null),$(e,n))return;let r=e.attributes;if(!r||In(e))return;R=Vn(I.uponSanitizeAttribute,R,wt,Nt);let i={attrName:``,attrValue:``,keepAttr:!0,allowedAttributes:R,forceKeepAttr:void 0},a=r.length,o=Y(e.nodeName);for(;a--;){let n=r[a],s=n.name,c=n.namespaceURI,l=n.value,u=Y(s),d=l,f=s===`value`?d:me(d),p=!1;i.attrName=u,i.attrValue=f,i.keepAttr=!0,i.forceKeepAttr=void 0,Q(I.uponSanitizeAttribute,e,i),f=i.attrValue,Rt&&(u===`id`||u===`name`)&&pe(f,zt)!==0&&(yn(s,e,n),f=zt+f,p=!0),Jn(s,f)?yn(s,e,n):i.forceKeepAttr||(i.keepAttr?!At&&w(Ge,f)?yn(s,e,n):(V&&(f=Nn(f)),Un(o,u,f)?(f=Kn(o,u,c,f),f!==d&&qn(e,s,c,f)&&p&&re(t.removed)):yn(s,e,n)):yn(s,e,n))}Q(I.afterSanitizeAttributes,e,null),$(e,n)},Xn=function(e){let t=null,n=Mn(e);for(Q(I.beforeSanitizeShadowDOM,e,null);t=n.nextNode();)if(Q(I.uponSanitizeShadowNode,t,null),Hn(t,e),Yn(t,e),Z(t.content)&&Xn(t.content),N(t)===j.element){let e=ge(t);Z(e)&&(Zn(e),Xn(e))}V&&Fn(e),Q(I.afterSanitizeShadowDOM,e,null)},Zn=function(e){let t=[{node:e,shadow:null}];for(;t.length>0;){let e=t.pop();if(e.shadow){Xn(e.shadow);continue}let n=e.node,r=N(n)===j.element,i=b(n);if(i)for(let e=i.length-1;e>=0;--e)t.push({node:i[e],shadow:null});if(r){let e=D?D(n):null;if(typeof e==`string`&&Y(e)===`template`){let e=n.content;Z(e)&&t.push({node:e,shadow:null})}}if(r){let e=ge(n);Z(e)&&t.push({node:null,shadow:e},{node:e,shadow:null})}}};return t.sanitize=function(e){let n=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},i=null,a=null,o=null,s=null;if(Xt=!e,Xt&&(e=`<!-->`),typeof e!=`string`&&!Ln(e)&&(e=ve(e),typeof e!=`string`))throw T(`dirty is not a string, aborting`);if(!t.isSupported)return e;jt?(L=Mt,R=Nt):un(n),(I.uponSanitizeElement.length>0||I.uponSanitizeAttribute.length>0)&&(L=k(L)),I.uponSanitizeAttribute.length>0&&(R=k(R)),t.removed=[];let c=Vt&&typeof e!=`string`&&Ln(e),l=[],u=G;if(c){An(e);let t=Qe(e);if(typeof t==`string`){let n=Y(t);if(!L[n]||Tt[n])throw vn(e),T(`root node is forbidden and cannot be sanitized in-place`)}if(In(e))throw vn(e),T(`root node is clobbered and cannot be sanitized in-place`);l=Cn(e),G=se()}else if(Ln(e))i=jn(`<!---->`),a=i.ownerDocument.importNode(e,!0),a.nodeType===j.element&&a.nodeName===`BODY`||a.nodeName===`HTML`?i=a:i.appendChild(a),Zn(i);else{if(!W&&!V&&!U&&e.indexOf(`<`)===-1)return P&&It?at(e):e;if(i=jn(e),!i)return W?null:It?F:``}i&&Pt&&X(i.firstChild);let d=c?e:i;try{c&&Zn(e);let t=Mn(d);for(;o=t.nextNode();)Hn(o,d),Yn(o,d),Z(o.content)&&Xn(o.content);c&&En(e,l)}catch(t){throw c&&(vn(e),Tn(e,l)),t}finally{G=u}if(c){if(Tn(e,l))throw T(`a node selected for removal could not be safely returned; refusing to sanitize in place`);return V&&Pn(e),e}if(W){if(V&&Pn(i),Ft)for(s=dt.call(i.ownerDocument);i.firstChild;)s.appendChild(i.firstChild);else s=i;return(R.shadowroot||R.shadowrootmode)&&(s=pt.call(r,s,!0)),s}let f=U?i.outerHTML:i.innerHTML;return U&&L[`!doctype`]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&w(Be,i.ownerDocument.doctype.name)&&(f=`<!DOCTYPE `+i.ownerDocument.doctype.name+`>
`+f),V&&(f=Nn(f)),P&&It?at(f):f},t.setConfig=function(){let e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:{};un(e),jt=!0,Mt=L,Nt=R},t.clearConfig=function(){sn=null,jt=!1,Mt=null,Nt=null,P=tt,F=``},t.isValidAttribute=function(e,t,n){sn||un({});let r=Y(e),i=Y(t);return typeof n==`string`&&(Jn(t,n)||!At&&w(Ge,n))?!1:Un(r,i,n)},t.addHook=function(e,t){typeof t==`function`&&S(I,e)&&ie(I[e],t)},t.removeHook=function(e,t){if(S(I,e)){if(t!==void 0){let n=ne(I[e],t);return n===-1?void 0:oe(I[e],n,1)[0]}return re(I[e])}},t.removeHooks=function(e){S(I,e)&&(I[e]=[])},t.removeAllHooks=function(){I=Ye()},t}return Ze()});
//# sourceMappingURL=purify.min.js.map
/* FastSEO safe DOM rendering bridge. HTML is sanitized before every dynamic insertion. */
(() => {
  const purifierConfig = {
    ADD_ATTR: ['toolname', 'tooldescription', 'toolparamdescription', 'fetchpriority'],
    ALLOW_DATA_ATTR: true,
    RETURN_TRUSTED_TYPE: false
  };
  let trustedPolicy = null;
  if (window.trustedTypes && window.DOMPurify) {
    try {
      trustedPolicy = window.trustedTypes.createPolicy('fastseo-dom', {
        createHTML: input => window.DOMPurify.sanitize(String(input), purifierConfig)
      });
    } catch (error) {
      console.warn('[FastSEO security] Trusted Types policy could not be created; sanitized string fallback remains active.', error);
    }
  }
  const safeURL = (value, options = {}) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.href);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
      if (url.origin === location.origin) return url.href;
      if (options.allowExternalImages && url.protocol === 'https:' && url.hostname === 'images.unsplash.com') return url.href;
      return '';
    } catch (_) {
      return '';
    }
  };
  const setHTML = (element, dirty) => {
    if (!element || !window.DOMPurify) return;
    const clean = window.DOMPurify.sanitize(String(dirty ?? ''), purifierConfig);
    element.innerHTML = trustedPolicy ? trustedPolicy.createHTML(clean) : clean;
  };
  window.FastSEODOM = Object.freeze({ setHTML, safeURL });
})();
/* فاست سيو | Fast Seo shared public-site interactions. Does not run in the admin dashboard. */
(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const path = location.pathname;
  // Load one shared Google font family (Cairo) on every public page.
  if (!document.querySelector('link[data-fastseo-google-font="cairo"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);
    const fontOrigin = document.createElement('link');
    fontOrigin.rel = 'preconnect';
    fontOrigin.href = 'https://fonts.gstatic.com';
    fontOrigin.crossOrigin = 'anonymous';
    document.head.appendChild(fontOrigin);
    const fontStylesheet = document.createElement('link');
    fontStylesheet.rel = 'stylesheet';
    fontStylesheet.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=optional';
    fontStylesheet.dataset.fastseoGoogleFont = 'cairo';
    document.head.appendChild(fontStylesheet);
  }
  const nested = /\/(articles|pages)\//.test(path);
  const root = nested ? '../' : './';
  const link = (href) => root + href;

  // Keep the Gradient Pulse identity while allowing a persistent light/dark color mode.
  const colorModeKey = 'fastseo-color-mode-v1';
  let savedColorMode = 'light';
  try {
    savedColorMode = localStorage.getItem(colorModeKey) === 'dark' ? 'dark' : 'light';
  } catch (_) {}
  document.documentElement.dataset.colorMode = savedColorMode;
  const optimizeImageUrl = (source, width) => {
    const safeSource = window.FastSEODOM.safeURL(source, { allowExternalImages: true });
    if (!safeSource) return '';
    try {
      const url = new URL(safeSource, location.href);
      if (url.hostname === 'images.unsplash.com') {
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        url.searchParams.set('w', String(width));
        url.searchParams.set('q', '75');
        return url.href;
      }
    } catch (_) {}
    return source;
  };
  const responsiveImageAttrs = (source, sizes) => {
    const safeSource = window.FastSEODOM.safeURL(source, { allowExternalImages: true });
    if (!safeSource) return '';
    try {
      const url = new URL(safeSource, location.href);
      if (url.hostname !== 'images.unsplash.com') return '';
      const srcset = [320, 640, 960].map(width => optimizeImageUrl(source, width) + ' ' + width + 'w').join(', ');
      return ' srcset="' + srcset + '" sizes="' + sizes + '"';
    } catch (_) { return ''; }
  };

  // One validated catalog request per page; all article widgets reuse the same promise.
  const articleCatalog = (() => {
    let request = null;
    return {
      load() {
        if (!request) {
          const primary = new URL(link('data/articles.json'), location.href);
          const candidates = [...new Set([primary.href, new URL('/data/articles.json', location.origin).href])];
          request = (async () => {
            let lastError = null;
            for (const url of candidates) {
              try {
                const response = await fetch(url, { cache: 'no-cache', credentials: 'same-origin' });
                if (!response.ok) throw new Error('HTTP ' + response.status + ' loading ' + url);
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('Article catalog must be a JSON array');
                const valid = data.filter(article => article && typeof article.title === 'string' && article.title.trim() && ((typeof article.file === 'string' && article.file.trim()) || (typeof article.slug === 'string' && article.slug.trim())));
                if (!valid.length) throw new Error('Article catalog contains no valid article titles');
                return valid;
              } catch (error) { lastError = error; }
            }
            throw lastError || new Error('Unable to load the article catalog');
          })().catch(error => { request = null; throw error; });
        }
        return request;
      }
    };
  })();
  window.MSEOArticleCatalog = articleCatalog;

  // Register optional WebMCP tools on supporting browsers; ordinary site behavior remains unchanged.
  if (!document.querySelector('script[data-fastseo-webmcp]')) {
    const webmcpScript = document.createElement('script');
    webmcpScript.src = link('assets/js/webmcp.js?v=20261114-webmcp-hardening');
    webmcpScript.async = true;
    webmcpScript.dataset.fastseoWebmcp = '';
    webmcpScript.dataset.catalogUrl = link('data/ai-catalog.json');
    webmcpScript.dataset.articlesUrl = link('data/articles.json');
    webmcpScript.dataset.toolsCatalogUrl = link('assets/js/tools-catalog.js');
    document.head.appendChild(webmcpScript);
  }

  // Refresh the brand shortcut icon on all pages so browsers do not keep the previous cached mark.
  document.querySelectorAll('link[rel~="icon"]').forEach((iconLink) => {
    iconLink.href = link('assets/favicon.svg?v=20261114-favicon-v2');
  });
  if (!document.querySelector('link[rel="icon"][type="image/png"]')) {
    const pngIcon = document.createElement('link');
    pngIcon.rel = 'icon'; pngIcon.type = 'image/png'; pngIcon.sizes = '32x32';
    pngIcon.href = link('assets/favicon-32x32.png?v=20261114-favicon-v2');
    document.head.appendChild(pngIcon);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    touchIcon.href = link('assets/favicon-32x32.png?v=20261114-favicon-v2');
    document.head.appendChild(touchIcon);
  }


  // Load Font Awesome after the page load; icons must not delay initial rendering.
  const loadFontAwesome = () => {
    if (document.querySelector('script[data-fontawesome-kit]')) return;
    const fontAwesomeKit = document.createElement('script');
    fontAwesomeKit.src = 'https://kit.fontawesome.com/5ed1f7cde5.js';
    fontAwesomeKit.crossOrigin = 'anonymous';
    fontAwesomeKit.async = true;
    fontAwesomeKit.setAttribute('data-fontawesome-kit', '');
    document.head.appendChild(fontAwesomeKit);
  };
  const scheduleOptionalAssets = callback => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(callback, { timeout: 2500 });
    else window.setTimeout(callback, 1200);
  };
  window.addEventListener('load', () => scheduleOptionalAssets(loadFontAwesome), { once: true });

  const navItems = [
    ['index.html','الرئيسية'],
    ['pages/ai.html','الذكاء الاصطناعي'],
    ['pages/web-development.html','تطوير المواقع'],
    ['pages/programming.html','البرمجة'],
    ['pages/seo.html','SEO'],
    ['pages/tools.html','الأدوات'],
    ['pages/archive.html','الأرشيف']
  ];
  // Use one fixed site-wide palette: Gradient Pulse.
  document.documentElement.dataset.theme = 'gradient-pulse';
  if (!document.querySelector('link[data-fastseo-theme-css]')) {
    const themeCss = document.createElement('link');
    themeCss.rel = 'stylesheet';
    themeCss.href = link('assets/css/theme-system.css?v=20261114-gradient-pulse-only');
    themeCss.dataset.fastseoThemeCss = '';
    document.head.appendChild(themeCss);
  }
  // Keep article breadcrumbs canonical and friendly; never expose index.html in the home crumb.
  const articleBreadcrumb = $('nav[aria-label="مسار التنقل"]');
  if (articleBreadcrumb) {
    const homeCrumb = articleBreadcrumb.querySelector('a');
    if (homeCrumb) homeCrumb.setAttribute('href', '/');
  }

  const header = $('[data-site-header]') || $('[data-home-header]');
  if (header) {
    header.style.minHeight = window.matchMedia('(max-width: 760px)').matches ? '70px' : '82px';
    window.FastSEODOM.setHTML(header, `
      <header class="mseo-header">
        <div class="mseo-header-inner">
          <button class="mseo-icon-button mseo-menu-toggle" type="button" aria-label="${'فتح القائمة'}" aria-expanded="false" data-menu-toggle><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
          <a class="mseo-brand" href="${link('')}" aria-label="Fast Seo ${'الرئيسية'}"><img class="mseo-brand-logo" src="${link('assets/images/fastseo-logo-header.svg?v=20261114-brand-v1')}" alt="" width="148" height="46" decoding="async" style="display:block;width:148px;height:46px;object-fit:contain"></a>
          <nav class="mseo-nav" data-main-nav aria-label="${'القائمة الرئيسية'}">
            ${navItems.map(([href,label])=>`<a href="${link(href === 'index.html' ? '' : href)}" ${((href==='index.html' && (path.endsWith('/mseo/') || path.endsWith('/index.html') || path === '/')) || (href!=='index.html' && path.endsWith('/'+href)))?'aria-current="page"':''}>${label}</a>`).join('')}
          </nav>
          <div class="mseo-actions">
            <button class="mseo-icon-button" type="button" data-search-toggle aria-label="${'فتح البحث'}" title="${'بحث'}"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
            </div>
        </div>
        <div class="mseo-search-panel" data-search-panel>
          <form action="${link('pages/archive.html')}" method="get" data-webmcp-search toolname="fastseo_search_articles" tooldescription="Search Fast Seo articles and guides by keyword."><label class="sr-only" for="mseo-global-search">${'ابحث في المقالات'}</label><input id="mseo-global-search" name="q" type="search" toolparamdescription="Search term or topic to find relevant articles and guides." placeholder="${'ابحث في مقالات فاست سيو | Fast Seo…'}" /><button type="submit">${'بحث'}</button></form>
        </div>
      </header>`);
  }
  // Advertise the RSS feed to browsers and feed readers on every public page.
  if (!document.querySelector('link[rel="alternate"][type="application/rss+xml"]')) {
    const rssLink = document.createElement('link');
    rssLink.rel = 'alternate';
    rssLink.type = 'application/rss+xml';
    rssLink.title = 'فاست سيو | Fast Seo — RSS';
    rssLink.href = link('feed.xml');
    document.head.appendChild(rssLink);
  }

  const footer = $('[data-site-footer]') || $('[data-home-footer]');
  if (footer) {
    window.FastSEODOM.setHTML(footer, `
      <footer class="mseo-footer">
        <div class="mseo-footer-inner">
          <section class="mseo-footer-brand-card" aria-label="عن فاست سيو">
            <a class="mseo-brand mseo-footer-brand" href="${link('')}" aria-label="فاست سيو — الصفحة الرئيسية">
              <img class="mseo-brand-logo" src="${link('assets/images/fastseo-logo-footer.svg?v=20261114-brand-v1')}" alt="فاست سيو | Fast Seo" width="180" height="48" decoding="async" onerror="this.onerror=null;this.src='${link('assets/favicon.svg?v=20261028')}'">
            </a>
            <p class="mseo-footer-tagline">المرجع العربي نحو الظهور الأفضل في محركات البحث، مع أدلة عملية في SEO والذكاء الاصطناعي وتطوير المواقع.</p>
            <nav class="mseo-socials" aria-label="مواقع التواصل الاجتماعي">
              <a href="https://x.com/laraforum" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></a>
              <a href="https://m.facebook.com/61577188775609" target="_blank" rel="noopener noreferrer" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
              <a href="https://www.instagram.com/larache_forum" target="_blank" rel="noopener noreferrer" aria-label="إنستغرام"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
              <a href="https://ma.linkedin.com/in/imad-limrani-0221aa3aa" target="_blank" rel="noopener noreferrer" aria-label="لينكدإن"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
              <a href="https://github.com/gpldroid/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a>
              <a href="https://wa.me/212783539816" target="_blank" rel="noopener noreferrer" aria-label="واتساب"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
            </nav>
          </section>
          <div class="mseo-footer-grid">            
            <section class="mseo-footer-group">
              <h3>الأرشيف و RSS</h3>
              <nav class="mseo-footer-links" aria-label="الأرشيف وRSS">
                <a href="${link('pages/archive.html')}">أرشيف المقالات</a>
                <a href="${link('feed.xml')}">خلاصة RSS</a>
                <a href="${link('sitemap.xml')}">خارطة الموقع</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>عن الموقع</h3>
              <nav class="mseo-footer-links" aria-label="عن الموقع والتواصل">
                <a href="${link('pages/about.html')}">من نحن</a>
                <a href="${link('pages/contact.html')}">اتصل بنا</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>الصفحات الأساسية</h3>
              <nav class="mseo-footer-links" aria-label="الصفحات الأساسية">              
                <a href="${link('pages/privacy.html')}">سياسة الخصوصية</a>
                <a href="${link('pages/terms.html')}">شروط الاستخدام</a>
                <a href="${link('pages/editorial-policy.html')}">سياسة النشر</a>
              </nav>
            </section>
            <section class="mseo-footer-group">
              <h3>روابط سريعة</h3>
              <nav class="mseo-footer-links" aria-label="روابط سريعة">
                <a href="${link('pages/topics.html')}">جميع المقالات</a>
                <a href="${link('pages/tools.html')}">الأدوات المجانية</a>
                <a href="${link('pages/internet-speed-test.html')}">قياس سرعة الإنترنت</a>
                <a href="${link('pages/categories.html')}">التصنيفات</a>
              </nav>
            </section>
          </div>
          <div class="mseo-copyright">
            <span class="mseo-footer-copyright-text">© فاست سيو <span data-footer-year>2026</span> جميع الحقوق محفوظة.</span>
            <span>تطوير <a href="${link('pages/about.html')}">عماد الدين لمراني</a></span>
          </div>
        </div>
      </footer>`);
  }
  const year = $('[data-current-year]'); if (year) year.textContent = new Date().getFullYear();
  document.querySelectorAll('[data-footer-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const menuButton=$('[data-menu-toggle]'), nav=$('[data-main-nav]');
  if(menuButton&&nav){menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));window.FastSEODOM.setHTML(menuButton, open?'<i class="fa-solid fa-xmark" aria-hidden="true"></i>':'<i class="fa-solid fa-bars" aria-hidden="true"></i>');});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');window.FastSEODOM.setHTML(menuButton, '<i class="fa-solid fa-bars" aria-hidden="true"></i>');}});}
  const searchButton=$('[data-search-toggle]'),searchPanel=$('[data-search-panel]');
  if(searchButton&&searchPanel){searchButton.addEventListener('click',()=>{const open=searchPanel.classList.toggle('is-open');if(open)$('#mseo-global-search')?.focus();});}

  // Floating light/dark switcher: this changes brightness only, never the Gradient Pulse theme.
  if (!document.querySelector('[data-mode-toggle]')) {
    const modeButton = document.createElement('button');
    modeButton.type = 'button';
    modeButton.className = 'mseo-mode-toggle';
    modeButton.setAttribute('data-mode-toggle', '');
    modeButton.setAttribute('aria-pressed', String(savedColorMode === 'dark'));
    modeButton.setAttribute('aria-label', savedColorMode === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن');
    modeButton.title = modeButton.getAttribute('aria-label');
    window.FastSEODOM.setHTML(modeButton, savedColorMode === 'dark' ? '<span aria-hidden="true">☀</span>' : '<span aria-hidden="true">☾</span>');
    modeButton.addEventListener('click', () => {
      const nextMode = document.documentElement.dataset.colorMode === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.colorMode = nextMode;
      modeButton.setAttribute('aria-pressed', String(nextMode === 'dark'));
      modeButton.setAttribute('aria-label', nextMode === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن');
      modeButton.title = modeButton.getAttribute('aria-label');
      window.FastSEODOM.setHTML(modeButton, nextMode === 'dark' ? '<span aria-hidden="true">☀</span>' : '<span aria-hidden="true">☾</span>');
      try { localStorage.setItem(colorModeKey, nextMode); } catch (_) {}
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.content = nextMode === 'dark' ? '#141324' : '#f7f4ff';
    });
    document.body.appendChild(modeButton);
  }

  // Mobile tab bar: point to the current category section when present, otherwise the archive.
  if (!document.querySelector('[data-mobile-tabbar]')) {
    const home = path === '/' || path.endsWith('/index.html') || path.endsWith('/mseo/');
    const pageMatch = path.match(/\/pages\/([^/]+)\.html$/);
    const categoryPage = Boolean(pageMatch && ['ai','web-development','programming','seo'].includes(pageMatch[1]));
    const tabs = [
      ['index.html','الرئيسية','fa-house',home],
      ['pages/categories.html','التصنيفات','fa-layer-group',path.endsWith('/pages/categories.html') || categoryPage],
      ['pages/topics.html','المقالات','fa-book-open',path.endsWith('/pages/topics.html') || path.includes('/articles/')],
      ['pages/tools.html','الأدوات','fa-screwdriver-wrench',path.endsWith('/pages/tools.html')],
      ['pages/archive.html','الأرشيف','fa-box-archive',path.endsWith('/pages/archive.html')]
    ];
    const bar = document.createElement('nav');
    bar.className = 'mseo-mobile-tabbar';
    bar.setAttribute('data-mobile-tabbar', '');
    bar.setAttribute('aria-label', 'التنقل السريع');
    window.FastSEODOM.setHTML(bar, tabs.map(([href,label,icon,active]) => {
      const target = href.startsWith('#') ? href : link(href === 'index.html' ? '' : href);
      return '<a href="' + target + '"' + (active ? ' aria-current="page"' : '') + '><i class="fa-solid ' + icon + '" aria-hidden="true"></i><span>' + label + '</span></a>';
    }).join(''));
    document.body.appendChild(bar);
  }

  // Read all candidate content first, then batch DOM updates to avoid read/write interleaving.
  const symbolIcons = {'✓':'fa-check','↓':'fa-arrow-down','↑':'fa-arrow-up','⌕':'fa-magnifying-glass','⌄':'fa-chevron-down','←':'fa-arrow-left','↗':'fa-arrow-up-right-from-square','✳':'fa-wand-magic-sparkles'};
  const symbolUpdates = [];
  document.querySelectorAll('span[aria-hidden="true"], .eyebrow, .hero-points span, .hero-actions a').forEach(el => {
    if (el.children.length || el.closest('.mseo-mobile-tabbar')) return;
    const symbol = el.textContent.trim();
    if (symbolIcons[symbol]) symbolUpdates.push([el, '<i class="fa-solid ' + symbolIcons[symbol] + '" aria-hidden="true"></i>']);
    else if (symbol.startsWith('✓ ')) symbolUpdates.push([el, '<i class="fa-solid fa-check" aria-hidden="true"></i> ' + symbol.slice(1).trim()]);
  });
  symbolUpdates.forEach(([el, markup]) => { window.FastSEODOM.setHTML(el, markup); });

  const controls=document.createElement('div');controls.className='mseo-scroll-controls';window.FastSEODOM.setHTML(controls, '<button type="button" data-scroll-top aria-label="العودة إلى أعلى الصفحة" title="أعلى الصفحة"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button><button type="button" data-scroll-down aria-label="الانتقال إلى أسفل الصفحة" title="أسفل الصفحة"><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>');document.body.append(controls);
  const topButton=$('[data-scroll-top]',controls),downButton=$('[data-scroll-down]',controls);
  let scrollFrame=0;
  let topButtonVisible=false;
  const updateScrollControl=()=>{
    scrollFrame=0;
    const nextVisible=window.scrollY>300;
    if(nextVisible!==topButtonVisible){
      topButtonVisible=nextVisible;
      topButton.classList.toggle('is-visible',nextVisible);
    }
  };
  const onScroll=()=>{
    if(!scrollFrame) scrollFrame=window.requestAnimationFrame(updateScrollControl);
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  downButton.addEventListener('click',()=>document.querySelector('footer.mseo-footer')?.scrollIntoView({behavior:'smooth',block:'end'}));
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const target=$(a.getAttribute('href'));if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}}));
})();
/* Cookie consent: show three seconds after the full page load event. */
(() => {
 const showCookieConsent=()=>{
  if(document.querySelector('.mseo-cookie-banner'))return;
  const key='mseo-cookie-consent-v1';
  let choice=null;
  try { choice=localStorage.getItem(key); } catch (_) {}
  if(choice)return;
  const banner=document.createElement('section');
  banner.className='mseo-cookie-banner';
  banner.setAttribute('role','dialog');
  banner.setAttribute('aria-label','إعدادات ملفات تعريف الارتباط');
  banner.setAttribute('aria-live','polite');
  window.FastSEODOM.setHTML(banner, '<div class="mseo-cookie-copy"><strong>خصوصيتك تهمنا</strong><p>يستخدم الموقع التخزين المحلي لحفظ تفضيلات الواجهة، مثل المظهر. لا يتم تفعيل ملفات تحليل أو إعلانات اختيارية من خلال هذه الرسالة.</p><a href="'+(location.pathname.includes('/articles/')||location.pathname.includes('/pages/')?'../':'./')+'pages/privacy.html">اقرأ سياسة الخصوصية</a></div><div class="mseo-cookie-actions"><button type="button" data-cookie-accept>موافق</button><button type="button" data-cookie-dismiss>إغلاق</button></div>');
  const save=value=>{try{localStorage.setItem(key,value);}catch(_){}banner.remove();};
  banner.querySelector('[data-cookie-accept]').addEventListener('click',()=>save('accepted'));
  banner.querySelector('[data-cookie-dismiss]').addEventListener('click',()=>save('dismissed'));
  document.body.append(banner);
 };
 const scheduleCookieConsent=()=>window.setTimeout(showCookieConsent,3000);
 if(document.readyState==='complete'){
  scheduleCookieConsent();
 }else{
  window.addEventListener('load',scheduleCookieConsent,{once:true});
 }
})();


/* Archive renderer: six articles initially, then six more per click. */
(()=>{
 const $=s=>document.querySelector(s),search=$('#archive-search'),select=$('#archive-category'),grid=$('#archive-grid'),count=$('#archive-count');
 if(!search||!select||!grid||!count)return;
 const params=new URLSearchParams(location.search),batch=6;let all=[],shown=batch;
 let more=$('#archive-load-more');if(!more){more=document.createElement('div');more.id='archive-load-more';more.className='pagination';more.hidden=true;grid.insertAdjacentElement('afterend',more);}
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 window.MSEOArticleCatalog.load().then(data=>{all=data;const cats=[...new Set(all.map(a=>a.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ar'));window.FastSEODOM.setHTML(select, '<option value="">كل التصنيفات</option>'+cats.map(cat=>'<option value="'+esc(cat)+'">'+esc(cat)+'</option>').join(''));select.value=params.get('category')||'';search.value=params.get('q')||'';render();}).catch(()=>{const err=$('#archive-error');if(err)err.hidden=false;count.textContent='';window.FastSEODOM.setHTML(grid, '');more.hidden=true;});
 function render(animateFrom=-1){
  const q=(search.value||'').toLocaleLowerCase('ar').trim(),cat=select.value;
  const filtered=all.filter(a=>(!cat||a.category===cat)&&(!q||[a.title,a.description,a.category,...(a.tags||[])].join(' ').toLocaleLowerCase('ar').includes(q)));
  shown=Math.min(shown,filtered.length);
  window.FastSEODOM.setHTML(grid, filtered.length?filtered.map((a,i)=>{const image=a.thumbnail||a.image||'assets/favicon.svg',src=/^(?:https?:)?\/\//i.test(image)?image:'../'+image,href='../articles/'+encodeURIComponent(a.file||a.slug+'.html');return '<article class="article-card mseo-load-card"'+(i>=shown?' hidden':'')+(i>=animateFrom&&i<shown?' data-enter="1"':'')+'><a href="'+href+'" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" width="640" height="400"'+responsiveImageAttrs(src,'(max-width: 700px) calc(100vw - 36px), (max-width: 1100px) 50vw, 33vw')+' src="'+esc(optimizeImageUrl(src,640))+'" alt=""></a><div class="article-card-body"><span class="article-category">'+esc(a.category)+'</span><h3><a href="'+href+'" aria-label="'+esc(a.title)+'">'+esc(a.title)+'</a></h3><p>'+esc(a.description)+'</p><a class="site-read" href="'+href+'" aria-label="'+esc(a.title)+'">اقرأ المقال ←</a></div></article>';}).join(''):'<p class="loading-card">لا توجد نتائج مطابقة.</p>');
  grid.querySelectorAll('[data-enter="1"]').forEach(el=>{el.classList.add('mseo-card-enter');el.removeAttribute('data-enter');});
  count.textContent='عرض '+Math.min(shown,filtered.length)+' من '+filtered.length+' مقالًا';
  const left=filtered.length-shown;more.hidden=left<=0;window.FastSEODOM.setHTML(more, left>0?'<button type="button" class="mseo-load-more" data-load-more>تحميل 6 مقالات إضافية <span aria-hidden="true">↓</span></button>':'');
  more.querySelector('[data-load-more]')?.addEventListener('click',()=>{const old=shown;shown=Math.min(shown+batch,filtered.length);render(old);});
 }
 search.addEventListener('input',()=>{shown=batch;render();});select.addEventListener('change',()=>{shown=batch;render();});
})();



/* Shared enhancements for every individual article page. */
(() => {
  if (!/\/articles\/[^/]+\.html$/.test(location.pathname)) return;
  const root = '../';
  const $ = (selector, context=document) => context.querySelector(selector);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const link = path => root + path;
  const main = $('main');
  const article = main && $('article', main);
  if (!main || !article || main.querySelector('.article-page-layout')) return;
  main.classList.add('article-page-main');
  const breadcrumb = $('nav[aria-label="مسار التنقل"]', main);
  // Normalize legacy article markup: the breadcrumb must sit outside <article>.
  // Otherwise the shared layout can be inserted into its own descendant and throw HierarchyRequestError.
  if (breadcrumb && article.contains(breadcrumb) && article.parentNode) {
    article.parentNode.insertBefore(breadcrumb, article);
  }
  const layout = document.createElement('div');
  layout.className = 'article-page-layout';
  const content = document.createElement('div');
  content.className = 'article-page-content';
  const sidebar = document.createElement('aside');
  sidebar.className = 'article-page-sidebar';
  sidebar.setAttribute('aria-label', 'الشريط الجانبي للمقالات');
  window.FastSEODOM.setHTML(sidebar, '<section class="sidebar-widget"><h2>أحدث المقالات</h2><ul class="sidebar-latest" data-article-sidebar-latest><li>جارٍ تحميل المقالات…</li></ul></section><section class="sidebar-widget"><h2>الأكثر مشاهدة</h2><p class="sidebar-widget-note">ترتيب زمني يبدأ بالمقالات الأقدم؛ لا تتوفر حالياً بيانات مشاهدة فعلية.</p><ol class="sidebar-popular" data-article-sidebar-popular><li>جارٍ تحميل المقالات…</li></ol></section><section class="sidebar-widget"><h2>تصفّح حسب التصنيف</h2><ul class="sidebar-categories" data-article-sidebar-categories><li>جارٍ تحميل التصنيفات…</li></ul></section><section class="sidebar-widget sidebar-social-widget"><h2>تابعنا</h2><nav class="sidebar-socials" aria-label="مواقع التواصل الاجتماعي"><a href="https://x.com/laraforum" target="_blank" rel="noopener noreferrer" aria-label="X"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i></a><a href="https://m.facebook.com/61577188775609" target="_blank" rel="noopener noreferrer" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a><a href="https://www.instagram.com/larache_forum" target="_blank" rel="noopener noreferrer" aria-label="إنستغرام"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a><a href="https://ma.linkedin.com/in/imad-limrani-0221aa3aa" target="_blank" rel="noopener noreferrer" aria-label="لينكدإن"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a><a href="https://github.com/gpldroid/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github" aria-hidden="true"></i></a><a href="https://wa.me/212783539816" target="_blank" rel="noopener noreferrer" aria-label="واتساب"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a></nav></section><section class="sidebar-widget sidebar-promo"><span class="section-kicker">أدوات مجانية</span><h2>أنجز مهامك أسرع</h2><p>استخدم أدوات فاست سيو | Fast Seo المجانية لتحسين المحتوى وSEO وتطوير الويب.</p><a class="site-read" href="../pages/tools.html">استكشف الأدوات ←</a></section>');
  if (breadcrumb) breadcrumb.insertAdjacentElement('afterend', layout);
  else main.insertAdjacentElement('afterbegin', layout);
  layout.append(content, sidebar);
  content.appendChild(article);
  const carousel = document.createElement('section');
  carousel.className = 'section latest-carousel-section article-latest-carousel-section';
  carousel.setAttribute('aria-labelledby', 'article-latest-carousel-title');
  window.FastSEODOM.setHTML(carousel, '<div class="section-heading"><div><span class="section-kicker">واصل الاستكشاف</span><h2 id="article-latest-carousel-title">أحدث المقالات</h2><p>مقالات وأدلة جديدة من مكتبة فاست سيو | Fast Seo.</p></div><span class="heading-count" aria-hidden="true">03 / 05</span></div><div class="latest-carousel" data-article-carousel><button class="carousel-arrow" type="button" data-article-prev aria-label="المقالات السابقة">‹</button><div class="latest-carousel-track" data-article-latest-carousel aria-live="polite"><div class="loading-card">جارٍ تحميل أحدث المقالات…</div></div><button class="carousel-arrow" type="button" data-article-next aria-label="المقالات التالية">›</button></div><div class="carousel-dots" data-article-carousel-dots aria-label="اختيار المقال"></div>');
  main.appendChild(carousel);
  window.MSEOArticleCatalog.load().then(items => {
    const articles = items.slice().sort((a,b) => String(b.updatedAt || b.publishedAt || '').localeCompare(String(a.updatedAt || a.publishedAt || '')));
    const latest = articles.slice(0, 5);
    const sidebarLatest = $('[data-article-sidebar-latest]');
    const sidebarPopular = $('[data-article-sidebar-popular]');
    const sidebarCategories = $('[data-article-sidebar-categories]');
    const sidebarItem = (a, rank) => {
      const href = link('articles/' + encodeURIComponent(a.file || a.slug + '.html'));
      const image = a.thumbnail || a.image || link('assets/favicon.svg');
      const imageSrc = /^https?:\/\//i.test(image) ? image : link(image);
      return '<li class="sidebar-article-item"><a class="sidebar-article-thumb" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + esc(imageSrc) + '" alt="" width="88" height="66" loading="lazy" decoding="async"></a><div class="sidebar-article-copy">' + (rank ? '<span class="sidebar-rank">' + rank + '</span>' : '') + '<a class="sidebar-article-title" href="' + href + '">' + esc(a.title) + '</a><span class="sidebar-article-category">' + esc(a.category || 'مقالات') + '</span></div></li>';
    };
    const oldestFirst = articles.slice().sort((a,b) => String(a.publishedAt || a.updatedAt || '').localeCompare(String(b.publishedAt || b.updatedAt || '')));
    if (sidebarLatest) window.FastSEODOM.setHTML(sidebarLatest, oldestFirst.slice(0,5).map((a,i) => sidebarItem(a,i+1)).join('') || '<li>لا توجد مقالات حاليًا.</li>');
    if (sidebarPopular) window.FastSEODOM.setHTML(sidebarPopular, oldestFirst.slice(0,5).map((a,i) => sidebarItem(a,i+1)).join('') || '<li>لا توجد مقالات حاليًا.</li>');
    const categories = [...new Set(articles.map(a => a.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ar'));
    if (sidebarCategories) window.FastSEODOM.setHTML(sidebarCategories, categories.map(category => '<li><a href="' + link('pages/archive.html') + '?category=' + encodeURIComponent(category) + '">' + esc(category) + '</a><span class="sidebar-category-count">' + articles.filter(a => a.category === category).length + '</span></li>').join('') || '<li>لا توجد تصنيفات حاليًا.</li>');
    const track = $('[data-article-latest-carousel]');
    const dots = $('[data-article-carousel-dots]');
    const carouselRoot = $('[data-article-carousel]');
    if (!track) return;
    window.FastSEODOM.setHTML(track, latest.map((a,i) => {
      const href = link('articles/' + encodeURIComponent(a.file || a.slug + '.html'));
      const image = a.thumbnail || a.image || 'assets/favicon.svg';
      const imageSrc = /^https?:\/\//i.test(image) ? image : link(image);
      return '<article class="latest-carousel-card" data-article-slide="' + i + '"><a class="latest-carousel-image" href="' + href + '" tabindex="-1" aria-hidden="true"><img loading="lazy" decoding="async" width="480" height="270"' + responsiveImageAttrs(imageSrc,'(max-width: 540px) 90vw, (max-width: 800px) 45vw, 30vw') + ' src="' + esc(optimizeImageUrl(imageSrc,640)) + '" alt=""></a><div class="latest-carousel-copy"><span class="article-category">' + esc(a.category || 'مقالات') + '</span><span class="carousel-index">0' + (i+1) + ' / 0' + latest.length + '</span><h3><a href="' + href + '" aria-label="' + esc(a.title) + '">' + esc(a.title) + '</a></h3><p>' + esc(a.description || 'اكتشف الدليل الكامل في مكتبة فاست سيو | Fast Seo.') + '</p><a class="button button-primary" href="' + href + '" aria-label="' + esc(a.title) + '">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>';
    }).join('') || '<p class="loading-card">لا توجد مقالات متاحة حاليًا.</p>');
    const slides = [...track.querySelectorAll('[data-article-slide]')];
    let active = 0, timer = null, visible = false;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const show = index => {
      if (!slides.length) return;
      active = (index + slides.length) % slides.length;
      slides[active].scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'nearest', inline:'start'});
      if (dots) dots.querySelectorAll('button').forEach((dot,i) => {
        dot.setAttribute('aria-current', String(i === active));
        dot.setAttribute('aria-label', 'عرض المقال ' + (i+1));
      });
    };
    if (dots) {
      window.FastSEODOM.setHTML(dots, slides.map((slide,i) => '<button type="button" aria-label="عرض المقال ' + (i+1) + '" aria-current="' + String(i === 0) + '" data-article-slide-to="' + i + '"></button>').join(''));
      dots.querySelectorAll('[data-article-slide-to]').forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.articleSlideTo))));
    }
    $('[data-article-prev]')?.addEventListener('click', () => show(active-1));
    $('[data-article-next]')?.addEventListener('click', () => show(active+1));
    const start = () => {
      stop();
      if (visible && !document.hidden && slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(active+1), 8000);
    };
    carouselRoot?.addEventListener('mouseenter', stop);
    carouselRoot?.addEventListener('mouseleave', start);
    carouselRoot?.addEventListener('focusin', stop);
    carouselRoot?.addEventListener('focusout', event => { if (!carouselRoot.contains(event.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    if ('IntersectionObserver' in window && carouselRoot) {
      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        visible ? start() : stop();
      }, {threshold: 0.15});
      observer.observe(carouselRoot);
    } else { visible = true; start(); }
  }).catch(() => {
    const track = $('[data-article-latest-carousel]');
    if (track) window.FastSEODOM.setHTML(track, '<p class="loading-card">تعذر تحميل أحدث المقالات.</p>');
  });
})();

/* AdSense placements: fluid units, loaded only shortly before they enter the viewport. */
(() => {
  const client = 'ca-pub-1849282438800062';
  const slot = '4210287912';
  const main = document.querySelector('main');
  if (!main) return;

  let adsenseLoadPromise = null;

  const loadAdsense = () => {
    if (adsenseLoadPromise) return adsenseLoadPromise;

    adsenseLoadPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-mseo-adsense]');
      if (!script) {
        script = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
      }

      if (script) {
        if (script.dataset.mseoAdsenseLoaded === 'true') {
          resolve();
          return;
        }
        script.addEventListener('load', resolve, { once: true });
        script.addEventListener('error', () => reject(new Error('AdSense failed to load')), { once: true });
        return;
      }

      script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + client;
      script.dataset.mseoAdsense = '';
      script.addEventListener('load', () => {
        script.dataset.mseoAdsenseLoaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => {
        adsenseLoadPromise = null;
        script.remove();
        reject(new Error('AdSense failed to load'));
      }, { once: true });
      document.head.appendChild(script);
    });

    return adsenseLoadPromise;
  };

  const requestAd = ins => {
    if (ins.dataset.mseoAdRequested === 'true') return;
    ins.dataset.mseoAdRequested = 'true';

    loadAdsense()
      .then(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      })
      .catch(error => {
        delete ins.dataset.mseoAdRequested;
        console.warn('[Fast Seo AdSense] Ad could not be initialized:', error);
      });
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const ins = entry.target.querySelector('ins.adsbygoogle');
          if (ins) requestAd(ins);
        });
      }, { rootMargin: '300px 0px', threshold: 0 })
    : null;

  const placeAdAfter = (anchor, placement) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mseo-ad-placement mseo-ad-' + placement;
    wrapper.dataset.mseoAdPlacement = placement;
    wrapper.setAttribute('role', 'complementary');
    wrapper.setAttribute('aria-label', 'إعلان');

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-format', 'fluid');
    ins.setAttribute('data-ad-layout-key', '-fb+5w+4e-db+86');
    ins.setAttribute('data-ad-client', client);
    ins.setAttribute('data-ad-slot', slot);
    wrapper.appendChild(ins);

    // Insert first so AdSense measures the final layout, then observe the placement.
    anchor.insertAdjacentElement('afterend', wrapper);
    if (observer) observer.observe(wrapper);
    else requestAd(ins);
  };

  if (/\/articles\/[^/]+\.html$/.test(location.pathname)) {
    const prose = main.querySelector('article .prose');
    if (!prose) return;
    const paragraphs = [...prose.querySelectorAll('p')].filter(p => p.textContent.trim());
    if (!paragraphs.length) return;

    const middleIndex = Math.max(0, Math.floor(paragraphs.length / 2) - 1);
    if (!prose.querySelector('[data-mseo-ad-placement="middle"]')) {
      placeAdAfter(paragraphs[middleIndex], 'middle');
    }

    const finalParagraph = paragraphs[paragraphs.length - 1];
    if (!prose.querySelector('[data-mseo-ad-placement="bottom"]')) {
      placeAdAfter(finalParagraph, 'bottom');
    }
    return;
  }

  if (main.classList.contains('seo-tool-page')) {
    const paragraphs = [...main.querySelectorAll('p')].filter(p => p.textContent.trim());
    if (!paragraphs.length || main.querySelector('[data-mseo-ad-placement="bottom"]')) return;
    placeAdAfter(paragraphs[paragraphs.length - 1], 'bottom');
  }
})();

/* Category archive cards: reveal six articles at a time, matching the homepage. */
(() => {
  document.querySelectorAll('[data-category-grid]').forEach(grid => {
    const cards = [...grid.children].filter(card => card.classList.contains('category-article-card'));
    if (cards.length <= 6) return;
    const batch = 6;
    let shown = batch;
    cards.forEach((card, index) => { card.hidden = index >= shown; });
    const controls = document.createElement('div');
    controls.className = 'category-load-more-wrap';
    window.FastSEODOM.setHTML(controls, '<p class="category-load-more-count" aria-live="polite"></p><button type="button" class="mseo-load-more" data-category-load-more>تحميل 6 مقالات إضافية <span aria-hidden="true">↓</span></button>');
    grid.insertAdjacentElement('afterend', controls);
    const button = controls.querySelector('[data-category-load-more]');
    const count = controls.querySelector('.category-load-more-count');
    const update = () => {
      count.textContent = 'عرض ' + Math.min(shown, cards.length) + ' من ' + cards.length + ' مقالًا';
      const left = cards.length - shown;
      button.hidden = left <= 0;
      if (left > 0) window.FastSEODOM.setHTML(button, 'تحميل ' + Math.min(batch, left) + ' مقالات إضافية <span aria-hidden="true">↓</span>');
    };
    button.addEventListener('click', () => {
      const nextShown = Math.min(shown + batch, cards.length);
      cards.slice(shown, nextShown).forEach(card => { card.hidden = false; });
      shown = nextShown;
      update();
    });
    update();
  });
})();
