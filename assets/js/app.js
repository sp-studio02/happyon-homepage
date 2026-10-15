
const H = (() => {
  const BASE = location.pathname.includes('/admin/') ? '../' : '';
  let cache = null;
  const categoryMap = {};
  const subMap = {};

  async function readJSON(path, fallback){
    try{
      const r = await fetch(BASE + path, {cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }catch(e){ return fallback; }
  }
  async function load(){
    if(cache) return cache;
    const seed = window.HAPPYON_SEED || {site:{},categories:[],products:[]};
    const [site,categories,legacyProducts,...splitLists] = await Promise.all([
      readJSON('data/site.json', seed.site),
      readJSON('data/categories.json', seed.categories),
      readJSON('data/products.json', seed.products),
      readJSON('data/products/magnifier.json', []),
      readJSON('data/products/card-mirror.json', []),
      readJSON('data/products/winter.json', []),
      readJSON('data/products/summer.json', []),
      readJSON('data/products/all-season.json', [])
    ]);

    // 카테고리별 상품 파일에 데이터가 들어간 뒤에는 그 파일들을 사용합니다.
    // 아직 분리 전이라 모두 비어 있으면 기존 products.json을 그대로 사용하므로
    // 홈페이지 표시가 바뀌거나 기존 상품이 사라지지 않습니다.
    const splitProducts = splitLists.flat().filter(Boolean);
    const products = splitProducts.length ? splitProducts : legacyProducts;

    categories.forEach(c=>{categoryMap[c.id]=c;(c.subs||[]).forEach(s=>subMap[c.id+'|'+s.id]=s)});
    cache={site,categories,products};
    return cache;
  }
  function q(name){return new URLSearchParams(location.search).get(name)||''}
  function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function imageHTML(path, alt, cls=''){
    if(path) return `<img class="${cls}" src="${esc(BASE + path.replace(/^\//,''))}" alt="${esc(alt)}">`;
    return `<div class="product-placeholder"><span>${esc(alt)}</span></div>`;
  }
  function catLabel(c){return categoryMap[c]?.label||c}
  function subLabel(c,s){return subMap[c+'|'+s]?.label||s}
  function productCard(p){
    return `<a class="product-card" href="product.html?id=${encodeURIComponent(p.id)}">
      <div class="product-media">${imageHTML(p.hero_image,p.title)}</div>
      <div class="product-body"><div class="product-meta">${esc(catLabel(p.category))} · ${esc(subLabel(p.category,p.subcategory))}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary||'')}</p><span class="card-arrow">제품 상세 보기 →</span></div>
    </a>`;
  }
  function fillSite(site){
    document.querySelectorAll('[data-site="company_name"]').forEach(e=>e.textContent=site.company_name||'해피온');
    document.querySelectorAll('[data-site="phone"]').forEach(e=>e.textContent=site.phone||'');
    document.querySelectorAll('[data-site="email"]').forEach(e=>e.textContent=site.email||'');
    document.querySelectorAll('[data-site="address"]').forEach(e=>e.textContent=site.address||'');
    document.querySelectorAll('[data-site="fax"]').forEach(e=>e.textContent=site.fax||'');
    document.querySelectorAll('[data-site="business_number"]').forEach(e=>e.textContent=site.business_number||'');
    document.querySelectorAll('[data-site="ceo"]').forEach(e=>e.textContent=site.ceo||'');
    document.querySelectorAll('[data-site="established"]').forEach(e=>e.textContent=site.established||'');
    document.querySelectorAll('img[data-site-logo]').forEach(e=>{ if(site.logo) e.src=BASE + site.logo.replace(/^\//,''); });
    document.querySelectorAll('a[data-phone-link]').forEach(e=>e.href='tel:'+String(site.phone||'').replace(/[^0-9+]/g,''));
    document.querySelectorAll('a[data-email-link]').forEach(e=>e.href='mailto:'+(site.email||''));
  }
  function setupMenu(){const b=document.querySelector('.mobile-menu'), n=document.querySelector('.main-nav');if(b&&n)b.addEventListener('click',()=>n.classList.toggle('open'))}
  function headerFooter(site, active=''){
    const header=document.querySelector('#site-header');
    if(header) header.innerHTML=`<header class="site-header"><div class="container header-inner"><a class="brand" href="${BASE}index.html"><img data-site-logo src="${BASE}assets/images/logo.png" alt="HAPPYON"></a><button class="mobile-menu" aria-label="메뉴">☰</button><nav class="main-nav"><a class="${active==='company'?'active':''}" href="${BASE}company.html">회사소개</a><a class="${active==='products'?'active':''}" href="${BASE}products.html">제품소개</a><a class="${active==='guide'?'active':''}" href="${BASE}guide.html">제작안내</a><a class="${active==='contact'?'active':''}" href="${BASE}contact.html">문의하기</a></nav></div></header>`;
    const footer=document.querySelector('#site-footer');
    if(footer) footer.innerHTML=`<footer class="site-footer"><div class="container footer-grid"><a href="${BASE}index.html"><img class="footer-logo" data-site-logo src="${BASE}assets/images/logo.png" alt="HAPPYON"></a><div class="footer-info"><strong>${esc(site.company_name||'해피온')}</strong><br>대표 ${esc(site.ceo||'')} · 사업자등록번호 ${esc(site.business_number||'')}<br>${esc(site.address||'')}<br>TEL. ${esc(site.phone||'')} · FAX. ${esc(site.fax||'')} · E-mail. ${esc(site.email||'')}</div><div class="copyright">© ${new Date().getFullYear()} ${esc(site.company_name_en||'HAPPYON')}<br>All Rights Reserved.</div></div></footer>`;
    fillSite(site);setupMenu();
  }
  return {load,q,esc,imageHTML,catLabel,subLabel,productCard,headerFooter,fillSite,categoryMap,subMap};
})();
