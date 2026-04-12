/* ═══ js/screens/downloads.js ═══
   Downloads screen
   - Workbooks (Greek & English)
   - PDF downloads
   ═══════════════════════════════════════════════════════════════ */

function buildDownloadsScreen() {
  const isGreek = LANG === 'el';
  const screenEl = document.getElementById('screen-downloads');
  
  if (!screenEl) return;

  const html = `
    <div class="scroll-area">
      <div style="padding: 20px;">
        
        <h2 style="font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 20px;">
          ${isGreek ? '📖 Βιβλία & Αρχεία' : '📖 Books & Files'}
        </h2>

        <!-- Greek Workbook -->
        <div class="content-card" style="cursor: default; margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: var(--teal); font-weight: 700;">
            📘 ${isGreek ? 'Εργοτετράδιο Ελληνικά' : 'Greek Workbook'}
          </h3>
          <p style="font-size: 12px; color: var(--text-soft); margin-bottom: 12px; line-height: 1.6;">
            ${isGreek 
              ? 'Ολοκληρωμένο εργοτετράδιο με ασκήσεις και σημειώσεις.' 
              : 'Complete workbook with exercises and notes.'}
          </p>
          <a href="workbook_el.pdf" download="workbook_el.pdf" 
             style="
               display: inline-block;
               padding: 10px 18px;
               background: var(--teal);
               color: white;
               border-radius: 8px;
               text-decoration: none;
               font-weight: 700;
               font-size: 12px;
               transition: all 0.2s;
               border: none;
               cursor: pointer;
             "
             onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-2px)';"
             onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)';">
            ⬇️ ${isGreek ? 'Κατέβασε' : 'Download'} PDF
          </a>
        </div>

        <!-- English Workbook -->
        <div class="content-card" style="cursor: default; margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 14px; color: var(--teal); font-weight: 700;">
            📗 ${isGreek ? 'Εργοτετράδιο English' : 'English Workbook'}
          </h3>
          <p style="font-size: 12px; color: var(--text-soft); margin-bottom: 12px; line-height: 1.6;">
            ${isGreek 
              ? 'Πλήρες εργοτετράδιο με ασκήσεις και σημειώσεις στα αγγλικά.' 
              : 'Complete workbook with exercises and notes in English.'}
          </p>
          <a href="workbook_en.pdf" download="workbook_en.pdf"
             style="
               display: inline-block;
               padding: 10px 18px;
               background: var(--teal);
               color: white;
               border-radius: 8px;
               text-decoration: none;
               font-weight: 700;
               font-size: 12px;
               transition: all 0.2s;
               border: none;
               cursor: pointer;
             "
             onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-2px)';"
             onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)';">
            ⬇️ ${isGreek ? 'Κατέβασε' : 'Download'} PDF
          </a>
        </div>

        <!-- Info -->
        <div class="content-card" style="background: rgba(42, 93, 94, 0.05); cursor: default; margin-top: 20px;">
          <h3 style="margin: 0 0 8px; font-size: 13px; color: var(--text); font-weight: 700;">
            💡 ${isGreek ? 'Συμβουλή' : 'Tip'}
          </h3>
          <p style="font-size: 11px; color: var(--text-soft); margin: 0; line-height: 1.6;">
            ${isGreek 
              ? 'Κατεβάστε τα εργοτετράδια για να κάνετε σημειώσεις κατά τη διάρκεια της πρακτικής σας.' 
              : 'Download the workbooks to make notes during your practice.'}
          </p>
        </div>

        <div class="spacer-bottom"></div>

      </div>
    </div>
  `;

  screenEl.innerHTML = html;
}

// Auto-build on load
document.addEventListener('DOMContentLoaded', () => {
  buildDownloadsScreen();
});
