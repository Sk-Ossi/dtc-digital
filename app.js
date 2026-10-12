/* Public data only. Never place GitHub credentials in this website. */
'use strict';
const config = window.DTC_CONFIG || {};
const $ = id => document.getElementById(id);
const state = { repos: [], releases: new Map(), page: 0, size: 9, busy: false, blockedUntil: 0 };
const username = (config.username || '').trim();
const validUser = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function safeURL(value, hosts) {
  try { const url = new URL(value); return url.protocol === 'https:' && (!hosts || hosts.includes(url.hostname)) ? url.href : ''; } catch { return ''; }
}
const githubURL = value => safeURL(value, ['github.com']);
function cached(path) { try { return JSON.parse(localStorage.getItem('dtc:v1:' + path)); } catch { return null; } }
function save(path, data) { try { localStorage.setItem('dtc:v1:' + path, JSON.stringify({time:Date.now(),data})); } catch { /* private mode or quota */ } }
async function api(path) {
  const entry = cached(path);
  const ttl = Math.max(1, Number(config.cacheMinutes) || 15) * 60000;
  if (entry && Date.now() - entry.time < ttl) return entry.data;
  try {
    if (Date.now() < state.blockedUntil) throw new Error('GitHub pausiert API-Anfragen. Bitte später erneut öffnen.');
    const response = await fetch('https://api.github.com' + path, { headers:{Accept:'application/vnd.github+json'}, signal:AbortSignal.timeout(15000) });
    if (response.status === 403 || response.status === 429) {
      const retry = Number(response.headers.get('retry-after'));
      const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
      state.blockedUntil = Math.max(Date.now() + (retry || 60) * 1000, reset || 0);
      throw new Error('GitHub-Anfragelimit erreicht. Erneut möglich ab ' + new Date(state.blockedUntil).toLocaleTimeString('de-DE') + '.');
    }
    if (response.status === 404 && path.endsWith('/releases/latest')) { save(path,null); return null; }
    if (!response.ok) throw new Error(response.status === 404 ? 'GitHub-Profil nicht gefunden. Bitte Benutzernamen prüfen.' : 'GitHub antwortet mit Fehler ' + response.status + '.');
    const data = await response.json(); save(path,data); return data;
  } catch (error) {
    if (entry) { $('status').textContent = 'GitHub derzeit nicht erreichbar. Gespeicherte Daten werden angezeigt; diese können veraltet sein. ' + error.message; return entry.data; }
    throw error;
  }
}
function filtered() {
  const query = $('search').value.toLowerCase().trim();
  return state.repos.filter(repo => [repo.name,repo.description,repo.language,...(repo.topics || [])].join(' ').toLowerCase().includes(query));
}
function downloadable(release) { return (release?.assets || []).filter(a => a.state === 'uploaded' && githubURL(a.browser_download_url)); }
function card(repo) {
  const release = state.releases.get(repo.full_name);
  const assets = downloadable(release);
  const description = repo.description || 'Mehr über dieses Projekt in der Vorschau und auf GitHub erfahren.';
  const tags = [repo.language,...(repo.topics || []).slice(0,2)].filter(Boolean);
  const version = release ? release.tag_name : release === null ? 'Noch kein Release' : 'Release wird geprüft';
  return `<article class="card"><div class="card-top"><span class="icon" aria-hidden="true">${escapeHTML(repo.name.slice(0,2).toUpperCase())}</span><span class="pill">${escapeHTML(version)}</span></div><h3>${escapeHTML(repo.name)}</h3><p class="description">${escapeHTML(description)}</p><div class="tags">${tags.map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join('')}</div><div class="actions">${assets.length === 1 ? `<a class="download" href="${escapeHTML(githubURL(assets[0].browser_download_url))}">Download ↓</a>` : `<button class="${assets.length ? 'download' : 'secondary'}" data-preview="${escapeHTML(repo.full_name)}">${assets.length ? 'Downloads ↓' : 'Details ↗'}</button>`}<button class="secondary" data-preview="${escapeHTML(repo.full_name)}">Vorschau</button></div></article>`;
}
async function render() {
  if (state.busy) return;
  state.busy = true;
  $('prev').disabled = $('next').disabled = true;
  const repos = filtered();
  state.page = Math.min(state.page, Math.max(0, Math.ceil(repos.length/state.size)-1));
  const visible = repos.slice(state.page*state.size,(state.page+1)*state.size);
  $('count').textContent = state.repos.length + ' Projekte';
  $('grid').innerHTML = visible.map(card).join('');
  for (const repo of visible) {
    if (state.releases.has(repo.full_name)) continue;
    try { state.releases.set(repo.full_name,await api('/repos/' + repo.full_name + '/releases/latest')); }
    catch (error) { $('status').textContent = error.message + ' Projektlinks bleiben verfügbar.'; if (state.blockedUntil) break; }
  }
  const shown = $('filter').value === 'downloads' ? visible.filter(r=>downloadable(state.releases.get(r.full_name)).length) : visible;
  $('grid').innerHTML = shown.length ? shown.map(card).join('') : '<p>Keine passenden Projekte auf dieser Seite.</p>';
  $('page').textContent = (state.page+1) + ' / ' + Math.max(1,Math.ceil(repos.length/state.size));
  state.busy = false;
  $('prev').disabled = state.page === 0;
  $('next').disabled = (state.page+1)*state.size >= repos.length;
  // Apply changes made while release requests were running.
  if (repos.map(r=>r.id).join() !== filtered().map(r=>r.id).join()) { state.page=0; render(); }
}
function preview(name) {
  const repo = state.repos.find(r=>r.full_name===name); if (!repo) return;
  const release = state.releases.get(name);
  const assets = downloadable(release);
  const homepage = safeURL(repo.homepage);
  $('detail').innerHTML = `<div class="eyebrow">PROJEKTVORSCHAU</div><h2>${escapeHTML(repo.name)}</h2><p class="description">${escapeHTML(repo.description || 'Keine Projektbeschreibung hinterlegt.')}</p><div class="detail-links"><a target="_blank" rel="noopener noreferrer" href="${escapeHTML(githubURL(repo.html_url))}">Projekt & Dokumentation ↗</a>${homepage ? `<a target="_blank" rel="noopener noreferrer" href="${escapeHTML(homepage)}">Live-Vorschau ↗</a>` : ''}</div>${release ? `<span class="pill">Version ${escapeHTML(release.tag_name)}</span><h3>${escapeHTML(release.name || 'Aktuelles Release')}</h3><p class="release-notes">${escapeHTML(release.body || 'Keine Versionshinweise vorhanden.')}</p>${assets.length ? assets.map(a=>`<a class="asset" href="${escapeHTML(githubURL(a.browser_download_url))}"><span>${escapeHTML(a.name)} ↓</span><small>${(a.size/1048576).toLocaleString('de-DE',{maximumFractionDigits:1})} MB</small></a>`).join('') : '<p>Dieses Release enthält noch keine hochgeladenen Download-Dateien.</p>'}<div class="detail-links"><a href="${escapeHTML(githubURL(release.html_url))}" target="_blank" rel="noopener noreferrer">Release auf GitHub ↗</a></div>` : `<p>${release === null ? 'Noch kein öffentliches stabiles Release vorhanden.' : 'Release-Daten derzeit nicht verfügbar.'}</p>`}`;
  $('preview').showModal();
}
async function init() {
  $('close').onclick = ()=>$('preview').close();
  $('grid').onclick = event => { const button = event.target.closest('[data-preview]'); if (button) preview(button.dataset.preview); };
  $('search').oninput = () => {state.page=0;render();};
  $('filter').onchange = render;
  $('prev').onclick = () => {state.page--;render();};
  $('next').onclick = () => {state.page++;render();};
  if (!validUser.test(username)) { $('status').textContent = 'Deine Bibliothek ist vorbereitet. Trage deinen GitHub-Benutzernamen in config.js ein, um echte Projekte anzuzeigen.'; $('prev').disabled=$('next').disabled=true; return; }
  $('status').textContent = 'Öffentliche Projekte werden geladen …';
  try {
    let page=1;
    for (;;) {
      const batch = await api('/users/' + encodeURIComponent(username) + '/repos?type=owner&sort=updated&per_page=100&page=' + page);
      state.repos.push(...batch.filter(r => !r.fork && r.name.toLowerCase() !== (config.repository || 'dtc-digital').toLowerCase() && r.name.toLowerCase() !== username.toLowerCase()+'.github.io' && !(config.exclude || []).includes(r.name)));
      if (batch.length < 100) break;
      page++;
    }
    $('status').textContent = state.repos.length ? 'Öffentliche eigene Projekte · neueste stabile Releases · automatische Erkennung beim nächsten Besuch. Downloadfilter gilt für die aktuelle Seite.' : 'Noch keine öffentlichen eigenen Projekte vorhanden. Erstelle ein Projekt und veröffentliche ein Release mit Dateien.';
    await render();
  } catch (error) { $('status').textContent = error.message; if(state.repos.length) await render(); else $('prev').disabled=$('next').disabled=true; }
}
init();
