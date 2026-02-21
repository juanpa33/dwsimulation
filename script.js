/* ========================================================
   Data Warehouse Didactic Simulation — script.js
   ======================================================== */

// ── OPERATIONAL SYSTEMS: live data streams ─────────────────
const systemDataGenerators = {
    crm: () => {
        const names = ['García J.', 'López M.', 'Martínez R.', 'Pérez A.', 'Sánchez L.'];
        const acts = ['Oportunidad abierta', 'Lead calificado', 'Contrato firmado', 'Follow-up enviado'];
        const n = names[Math.floor(Math.random() * names.length)];
        const a = acts[Math.floor(Math.random() * acts.length)];
        return `${n}\n${a}\n$${(Math.random() * 50000 + 5000).toFixed(0)}`;
    },
    erp: () => {
        const items = ['Laptop Pro 15"', 'Monitor 4K', 'Teclado Mec.', 'Router WiFi 6', 'Switch 24P'];
        const i = items[Math.floor(Math.random() * items.length)];
        const qty = Math.floor(Math.random() * 100 + 1);
        return `OC-${Math.floor(Math.random() * 90000 + 10000)}\n${i} x${qty}\nAlmacén B-${Math.floor(Math.random() * 5 + 1)}`;
    },
    ecom: () => {
        const c = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Santiago'];
        const city = c[Math.floor(Math.random() * c.length)];
        const total = (Math.random() * 800 + 50).toFixed(2);
        return `ORD-${Math.floor(Math.random() * 999999)}\n${city}\n$${total} USD`;
    },
    mktg: () => {
        const ch = ['Meta Ads', 'Google Ads', 'Email', 'TikTok'];
        const ch2 = ch[Math.floor(Math.random() * ch.length)];
        const clicks = Math.floor(Math.random() * 5000 + 100);
        const conv = (Math.random() * 5).toFixed(2);
        return `${ch2}\n${clicks} clics\nConv: ${conv}%`;
    },
    fin: () => {
        const types = ['Factura', 'NC', 'Pago', 'Devol.', 'Gasto'];
        const t = types[Math.floor(Math.random() * types.length)];
        return `TXN-${Math.floor(Math.random() * 999999)}\n${t}\n$${(Math.random() * 20000).toFixed(2)}`;
    },
    sc: () => {
        const status = ['En tránsito', 'Despachado', 'Recibido', 'Demorado'];
        const s = status[Math.floor(Math.random() * status.length)];
        const sku = `SKU-${Math.floor(Math.random() * 9000 + 1000)}`;
        return `${sku}\n${s}\n${Math.floor(Math.random() * 200 + 10)} unid`;
    }
};

function startSystemFeeds() {
    const ids = ['crm', 'erp', 'ecom', 'mktg', 'fin', 'sc'];
    ids.forEach(id => {
        const el = document.getElementById(id + 'Data');
        if (!el) return;
        function tick() {
            el.textContent = systemDataGenerators[id]();
            el.style.animation = 'none';
            el.offsetHeight; // reflow
            el.style.animation = 'dataFlash 0.3s ease';
        }
        tick();
        setInterval(tick, 1500 + Math.random() * 2000);
    });
}

// Add flash animation via style injection
const style = document.createElement('style');
style.textContent = `@keyframes dataFlash { 0%{opacity:0.3;color:#fff} 100%{opacity:1;color:#4ade80} }`;
document.head.appendChild(style);

// ── ETL SIMULATION ─────────────────────────────────────────
let etlRunning = false;

