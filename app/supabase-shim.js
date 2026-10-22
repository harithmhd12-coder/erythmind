'use strict';
/* ================= Erythmind app: the claude.ai runtime rebuilt on Supabase =================
   The world code asks for window.claude.use('db' | 'room' | 'user' | 'downloads'). Inside claude.ai those come
   from the artifact runtime; here they come from the owner's own Supabase project:
     db        -> table public.docs (path, data) + Realtime row changes, guarded by Row Level Security
     room      -> one private Realtime channel 'erythmind' (presence + broadcast), guarded by Realtime Authorization
     user      -> Supabase Auth: every visitor gets an anonymous id; the owner signs in with email + password
     downloads -> a normal browser download
   Everything the world stores is already encrypted on the device before it gets here. */
(() => {
  const C = window.ERYTH_CONFIG || {};
  if(!C.supabaseUrl || !C.supabaseKey || /GANTI/.test(C.supabaseUrl + C.supabaseKey) || !window.supabase){
    console.warn('Erythmind: app/config.js belum diisi. Dunia berjalan dalam mod tempatan (pelayar ini sahaja).');
    window.ERY = {configured:false}; return;
  }
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true, storageKey:'erythmind.auth'}});
  const ERY = window.ERY = {configured:true, sb, uid:null, email:null, owner:false, events:new EventTarget()};
  const fail = (e, code) => Object.assign(new Error(e?.message || String(e || code)), {code:e?.code || code || 'db_error'});

  /* --- identity: reuse the saved session, otherwise an anonymous one --- */
  const ready = (async () => {
    let {data:{session}} = await sb.auth.getSession();
    if(!session){ const r = await sb.auth.signInAnonymously(); if(r.error) throw fail(r.error, 'auth'); session = r.data.session; }
    ERY.uid = session.user.id; ERY.email = session.user.is_anonymous ? null : session.user.email || null;
    sb.realtime.setAuth(session.access_token);
    const o = await sb.rpc('is_owner'); ERY.owner = !o.error && o.data === true;
    sb.auth.onAuthStateChange((ev, s) => { if(s?.access_token) sb.realtime.setAuth(s.access_token); });
    return session;
  })();
  ready.catch(e => console.error('Erythmind auth', e));
  ERY.ready = ready;

  /* --- db: Firestore-shaped docs over one table --- */
  const cache = new Map();                       // path -> data
  const docSubs = new Map(), collSubs = new Map(); // path|coll -> Set(fn)
  const coll = p => p.split('/')[0];
  const clone = v => v == null ? v : JSON.parse(JSON.stringify(v));
  const docSnap = p => ({id:p.split('/')[1], exists:cache.has(p), data:() => clone(cache.get(p)), metadata:{fromCache:false}});
  const collSnap = (c, n) => ({docs:[...cache.keys()].filter(p => coll(p) === c).slice(0, n).map(p => ({id:p.split('/')[1], data:() => clone(cache.get(p))}))});
  const notify = p => { (docSubs.get(p) || []).forEach(f => f()); (collSubs.get(coll(p)) || []).forEach(f => f()); };
  const sub = (m, k, f) => { if(!m.has(k)) m.set(k, new Set()); m.get(k).add(f); return () => m.get(k).delete(f); };
  let changes = null;
  function listen(){
    if(changes) return; changes = sb.channel('erythmind-docs', {config:{private:true}}).on('postgres_changes', {event:'*', schema:'public', table:'docs'}, ch => {
      if(ch.eventType === 'DELETE'){ const p = ch.old?.path; if(p){ cache.delete(p); notify(p); } return; }
      const r = ch.new; if(!r?.path) return; cache.set(r.path, r.data); notify(r.path);
    }).subscribe();
  }
  ERY.dbReload = async () => { for(const p of [...cache.keys()]) cache.delete(p); const r = await sb.from('docs').select('path,data').limit(1000); (r.data || []).forEach(x => cache.set(x.path, x.data)); [...docSubs.keys()].forEach(notify); [...collSubs.keys()].forEach(c => (collSubs.get(c) || []).forEach(f => f())); };
  function docRef(path){
    return {
      id:path.split('/')[1],
      onSnapshot(cb, onErr){ let off = () => {};
        ready.then(async () => { listen(); const r = await sb.from('docs').select('data').eq('path', path).maybeSingle();
          if(r.error){ onErr?.(fail(r.error)); return; } if(r.data) cache.set(path, r.data.data); else cache.delete(path);
          cb(docSnap(path)); off = sub(docSubs, path, () => cb(docSnap(path))); }).catch(e => onErr?.(fail(e)));
        return () => off(); },
      async get(){ await ready; const r = await sb.from('docs').select('data').eq('path', path).maybeSingle(); if(r.error) throw fail(r.error); if(r.data) cache.set(path, r.data.data); return docSnap(path); },
      async set(data){ await ready; const r = await sb.from('docs').upsert({path, data}); if(r.error) throw fail(r.error, 'not_permitted'); cache.set(path, clone(data)); notify(path); },
      async delete(){ await ready; const r = await sb.from('docs').delete().eq('path', path); if(r.error) throw fail(r.error, 'not_permitted'); cache.delete(path); notify(path); },
    };
  }
  function collRef(c){
    const q = n => ({
      onSnapshot(cb, onErr){ let off = () => {};
        ready.then(async () => { listen(); const r = await sb.from('docs').select('path,data').eq('coll', c).limit(n);
          if(r.error){ onErr?.(fail(r.error)); return; } (r.data || []).forEach(x => cache.set(x.path, x.data));
          cb(collSnap(c, n)); off = sub(collSubs, c, () => cb(collSnap(c, n))); }).catch(e => onErr?.(fail(e)));
        return () => off(); },
    });
    return {limit:q, doc:id => docRef(c + '/' + id), onSnapshot:(cb, e) => q(1000).onSnapshot(cb, e)};
  }
  const db = {doc:docRef, collection:collRef};
  ERY.db = db;

  /* --- room: presence for who is here, broadcast for movement, chat, voice and powers --- */
  let roomP = null;
  function makeRoom(){
    const peerId = (ERY.uid || 'x').slice(0, 8) + '-' + Math.random().toString(36).slice(2, 8);
    const ch = sb.channel('erythmind', {config:{private:true, presence:{key:peerId}, broadcast:{self:false}}});
    const live = new Map();                        // peerId -> {by, presence}
    const peerCbs = new Set(), topicCbs = new Map();
    let latest = null, lastTrack = 0, trackKey = '', joined = false;
    const peersNow = () => {
      const st = ch.presenceState(), out = [];
      for(const [key, metas] of Object.entries(st)){ const m = metas[0] || {}; const l = live.get(key); out.push({peer:key, by:m.by, isMe:m.by === ERY.uid, sameTab:key === peerId, presence:(l && l.presence) || m.p || {}}); }
      return out;
    };
    const emitPeers = () => { const ps = peersNow(); peerCbs.forEach(f => { try{ f({peers:ps}); }catch(e){} }); };
    const sendPos = () => { if(joined && latest) ch.send({type:'broadcast', event:'__p', payload:{peer:peerId, by:ERY.uid, p:latest}}); };
    ch.on('presence', {event:'sync'}, emitPeers);
    ch.on('presence', {event:'join'}, ({key}) => { if(key !== peerId) sendPos(); });
    ch.on('presence', {event:'leave'}, ({key}) => { live.delete(key); emitPeers(); });
    ch.on('broadcast', {event:'*'}, msg => {
      const ev = msg.event, pl = msg.payload || {};
      if(ev === '__p'){ if(pl.peer && pl.peer !== peerId){ live.set(pl.peer, {by:pl.by, presence:pl.p}); emitPeers(); } return; }
      if(ev === '__kick'){ ERY.events.dispatchEvent(new CustomEvent('kick', {detail:pl})); return; }
      const set = topicCbs.get(ev); if(!set) return;
      const m = {data:pl.data, peer:pl.peer, by:pl.by, isMe:pl.by === ERY.uid, sameTab:false};
      set.forEach(f => { try{ f(m); }catch(e){} });
    });
    const room = {
      presence(p){
        latest = p; sendPos();
        const key = [p.l, p.n, p.r, p.st, p.g, p.vk].join('|'), now = Date.now();
        if(joined && (key !== trackKey || now - lastTrack > 5000)){ trackKey = key; lastTrack = now; ch.track({by:ERY.uid, p}); }
        return Promise.resolve();
      },
      onPeers(cb){ peerCbs.add(cb); cb({peers:peersNow()}); return () => peerCbs.delete(cb); },
      on(topic, cb){ if(!topicCbs.has(topic)) topicCbs.set(topic, new Set()); topicCbs.get(topic).add(cb); return () => topicCbs.get(topic).delete(cb); },
      async emit(topic, data){ const r = await ch.send({type:'broadcast', event:topic, payload:{data, peer:peerId, by:ERY.uid}}); if(r !== 'ok') throw fail(null, r === 'timed out' ? 'timeout' : 'not_permitted'); },
      kick(by){ return ch.send({type:'broadcast', event:'__kick', payload:{target:by, from:ERY.uid}}); },
      peers:peersNow, peerId, channel:ch,
    };
    ERY.room = room;
    return new Promise(res => {
      let done = false; const finish = v => { if(!done){ done = true; res(v); } };
      ch.subscribe(status => {
        if(status === 'SUBSCRIBED'){ joined = true; ch.track({by:ERY.uid, p:latest || {}}); finish(room); }
        else if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'){ ERY.roomError = status; finish(null); }
      });
      setTimeout(() => finish(null), 15000);
    });
  }

  const user = {id:async () => (await ready).user.id, isOwner:async () => { await ready; return ERY.owner; }, canEdit:async () => { await ready; return ERY.owner; }};
  const downloads = {async save({filename, data, mimeType}){ const b = new Blob([data], {type:mimeType || 'application/json'}), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = filename || 'erythmind.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); }};

  window.claude = {use:async name => {
    await ready;
    if(name === 'db') return db;
    if(name === 'user') return user;
    if(name === 'downloads') return downloads;
    if(name === 'room') return roomP || (roomP = makeRoom());
    return null;
  }};
})();
