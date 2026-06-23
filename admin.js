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

  // Pengesahan imej profil
  const imageBlock = (resume.imageData && resume.imageData.trim() !== '')
    ? `<div class="pfp-frame"><img src="${resume.imageData}" alt="Profile Image"></div>`
    : `<div class="pfp-frame" style="display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.75rem;font-weight:bold;background:#f8fafc;">NO IMAGE</div>`;

  // Fallback data sekiranya medan kosong atau menggunakan nama kunci (field keys) alternatif
  const nameData = resume.name ? escapeHtml(resume.name) : 'Unnamed User';
  const roleData = resume.role ? escapeHtml(resume.role) : '-';
  const emailData = resume.email ? escapeHtml(resume.email) : 'No email shared';
  const bioData = resume.bio ? escapeHtml(resume.bio) : 'No summary available.';
  
  // Variasi semakan untuk Education
  let rawEdu = resume.education || resume.educationDetails || resume.education_details || resume.edu || resume.exp || '';
  const eduData = rawEdu ? escapeHtml(rawEdu) : 'No education content available.';
  
  // Variasi semakan untuk Languages
  let rawLang = resume.languages || resume.language || resume.lang || '';
  const langData = rawLang ? escapeHtml(rawLang) : 'No languages listed.';

  // Variasi semakan untuk bahagian lain
  let rawProject = resume.project || resume.projects || resume.projectExperience || '';
  const projectData = rawProject ? escapeHtml(rawProject) : 'No project content available.';

  let rawWork = resume.work || resume.workExperience || resume.experience || '';
  const workData = rawWork ? escapeHtml(rawWork) : 'No work experience available.';

  let rawSkills = resume.skills || resume.skill || resume.competency || '';
  const skillsData = rawSkills ? escapeHtml(rawSkills) : 'No skills listed.';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${nameData} - Preview</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background: #0f172a; 
            padding: 40px 20px; 
            display: flex; 
            flex-direction: column; 
            align-items: center;
            font-family: 'Arial', sans-serif;
            color: #1e293b;
        }
        .no-print-zone {
            width: 100%;
            max-width: 800px;
            margin-bottom: 20px;
            text-align: left;
        }
        .print-btn {
            display: inline-block;
            padding: 10px 25px;
            border-radius: 50px;
            background: #22c55e;
            color: white;
            text-decoration: none;
            font-weight: bold;
            font-size: 0.95rem;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }
        .resume-sheet {
            background: #ffffff !important;
            width: 100%;
            max-width: 800px;
            min-height: 1050px;
            padding: 50px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            border-radius: 4px;
            box-sizing: border-box;
            position: relative;
        }
        .resume-main-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
        }
        .header-left {
            flex: 1;
            padding-right: 20px;
        }
        .user-pdf-name {
            font-size: 2.2rem;
            font-weight: bold;
            color: #000000;
            text-transform: uppercase;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }
        .user-pdf-role {
            font-size: 1.15rem;
            color: #3b82f6;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .user-pdf-sub {
            font-size: 0.95rem;
            color: #64748b;
        }
        .pfp-frame {
            width: 110px;
            height: 130px;
            border: 1px solid #cbd5e1;
            overflow: hidden;
            border-radius: 4px;
            background: #f8fafc;
        }
        .pfp-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .thick-divider {
            border: none;
            height: 3px;
            background-color: #000000;
            margin: 25px 0 20px 0;
        }
        .pdf-section {
            margin-bottom: 25px;
        }
        .pdf-section h3 {
            font-size: 1.05rem;
            color: #3b82f6;
            font-weight: bold;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }
        .pdf-section p {
            font-size: 0.95rem;
            color: #334155;
            line-height: 1.6;
            white-space: pre-line;
        }
        .pdf-footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        @media print {
            body { 
                background: none !important; 
                padding: 0 !important;
            }
            .no-print-zone { 
                display: none !important; 
            }
            .resume-sheet { 
                box-shadow: none !important; 
                padding: 0 !important;
                width: 100% !important;
                border-radius: 0 !important;
            }
        }
    </style>
</head>
<body>
    <div class="no-print-zone">
        <button class="print-btn" onclick="window.print();">Print / Save as PDF</button>
    </div>
    <div class="resume-sheet">
        <div class="resume-main-header">
            <div class="header-left">
                <h1 class="user-pdf-name">${nameData}</h1>
                <div class="user-pdf-role">${roleData}</div>
                <div class="user-pdf-sub">${emailData}</div>
            </div>
            <div class="header-right">
                ${imageBlock}
            </div>
        </div>
        <hr class="thick-divider">
        <div class="pdf-section">
            <h3>STRENGTH / SUMMARY</h3>
            <p>${bioData}</p>
        </div>
        <div class="pdf-section">
            <h3>EDUCATION</h3>
            <p>${eduData}</p>
        </div>
        <div class="pdf-section">
            <h3>PROJECT EXPERIENCE</h3>
            <p>${projectData}</p>
        </div>
        <div class="pdf-section">
            <h3>WORK EXPERIENCE</h3>
            <p>${workData}</p>
        </div>
        <div class="pdf-section">
            <h3>COMPETENCY & SOFT SKILLS</h3>
            <p>${skillsData}</p>
        </div>
        <div class="pdf-section">
            <h3>LANGUAGES</h3>
            <p>${langData}</p>
        </div>
        <div class="pdf-footer">
            <span>PLATFORM ASSESSMENT ASSET</span>
            <span>SYSTEM SECURE VERIFIED</span>
        </div>
    </div>
</body>
</html>`;

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

  if (typeof window.firebaseConfigValid === 'undefined') {
    window.firebaseConfigValid = true; 
  }

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