const etlSteps = {
    extract: [
        '→ Conectando a CRM (Salesforce API)...',
        '→ Extrayendo tabla clientes...    ✓',
        '→ Conectando a ERP (SAP BAPI)...',
        '→ Extrayendo órdenes de compra...  ✓',
        '→ Conectando E-Com REST API...',
        '→ Extrayendo transacciones...     ✓',
        '→ Conectando Marketing API...',
        '→ Extrayendo métricas ads...      ✓',
        '→ Extrayendo datos financieros... ✓',
        '→ Extrayendo logs supply chain... ✓'
    ],
    transform: [
        '✦ Estandarizando formatos de fecha...',
        '✦ Eliminando registros duplicados...',
        '✦ Normalizando monedas a USD...',
        '✦ Validando integridad referencial...',
        '✦ Aplicando reglas de negocio...',
        '✦ Calculando KPIs derivados...',
        '✦ Enriqueciendo datos de clientes...',
        '✦ Mapeando dimensiones DW...',
        '✦ Control de calidad (DQ Rules)... ✓',
        '✦ Datos listos para carga. ✓'
    ],
    load: [
        '★ Conectando a DW (Snowflake)...',
        '★ Cargando dim_clientes...        ✓',
        '★ Cargando dim_producto...        ✓',
        '★ Cargando dim_canal...           ✓',
        '★ Cargando dim_tiempo...          ✓',
        '★ Cargando fact_ventas...         ✓',
        '★ Cargando fact_inventario...     ✓',
        '★ Actualizando índices...         ✓',
        '★ Refrescando Data Marts...       ✓',
        '★ ETL completado con éxito! 🎉'
    ]
};

const dwRows = [
    ['20260220', 'CLI-4421', 'PRD-889', 'E-Com', '1,240.00', '8', '42.3'],
    ['20260220', 'CLI-1103', 'PRD-224', 'Tienda', '560.00', '2', '38.1'],
    ['20260220', 'CLI-7789', 'PRD-556', 'Online', '3,200.00', '16', '45.7'],
    ['20260219', 'CLI-3310', 'PRD-112', 'Mayorista', '8,900.00', '50', '28.2'],
    ['20260219', 'CLI-9901', 'PRD-773', 'E-Com', '420.00', '3', '51.0'],
    ['20260218', 'CLI-5500', 'PRD-441', 'Tienda', '980.00', '7', '40.5'],
    ['20260218', 'CLI-2211', 'PRD-667', 'Online', '2,100.00', '10', '47.2'],
];

async function runETL() {
    if (etlRunning) return;
    etlRunning = true;
    document.getElementById('btnRunETL').disabled = true;

    const stages = ['Extract', 'Transform', 'Load'];
    const logIds = ['extractLog', 'transformLog', 'loadLog'];
    const metricIds = ['extractRows', 'transformRows', 'loadRows'];
    const stageIds = ['stageExtract', 'stageTransform', 'stageLoad'];
    const metricVals = ['295,847 registros', '289,312 registros limpios', '289,312 cargados al DW'];
    const statusMsgs = ['EXTRACTANDO datos de 6 sistemas...', 'TRANSFORMANDO y limpiando datos...', 'CARGANDO al Data Warehouse...'];
    const stepKeys = ['extract', 'transform', 'load'];

    for (let i = 0; i < 3; i++) {
        document.getElementById('etlStatus').textContent = statusMsgs[i];
        const stage = document.getElementById(stageIds[i]);
        stage.classList.add('active');
        const log = document.getElementById(logIds[i]);
        log.textContent = '';

        const steps = etlSteps[stepKeys[i]];
        for (let s = 0; s < steps.length; s++) {
            await sleep(280);
            log.textContent += steps[s] + '\n';
            log.scrollTop = log.scrollHeight;
        }
        await sleep(300);
        document.getElementById(metricIds[i]).textContent = metricVals[i];
        stage.classList.remove('active');
        stage.classList.add('done');
        await sleep(400);
    }

    document.getElementById('etlStatus').textContent = '✅ ETL finalizado — DW actualizado';

    // Show DW preview
    const preview = document.getElementById('dwPreview');
    preview.style.display = 'block';
    const tbody = document.getElementById('dwTableBody');
    tbody.innerHTML = '';
    for (let r = 0; r < dwRows.length; r++) {
        await sleep(150);
        const tr = document.createElement('tr');
        tr.classList.add('new-row');
        tr.innerHTML = dwRows[r].map(c => `<td>${c}</td>`).join('');
        tbody.appendChild(tr);
    }

    etlRunning = false;
    document.getElementById('btnRunETL').disabled = false;
}

function resetETL() {
    etlRunning = false;
    document.getElementById('btnRunETL').disabled = false;
    document.getElementById('etlStatus').textContent = 'Listo para ejecutar';
    ['extractLog', 'transformLog', 'loadLog'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
    ['extractRows', 'transformRows', 'loadRows'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.textContent = ['0 registros', '0 registros limpios', '0 cargados al DW'][i];
    });
    ['stageExtract', 'stageTransform', 'stageLoad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.classList.remove('active', 'done'); }
    });
    const p = document.getElementById('dwPreview');
    if (p) p.style.display = 'none';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── DASHBOARD TABS ─────────────────────────────────────────
