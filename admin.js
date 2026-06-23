const ADMIN_EMAIL = 'admin@gmail.com';

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Never';
  if (timestamp && timestamp.seconds != null) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
}

function signOutUser() {
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.disabled = true;
    signOutBtn.innerText = 'Signing out...';
  }

  if (!window.firebase || !firebase.auth) {
    window.location.replace('auth.html');
    return;
  }

  firebase.auth().signOut()
    .then(() => {
      window.location.replace('auth.html?logout=true');
    })
    .catch((error) => {
      console.warn('Sign out failed:', error);
      window.location.replace('auth.html?logout=true');
    });
}

window.signOutUser = signOutUser;

function renderResumes(resumes) {
  const container = document.getElementById('resumeList');
  if (!resumes || !resumes.length) {
    container.innerHTML = '<tr><td colspan="6" class="empty-state">No resumes found.</td></tr>';
    return;
  }

  let html = '';
  resumes.forEach((resume, index) => {
    html += `
      <tr>
        <td>${resume.email ? escapeHtml(resume.email) : '<span style="opacity:.75;">Unknown</span>'}</td>
        <td>${resume.name ? escapeHtml(resume.name) : '-'}</td>
        <td>${resume.role ? escapeHtml(resume.role) : '-'}</td>
        <td>${escapeHtml(formatTimestamp(resume.updatedAt))}</td>
        <td>${resume.bio ? escapeHtml(resume.bio).replace(/\n/g, '<br>') : '-'}</td>
        <td>
          <div class="action-cell">
            <button type="button" class="btn btn-muted btn-view" data-index="${index}">View PDF</button>
            <button type="button" class="btn-danger" data-id="${resume.id}">Delete</button>
          </div>
        </td>
      </tr>`;
  });

  container.innerHTML = html;

  // Event Listener untuk View PDF
  container.querySelectorAll('button[data-index]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const index = parseInt(event.currentTarget.getAttribute('data-index'), 10);
      openResumePdf(resumes[index]);
    });
  });

  // Event Listener untuk Delete
  container.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const docId = event.currentTarget.getAttribute('data-id');
      deleteResume(docId);
    });
  });
}

// FUNGSI UTK PADAM RESUME DARIPADA FIRESTORE
async function deleteResume(docId) {
  if (!docId) return;

  const sahkan = confirm("Adakah anda pasti mahu memadam resume ini secara kekal daripada pangkalan data?");
  if (!sahkan) return;

  const status = document.getElementById('adminStatus');
  try {
    status.innerHTML = `<em>Memadam resume...</em>`;
    await firebase.firestore().collection('resumes').doc(docId).delete();
    
    // Muat semula senarai selepas berjaya padam
    loadAdminResumes();
  } catch (error) {
    console.error("Gagal memadam resume:", error);
    alert(`Gagal memadam data: ${error.message}`);
    loadAdminResumes(); // Set semula paparan status asal
  }
}

window.deleteResume = deleteResume;

