const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat, PageBreak, HeadingLevel } = require('docx');
const { S, QA, GLOSSARY, P, secs, fmt } = require('./data.js');

const INK = '14213D', TEAL = '0FA3B1', GREY = '5B6C8F', BODY = '3A3F51', ZEBRA = 'EEF3F8';
const W = 9360;
const run = (t, o = {}) => new TextRun(Object.assign({ text: t }, o));
// split text: [stage directions] in italics (but not [Presenter N] / [group name] placeholders)
function richRuns(text) {
  const out = []; const re = /\[([^\]]+)\]/g; let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(run(text.slice(last, m.index)));
    const inner = m[1];
    if (/^Presenter \d$|^group name$/.test(inner)) out.push(run(m[0]));
    else out.push(run(m[0], { italics: true, color: GREY }));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(run(text.slice(last)));
  return out;
}
const boldRuns = (t) => t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s => s.startsWith('**') ? run(s.slice(2, -2), { bold: true }) : run(s));
const cell = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
  shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined, children });
const tp = (runs, o = {}) => new Paragraph(Object.assign({ children: runs }, o));
const thin = { style: BorderStyle.SINGLE, size: 4, color: 'D5DDEC' };
const borders = { top: thin, bottom: thin, left: thin, right: thin };
function table(widths, header, rows, o = {}) {
  const mk = (cells, isHead, zebra) => new TableRow({ tableHeader: isHead, cantSplit: true, children: cells.map((c, i) =>
    cell([tp(Array.isArray(c) ? c : [run(c, { bold: isHead, color: isHead ? 'FFFFFF' : undefined, size: 20 })])], widths[i], { fill: isHead ? INK : (zebra ? ZEBRA : undefined) })) });
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
    rows: [mk(header, true), ...rows.map((r, i) => mk(r, false, i % 2 === 1))] });
}

// ---- timing ----
const per = {}; const range = {};
S.forEach(s => { per[s[1]] = (per[s[1]] || 0) + secs(s); (range[s[1]] = range[s[1]] || []).push(s[0]); });
const total = Object.values(per).reduce((a, b) => a + b, 0);
const info = { 1: ['Python notebook', 'Opening & The Dataset'], 2: ['Python notebook', 'Cleaning, Machine Learning & Charts'], 3: ['Power BI', 'The Power BI Version & Live Demo'], 4: ['Power BI', 'Insights, Takeaways & Q&A'] };
const rg = k => `${range[k][0]}–${range[k][range[k].length - 1]}`;

const kids = [];
kids.push(new Paragraph({ style: 'Title', children: [run('ClinVar Project: Presentation Script')] }));
kids.push(tp([run(`Deck: ClinVar_Full_Presentation_DNA.pptx · 33 slides · 4 presenters · limit 15 minutes. The same script is in each slide's speaker notes.`, { color: GREY })], { spacing: { after: 160 } }));
kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run('Who presents what')] }));
kids.push(table([1500, 1500, 3060, 1200, 2100], ['Presenter', 'Side', 'Part', 'Slides', 'Time'],
  [1, 2, 3, 4].map(k => [[run(P[k], { bold: true, size: 20 })], info[k][0], info[k][1], rg(k), `about ${fmt(per[k])}`]).concat([[[run('Total', { bold: true, size: 20 })], '', '', `1–33`, [run(`about ${fmt(total)}`, { bold: true, size: 20 })]]])));
kids.push(tp([run(`Tips: replace [group name] and [Presenter 2/3/4] with real names. The times assume a calm 120 words per minute and add up to about ${fmt(total)}, including about 45 seconds of clicking in the live demo, which leaves about ${fmt(900 - total)} for questions. Hand over with the last sentence of your part. Presenter 3: open Power BI before the talk and clear all slicers.`, { italics: true, color: BODY, size: 20 })], { spacing: { before: 160, after: 160 } }));
kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run('Speaking to computer science students')] }));
kids.push(tp([run('Your audience knows data and code, not biology. Keep the biology to one sentence per idea and lead with the data and ML story: a large, messy dataset, a cleaning pipeline, a supervised model compared against a baseline. Use these analogies instead of medical detail:', { color: BODY })], { spacing: { after: 100 } }));
kids.push(table([3000, 6360], ['Term', 'Say it like this'], GLOSSARY));
kids.push(new Paragraph({ children: [new PageBreak()] }));