function showDash(name) {
    document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('dash-' + name).classList.add('active');
    document.querySelectorAll('.dash-tab').forEach(t => {
        if (t.textContent.toLowerCase().includes(name === 'ops' ? 'oper' : name)) t.classList.add('active');
    });
    animateKPIs();
}

function animateKPIs() {
    document.querySelectorAll('.dash-panel.active .kpi-val').forEach(el => {
        const target = parseInt(el.dataset.count);
        const isPct = el.classList.contains('pct');
        let current = 0;
        const inc = target / 50;
        const interval = setInterval(() => {
            current = Math.min(current + inc, target);
            el.textContent = isPct ? Math.round(current) + '%' : Math.round(current).toLocaleString();
            if (current >= target) clearInterval(interval);
        }, 20);
    });
}

// ── CHART.JS CHARTS ────────────────────────────────────────
const indigo = '#6366f1';
const cyan = '#06b6d4';
const green = '#10b981';
const amber = '#f59e0b';
const pink = '#ec4899';

function buildCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';
    Chart.defaults.font.family = 'Inter';

    // Bar: Ventas por mes
    new Chart(document.getElementById('chartVentas'), {
        type: 'bar',
        data: {
            labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
            datasets: [{
                label: 'Ventas USD',
                data: [320000, 380000, 410000, 520000, 680000, 430000, 495000],
                backgroundColor: ctx => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                    g.addColorStop(0, indigo); g.addColorStop(1, 'rgba(99,102,241,0.2)');
                    return g;
                },
                borderRadius: 6, borderSkipped: false
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => '$' + v.toLocaleString() } } } }
    });

    // Doughnut: Canal
    new Chart(document.getElementById('chartCanal'), {
        type: 'doughnut',
        data: {
            labels: ['E-Commerce', 'Tienda', 'Mayorista', 'Online'],
            datasets: [{ data: [45, 25, 18, 12], backgroundColor: [indigo, cyan, green, amber], borderWidth: 0, hoverOffset: 8 }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } } }
    });

    // Doughnut: Segmentos
    new Chart(document.getElementById('chartSegmentos'), {
        type: 'pie',
        data: {
            labels: ['Champions', 'Leales', 'Potenciales', 'En riesgo', 'Perdidos'],
            datasets: [{ data: [22, 30, 25, 15, 8], backgroundColor: [green, indigo, cyan, amber, pink], borderWidth: 0 }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 10, font: { size: 11 } } } } }
    });

    // Line: Nuevos clientes
    new Chart(document.getElementById('chartNuevos'), {
        type: 'line',
        data: {
            labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb'],
            datasets: [{
                label: 'Nuevos Clientes',
                data: [1200, 1450, 1380, 1900, 2300, 1600, 1750],
                borderColor: cyan, backgroundColor: 'rgba(6,182,212,0.1)',
                fill: true, tension: 0.4, pointBackgroundColor: cyan, pointRadius: 4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Bar grouped: Inventario vs Demanda
    new Chart(document.getElementById('chartOps'), {
        type: 'bar',
        data: {
            labels: ['Laptops', 'Monitores', 'Teclados', 'Routers', 'Switches', 'Cámaras', 'Auriculares'],
            datasets: [
                { label: 'Stock', data: [450, 320, 780, 230, 180, 120, 560], backgroundColor: indigo, borderRadius: 4 },
                { label: 'Demanda (30d)', data: [380, 360, 620, 290, 150, 200, 480], backgroundColor: cyan, borderRadius: 4 }
            ]
        },
        options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { grouped: true } } }
    });
}

// ── ML MINI CHARTS ────────────────────────────────────────
function buildMLCharts() {
    // Forecast
    const fcLabels = ['Ene', 'Feb', 'Mar', 'Abr'];
    new Chart(document.getElementById('chartForecast'), {
        type: 'line',
        data: {
            labels: [...['Oct', 'Nov', 'Dic'], ...fcLabels],
            datasets: [
                { label: 'Real', data: [420, 510, 680, null, null, null, null], borderColor: cyan, tension: 0.4, pointRadius: 3 },
                { label: 'Forecast', data: [null, null, 680, 700, 740, 780, 820], borderColor: amber, borderDash: [5, 5], tension: 0.4, pointRadius: 3, pointStyle: 'triangle' }
            ]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } }, scales: { x: { ticks: { font: { size: 10 } } }, y: { display: false } } }
    });

    // Clusters scatter
    const clusters = [
        { label: 'VIP', data: Array.from({ length: 20 }, () => ({ x: 80 + Math.random() * 18, y: 80 + Math.random() * 18 })), backgroundColor: 'rgba(99,102,241,0.7)' },
        { label: 'Recurrentes', data: Array.from({ length: 30 }, () => ({ x: 40 + Math.random() * 25, y: 40 + Math.random() * 25 })), backgroundColor: 'rgba(6,182,212,0.7)' },
        { label: 'Ocasionales', data: Array.from({ length: 25 }, () => ({ x: 10 + Math.random() * 25, y: 10 + Math.random() * 25 })), backgroundColor: 'rgba(16,185,129,0.7)' },
    ];
    new Chart(document.getElementById('chartClusters'), {
        type: 'scatter',
        data: { datasets: clusters },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 6 } } }, scales: { x: { display: false }, y: { display: false } } }
    });

    // Churn bar
    new Chart(document.getElementById('chartChurn'), {
        type: 'bar',
        data: {
            labels: ['Bajo', 'Medio', 'Alto', 'Crítico'],
            datasets: [{
                label: 'Clientes',
                data: [18500, 9200, 3800, 1200],
                backgroundColor: [green, amber, 'rgba(249,115,22,0.8)', pink],
                borderRadius: 5
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { font: { size: 10 } } }, y: { display: false } } }
    });
}

