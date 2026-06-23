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

  // Struktur gambar mengikut bingkai segi empat di bucu kanan atas seperti di image_c75be8.png
  const imageBlock = resume.imageData
    ? `<div class="pfp-frame"><img src="${resume.imageData}" alt="Profile Image"></div>`
    : `<div class="pfp-frame" style="display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.75rem;font-weight:bold;">NO IMAGE</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(resume.name || 'Resume Preview')}</title>
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

        /* ZON BUTANG PRINT (AKAN DIKECUALIKAN SEMASA PRINT) */
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

        /* STRUKTUR HELAIAN KERTAS PUTIH SEBIJIK MACAM USER */
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

        /* SUSUNAN HEADER (NAMA & GAMBAR) */
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
            color: #3b82f6; /* Warna biru peranan */
            font-weight: bold;
            margin-bottom: 4px;
        }
        .user-pdf-sub {
            font-size: 0.95rem;
            color: #64748b;
        }

        /* BINGKAI GAMBAR PROFIL */
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

        /* GARISAN PEMISAH HITAM TEBAL */
        .thick-divider {
            border: none;
            height: 3px;
            background-color: #000000;
            margin: 25px 0 20px 0;
        }

        /* REKA BENTUK SEKSYEN */
        .pdf-section {
            margin-bottom: 25px;
        }
        .pdf-section h3 {
            font-size: 1.05rem;
            color: #3b82f6; /* Tajuk seksyen warna biru */
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
            white-space: pre-line; /* Mengekalkan format baris baru dari textarea */
        }

        /* FOOTER UNTUK ASSET AKADEMIK */
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

        /* ATURAN SEMASA MENCETAK KEPADA PDF */
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
                <h1 class="user-pdf-name">${escapeHtml(resume.name || 'Unnamed User')}</h1>
                <div class="user-pdf-role">${escapeHtml(resume.role || '-')}</div>
                <div class="user-pdf-sub">${escapeHtml(resume.email || 'No email shared')}</div>
            </div>
            <div class="header-right">
                ${imageBlock}
            </div>
        </div>

        <hr class="thick-divider">

        <div class="pdf-section">
            <h3>STRENGTH / SUMMARY</h3>
            <p>${resume.bio ? escapeHtml(resume.bio) : 'No summary available.'}</p>
        </div>

        <div class="pdf-section">
            <h3>EDUCATION</h3>
            <p>${resume.education ? escapeHtml(resume.education) : (resume.exp ? escapeHtml(resume.exp) : 'No education content available.')}</p>
        </div>

        <div class="pdf-section">
            <h3>PROJECT EXPERIENCE</h3>
            <p>${resume.project ? escapeHtml(resume.project) : 'No project content available.'}</p>
        </div>

        <div class="pdf-section">
            <h3>WORK EXPERIENCE</h3>
            <p>${resume.work ? escapeHtml(resume.work) : 'No work experience available.'}</p>
        </div>

        <div class="pdf-section">
            <h3>COMPETENCY & SOFT SKILLS</h3>
            <p>${resume.skills ? escapeHtml(resume.skills) : 'No skills listed.'}</p>
        </div>

        <div class="pdf-section">
            <h3>LANGUAGES</h3>
            <p>${resume.languages ? escapeHtml(resume.languages) : 'No languages listed.'}</p>
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