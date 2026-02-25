module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,a)=>{t.exports=e.x("util",()=>require("util"))},20336,e=>{"use strict";var t=e.i(21347),a=e.i(4483),r=e.i(42707),o=e.i(7157),n=e.i(57085),s=e.i(42638),i=e.i(28123),l=e.i(73873),u=e.i(36011),d=e.i(2538),c=e.i(16591),p=e.i(24432),E=e.i(72920),R=e.i(32160),h=e.i(89104),v=e.i(13303),f=e.i(93695);e.i(54677);var N=e.i(77279),x=e.i(44747),m=e.i(62294);async function C(e){try{let t,{searchParams:a}=new URL(e.url),r=a.get("fecha"),o=a.get("sesionId");if(!r&&!o)return x.NextResponse.json({error:"Se requiere fecha o ID de sesión"},{status:400});if(!(t=o?(await (0,m.query)(`
        SELECT 
          sc.*,
          u.nombre as usuario
        FROM sesiones_caja sc
        INNER JOIN usuarios u ON sc.usuario_id = u.id
        WHERE sc.id = ?
      `,[o]))[0]:(await (0,m.query)(`
        SELECT 
          sc.*,
          u.nombre as usuario
        FROM sesiones_caja sc
        INNER JOIN usuarios u ON sc.usuario_id = u.id
        WHERE DATE(sc.fecha_apertura) = ?
        ORDER BY sc.fecha_apertura DESC
        LIMIT 1
      `,[r]))[0]))return x.NextResponse.json({error:"No se encontró sesión de caja para esta fecha"},{status:404});let n=t.fecha_apertura,s=t.fecha_cierre||new Date().toISOString(),i=await (0,m.query)(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'efectivo'
    `,[n,s]),l=await (0,m.query)(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'tarjeta'
    `,[n,s]),u=await (0,m.query)(`
      SELECT COALESCE(SUM(v.total), 0) as total
      FROM ventas v
      WHERE v.fecha_venta BETWEEN ? AND ?
        AND v.estado = 'completada'
        AND v.metodo_pago = 'transferencia'
    `,[n,s]),d=await (0,m.query)(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'efectivo'
    `,[n,s]),c=await (0,m.query)(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'tarjeta'
    `,[n,s]),p=await (0,m.query)(`
      SELECT COALESCE(SUM(a.monto), 0) as total
      FROM abonos a
      WHERE a.fecha_abono BETWEEN ? AND ?
        AND a.metodo_pago = 'transferencia'
    `,[n,s]),E=await (0,m.query)(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos
      WHERE fecha BETWEEN ? AND ?
    `,[n,s]),R=await (0,m.query)(`
      SELECT COUNT(*) as total
      FROM ventas
      WHERE fecha_venta BETWEEN ? AND ?
    `,[n,s]),h=Number(i[0]?.total||0),v=Number(l[0]?.total||0),f=Number(u[0]?.total||0),N=Number(d[0]?.total||0),C=Number(c[0]?.total||0),g=Number(p[0]?.total||0),A=Number(E[0]?.total||0),w=Number(t.monto_base||0)+h+N-A,b=Number(t.efectivo_contado||0),S={fecha:t.fecha_apertura,aperturaBase:Number(t.monto_base||0),ingresos:{ventasEfectivo:h,ventasTarjeta:v,ventasTransferencia:f,abonosEfectivo:N,abonosTarjeta:C,abonosTransferencia:g,total:h+v+f+N+C+g},egresos:{gastos:A,retiros:0,total:A},efectivoEsperado:w,efectivoContado:b,diferencia:b-w,transacciones:Number(R[0]?.total||0),usuario:t.usuario};return x.NextResponse.json(S)}catch(e){return console.error("Error generando reporte diario:",e),x.NextResponse.json({error:"Error al generar el reporte"},{status:500})}}e.s(["GET",()=>C],56100);var g=e.i(56100);let A=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/reportes/financieros/diario/route",pathname:"/api/reportes/financieros/diario",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/reportes/financieros/diario/route.ts",nextConfigOutput:"",userland:g}),{workAsyncStorage:w,workUnitAsyncStorage:b,serverHooks:S}=A;function y(){return(0,r.patchFetch)({workAsyncStorage:w,workUnitAsyncStorage:b})}async function T(e,t,r){A.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let x="/api/reportes/financieros/diario/route";x=x.replace(/\/index$/,"")||"/";let m=await A.prepare(e,t,{srcPage:x,multiZoneDraftMode:!1});if(!m)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:C,params:g,nextConfig:w,parsedUrl:b,isDraftMode:S,prerenderManifest:y,routerServerContext:T,isOnDemandRevalidate:O,revalidateOnlyGenerated:_,resolvedPathname:D,clientReferenceManifest:M,serverActionsManifest:q}=m,H=(0,l.normalizeAppPath)(x),j=!!(y.dynamicRoutes[H]||y.routes[D]),U=async()=>((null==T?void 0:T.render404)?await T.render404(e,t,b,!1):t.end("This page could not be found"),null);if(j&&!S){let e=!!y.routes[D],t=y.dynamicRoutes[H];if(t&&!1===t.fallback&&!e){if(w.experimental.adapterPath)return await U();throw new f.NoFallbackError}}let I=null;!j||A.isDev||S||(I="/index"===(I=D)?"/":I);let L=!0===A.isDev||!j,P=j&&!L;q&&M&&(0,s.setReferenceManifestsSingleton)({page:x,clientReferenceManifest:M,serverActionsManifest:q,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:q})});let k=e.method||"GET",W=(0,n.getTracer)(),F=W.getActiveScopeSpan(),B={params:g,prerenderManifest:y,renderOpts:{experimental:{authInterrupts:!!w.experimental.authInterrupts},cacheComponents:!!w.cacheComponents,supportsDynamicResponse:L,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:w.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>A.onRequestError(e,t,r,T)},sharedContext:{buildId:C}},$=new u.NodeNextRequest(e),K=new u.NodeNextResponse(t),G=d.NextRequestAdapter.fromNodeNextRequest($,(0,d.signalFromNodeResponse)(t));try{let s=async e=>A.handle(G,B).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=W.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==c.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${k} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${k} ${x}`)}),i=!!(0,o.getRequestMeta)(e,"minimalMode"),l=async o=>{var n,l;let u=async({previousCacheEntry:a})=>{try{if(!i&&O&&_&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(o);e.fetchMetrics=B.renderOpts.fetchMetrics;let l=B.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let u=B.renderOpts.collectedTags;if(!j)return await (0,E.sendResponse)($,K,n,B.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,R.toNodeOutgoingHttpHeaders)(n.headers);u&&(t[v.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==B.renderOpts.collectedRevalidate&&!(B.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&B.renderOpts.collectedRevalidate,r=void 0===B.renderOpts.collectedExpire||B.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:B.renderOpts.collectedExpire;return{value:{kind:N.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await A.onRequestError(e,t,{routerKind:"App Router",routePath:x,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:O})},T),t}},d=await A.handleResponse({req:e,nextConfig:w,cacheKey:I,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:O,revalidateOnlyGenerated:_,responseGenerator:u,waitUntil:r.waitUntil,isMinimalMode:i});if(!j)return null;if((null==d||null==(n=d.value)?void 0:n.kind)!==N.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",O?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,R.fromNodeOutgoingHttpHeaders)(d.value.headers);return i&&j||c.delete(v.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,h.getCacheControlHeader)(d.cacheControl)),await (0,E.sendResponse)($,K,new Response(d.value.body,{headers:c,status:d.value.status||200})),null};F?await l(F):await W.withPropagatedContext(e.headers,()=>W.trace(c.BaseServerSpan.handleRequest,{spanName:`${k} ${x}`,kind:n.SpanKind.SERVER,attributes:{"http.method":k,"http.target":e.url}},l))}catch(t){if(t instanceof f.NoFallbackError||await A.onRequestError(e,t,{routerKind:"App Router",routePath:H,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:P,isOnDemandRevalidate:O})}),j)throw t;return await (0,E.sendResponse)($,K,new Response(null,{status:500})),null}}e.s(["handler",()=>T,"patchFetch",()=>y,"routeModule",()=>A,"serverHooks",()=>S,"workAsyncStorage",()=>w,"workUnitAsyncStorage",()=>b],20336)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__869d863a._.js.map