// ── ML MODEL SIMULATION ────────────────────────────────────
function runModel(type) {
    const messages = {
        forecast: ['🔄 Cargando fact_ventas del DW...', '📊 Ajustando modelo Prophet...', '🔮 Proyectando 90 días...', '✅ Forecast: $2.4M próximo trimestre (±8%)'],
        cluster: ['🔄 Extrayendo dim_clientes del DW...', '🧮 Ejecutando K-Means (k=4)...', '🗺️ Proyectando en 2D (UMAP)...', '✅ 4 segmentos identificados. Silhouette=0.73'],
        churn: ['🔄 Consultando historial de compras DW...', '🌲 Entrenando Random Forest (100 árboles)...', '📈 Evaluando curva ROC...', '✅ 1,200 clientes en riesgo crítico detectados']
    };
    const cards = { forecast: 'mlCard1', cluster: 'mlCard2', churn: 'mlCard3' };
    const card = document.getElementById(cards[type]);
    const btn = card.querySelector('.ml-run-btn');
    const desc = card.querySelector('.ml-desc');
    const msgs = messages[type];
    let i = 0;
    btn.disabled = true;
    card.style.borderColor = '#6366f1';
    function next() {
        if (i < msgs.length) {
            desc.textContent = msgs[i++];
            setTimeout(next, 700);
        } else {
            btn.disabled = false;
            card.style.borderColor = '#10b981';
        }
    }
    next();
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    startSystemFeeds();
    buildCharts();
    buildMLCharts();
    animateKPIs();

    // Intersection observer to animate KPIs on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) animateKPIs(); });
    }, { threshold: 0.3 });
    document.querySelectorAll('.dash-container').forEach(el => observer.observe(el));
});

// ═══════════════════════════════════════════════════════════
// ── CHATBOT: DW QUERY ENGINE ───────────────────────────────
// ═══════════════════════════════════════════════════════════