const names = { 1: 'Opening & The Dataset', 2: 'Cleaning, Machine Learning & Charts', 3: 'The Power BI Version & Live Demo', 4: 'Insights, Takeaways & Q&A' };
[1, 2, 3, 4].forEach(k => {
  kids.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: k > 1 && false, children: [run(`${P[k]}: ${names[k]}`)] }));
  kids.push(tp([run(`${info[k][0]} · slides ${rg(k)} · about ${fmt(per[k])}`, { color: GREY })], { spacing: { after: 120 } }));
  S.filter(s => s[1] === k).forEach(s => {
    const t = secs(s); const label = s[4] ? `(${fmt(t - s[4])} + ~${s[4]}s of clicking)` : `(${fmt(t)})`;
    kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run(`Slide ${s[0]} · ${s[2]} `), run(label, { color: TEAL, bold: false, size: 20 })] }));
    kids.push(tp(richRuns(s[3]), { spacing: { after: 80 }, keepLines: false }));
  });
  kids.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run('Questions you may get')] }));
  QA[k].forEach(([q, a]) => {
    kids.push(new Paragraph({ numbering: { reference: 'qa', level: 0 }, keepNext: true, children: [run(`Q: ${q}`, { bold: true })] }));
    kids.push(tp([run(`A: ${a}`, { color: BODY })], { indent: { left: 720 }, spacing: { after: 80 } }));
  });
  if (k < 4) kids.push(new Paragraph({ children: [new PageBreak()] }));
});

// ---- appendix ----
kids.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run('Appendix: top 10 genes in plain language (for Q&A)')] }));
const genes = [
 ['1', 'TTN', '6,134', 'Builds **titin**, a giant "spring" protein that keeps muscles, including the heart, stretchy', 'Weak, enlarged heart muscle (cardiomyopathy)'],
 ['2', 'BRCA2', '5,779', `Part of the cell's **DNA repair crew**: it fixes broken DNA before damage builds up`, 'Much higher risk of breast, ovarian and prostate cancer'],
 ['3', 'NF1', '5,740', 'A **brake** on cell growth', 'Cells grow unchecked, causing lumps on the nerves and skin spots (neurofibromatosis type 1)'],
 ['4', 'BRCA1', '4,330', 'Another member of the **DNA repair crew**, working alongside BRCA2', 'Much higher risk of breast and ovarian cancer'],
 ['5', 'ATM', '3,908', `The cell's **damage alarm**: it spots broken DNA and calls the repair crew`, 'Higher cancer risk; when both copies are broken, a rare movement and immune disorder (ataxia-telangiectasia)'],
 ['6', 'FBN1', '3,742', 'Builds **fibrillin**, the "elastic glue" that holds connective tissue together, like the walls of blood vessels', 'Marfan syndrome: very tall, long limbs, and a dangerously weak main artery (aorta)'],
 ['7', 'APC', '2,640', 'A **gatekeeper** that stops gut cells from multiplying too much', 'Hundreds of growths (polyps) in the colon and a very high risk of colon cancer'],
 ['8', 'PKD1', '2,559', 'Helps kidney cells **keep their shape**, like a structural sensor', 'Fluid-filled cysts that grow in the kidneys (polycystic kidney disease) and can lead to kidney failure'],
 ['9', 'DMD', '2,471', 'Builds **dystrophin**, a "shock absorber" that protects muscle cells when they contract', 'Muscles slowly break down (Duchenne / Becker muscular dystrophy), mostly in boys'],
 ['10', 'USH2A', '2,320', 'Builds a protein that keeps the **light-sensing cells in the eye and the hearing cells in the ear** working', 'Hearing loss from birth plus vision loss over time (Usher syndrome)'],
];
kids.push(table([500, 1000, 1200, 3400, 3260], ['#', 'Gene', 'Pathogenic variants', 'Plain-language role', 'What goes wrong when it breaks'],
  genes.map(g => [g[0], [run(g[1], { bold: true, size: 20 })], g[2], boldRuns(g[3]).map(r => r), g[4]])));

const doc = new Document({
  creator: 'ClinVar project team', title: 'ClinVar Project: Presentation Script',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', run: { font: 'Calibri', size: 40, bold: true, color: INK }, paragraph: { spacing: { before: 0, after: 120 }, keepNext: true } },
      { id: 'Heading1', name: 'heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 30, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 23, bold: true, color: INK }, paragraph: { spacing: { before: 200, after: 60 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Calibri', size: 22, bold: true, color: INK }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [{ reference: 'qa', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 360 } } } }] }] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: kids }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('../ClinVar_Full_Presentation_Script.docx', b); console.log('docx written', fmt(total)); });

// speaker notes for the deck (same text)
const notes = S.map(s => `[${P[s[1]]} · ${(() => { const t = secs(s); return s[4] ? fmt(t - s[4]) + ' + ~' + s[4] + 's' : fmt(t); })()}]\n${s[3]}`);
fs.writeFileSync('../notes33.json', JSON.stringify(notes));
