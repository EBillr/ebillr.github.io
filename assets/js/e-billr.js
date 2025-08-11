// e-billr.js - dashboard code (no imports)
(function(){
  const session = window.eb_getSession && window.eb_getSession();
  if (!session){
    // show modal + redirect to login
    const modal = document.getElementById('session-modal');
    if (modal) modal.classList.remove('hidden');
    setTimeout(()=> window.location.href = 'login.html', 1300);
    return;
  }

  // helper for GitHub API calls using token
  async function ghFetch(url, opts = {}){
    const headers = opts.headers || {};
    headers['Authorization'] = `token ${session.token}`;
    headers['Accept'] = 'application/vnd.github.v3+json';
    const res = await fetch(url, Object.assign({}, opts, { headers }));
    if (!res.ok) {
      const body = await res.json().catch(()=>({message:'unknown'}));
      throw new Error(body.message || 'GitHub API error');
    }
    return res.json();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // populate header user
    const userNameEl = document.getElementById('username');
    const userNameHeader = document.getElementById('user-name');
    const avatar = document.getElementById('user-avatar');
    const userInfoBlock = document.getElementById('user-info');

    try{
      const user = await ghFetch('https://api.github.com/user');
      if (userNameEl) userNameEl.textContent = user.login;
      if (userNameHeader) userNameHeader.textContent = user.login;
      if (avatar) { avatar.src = user.avatar_url; userInfoBlock.style.display = 'flex'; }
    } catch(err){
      console.error('Failed to fetch user', err);
      // likely invalid token: destroy and redirect
      window.eb_destroySession && window.eb_destroySession();
      window.location.href = 'login.html';
      return;
    }

    // logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
      if (confirm('Logout?')) {
        window.eb_destroySession && window.eb_destroySession();
        window.location.href = 'login.html';
      }
    });

    // repo list
    const repoListEl = document.getElementById('repo-list');
    async function loadRepos(){
      repoListEl.innerHTML = 'Loading...';
      try{
        const repos = await ghFetch('https://api.github.com/user/repos?per_page=100');
        repoListEl.innerHTML = '';
        repos.sort((a,b)=>b.updated_at.localeCompare(a.updated_at));
        if (repos.length === 0) repoListEl.innerHTML = '<div class="muted">No repos found</div>';
        repos.forEach(r=>{
          const el = document.createElement('div');
          el.className = 'repo-item';
          el.textContent = r.full_name;
          el.addEventListener('click', ()=> selectRepo(r));
          repoListEl.appendChild(el);
        });
      } catch(e){
        repoListEl.innerHTML = '<div class="muted">Failed to load repos</div>';
        console.error(e);
      }
    }

    let currentRepo = null;
    async function selectRepo(repo){
      currentRepo = repo;
      // visually mark
      Array.from(repoListEl.children).forEach(c=>c.classList.remove('active'));
      const found = Array.from(repoListEl.children).find(c => c.textContent === repo.full_name);
      if (found) found.classList.add('active');

      const mainArea = document.getElementById('main-area');
      mainArea.innerHTML = `<p class="muted">Checking for <code>digitalbill.json</code> in <strong>${repo.full_name}</strong>…</p>`;
      try{
        const contents = await ghFetch(`https://api.github.com/repos/${repo.full_name}/contents/digitalbill.json`);
        const decoded = atob(contents.content.replace(/\n/g,''));
        const json = JSON.parse(decoded);
        mainArea.innerHTML = `<pre style="white-space:pre-wrap;max-height:420px;overflow:auto">${JSON.stringify(json,null,2)}</pre>
          <div style="margin-top:0.75rem"><button id="edit-json" class="btn">Edit</button></div>`;
        document.getElementById('edit-json').addEventListener('click', ()=> openEditor(repo, contents.sha, json));
      }catch(err){
        mainArea.innerHTML = `<p class="muted">digitalbill.json not found in <strong>${repo.full_name}</strong>.</p>
          <div style="margin-top:0.75rem"><button id="create-json" class="btn primary">Create digitalbill.json</button></div>`;
        document.getElementById('create-json').addEventListener('click', ()=> createDigitalBill(repo));
      }
    }

    async function createDigitalBill(repo){
      const defaultObj = { lastCustomerId: 0, businessName: "My Business", location: "", notes:"" };
      const message = 'Create digitalbill.json (by E-Billr)';
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(defaultObj,null,2))));
      try{
        await ghFetch(`https://api.github.com/repos/${repo.full_name}/contents/digitalbill.json`, {
          method: 'PUT',
          body: JSON.stringify({ message, content })
        });
        alert('digitalbill.json created — refresh to view');
        loadRepos();
      }catch(e){ alert('Failed to create file: ' + e.message); }
    }

    function openEditor(repo, sha, currentObj){
      const mainArea = document.getElementById('main-area');
      mainArea.innerHTML = '';
      const textarea = document.createElement('textarea');
      textarea.style.width = '100%'; textarea.style.height = '320px';
      textarea.value = JSON.stringify(currentObj, null, 2);
      mainArea.appendChild(textarea);
      const saveBtn = document.createElement('button');
      saveBtn.className='btn primary'; saveBtn.textContent='Save';
      saveBtn.style.marginTop = '0.75rem';
      saveBtn.addEventListener('click', async ()=>{
        let parsed;
        try { parsed = JSON.parse(textarea.value); } catch(e){ alert('Invalid JSON'); return; }
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(parsed,null,2))));
        try{
          await ghFetch(`https://api.github.com/repos/${repo.full_name}/contents/digitalbill.json`, {
            method: 'PUT',
            body: JSON.stringify({ message: 'Update digitalbill.json', content, sha })
          });
          alert('Saved');
          loadRepos();
        }catch(e){ alert('Save failed: '+e.message); }
      });
      mainArea.appendChild(saveBtn);
    }

    // create repo
    document.getElementById('create-repo').addEventListener('click', async ()=>{
      const name = prompt('New repo name (no spaces, e.g. my-ebillr-data)');
      if (!name) return;
      try{
        await ghFetch('https://api.github.com/user/repos', {
          method: 'POST',
          body: JSON.stringify({ name, description: 'E-Billr storage repo', auto_init: true })
        });
        alert('Repo created');
        loadRepos();
      }catch(e){ alert('Create repo failed: '+e.message); }
    });

    document.getElementById('refresh-repos').addEventListener('click', loadRepos);
    document.getElementById('open-bill-editor').addEventListener('click', ()=>{
      if (!currentRepo) return alert('Select a repo first');
      selectRepo(currentRepo);
    });

    // initial
    loadRepos();
  });
})();