const dwKnowledge = {
    'ventas-mes': {
        query: '¿Cómo van las ventas este mes?',
        tables: ['fact_ventas', 'dim_tiempo', 'dim_canal'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_ventas</span><span class="trace-table">dim_tiempo</span><span class="trace-table">dim_canal</span></div>
      <p><strong>Febrero 2026 — Resumen de Ventas:</strong></p>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">$495,200</div><div class="metric-lbl">Total ventas mes</div></div>
        <div class="metric-item"><div class="metric-val">+15.3%</div><div class="metric-lbl">vs mes anterior</div></div>
        <div class="metric-item"><div class="metric-val">18,432</div><div class="metric-lbl">Órdenes procesadas</div></div>
        <div class="metric-item"><div class="metric-val">$154</div><div class="metric-lbl">Ticket promedio</div></div>
      </div>
      <p style="margin:10px 0 6px"><strong>Distribución por canal:</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>E-Commerce</span><span>45% · $222,840</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:45%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Tienda Física</span><span>25% · $123,800</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:25%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Mayorista</span><span>18% · $89,136</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:18%"></div></div></div>
      <div class="success-box">✅ E-Commerce superó su meta mensual de $200K por segundo mes consecutivo.</div>`
    },
    'mejor-producto': {
        query: '¿Cuál es nuestro mejor producto?',
        tables: ['fact_ventas', 'dim_producto'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_ventas</span><span class="trace-table">dim_producto</span></div>
      <p><strong>Top 5 Productos por Ingresos — Últimos 90 días:</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥇 Laptop Pro 15" (SKU-889)</span><span>$148,320 · 28%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:90%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥈 Monitor UltraWide 4K</span><span>$89,210 · 17%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:60%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥉 Router WiFi 6 Pro</span><span>$67,440 · 13%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:45%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Switch Giga 24P</span><span>$51,890 · 10%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:35%"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">💬 RESEÑAS DE CLIENTES · Google / Tienda online</div>
        <div class="quote-item">"La Laptop Pro 15 es increíble. Rapidez de entrega y muy buen precio." — Carlos M. ⭐⭐⭐⭐⭐</div>
        <div class="quote-item">"El Monitor 4K cambió mi trabajo remoto. Ya compré 3 para mi equipo." — Ana R., LinkedIn</div>
      </div>`
    },
    'clientes-riesgo': {
        query: '¿Qué clientes están en riesgo de abandono?',
        tables: ['dim_clientes', 'fact_ventas', 'ml_churn_scores'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">dim_clientes</span><span class="trace-table">ml_churn_scores</span></div>
      <p><strong>Modelo Churn — Random Forest (AUC 0.89):</strong></p>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">1,200</div><div class="metric-lbl">Clientes riesgo crítico</div></div>
        <div class="metric-item"><div class="metric-val">2.8%</div><div class="metric-lbl">Del total de cartera</div></div>
        <div class="metric-item"><div class="metric-val">$184K</div><div class="metric-lbl">Ingresos en riesgo</div></div>
        <div class="metric-item"><div class="metric-val">47 días</div><div class="metric-lbl">Promedio sin comprar</div></div>
      </div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Sin compra &gt;45 días</span><span>68% de los casos</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:68%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Ticket caído &gt;50%</span><span>45% de los casos</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:45%"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">📧 TICKETS DE SOPORTE · NLP sobre CRM</div>
        <div class="quote-item">"Llevo 2 meses esperando resolución de mi garantía. Considero buscar otro proveedor." — CRM Ticket #44213</div>
        <div class="quote-item">"Los precios subieron mucho. Estamos evaluando alternativas." — Email CLI-7812</div>
      </div>
      <div class="alert-box">⚠️ Acción: Activar campaña de retención con descuento 15% para los 1,200 clientes en riesgo.</div>`
    },
    'canal-rentable': {
        query: '¿Cuál canal es más rentable?',
        tables: ['fact_ventas', 'dim_canal', 'fact_costos'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_ventas</span><span class="trace-table">fact_costos</span><span class="trace-table">dim_canal</span></div>
      <p><strong>Rentabilidad por Canal (Margen Bruto %):</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>💎 E-Commerce Propio</span><span>Margen: 51% · $222,840</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:95%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🏪 Tienda Física</span><span>Margen: 38% · $123,800</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:70%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🌐 Marketplace</span><span>Margen: 31% · $59,424</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:56%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🏭 Mayorista</span><span>Margen: 22% · $89,136</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:38%"></div></div></div>
      <div class="success-box">💡 E-Commerce genera el doble de margen que Mayorista. Redirigir inversión puede aumentar utilidad neta un 12% sin subir ventas.</div>`
    },
    'satisfaccion': {
        query: '¿Cómo está la satisfacción del cliente?',
        tables: ['fact_encuestas', 'dim_clientes', 'social_listening'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_encuestas</span><span class="trace-table">social_listening</span></div>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">72</div><div class="metric-lbl">NPS Score (🟢 Excelente)</div></div>
        <div class="metric-item"><div class="metric-val">4.3/5</div><div class="metric-lbl">CSAT Promedio</div></div>
        <div class="metric-item"><div class="metric-val">78%</div><div class="metric-lbl">Tasa de retención</div></div>
        <div class="metric-item"><div class="metric-val">89%</div><div class="metric-lbl">Resolución 1er contacto</div></div>
      </div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Clientes VIP</span><span>NPS: 88</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:88%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Clientes Recurrentes</span><span>NPS: 71</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:71%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Clientes Ocasionales</span><span>NPS: 54</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:54%"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">📱 SOCIAL LISTENING · Twitter / Instagram / Google Reviews</div>
        <div class="quote-item">"Llevamos 2 años con ellos y siempre nos sorprenden. Servicio posventa top." — Google ⭐⭐⭐⭐⭐</div>
        <div class="quote-item">"El tiempo de entrega mejoró muchísimo este año. Muy contentos." — Instagram DM</div>
        <div class="quote-item">"Tuve un problema y lo resolvieron en 2 horas. Eso es lo que busco." — Twitter/X</div>
      </div>`
    },
    'inventario': {
        query: '¿Hay quiebres de stock?',
        tables: ['fact_inventario', 'dim_producto', 'fact_ventas'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_inventario</span><span class="trace-table">dim_producto</span></div>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">97%</div><div class="metric-lbl">Fill Rate global</div></div>
        <div class="metric-item"><div class="metric-val">7</div><div class="metric-lbl">SKUs en alerta roja</div></div>
        <div class="metric-item"><div class="metric-val">$34K</div><div class="metric-lbl">Ventas perdidas est.</div></div>
        <div class="metric-item"><div class="metric-val">2.1 días</div><div class="metric-lbl">Lead time promedio</div></div>
      </div>
      <p style="margin:10px 0 6px"><strong>Productos en riesgo de quiebre:</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>⚠️ Monitor 4K (SKU-224) — Stock: 40 | Demanda 30d: 360</span><span>11%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:11%;background:linear-gradient(90deg,#ec4899,#f59e0b)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>⚠️ Router WiFi 6 (SKU-556) — Stock: 55 | Demanda 30d: 290</span><span>19%</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:19%;background:linear-gradient(90deg,#ec4899,#f59e0b)"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">📋 NOTAS INTERNAS · Sharepoint / Slack #compras</div>
        <div class="quote-item">"Proveedor Samsung confirmó demora 3 semanas por problemas en aduana. Afecta Monitor 4K." — Nota reunión 18-Feb</div>
      </div>
      <div class="alert-box">🚨 Sin reposición del Monitor 4K en 7 días, se pierden $28,000 en ventas proyectadas.</div>`
    },
    'forecast': {
        query: '¿Cuánto venderemos el próximo mes?',
        tables: ['fact_ventas', 'ml_forecasts', 'dim_tiempo'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">ml_forecasts</span><span class="trace-table">fact_ventas</span></div>
      <p><strong>Pronóstico Marzo 2026 — Modelo Prophet v3 (24 meses de historial):</strong></p>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">$542,000</div><div class="metric-lbl">Forecast central</div></div>
        <div class="metric-item"><div class="metric-val">±8.7%</div><div class="metric-lbl">Intervalo de confianza</div></div>
        <div class="metric-item"><div class="metric-val">+9.4%</div><div class="metric-lbl">vs Febrero 2026</div></div>
        <div class="metric-item"><div class="metric-val">91.3%</div><div class="metric-lbl">Precisión MAPE del modelo</div></div>
      </div>
      <div class="insight-bar"><div class="insight-bar-label"><span>E-Commerce</span><span>$244,000 (+10%)</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:85%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Tienda Física</span><span>$135,000 (+9%)</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:55%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Mayorista</span><span>$98,000 (+10%)</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:40%"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">📊 CONTEXTO EXTERNO · Fuentes no estructuradas del modelo</div>
        <div class="quote-item">Índice de actividad INDEC: +2.1% previsto Q1 2026</div>
        <div class="quote-item">Google Trends "laptops gaming": +34% en 4 semanas en Argentina</div>
      </div>
      <div class="success-box">✅ Preparar 110% del stock habitual para cubrir la demanda proyectada.</div>`
    },
    'equipo-ventas': {
        query: '¿Quiénes son los mejores vendedores?',
        tables: ['fact_ventas', 'dim_vendedor'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_ventas</span><span class="trace-table">dim_vendedor</span></div>
      <p><strong>Ranking Vendedores — Ene-Feb 2026:</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥇 Carlos Mendez</span><span>$182,400 · 87 cierres</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:95%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥈 Valentina Ríos</span><span>$164,200 · 79 cierres</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:85%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>🥉 Martín Torres</span><span>$138,700 · 65 cierres</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:72%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Ana González</span><span>$98,100 · 51 cierres</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:50%"></div></div></div>
      <div class="metric-grid" style="margin-top:12px">
        <div class="metric-item"><div class="metric-val">62%</div><div class="metric-lbl">Tasa conversión top 3</div></div>
        <div class="metric-item"><div class="metric-val">$2,096</div><div class="metric-lbl">Ticket prom. C.Mendez</div></div>
      </div>
      <div class="unstructured-box">
        <div class="unstructured-label">📋 NOTAS DE REUNIÓN · Teams / Notion</div>
        <div class="quote-item">"Carlos cerró contraro TechCorp por $48K anuales. Clave: 3 semanas de seguimiento personalizado." — Reunión ventas 14-Feb</div>
        <div class="quote-item">"Valentina capacita a los nuevos con metodología consultiva. Está elevando al equipo."  — Review Q1</div>
      </div>`
    },
    'devolucion': {
        query: '¿Por qué aumentaron las devoluciones?',
        tables: ['fact_devoluciones', 'dim_producto', 'soporte_tickets'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_devoluciones</span><span class="trace-table">soporte_tickets</span></div>
      <div class="metric-grid">
        <div class="metric-item"><div class="metric-val">12%</div><div class="metric-lbl">Tasa devoluciones Feb</div></div>
        <div class="metric-item"><div class="metric-val">+4.2%</div><div class="metric-lbl">vs Enero (era 7.8%)</div></div>
        <div class="metric-item"><div class="metric-val">847</div><div class="metric-lbl">Devoluciones registradas</div></div>
        <div class="metric-item"><div class="metric-val">$52,400</div><div class="metric-lbl">Monto devuelto</div></div>
      </div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Producto defectuoso</span><span>38% · 321 casos</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:80%;background:linear-gradient(90deg,#ec4899,#6366f1)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Descripción no coincide</span><span>27% · 229 casos</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:55%;background:linear-gradient(90deg,#f59e0b,#6366f1)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>Daño en envío</span><span>21% · 178 casos</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:42%;background:linear-gradient(90deg,#f59e0b,#6366f1)"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">📧 TICKETS Y EMAILS · Análisis NLP automático</div>
        <div class="quote-item">"El Router se recalienta y se reinicia solo. Es imposible trabajar así." — Ticket #55321</div>
        <div class="quote-item">"La foto mostraba 3 puertos USB pero el equipo tiene solo 1. Me siento engañado." — Google 1⭐</div>
        <div class="quote-item">"La caja llegó aplastada. La empresa logística que usan es un desastre." — Email 17-Feb</div>
      </div>
      <div class="alert-box">🚨 38% de defectos se concentra en lote LOTE-2026-02-A del proveedor Shenz-Tech. Revisar QC urgente.</div>`
    },
    'region': {
        query: '¿Qué región está creciendo más?',
        tables: ['fact_ventas', 'dim_geografia', 'dim_tiempo'],
        response: `
      <div class="dw-query-trace"><span class="trace-label">🔍 DW Query →</span><span class="trace-table">fact_ventas</span><span class="trace-table">dim_geografia</span></div>
      <p><strong>Crecimiento por Región — Febrero vs Enero 2026:</strong></p>
      <div class="insight-bar"><div class="insight-bar-label"><span>🚀 Patagonia Argentina</span><span>+38.4% · $48,200</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:95%;background:linear-gradient(90deg,#10b981,#06b6d4)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>📈 NOA (Noroeste)</span><span>+24.1% · $62,400</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:70%;background:linear-gradient(90deg,#10b981,#06b6d4)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>📈 Chile — Santiago</span><span>+19.7% · $88,700</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:58%;background:linear-gradient(90deg,#6366f1,#06b6d4)"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>➡️ Buenos Aires GBA</span><span>+8.3% · $198,400</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:40%"></div></div></div>
      <div class="insight-bar"><div class="insight-bar-label"><span>⬇️ Córdoba Capital</span><span>-3.1% · $97,500</span></div><div class="insight-bar-track"><div class="insight-bar-fill" style="width:15%;background:linear-gradient(90deg,#ec4899,#f59e0b)"></div></div></div>
      <div class="unstructured-box">
        <div class="unstructured-label">🗺️ INFORMES DE CAMPO · Gerentes Zonales</div>
        <div class="quote-item">"Apertura de oficina en Rawson impulsó ventas corporativas en Patagonia." — Reporte Zonal Feb 2026</div>
        <div class="quote-item">"Córdoba baja por competencia de precio distribuidor local. Evaluar estrategia." — Dirección Comercial</div>
      </div>
      <div class="success-box">💡 Reforzar Patagonia con 1 vendedor dedicado. ROI proyectado en 4 meses.</div>`
    }
};

// ── FUZZY MATCHING ─────────────────────────────────────────
function matchQuestion(text) {
    const t = text.toLowerCase();
    if (t.match(/venta|mes|factur|ingreso|revenue/)) return 'ventas-mes';
    if (t.match(/product|mejor|top|rendimiento|sku/)) return 'mejor-producto';
    if (t.match(/riesgo|churn|abandon|perder|fuga/)) return 'clientes-riesgo';
    if (t.match(/canal|rentab|margin|profit/)) return 'canal-rentable';
    if (t.match(/satisfac|nps|csat|opinion/)) return 'satisfaccion';
    if (t.match(/stock|inventario|quiebre|falta/)) return 'inventario';
    if (t.match(/forecast|predic|próximo|futuro|cuánto.*vend/)) return 'forecast';
    if (t.match(/vendedor|equipo|comercial|seller/)) return 'equipo-ventas';
    if (t.match(/devolu|cambio|quejas|reclamo/)) return 'devolucion';
    if (t.match(/region|ciudad|zona|geografí/)) return 'region';
    return null;
}

// ── CHAT ENGINE ────────────────────────────────────────────
function askQuestion(key) {
    document.querySelectorAll('.q-chip').forEach(c => c.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    const entry = dwKnowledge[key];
    if (!entry) return;
    addUserMessage(entry.query);
    simulateResponse(key);
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    const key = matchQuestion(text);
    key ? simulateResponse(key) : simulateUnknown();
}

function addUserMessage(text) {
    const msgs = document.getElementById('chatMessages');
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'chat-msg user-msg';
    div.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-content"><div class="msg-bubble">${text}</div><div class="msg-time">${now}</div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

async function simulateResponse(key) {
    const msgs = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot-msg';
    typing.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content"><div class="msg-bubble" style="padding:8px 16px"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><div style="font-size:0.7rem;color:#64748b;margin-top:4px">Consultando Data Warehouse...</div></div></div>`;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    await sleep(1600 + Math.random() * 700);
    typing.remove();

    const entry = dwKnowledge[key];
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'chat-msg bot-msg';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content"><div class="msg-bubble">${entry.response}</div><div class="msg-time">${now} · Fuentes: ${entry.tables.join(', ')}</div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(() => {
        div.querySelectorAll('.insight-bar-fill').forEach(bar => {
            const w = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => { bar.style.width = w; }, 80);
        });
    }, 200);
}

function simulateUnknown() {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot-msg';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-content"><div class="msg-bubble">
    <p>No encontré datos exactos para eso en el DW. 😔</p>
    <p style="margin-top:8px">Prueba preguntando sobre: <span class="tag-green">ventas</span>, <span class="tag-blue">clientes en riesgo</span>, <span class="tag-amber">inventario</span>, <span class="tag-pink">satisfacción</span>, <span class="tag-blue">forecast</span>, <span class="tag-green">devoluciones</span> o <span class="tag-amber">regiones</span>.<br><br>O usa los botones sugeridos del panel izquierdo 👈</p>
  </div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

