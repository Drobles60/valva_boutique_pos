module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},24361,(e,t,a)=>{t.exports=e.x("util",()=>require("util"))},3615,e=>{"use strict";var t=e.i(21347),a=e.i(4483),r=e.i(42707),o=e.i(7157),n=e.i(57085),s=e.i(42638),i=e.i(28123),u=e.i(73873),l=e.i(36011),c=e.i(2538),d=e.i(16591),p=e.i(24432),E=e.i(72920),h=e.i(32160),R=e.i(89104),f=e.i(13303),g=e.i(93695);e.i(54677);var x=e.i(77279),v=e.i(44747),N=e.i(62294);async function m(e){try{let{searchParams:t}=new URL(e.url),a=t.get("fechaInicio"),r=t.get("fechaFin");if(!a||!r)return v.NextResponse.json({error:"Fechas de inicio y fin son requeridas"},{status:400});let o=[],n=0,s=await (0,N.query)(`
      SELECT COALESCE(SUM(
        CASE 
          WHEN tipo = 'ingreso' THEN monto
          WHEN tipo = 'egreso' THEN -monto
          ELSE 0
        END
      ), 0) as saldoInicial
      FROM movimientos_caja
      WHERE DATE(fecha) < ?
    `,[a]);n=s[0]?.saldoInicial||0;let i=await (0,N.query)(`
      SELECT 
        v.fecha_venta as fecha,
        'Venta de contado' as concepto,
        'ingreso' as tipo,
        'Ventas' as categoria,
        v.total as monto,
        u.nombre as usuario
      FROM ventas v
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.estado = 'completada'
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      ORDER BY v.fecha_venta
    `,[a,r]),u=await (0,N.query)(`
      SELECT 
        a.fecha_abono as fecha,
        CONCAT('Abono de ', c.nombre) as concepto,
        'ingreso' as tipo,
        'Abonos Cr\xe9dito' as categoria,
        a.monto as monto,
        u.nombre as usuario
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_id = cpc.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE DATE(a.fecha_abono) BETWEEN ? AND ?
      ORDER BY a.fecha_abono
    `,[a,r]),l=await (0,N.query)(`
      SELECT 
        g.fecha as fecha,
        g.descripcion as concepto,
        'egreso' as tipo,
        g.categoria as categoria,
        g.monto as monto,
        u.nombre as usuario
      FROM gastos g
      INNER JOIN usuarios u ON g.usuario_id = u.id
      WHERE DATE(g.fecha) BETWEEN ? AND ?
      ORDER BY g.fecha
    `,[a,r]),c=await (0,N.query)(`
      SELECT 
        ap.fecha_abono as fecha,
        CONCAT('Pago a proveedor - Pedido #', ap.pedido_id) as concepto,
        'egreso' as tipo,
        'Pagos Proveedores' as categoria,
        ap.monto as monto,
        u.nombre as usuario
      FROM abonos_pedidos ap
      INNER JOIN usuarios u ON ap.usuario_id = u.id
      WHERE DATE(ap.fecha_abono) BETWEEN ? AND ?
      ORDER BY ap.fecha_abono
    `,[a,r]);return[...i,...u,...l,...c].sort((e,t)=>new Date(e.fecha).getTime()-new Date(t.fecha).getTime()).forEach(e=>{"ingreso"===e.tipo?n+=Number(e.monto):n-=Number(e.monto),o.push({fecha:e.fecha,concepto:e.concepto,tipo:e.tipo,categoria:e.categoria,monto:Number(e.monto),saldo:n,usuario:e.usuario})}),v.NextResponse.json({saldoInicial:s[0]?.saldoInicial||0,movimientos:o,saldoFinal:n})}catch(e){return console.error("Error generando flujo de caja:",e),v.NextResponse.json({error:"Error al generar el reporte"},{status:500})}}e.s(["GET",()=>m],93310);var w=e.i(93310);let C=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/reportes/financieros/flujo-caja/route",pathname:"/api/reportes/financieros/flujo-caja",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/reportes/financieros/flujo-caja/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:b,workUnitAsyncStorage:A,serverHooks:O}=C;function T(){return(0,r.patchFetch)({workAsyncStorage:b,workUnitAsyncStorage:A})}async function y(e,t,r){C.isDev&&(0,o.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let v="/api/reportes/financieros/flujo-caja/route";v=v.replace(/\/index$/,"")||"/";let N=await C.prepare(e,t,{srcPage:v,multiZoneDraftMode:!1});if(!N)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:m,params:w,nextConfig:b,parsedUrl:A,isDraftMode:O,prerenderManifest:T,routerServerContext:y,isOnDemandRevalidate:_,revalidateOnlyGenerated:I,resolvedPathname:j,clientReferenceManifest:D,serverActionsManifest:S}=N,q=(0,u.normalizeAppPath)(v),P=!!(T.dynamicRoutes[q]||T.routes[j]),H=async()=>((null==y?void 0:y.render404)?await y.render404(e,t,A,!1):t.end("This page could not be found"),null);if(P&&!O){let e=!!T.routes[j],t=T.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(b.experimental.adapterPath)return await H();throw new g.NoFallbackError}}let M=null;!P||C.isDev||O||(M="/index"===(M=j)?"/":M);let k=!0===C.isDev||!P,U=P&&!k;S&&D&&(0,s.setReferenceManifestsSingleton)({page:v,clientReferenceManifest:D,serverActionsManifest:S,serverModuleMap:(0,i.createServerModuleMap)({serverActionsManifest:S})});let F=e.method||"GET",B=(0,n.getTracer)(),L=B.getActiveScopeSpan(),W={params:w,prerenderManifest:T,renderOpts:{experimental:{authInterrupts:!!b.experimental.authInterrupts},cacheComponents:!!b.cacheComponents,supportsDynamicResponse:k,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:b.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r)=>C.onRequestError(e,t,r,y)},sharedContext:{buildId:m}},$=new l.NodeNextRequest(e),K=new l.NodeNextResponse(t),J=c.NextRequestAdapter.fromNodeNextRequest($,(0,c.signalFromNodeResponse)(t));try{let s=async e=>C.handle(J,W).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=B.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${F} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${F} ${v}`)}),i=!!(0,o.getRequestMeta)(e,"minimalMode"),u=async o=>{var n,u;let l=async({previousCacheEntry:a})=>{try{if(!i&&_&&I&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let n=await s(o);e.fetchMetrics=W.renderOpts.fetchMetrics;let u=W.renderOpts.pendingWaitUntil;u&&r.waitUntil&&(r.waitUntil(u),u=void 0);let l=W.renderOpts.collectedTags;if(!P)return await (0,E.sendResponse)($,K,n,W.renderOpts.pendingWaitUntil),null;{let e=await n.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(n.headers);l&&(t[f.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==W.renderOpts.collectedRevalidate&&!(W.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&W.renderOpts.collectedRevalidate,r=void 0===W.renderOpts.collectedExpire||W.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:W.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:n.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await C.onRequestError(e,t,{routerKind:"App Router",routePath:v,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:_})},y),t}},c=await C.handleResponse({req:e,nextConfig:b,cacheKey:M,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:T,isRoutePPREnabled:!1,isOnDemandRevalidate:_,revalidateOnlyGenerated:I,responseGenerator:l,waitUntil:r.waitUntil,isMinimalMode:i});if(!P)return null;if((null==c||null==(n=c.value)?void 0:n.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(u=c.value)?void 0:u.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",_?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),O&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let d=(0,h.fromNodeOutgoingHttpHeaders)(c.value.headers);return i&&P||d.delete(f.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||d.get("Cache-Control")||d.set("Cache-Control",(0,R.getCacheControlHeader)(c.cacheControl)),await (0,E.sendResponse)($,K,new Response(c.value.body,{headers:d,status:c.value.status||200})),null};L?await u(L):await B.withPropagatedContext(e.headers,()=>B.trace(d.BaseServerSpan.handleRequest,{spanName:`${F} ${v}`,kind:n.SpanKind.SERVER,attributes:{"http.method":F,"http.target":e.url}},u))}catch(t){if(t instanceof g.NoFallbackError||await C.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,p.getRevalidateReason)({isStaticGeneration:U,isOnDemandRevalidate:_})}),P)throw t;return await (0,E.sendResponse)($,K,new Response(null,{status:500})),null}}e.s(["handler",()=>y,"patchFetch",()=>T,"routeModule",()=>C,"serverHooks",()=>O,"workAsyncStorage",()=>b,"workUnitAsyncStorage",()=>A],3615)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__4a10e6eb._.js.map