function openResumePdf(resume) {
  if (!resume) {
    alert('Unable to open resume preview.');
    return;
  }

  const preview = window.open('', '_blank');
  if (!preview) {
    alert('Please allow popups to view the PDF preview.');
    return;
  }

  const imageBlock = resume.imageData
    ? `<img src="${resume.imageData}" alt="Profile Image" style="width:120px;height:120px;border-radius:18px;object-fit:cover;">`
    : '<div style="width:120px;height:120px;border-radius:18px;background:#111827;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.85rem;">NO IMAGE</div>';

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Resume Preview</title><style>body{margin:0;font-family:Poppins,sans-serif;background:#0b1120;color:#e2e8f0} .container{max-width:900px;margin:0 auto;padding:40px;background:#111827} .header{display:flex;justify-content:space-between;flex-wrap:wrap;gap:24px;align-items:center;margin-bottom:30px} .title{font-size:2.25rem;margin:0} .subtitle{color:#94a3b8;margin:8px 0 0} .section{margin-bottom:22px} .section h3{margin-bottom:10px;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.12em;color:#60a5fa} .section p{margin:0;line-height:1.8;color:#cbd5e1} .print-btn{display:inline-block;margin-bottom:24px;padding:12px 20px;border-radius:999px;background:#22c55e;color:#0f172a;text-decoration:none;font-weight:700}</style></head><body><div class="container"><a class="print-btn" href="#" onclick="window.print(); return false;">Print / Save as PDF</a><div class="header"><div><h1 class="title">${escapeHtml(resume.name || 'Unnamed User')}</h1><div class="subtitle">${escapeHtml(resume.role || 'Resume Preview')}</div></div>${imageBlock}</div><div class="section"><h3>Summary</h3><p>${resume.bio ? escapeHtml(resume.bio).replace(/\n/g, '<br>') : 'No summary available.'}</p></div><div class="section"><h3>Experience & Education</h3><p>${resume.exp ? escapeHtml(resume.exp).replace(/\n/g, '<br>') : 'No experience content available.'}</p></div><div class="section"><h3>Contact</h3><p>${escapeHtml(resume.email || 'No email available.')}</p></div></div></body></html>`;

  preview.document.write(html);
  preview.document.close();
}

window.openResumePdf = openResumePdf;

async function loadAdminResumes() {
  const status = document.getElementById('adminStatus');
  try {
    const query = await firebase.firestore().collection('resumes').get();
    const resumes = [];
    query.forEach((doc) => {
      // Kita masukkan id dokumen (UID user) sekali ke dalam objek data resume
      const data = doc.data();
      data.id = doc.id; 
      resumes.push(data);
    });
    renderResumes(resumes);
    status.innerHTML = `<strong>Access granted.</strong> Showing ${resumes.length} saved resume${resumes.length === 1 ? '' : 's'}.`;
  } catch (error) {
    const denied = error.code === 'permission-denied';
    const currentUser = firebase.auth().currentUser;
    const currentEmail = currentUser && currentUser.email ? currentUser.email : 'unknown';

    status.innerHTML = denied
      ? `<strong>Access denied.</strong> Signed in as <strong>${escapeHtml(currentEmail)}</strong>. You must sign in with the admin account (${escapeHtml(ADMIN_EMAIL)}).`
      : `Unable to load resumes: ${escapeHtml(error.message)}`;

    document.getElementById('resumeList').innerHTML = '<tr><td colspan="6" class="empty-state">Unable to load resume list.</td></tr>';
  }
}

function initAdminDashboard() {
  const status = document.getElementById('adminStatus');
  const resumeList = document.getElementById('resumeList');

  if (!window.firebaseConfigValid) {
    status.innerText = 'Firebase config incomplete. Update firebase-config.js with your web app credentials.';
    return;
  }

  function showUnauthorized(user) {
    const email = user && user.email ? user.email : 'Unknown';
    status.innerHTML = `Signed in as <strong>${escapeHtml(email)}</strong>. You are not authorized to access this page.`;
    resumeList.innerHTML = '<tr><td colspan="6" class="empty-state">Only the admin may view this dashboard.</td></tr>';
    setTimeout(() => { window.location.href = 'index.html'; }, 1300);
  }

  async function handleUser(user) {
    if (!user) {
      status.innerText = 'No authenticated user found. Redirecting to login...';
      setTimeout(() => { window.location.href = 'auth.html'; }, 700);
      return;
    }

    const userEmail = user.email ? user.email.toLowerCase() : '';
    const adminEmail = ADMIN_EMAIL.toLowerCase();

    if (userEmail !== adminEmail) {
      showUnauthorized(user);
      return;
    }

    status.innerHTML = `Signed in as <strong>${escapeHtml(user.email)}</strong>. Admin access granted.`;

    try {
      const adminRef = firebase.firestore().collection('admins').doc(user.uid);
      const doc = await adminRef.get();
      if (!doc.exists) {
        await adminRef.set({
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Registered admin in Firestore');
      }
    } catch (err) {
      console.warn('Failed to check/register admin status:', err);
    }

    loadAdminResumes();
  }

  status.innerText = 'Waiting for Firebase authentication...';
  firebase.auth().onAuthStateChanged(handleUser);
}

document.addEventListener('DOMContentLoaded', () => {
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOutUser);
  }
  initAdminDashboard();
});