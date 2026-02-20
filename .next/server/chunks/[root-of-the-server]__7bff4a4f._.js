module.exports=[93695,(e,t,o)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,o)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,o)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,o)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,o)=>{t.exports=e.x("util",()=>require("util"))},19856,e=>{"use strict";var t=e.i(62294);async function o(e){try{console.log(`[DESCUENTOS] Buscando descuentos para producto ID: ${e}`),await (0,t.query)(`
      UPDATE descuentos 
      SET estado = 'inactivo' 
      WHERE fecha_fin IS NOT NULL 
        AND fecha_fin < CURDATE() 
        AND estado = 'activo'
    `);let o=await (0,t.query)(`
      SELECT p.*, p.tipo_prenda_id, tp.id as tipo_prenda_id_join
      FROM productos p
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      WHERE p.id = ?
    `,[e]);if(!o||0===o.length)return console.log(`[DESCUENTOS] Producto ${e} no encontrado`),[];let r=o[0];console.log(`[DESCUENTOS] Producto: ${r.nombre}, Tipo Prenda ID: ${r.tipo_prenda_id}`);let a=[],n=await (0,t.query)(`
      SELECT d.* 
      FROM descuentos d
      JOIN descuento_productos dp ON d.id = dp.descuento_id
      WHERE dp.producto_id = ? 
        AND d.estado = 'activo'
        AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
        AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
    `,[e]);if(console.log(`[DESCUENTOS] Descuentos directos encontrados: ${n.length}`),n.length>0&&console.log("[DESCUENTOS] Detalles:",n.map(e=>({id:e.id,nombre:e.nombre,tipo:e.tipo,valor:e.valor}))),a.push(...n),r.tipo_prenda_id){let e=await (0,t.query)(`
        SELECT d.*
        FROM descuentos d
        JOIN descuento_tipos_prenda dtp ON d.id = dtp.descuento_id
        WHERE dtp.tipo_prenda_id = ?
          AND d.estado = 'activo'
          AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
          AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
      `,[r.tipo_prenda_id]);console.log(`[DESCUENTOS] Descuentos por tipo de prenda encontrados: ${e.length}`),e.length>0&&console.log("[DESCUENTOS] Detalles:",e.map(e=>({id:e.id,nombre:e.nombre,tipo:e.tipo,valor:e.valor}))),a.push(...e)}else console.log("[DESCUENTOS] Producto sin tipo_prenda_id, no se buscaron descuentos por tipo");return console.log(`[DESCUENTOS] Total descuentos aplicables: ${a.length}`),a}catch(e){return console.error("[DESCUENTOS] Error obteniendo descuentos para producto:",e),[]}}function r(e,t){if(!t||0===t.length)return{precioFinal:e,descuentoAplicado:null,montoDescuento:0};console.log(`[CALC] Calculando descuento para precio: $${e}, descuentos disponibles: ${t.length}`);let o=t.map(t=>{let o=e,r=0;return"fijo"===t.tipo?(o=t.valor,r=e-t.valor):"porcentaje"===t.tipo&&(r=e*t.valor/100,o=e-r),o=Math.max(0,o),console.log(`[CALC] Descuento "${t.nombre}" (${t.tipo}): ${"fijo"===t.tipo?`Precio fijo $${t.valor}`:`${t.valor}% sobre $${e} = -$${r.toFixed(2)}`} → Precio final: $${o.toFixed(2)}`),{...t,montoDescuento:r,precioFinal:o}}).reduce((e,t)=>t.precioFinal<e.precioFinal?t:e);return console.log(`[CALC] Mejor descuento seleccionado: "${o.nombre}" - Precio final: $${o.precioFinal}`),{precioFinal:o.precioFinal,descuentoAplicado:o,montoDescuento:o.montoDescuento}}async function a(){try{let e=await (0,t.query)(`
      SELECT p.*, 
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE p.estado = 'activo'
    `);return await Promise.all(e.map(async e=>{let t=await o(e.id),{precioFinal:a,descuentoAplicado:n,montoDescuento:s}=r(e.precio_venta,t);return{...e,descuentos_disponibles:t,descuento_aplicado:n,monto_descuento:s,precio_original:e.precio_venta,precio_final:a}}))}catch(e){throw console.error("Error obteniendo productos con descuentos:",e),e}}e.s(["calcularPrecioConDescuento",()=>r,"getDescuentosForProduct",()=>o,"getProductosConDescuentos",()=>a])},64416,e=>{"use strict";var t=e.i(21347),o=e.i(4483),r=e.i(42707),a=e.i(7157),n=e.i(57085),s=e.i(42638),i=e.i(28123),c=e.i(73873),d=e.i(36011),l=e.i(2538),p=e.i(16591),u=e.i(24432),_=e.i(72920),E=e.i(32160),g=e.i(89104),h=e.i(13303),R=e.i(93695);e.i(54677);var v=e.i(77279),m=e.i(44747),f=e.i(62294),x=e.i(19856);async function N(){try{console.log("[API PRODUCTOS] Iniciando obtención de productos con descuentos");let e=await (0,f.query)(`
      SELECT 
        p.id,
        p.codigo_barras,
        p.sku,
        p.nombre,
        p.descripcion,
        p.color,
        p.precio_venta,
        p.precio_compra,
        p.precio_minimo,
        p.stock_actual,
        p.estado,
        p.categoria_padre_id,
        p.tipo_prenda_id,
        p.talla_id,
        p.proveedor_id,
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor,
        prov.razon_social as proveedor_nombre
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
      ORDER BY p.created_at DESC
    `);console.log(`[API PRODUCTOS] Productos obtenidos: ${e.length}`);let t=await Promise.all(e.map(async e=>{let t=await (0,x.getDescuentosForProduct)(e.id),{precioFinal:o,descuentoAplicado:r,montoDescuento:a}=(0,x.calcularPrecioConDescuento)(e.precio_venta,t),n={...e,precio_original:e.precio_venta,precio_final:o,tiene_descuento:null!==r,descuento_aplicado:r,monto_descuento:a,precio_venta:o};return r&&console.log(`[API PRODUCTOS] ✓ Producto "${e.nombre}" con descuento: $${e.precio_venta} → $${o}`),n})),o=t.filter(e=>e.tiene_descuento).length;return console.log(`[API PRODUCTOS] Total productos con descuento: ${o}/${e.length}`),m.NextResponse.json({success:!0,data:t})}catch(e){return console.error("[API PRODUCTOS] Error obteniendo productos:",e),console.error("[API PRODUCTOS] Stack:",e.stack),m.NextResponse.json({success:!1,error:"Error al obtener productos",details:e.message},{status:500})}}async function O(e){try{let t=await e.json();console.log("Creando producto:",t);let{codigo_barras:o,sku:r,nombre:a,descripcion:n,categoria_padre_id:s,tipo_prenda_id:i,talla_id:c,proveedor_id:d,color:l,precio_compra:p,precio_venta:u,precio_minimo:_,stock_actual:E,estado:g}=t;if(!a||!r||!s||!i||!d)return m.NextResponse.json({success:!1,error:"Faltan campos requeridos"},{status:400});let h=a.toUpperCase(),R=await (0,f.query)(`
      INSERT INTO productos (
        codigo_barras,
        sku,
        nombre,
        descripcion,
        categoria_padre_id,
        tipo_prenda_id,
        talla_id,
        proveedor_id,
        color,
        precio_compra,
        precio_venta,
        precio_minimo,
        stock_actual,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,[o,r,h,n||null,s,i,c||null,d,l||null,p||0,u||0,_||u||0,E||0,g||"activo"]);return console.log("Producto creado con ID:",R.insertId),m.NextResponse.json({success:!0,data:{id:R.insertId,...t}})}catch(e){return console.error("Error creando producto:",e),console.error("Error code:",e.code),console.error("Error message:",e.message),m.NextResponse.json({success:!1,error:"Error al crear producto",details:e.message,code:e.code},{status:500})}}async function C(e){try{let t=await e.json();console.log("Actualizando producto:",t);let{id:o,codigo_barras:r,sku:a,nombre:n,descripcion:s,categoria_padre_id:i,tipo_prenda_id:c,talla_id:d,proveedor_id:l,color:p,precio_compra:u,precio_venta:_,precio_minimo:E,stock_actual:g,estado:h}=t;if(!o)return m.NextResponse.json({success:!1,error:"ID de producto requerido"},{status:400});let R=n.toUpperCase();return await (0,f.query)(`
      UPDATE productos SET
        codigo_barras = ?,
        sku = ?,
        nombre = ?,
        descripcion = ?,
        categoria_padre_id = ?,
        tipo_prenda_id = ?,
        talla_id = ?,
        proveedor_id = ?,
        color = ?,
        precio_compra = ?,
        precio_venta = ?,
        precio_minimo = ?,
        stock_actual = ?,
        estado = ?
      WHERE id = ?
    `,[r,a,R,s||null,i,c,d||null,l,p||null,u||0,_||0,E||_||0,g||0,h||"activo",o]),m.NextResponse.json({success:!0,data:t})}catch(e){return console.error("Error actualizando producto:",e),m.NextResponse.json({success:!1,error:"Error al actualizar producto",details:e.message},{status:500})}}e.s(["GET",()=>N,"POST",()=>O,"PUT",()=>C],51844);var T=e.i(51844);let D=new t.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/productos/route",pathname:"/api/productos",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/productos/route.ts",nextConfigOutput:"",userland:T}),{workAsyncStorage:S,workUnitAsyncStorage:b,serverHooks:A}=D;function P(){return(0,r.patchFetch)({workAsyncStorage:S,workUnitAsyncStorage:b})}async function w(e,t,r){D.isDev&&(0,a.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let m="/api/productos/route";m=m.replace(/\/index$/,"")||"/";let f=await D.prepare(e,t,{srcPage:m,multiZoneDraftMode:!1});if(!f)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:x,params:N,nextConfig:O,parsedUrl:C,isDraftMode:T,prerenderManifest:S,routerServerContext:b,isOnDemandRevalidate:A,revalidateOnlyGenerated:P,resolvedPathname:w,clientReferenceManifest:y,serverActionsManifest:U}=f,I=(0,c.normalizeAppPath)(m),$=!!(S.dynamicRoutes[I]||S.routes[w]),j=async()=>((null==b?void 0:b.render404)?await b.render404(e,t,C,!1):t.end("This page could not be found"),null);if($&&!T){let e=!!S.routes[w],t=S.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(O.experimental.adapterPath)return await j();throw new R.NoFallbackError}}let F=null;!$||D.isDev||T||(F="/index"===(F=w)?"/":F);let L=!0===D.isDev||!$,q=$&&!L;U&&y&&(0,s.setReferenceManifestsSingleton)({page:m,clientReferenceManifest:y,serverActionsManifest:U,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:U})});let k=e.method||"GET",H=(0,n.getTracer)(),M=H.getActiveScopeSpan(),J={params:N,prerenderManifest:S,renderOpts:{experimental:{authInterrupts:!!O.experimental.authInterrupts},cacheComponents:!!O.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:O.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,o,r)=>D.onRequestError(e,t,r,b)},sharedContext:{buildId:x}},K=new d.NodeNextRequest(e),W=new d.NodeNextResponse(t),B=l.NextRequestAdapter.fromNodeNextRequest(K,(0,l.signalFromNodeResponse)(t));try{let s=async e=>D.handle(B,J).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let o=H.getRootSpanAttributes();if(!o)return;if(o.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${o.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=o.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${m}`)}),i=!!(0,a.getRequestMeta)(e,"minimalMode"),c=async a=>{var n,c;let d=async({previousCacheEntry:o})=>{try{if(!i&&A&&P&&!o)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(a);e.fetchMetrics=J.renderOpts.fetchMetrics;let c=J.renderOpts.pendingWaitUntil;c&&r.waitUntil&&(r.waitUntil(c),c=void 0);let d=J.renderOpts.collectedTags;if(!$)return await (0,_.sendResponse)(K,W,n,J.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,E.toNodeOutgoingHttpHeaders)(n.headers);d&&(t[h.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let o=void 0!==J.renderOpts.collectedRevalidate&&!(J.renderOpts.collectedRevalidate>=h.INFINITE_CACHE)&&J.renderOpts.collectedRevalidate,r=void 0===J.renderOpts.collectedExpire||J.renderOpts.collectedExpire>=h.INFINITE_CACHE?void 0:J.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:o,expire:r}}}}catch(t){throw(null==o?void 0:o.isStale)&&await D.onRequestError(e,t,{routerKind:"App Router",routePath:m,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})},b),t}},l=await D.handleResponse({req:e,nextConfig:O,cacheKey:F,routeKind:o.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:S,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:P,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:i});if(!$)return null;if((null==l||null==(n=l.value)?void 0:n.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(c=l.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let p=(0,E.fromNodeOutgoingHttpHeaders)(l.value.headers);return i&&$||p.delete(h.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||t.getHeader("Cache-Control")||p.get("Cache-Control")||p.set("Cache-Control",(0,g.getCacheControlHeader)(l.cacheControl)),await (0,_.sendResponse)(K,W,new Response(l.value.body,{headers:p,status:l.value.status||200})),null};M?await c(M):await H.withPropagatedContext(e.headers,()=>H.trace(p.BaseServerSpan.handleRequest,{spanName:`${k} ${m}`,kind:n.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},c))}catch(t){if(t instanceof R.NoFallbackError||await D.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})}),$)throw t;return await (0,_.sendResponse)(K,W,new Response(null,{status:500})),null}}e.s(["handler",()=>w,"patchFetch",()=>P,"routeModule",()=>D,"serverHooks",()=>A,"workAsyncStorage",()=>S,"workUnitAsyncStorage",()=>b],64416)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__7bff4a4f._.js.map