const pptxgen = require('pptxgenjs');
const SKILL = '/root/.claude/skills/synced/8c24175c-62ad-47a4-ba77-2175656d9d7d_6991401d-8424-4649-a841-67daf3226585/pptx';
const { applyTheme } = require(SKILL + '/scripts/apply_theme.js');
const notes = require('./notes.json');
const MEDIA = '../orig/x/ppt/media/';
const SIZES = require('./chartsizes.json');
const ROC = require('./roc.json'), IMP = require('./imp.json'), HIST = require('./hist.json');
notes[15] = notes[15].replace('Now [Presenter 3] will show the Power BI version.', 'Before we leave the notebook, here are all eight charts we made.');
notes[14] = 'Here are the results on the 40 thousand variants the models never saw. The baseline gets 79 percent accuracy but finds no harmful variants, so we compare AUC and recall instead. The random forest wins: AUC 0.81 against 0.78, and it is ahead in every other score too.';

const THEME = { name: 'ClinVar DNA', headFontFace: 'Montserrat', bodyFontFace: 'Montserrat',
  colors: { dk1:'0A1F44', lt1:'FFFFFF', dk2:'0A2A8A', lt2:'DCEBFF',
    accent1:'1E4FFF', accent2:'00A6D6', accent3:'12B873', accent4:'A8E63D', accent5:'0A2A8A', accent6:'5B6B88',
    hlink:'1E4FFF', folHlink:'7B4DFF' } };
// hex copies for chart options (charts need hex)
const H = { blue:'1E4FFF', cyan:'00A6D6', green:'12B873', lime:'A8E63D', navy:'0A2A8A', mute:'5B6B88', grey:'CBD5E6', grid:'E3E9F4' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';           // 10 x 5.625 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'ClinVar: What 9 Million Genetic Records Tell Us';
const C = pres.SchemeColor, S = pres.ShapeType;
const INK = C.text1, MUTE = C.accent6, WHITE = C.background1;
const BLUE = C.accent1, CYAN = C.accent2, GREEN = C.accent3, LIME = C.accent4, NAVY = C.accent5;

// ---------- layouts ----------
pres.defineSlideMaster({ title: 'COVER', background: { path: 'bg_cover.png' } });
for (const k of [1, 2, 3, 4]) pres.defineSlideMaster({ title: 'DIV' + k, background: { path: `bg_div${k}.png` } });
pres.defineSlideMaster({ title: 'WHITE', background: { path: 'bg_white.png' } });
pres.defineSlideMaster({ title: 'BLUE_A', background: { path: 'bg_blueA.png' } });
pres.defineSlideMaster({ title: 'BLUE_B', background: { path: 'bg_blueB.png' } });

// ---------- helpers ----------
let n = 0, origN = 0, curDark = false;
function newSlide(master, section, note) {
  const s = pres.addSlide({ masterName: master, sectionTitle: section });
  s.addNotes(note != null ? note : (notes[origN++] || '')); n++;
  curDark = master.startsWith('BLUE') || master.startsWith('DIV');
  if (master === 'WHITE' || master.startsWith('BLUE'))
    s.addText(String(n), { isTextBox: true, x: 9.0, y: 5.2, w: 0.45, h: 0.25, fontSize: 10, color: curDark ? WHITE : MUTE, align: 'right', margin: 0, objectName: 'Slide number' });
  return s;
}
const title = (s, text) => s.addText(text, { isTextBox: true, x: 0.55, y: 0.8, w: 8.6, h: 0.95, fontSize: 24, bold: true, color: curDark ? WHITE : INK,
  align: 'left', valign: 'top', margin: 0, objectName: 'Title' });
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, color: INK, fontSize: 12, valign: 'top' }, o));
function tag(s, text, dark) {                        // outlined label, square corners
  const w = 0.4 + text.length * 0.098;
  s.addText(text, { isTextBox: true, x: 0.55, y: 0.42, w, h: 0.27, fontSize: 8, bold: true, charSpacing: 2.5, align: 'center', valign: 'middle',
    margin: 0, color: dark ? WHITE : BLUE, line: { color: dark ? WHITE : BLUE, width: 1.25 }, objectName: 'Section tag' });
}
function circleNum(s, x, y, d, label, color, size = 16) {
  s.addText(String(label), { x, y, w: d, h: d, shape: S.ellipse, line: { color, width: 2 }, align: 'center', valign: 'middle',
    margin: 0, fontSize: size, bold: true, color, objectName: 'Number ' + label });
}
function hexLetter(s, x, y, letter) {
  s.addText(letter, { x, y, w: 0.85, h: 0.74, shape: S.hexagon, line: { color: BLUE, width: 2 }, align: 'center', valign: 'middle',
    margin: 0, fontSize: 22, bold: true, color: BLUE, objectName: 'Hexagon ' + letter });
}
function box(s, x, y, w, h, color, width = 1.5) {
  s.addShape(S.rect, { x, y, w, h, fill: { type: 'none' }, line: { color, width } });
}
function stat(s, x, y, w, val, label, color, size = 30) {
  T(s, val, { x, y, w, h: size / 60 + 0.1, fontSize: size, bold: true, color, valign: 'middle' });
  T(s, label, { x, y: y + size / 60 + 0.12, w, h: 0.6, fontSize: 11, color: MUTE });
}
function bullets(s, items, o) {
  const runs = items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } }));
  T(s, runs, o);
}
const chartBase = { catAxisLabelFontFace: '+mn-lt', valAxisLabelFontFace: '+mn-lt', legendFontFace: '+mn-lt', dataLabelFontFace: '+mn-lt',
  titleFontFace: '+mn-lt', catAxisLabelColor: H.mute, valAxisLabelColor: H.mute, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10,
  legendFontSize: 10, legendColor: H.mute, dataLabelFontSize: 10, dataLabelColor: '0A1F44', valGridLine: { color: H.grid, size: 0.75 },
  catGridLine: { style: 'none' }, valAxisLineShow: false };
const chart = (s, type, data, o) => s.addChart(type, data, Object.assign({}, chartBase, o));
const img = (s, file, x, y, w, ratio) => s.addImage({ path: MEDIA + file, x, y, w, h: w / ratio, altText: 'Code and its output from the notebook' });

// ================= 1 COVER =================
pres.addSection({ title: 'Introduction' });
let s = newSlide('COVER', 'Introduction');
s.addText('ClinVar', { x: 0.55, y: 1.0, w: 3.5, h: 1.0, shape: S.rect, line: { color: BLUE, width: 3 }, align: 'center', valign: 'middle',
  margin: 0, fontSize: 40, bold: true, color: BLUE, objectName: 'Title' });
T(s, 'What 9 Million Genetic Records Tell Us', { x: 0.55, y: 2.25, w: 4.1, h: 1.1, fontSize: 22, bold: true });
T(s, 'From raw dataset to cleaning to insights', { x: 0.55, y: 3.45, w: 4.1, h: 0.3, fontSize: 11, color: MUTE });
s.addText('PTF10 · INTRO TO DATA SCIENCE · FINAL PROJECT', { isTextBox: true, x: 0.55, y: 4.05, w: 4.3, h: 0.3, fontSize: 7.5, bold: true,
  charSpacing: 1.5, align: 'center', valign: 'middle', margin: 0, color: BLUE, line: { color: BLUE, width: 1.25 } });

// ================= 2 AGENDA (blue) =================
s = newSlide('BLUE_A', 'Introduction');
tag(s, 'OVERVIEW', true); title(s, 'Our project in four parts');
[['The Dataset', 'What ClinVar is, key terms, the columns we kept'], ['Python Notebook', 'Cleaning with pandas, then comparing four machine-learning models'],
 ['Power BI', 'The same cleaning in Power Query, one interactive dashboard'], ['Insights', 'What the data shows, and what it means']].forEach(([h, d], i) => {
  const x = 0.55 + i * 2.28;
  circleNum(s, x, 2.0, 0.7, i + 1, WHITE, 20);
  T(s, h, { x, y: 2.95, w: 2.05, h: 0.6, fontSize: 14, bold: true, color: WHITE });
  T(s, d, { x, y: 3.6, w: 2.0, h: 1.0, fontSize: 11, color: WHITE });
});

// ================= 3 DIVIDER 1 =================
function divider(k, part, title, sub, section) {
  const d = newSlide('DIV' + k, section);
  d.addText(part, { isTextBox: true, x: 0.55, y: 1.7, w: 1.1, h: 0.27, fontSize: 8, bold: true, charSpacing: 2.5, align: 'center', valign: 'middle',
    margin: 0, color: WHITE, line: { color: WHITE, width: 1.25 } });
  T(d, title, { x: 0.55, y: 2.15, w: 5.6, h: 1.4, fontSize: 38, bold: true, color: WHITE, charSpacing: -0.5 });
  T(d, sub, { x: 0.55, y: 3.65, w: 4.6, h: 0.8, fontSize: 14, color: WHITE });
  return d;
}
pres.addSection({ title: 'Part 1 · The Dataset' });
divider(1, 'PART 1', 'THE DATASET', 'What ClinVar is and what is inside it', 'Part 1 · The Dataset');

// ================= 4 TERMS =================
s = newSlide('WHITE', 'Part 1 · The Dataset');
tag(s, 'THE DATASET'); title(s, 'Four terms you need first');
[['D', 'DNA', 'The instruction manual in every cell, written in 4 letters: A, C, G, T.'], ['G', 'Gene', 'One section of DNA that tells the body how to make one part.'],
 ['V', 'Variant', 'A change in the DNA letters, like a typo in a book. Some are harmless, some cause disease.'], ['B', 'Genome build', 'A standard “map” of human DNA. GRCh37 is the old map, GRCh38 the new one.']].forEach(([l, h, d], i) => {
  const x = i % 2 ? 5.15 : 0.55, y = i < 2 ? 2.0 : 3.65;
  hexLetter(s, x, y, l);
  T(s, h, { x: x + 1.1, y, w: 3.4, h: 0.35, fontSize: 15, bold: true });
  T(s, d, { x: x + 1.1, y: y + 0.4, w: 3.4, h: 0.95, fontSize: 11.5 });
});

// ================= 5 ARCHIVE =================
s = newSlide('WHITE', 'Part 1 · The Dataset');
tag(s, 'THE DATASET'); title(s, 'ClinVar: the world’s public variant archive');
bullets(s, ['Run by NCBI, part of the U.S. National Institutes of Health', 'Labs and experts share what each variant does to health',
  'Free download: variant_summary.txt.gz (tab-separated)', 'We used the November 2026 release'], { x: 0.55, y: 2.0, w: 4.5, h: 2.9, fontSize: 12.5 });
[['9.35M', 'rows in the raw file', BLUE], ['43', 'columns', CYAN], ['440 MB', 'compressed file size', GREEN], ['30K+', 'genes covered', NAVY]].forEach(([v, l, c], i) => {
  const x = 5.4 + (i % 2) * 2.1, y = 2.0 + Math.floor(i / 2) * 1.5;
  box(s, x, y, 1.9, 1.3, c, 2);
  T(s, v, { x, y: y + 0.2, w: 1.9, h: 0.5, fontSize: 24, bold: true, color: c, align: 'center', valign: 'middle' });
  T(s, l, { x: x + 0.1, y: y + 0.8, w: 1.7, h: 0.4, fontSize: 10, color: MUTE, align: 'center' });
});

// ================= 6 LABELS =================
s = newSlide('WHITE', 'Part 1 · The Dataset');
tag(s, 'THE DATASET'); title(s, 'How ClinVar labels a variant');
T(s, 'Clinical significance: the experts’ verdict', { x: 0.55, y: 1.85, w: 8, h: 0.3, fontSize: 11, bold: true, color: MUTE });
[['P / LP', 'Pathogenic · causes disease', BLUE, BLUE], ['VUS', 'Uncertain · not enough evidence', CYAN, CYAN], ['B / LB', 'Benign · harmless', GREEN, GREEN],
 ['Conflicting', 'Labs disagree · different verdicts', LIME, INK]].forEach(([t, d, line, txt], i) => {
  const x = 0.55 + i * 2.25;
  s.addText(t, { x, y: 2.25, w: 2.05, h: 0.55, shape: S.rect, line: { color: line, width: 2.5 }, align: 'center', valign: 'middle', margin: 0, fontSize: 14, bold: true, color: txt });
  T(s, d, { x, y: 2.88, w: 2.05, h: 0.5, fontSize: 9.5, color: MUTE, align: 'center' });
});
T(s, 'Review status: how much to trust the label (0–4 stars)', { x: 0.55, y: 3.6, w: 8, h: 0.3, fontSize: 11, bold: true, color: MUTE });
[['0', 'No evidence', MUTE], ['1', 'One lab', CYAN], ['2', 'Labs agree', GREEN], ['3', 'Expert panel', BLUE], ['4', 'Guideline', NAVY]].forEach(([v, l, c], i) => {
  const x = 0.55 + i * 1.8;
  circleNum(s, x + 0.45, 4.0, 0.5, v, c, 15);
  T(s, l, { x, y: 4.58, w: 1.4, h: 0.3, fontSize: 9.5, color: MUTE, align: 'center' });
});

// ================= 7 COLUMNS TABLE =================
function table(s, rows, colW, y, fs) {
  const b = [{ type: 'none' }, { type: 'none' }, { pt: 0.75, color: 'D5DDEC' }, { type: 'none' }];
  const data = rows.map((r, ri) => r.map(c => ({ text: c, options: { bold: ri === 0, color: ri === 0 ? BLUE : INK, fontSize: fs, border: ri === 0 ? [{ type: 'none' }, { type: 'none' }, { pt: 1.5, color: '0A1F44' }, { type: 'none' }] : b, valign: 'middle', margin: [0.03, 0.08, 0.03, 0.08] } })));
  s.addTable(data, { x: 0.55, y, w: colW.reduce((a, b2) => a + b2, 0), colW, rowH: 0.3 });
}
s = newSlide('WHITE', 'Part 1 · The Dataset');
tag(s, 'THE DATASET'); title(s, 'The 11 columns we used (of 43)');
table(s, [['Column', 'What it holds', 'Example'], ['VariationID', 'Unique ID of the variant', '12375'], ['GeneSymbol', 'Gene the variant is in', 'BRCA1'],
  ['Type', 'Kind of DNA change', 'single nucleotide variant'], ['ClinicalSignificance', 'The label', 'Likely pathogenic'], ['ReviewStatus', 'How it was reviewed', 'reviewed by expert panel'],
  ['NumberSubmitters', 'How many labs reported it', '3'], ['PhenotypeList', 'Linked condition(s)', 'Familial cancer of breast'],
  ['Assembly / Chromosome / Start / Stop', 'Where it is on the DNA map', 'GRCh38 / 17 / 43045712'], ['LastEvaluated', 'Date of the latest review', 'Mar 05, 2019']], [3.3, 2.8, 2.8], 1.85, 10);

// ================= 8 QUESTIONS (blue) =================
s = newSlide('BLUE_B', 'Part 1 · The Dataset');
tag(s, 'OVERVIEW', true); title(s, 'Our questions, and what we don’t do');
['How much do we actually know about variants?', 'How much can we trust the labels?', 'Where do experts disagree?', 'Which genes and changes matter most?'].forEach((q, i) => {
  const y = 1.95 + i * 0.8;
  circleNum(s, 0.55, y, 0.5, i + 1, WHITE, 14);
  T(s, q, { x: 1.3, y, w: 4.5, h: 0.5, fontSize: 13, color: WHITE, valign: 'middle' });
});
box(s, 6.2, 1.95, 3.25, 2.8, WHITE, 1.75);
T(s, 'We study the data, we don’t diagnose', { x: 6.45, y: 2.15, w: 2.8, h: 0.8, fontSize: 14, bold: true, color: WHITE });
T(s, 'No patients, no medical advice. Doctors decide what a variant means; we check how well that knowledge is recorded.', { x: 6.45, y: 3.05, w: 2.8, h: 1.5, fontSize: 11, color: WHITE });

// ================= 9 DIVIDER 2 =================
pres.addSection({ title: 'Part 2 · Data Cleaning' });
divider(2, 'PART 2', 'DATA CLEANING', 'Turning 9.35 million messy rows into data we can trust', 'Part 2 · Data Cleaning');

// ================= 10 LOADING =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'DATA CLEANING'); title(s, 'Loading a file too big to open');
[['Download', 'wget from NCBI into Colab'], ['Peek', 'Read 5 rows: 43 columns'], ['Read in chunks', '500,000 rows at a time; peak memory 3.7 of 12 GB'], ['Filter', 'Keep only the newer map (GRCh38)']].forEach(([h, d], i) => {
  const x = 0.55 + i * 2.28;
  circleNum(s, x, 1.85, 0.45, i + 1, [BLUE, CYAN, GREEN, NAVY][i], 14);
  T(s, h, { x: x + 0.6, y: 1.85, w: 1.55, h: 0.45, fontSize: 12, bold: true, valign: 'middle' });
  T(s, d, { x: x, y: 2.42, w: 2.05, h: 0.6, fontSize: 10, color: MUTE });
});
img(s, 'image-10-1.png', 0.55, 3.15, 7.6, 990 / 253);

// ================= 11 CHEAP HALF =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'DATA CLEANING'); title(s, 'Cleaning cut the data in half');
chart(s, pres.charts.BAR, [{ name: 'Rows', labels: ['Has a germline label', 'After removing duplicates', 'Keep GRCh38 only', 'Rows in the file'], values: [4391047, 4641203, 4643623, 9354555] }],
  { x: 0.55, y: 1.75, w: 5.6, h: 2.15, barDir: 'bar', chartColors: [H.blue], showValue: true, dataLabelFormatCode: '#,##0', dataLabelPosition: 'outEnd', showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, barGapWidthPct: 45, showTitle: true, title: 'Rows after each step', titleFontSize: 11, titleColor: H.mute });
bullets(s, ['Every variant appeared twice: once per DNA map', '2,420 more exact duplicates removed', '250K tumor-only records have no germline label'], { x: 6.5, y: 1.95, w: 2.95, h: 1.9, fontSize: 11 });
img(s, 'image-11-1.png', 0.55, 4.05, 7.8, 902 / 135);

// ================= 12 MISSING =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'DATA CLEANING'); title(s, 'Missing data hides behind codes');
chart(s, pres.charts.BAR, [{ name: '% missing', labels: ['Gene', 'Review status', 'Label', 'Review date', 'Condition'], values: [0.0, 5.2, 5.4, 6.0, 45.0] }],
  { x: 0.55, y: 1.75, w: 5.4, h: 2.1, barDir: 'bar', chartColors: [H.blue], showValue: true, dataLabelFormatCode: '0.0"%"', dataLabelPosition: 'outEnd', showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, barGapWidthPct: 45, valAxisMaxVal: 55, showTitle: true, title: '% of rows missing after replacing the codes', titleFontSize: 11, titleColor: H.mute });
bullets(s, ['pandas found 0 missing values, but 2.86 million cells held codes like “-” or “not provided”', 'Replaced them with real empty values (NaN) and kept the rows'], { x: 6.3, y: 1.95, w: 3.15, h: 1.9, fontSize: 11 });
img(s, 'image-12-1.png', 0.55, 4.0, 7.4, 890 / 158);

// ================= 13 LABEL SPELLINGS =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'DATA CLEANING'); title(s, '104 label spellings, grouped into 5');
chart(s, pres.charts.BAR, [{ name: 'Spellings', labels: ['P/LP', 'VUS', 'B/LB', 'Conflicting', 'Other'], values: [35, 15, 22, 11, 21] }],
  { x: 0.55, y: 1.75, w: 4.7, h: 3.2, barDir: 'col', chartColors: [H.blue, H.cyan, H.green, H.lime, H.grey], showValue: true, dataLabelPosition: 'outEnd', showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, barGapWidthPct: 40, showTitle: true, title: 'Different spellings per group', titleFontSize: 11, titleColor: H.mute });
img(s, 'image-13-1.png', 5.55, 1.8, 3.9, 470 / 134);
T(s, 'These all become one group (P/LP):', { x: 5.55, y: 3.35, w: 3.9, h: 0.3, fontSize: 11, bold: true });
bullets(s, ['“Pathogenic”', '“Pathogenic/Likely pathogenic”', '“Pathogenic, low penetrance”'], { x: 5.55, y: 3.7, w: 3.9, h: 0.95, fontSize: 10.5 });
T(s, 'Review-status text became a 0–4 star score the same way.', { x: 5.55, y: 4.7, w: 3.9, h: 0.4, fontSize: 9.5, italic: true, color: MUTE });

// ================= 14 OUTLIERS (blue) =================
s = newSlide('BLUE_A', 'Part 2 · Data Cleaning');
tag(s, 'DATA CLEANING', true); title(s, 'Outliers and data types');
[['Fake dates', '111 review dates before 1990 (oldest: 1965). ClinVar began in 2013.', 'Set to missing', LIME],
 ['Many submitters', 'The IQR rule flags 22.5% of rows, but popular variants really do get many labs.', 'Kept: real data', LIME],
 ['Huge variants', 'A few span up to 159 million DNA letters and squash the charts.', 'Top 0.1% left out of length chart', LIME]].forEach(([h, d, dec], i) => {
  const x = 0.55 + i * 3.05;
  s.addText(String(i + 1), { x, y: 1.95, w: 0.7, h: 0.62, shape: S.hexagon, line: { color: WHITE, width: 2 }, align: 'center', valign: 'middle', margin: 0, fontSize: 16, bold: true, color: WHITE });
  T(s, h, { x, y: 2.75, w: 2.8, h: 0.35, fontSize: 14, bold: true, color: WHITE });
  T(s, d, { x, y: 3.15, w: 2.75, h: 0.95, fontSize: 10.5, color: WHITE });
  s.addText(dec, { x, y: 4.15, w: 2.75, h: 0.4, shape: S.rect, line: { color: LIME, width: 1.75 }, align: 'center', valign: 'middle', margin: 0.05, fontSize: 9.5, bold: true, color: LIME });
});
T(s, 'Data types: all text at load → numbers (positions, submitters), real dates (review date), categories (type, label) to save memory.', { x: 0.55, y: 4.75, w: 8.3, h: 0.45, fontSize: 10, color: WHITE });

// ================= NEW A: ML PROCESS =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning', '[Presenter 2 · 0:40]\nNow the machine learning. The question: can the recorded facts about a variant tell a pathogenic one from a benign one? Here is exactly how we ran it. One: we kept only variants labeled pathogenic or benign, because for uncertain ones the true answer is unknown. Two: a 200 thousand variant sample with the same 21 percent pathogenic share. Three: each variant becomes 38 numbers, such as its type, length, number of labs and stars. Four: 160 thousand variants to train, 40 thousand kept hidden. Five: three models get the same data, a baseline that always says benign, logistic regression and a random forest. Six: five-fold cross-validation inside the training set. Seven: one final exam on the hidden 40 thousand. Eight: the winner scores the uncertain variants. The rules: same inputs, same split, a baseline to beat, and no input that already contains the answer.');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'Machine learning: how we trained and tested the models');
const steps = [
  ['Pick the answer', 'Keep variants labeled pathogenic (1) or benign (0). Uncertain ones are left out: their true answer is unknown.'],
  ['Take a sample', '200,000 variants, with the same 21% pathogenic share as the full data.'],
  ['Build the inputs', '38 numbers per variant: type, chromosome, length, labs, stars and year.'],
  ['Split the data', '160,000 to train. 40,000 stay hidden for the final test.'],
  ['Choose the models', 'Baseline (always benign), Logistic Regression and Random Forest, on the same data.'],
  ['Cross-check', '5-fold cross-validation on the training data: a score and its spread for each model.'],
  ['Final exam', 'Fit on all training data, then score once on the 40,000 unseen variants.'],
  ['Apply', 'The winner scores the 2.4M uncertain (VUS) variants.']];
steps.forEach(([h, d], i) => {
  const x = 0.55 + (i % 4) * 2.28, y = i < 4 ? 1.85 : 3.3;
  circleNum(s, x, y, 0.42, i + 1, [BLUE, CYAN, GREEN, NAVY][i % 4], 13);
  T(s, h, { x: x + 0.55, y, w: 1.6, h: 0.42, fontSize: 11, bold: true, valign: 'middle' });
  T(s, d, { x, y: y + 0.55, w: 2.1, h: 0.85, fontSize: 9.5, color: MUTE });
});
box(s, 0.55, 4.75, 8.9, 0.4, BLUE, 1.5);
T(s, 'Fair-test rules: same inputs · same split · a baseline to beat · no input that already contains the answer', { x: 0.7, y: 4.75, w: 8.6, h: 0.4, fontSize: 10, bold: true, color: BLUE, valign: 'middle' });

// ================= 15 ML CLASSIFICATION =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'Machine learning: which model spots harmful variants?');
chart(s, pres.charts.BAR, [
  { name: 'Baseline (always benign)', labels: ['ROC-AUC', 'Accuracy', 'Recall (pathogenic)', 'F1 (pathogenic)'], values: [0.5, 0.791, 0, 0] },
  { name: 'Logistic Regression', labels: ['ROC-AUC', 'Accuracy', 'Recall (pathogenic)', 'F1 (pathogenic)'], values: [0.779, 0.828, 0.561, 0.577] },
  { name: 'Random Forest', labels: ['ROC-AUC', 'Accuracy', 'Recall (pathogenic)', 'F1 (pathogenic)'], values: [0.812, 0.847, 0.598, 0.62] }],
  { x: 0.55, y: 1.8, w: 5.8, h: 3.3, barDir: 'col', chartColors: [H.grey, H.blue, H.green], showValue: true, dataLabelFormatCode: '0.00', dataLabelPosition: 'outEnd', dataLabelFontSize: 8,
    showLegend: true, legendPos: 'b', valAxisMaxVal: 1, valAxisMinVal: 0, valAxisLabelFormatCode: '0.0', barGapWidthPct: 40, showTitle: true, title: 'Test-set scores (40,000 unseen variants)', titleFontSize: 11, titleColor: H.mute });
T(s, 'Winner', { x: 6.7, y: 1.9, w: 2.7, h: 0.25, fontSize: 10, bold: true, color: MUTE });
T(s, 'Random Forest', { x: 6.7, y: 2.15, w: 2.8, h: 0.45, fontSize: 20, bold: true, color: GREEN });
T(s, 'AUC 0.812 vs. 0.779 for logistic regression; better in cross-validation too.', { x: 6.7, y: 2.65, w: 2.75, h: 0.7, fontSize: 10, color: MUTE });
stat(s, 6.7, 3.5, 2.75, '60,497', 'uncertain variants (2.5%) score ≥ 0.8: candidates for expert review, not a diagnosis.', BLUE, 28);

// ================= NEW B: WHY RANDOM FOREST WINS =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning', '[Presenter 2 · 0:35]\nWhy does the random forest win? On the left, the ROC curve: the closer a line gets to the top-left corner, the better, and the forest stays above logistic regression all the way, AUC 0.81 against 0.78. In the middle, what that means on the 40 thousand hidden variants: the forest finds 4,982 of the 8,362 pathogenic ones, about 60 percent, with 2,709 false alarms. Logistic regression finds 4,687. On the right, what the forest relies on: first the type of DNA change, then its length and the year of review. Single-letter changes point to benign, deletions to pathogenic, the same pattern as in our charts.');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'Machine learning: why the random forest wins');
chart(s, pres.charts.SCATTER, [
  { name: 'False positive rate', values: ROC.x },
  { name: 'Random Forest (AUC 0.812)', values: ROC.rf },
  { name: 'Logistic Regression (AUC 0.779)', values: ROC.lr },
  { name: 'Random guess', values: ROC.x }],
  { x: 0.45, y: 1.8, w: 3.45, h: 2.7, chartColors: [H.green, H.blue, H.grey], lineSize: 2.5, lineDataSymbol: 'none',
    showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 1, catAxisMinVal: 0, catAxisMaxVal: 1, valAxisLabelFormatCode: '0.0', catAxisLabelFormatCode: '0.0',
    showCatAxisTitle: true, catAxisTitle: 'False positive rate', showValAxisTitle: true, valAxisTitle: 'True positive rate', catAxisTitleFontSize: 9, valAxisTitleFontSize: 9,
    catAxisTitleColor: H.mute, valAxisTitleColor: H.mute, catAxisTitleFontFace: '+mn-lt', valAxisTitleFontFace: '+mn-lt',
    showTitle: true, title: 'ROC curve (test set)', titleFontSize: 10, titleColor: H.mute, catGridLine: { color: H.grid, size: 0.75 } });
T(s, 'Green: Random Forest (AUC 0.812) · Blue: Logistic Regression (AUC 0.779) · Grey: random guess', { x: 0.55, y: 4.5, w: 3.3, h: 0.4, fontSize: 8, color: MUTE });
T(s, 'Random Forest · confusion matrix', { x: 4.15, y: 1.85, w: 2.5, h: 0.25, fontSize: 10, bold: true, color: MUTE });
T(s, 'Predicted benign', { x: 4.95, y: 2.2, w: 0.8, h: 0.35, fontSize: 8, color: MUTE, align: 'center' });
T(s, 'Predicted pathogenic', { x: 5.8, y: 2.2, w: 0.8, h: 0.35, fontSize: 8, color: MUTE, align: 'center' });
[['True benign', 28929, 2709], ['True pathogenic', 3380, 4982]].forEach(([lab, a, b], r) => {
  const y = 2.6 + r * 0.9;
  T(s, lab, { x: 4.15, y, w: 0.75, h: 0.8, fontSize: 8, color: MUTE, align: 'right', valign: 'middle' });
  [a, b].forEach((v, c) => {
    const good = r === c;
    s.addText(v.toLocaleString('en-US'), { x: 4.95 + c * 0.85, y, w: 0.8, h: 0.8, shape: S.rect, line: { color: good ? GREEN : MUTE, width: good ? 2.5 : 1 },
      align: 'center', valign: 'middle', margin: 0, fontSize: 11, bold: true, color: good ? GREEN : MUTE });
  });
});
T(s, 'Finds 4,982 of 8,362 pathogenic variants (60%). Logistic Regression finds 4,687 (56%).', { x: 4.15, y: 4.45, w: 2.5, h: 0.6, fontSize: 9, color: MUTE });
const impNames = ['Single-letter change', 'Deletion', 'Length (log)', 'Year of review', 'Number of labs', 'Duplication', 'Review stars', 'Chromosome X', 'Indel', 'Microsatellite'];
chart(s, pres.charts.BAR, [{ name: 'Importance', labels: impNames.slice().reverse(), values: IMP.slice().reverse() }],
  { x: 6.75, y: 1.8, w: 2.8, h: 3.0, barDir: 'bar', chartColors: [H.cyan], showValue: true, dataLabelFormatCode: '0.00', dataLabelPosition: 'outEnd', dataLabelFontSize: 8, showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, valAxisMaxVal: 0.47, barGapWidthPct: 35, catAxisLabelFontSize: 8, showTitle: true, title: 'Inputs the forest relies on most', titleFontSize: 10, titleColor: H.mute });
T(s, 'Both models learn the same story: the type and length of the DNA change matter most.', { x: 0.55, y: 4.9, w: 8.4, h: 0.25, fontSize: 9.5, italic: true, color: MUTE });

// ================= NEW C: SCORING VUS + LIMITS =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning', '[Presenter 2 · 0:35]\nLast step of the classification: we ask the forest how much each uncertain variant looks like the pathogenic ones it learned from. Most score around 0.3, because they are single-letter changes that look like neither group. About 60 thousand, 2.5 percent, score 0.8 or higher: they look like known pathogenic variants and would be sensible candidates for expert review first. The limits: the model still misses about 40 percent of pathogenic variants, 3,380 in the test set, and our inputs describe what kind of change it is, not what it does to the protein. So this is a way to prioritise, not a diagnosis. Now the second comparison: predicting disagreement per gene.');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'Machine learning: scoring the uncertain variants');
const nb = 33, hv = new Array(nb).fill(0), hl = [];
for (let i = 0; i < nb; i++) hl.push((0.229 + i * 0.0215).toFixed(2));
HIST.forEach(([c, k]) => { hv[Math.round((c - 0.229) / 0.0215)] = Math.round(k); });
chart(s, pres.charts.BAR, [{ name: 'VUS variants (thousands)', labels: hl, values: hv }],
  { x: 0.55, y: 1.8, w: 5.6, h: 3.3, barDir: 'col', chartColors: [H.cyan], showLegend: false, barGapWidthPct: 8, catAxisLabelFrequency: 4, valAxisLabelFormatCode: '#,##0"K"',
    showCatAxisTitle: true, catAxisTitle: 'Predicted probability of being pathogenic', showValAxisTitle: true, valAxisTitle: 'Variants (thousands)', catAxisTitleFontSize: 9, valAxisTitleFontSize: 9,
    catAxisTitleColor: H.mute, valAxisTitleColor: H.mute, catAxisTitleFontFace: '+mn-lt', valAxisTitleFontFace: '+mn-lt',
    showTitle: true, title: 'Scores for 2.4M uncertain (VUS) variants', titleFontSize: 10, titleColor: H.mute });
stat(s, 6.5, 1.85, 2.95, '≈ 60K', 'uncertain variants (2.5%) score ≥ 0.8: they look like known pathogenic ones, so expert review could start there.', BLUE, 30);
T(s, 'Limits', { x: 6.5, y: 3.4, w: 2.95, h: 0.3, fontSize: 12, bold: true, color: INK });
bullets(s, ['Still misses ~40% of pathogenic variants (3,380 of 8,362)', 'Inputs say what kind of change it is, not what it does to the protein', 'A way to prioritise, not a diagnosis'], { x: 6.5, y: 3.75, w: 2.95, h: 1.4, fontSize: 9.5 });

// ================= 16 ML REGRESSION =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'Machine learning: predicting disagreement per gene');
const regCats = ['Baseline (average)', 'Linear Regression', 'Random Forest'];
chart(s, pres.charts.BAR, [{ name: 'R²', labels: regCats, values: [0, 0.723, 0.725] }],
  { x: 0.55, y: 1.8, w: 3.05, h: 3.3, barDir: 'col', chartColors: [H.grey, H.blue, H.green], showValue: true, dataLabelFormatCode: '0.000', dataLabelPosition: 'outEnd', showLegend: false, valAxisHidden: true,
    valGridLine: { style: 'none' }, valAxisMaxVal: 0.9, barGapWidthPct: 40, catAxisLabelFontSize: 8, showTitle: true, title: 'R² (share of variation explained)', titleFontSize: 10, titleColor: H.mute });
chart(s, pres.charts.BAR, [{ name: 'MAE', labels: regCats, values: [2.159, 0.864, 0.866] }],
  { x: 3.7, y: 1.8, w: 3.05, h: 3.3, barDir: 'col', chartColors: [H.grey, H.blue, H.green], showValue: true, dataLabelFormatCode: '0.00', dataLabelPosition: 'outEnd', showLegend: false, valAxisHidden: true,
    valGridLine: { style: 'none' }, valAxisMaxVal: 2.8, barGapWidthPct: 40, catAxisLabelFontSize: 8, showTitle: true, title: 'Average error (% points)', titleFontSize: 10, titleColor: H.mute });
box(s, 7.0, 1.9, 2.45, 3.1, BLUE, 1.75);
T(s, 'A tie, so pick the simpler model', { x: 7.2, y: 2.05, w: 2.1, h: 0.7, fontSize: 11, bold: true });
stat(s, 7.2, 2.85, 2.1, '+6.6', 'points of conflict per extra lab', BLUE, 24);
stat(s, 7.2, 3.9, 2.1, '+0.6', 'points for a gene with 10× more variants', CYAN, 24);

// ================= NEW: ALL EIGHT CHARTS =================
s = newSlide('WHITE', 'Part 2 · Data Cleaning', '[Presenter 2 · 0:20]\nThese are the eight charts we built in the notebook: the label mix, the top genes, reviews per year, labs per variant, gene size against disagreement, the type of DNA change, the trust stars and the linked conditions. [Presenter 3] will now show the same project in Power BI, where we can explore these views interactively.');
tag(s, 'PYTHON NOTEBOOK'); title(s, 'The eight charts from the notebook');
const caps = ['1 · Label mix', '2 · Top pathogenic genes', '3 · Reviews per year', '4 · Labs per variant', '5 · Gene size vs. conflict', '6 · Type of DNA change', '7 · Trust stars', '8 · Linked conditions'];
caps.forEach((cap, i) => {
  const col = i % 4, row = Math.floor(i / 4), cw = 2.1, ch = 1.25;
  const x = 0.55 + col * 2.27, y = 1.8 + row * 1.7;
  const [iw, ih] = SIZES[i], r = iw / ih;
  let w = cw, h = cw / r; if (h > ch) { h = ch; w = ch * r; }
  box(s, x, y, cw, ch, C.accent6, 0.75);
  s.addImage({ path: 'fig/chart' + (i + 1) + '.png', x: x + (cw - w) / 2, y: y + (ch - h) / 2, w, h, altText: 'Notebook chart: ' + cap });
  T(s, cap, { x, y: y + ch + 0.06, w: cw, h: 0.25, fontSize: 9, bold: true, color: MUTE });
});

// ================= 17 DIVIDER 3 =================
pres.addSection({ title: 'Part 3 · Power BI' });
divider(3, 'PART 3', 'THE POWER BI VERSION', 'The same cleaning in Power Query, and one interactive dashboard', 'Part 3 · Power BI');

// ================= 18 POWER BI LOADING =================
s = newSlide('WHITE', 'Part 3 · Power BI');
tag(s, 'POWER BI'); title(s, 'Loading 4.6 million rows into Power BI');
[['Get Data', 'Folder → 21 .txt parts'], ['Parse', 'Tab-separated, QuoteStyle.None'], ['Headers', 'First row → headers, once per file'], ['Combine', 'Stack into one table'], ['Choose columns', 'Keep 12 of 43']].forEach(([h, d], i) => {
  const x = 0.55 + i * 1.8;
  circleNum(s, x, 2.1, 0.55, i + 1, [BLUE, CYAN, GREEN, NAVY, BLUE][i], 16);
  T(s, h, { x, y: 2.85, w: 1.65, h: 0.4, fontSize: 12, bold: true });
  T(s, d, { x, y: 3.3, w: 1.6, h: 0.8, fontSize: 10, color: MUTE });
});
T(s, 'Every step is recorded in Power Query’s Applied Steps, so the whole cleaning re-runs on Refresh.', { x: 0.55, y: 4.5, w: 8.2, h: 0.5, fontSize: 11, italic: true, color: MUTE });

// ================= 19 TWO TOOLS =================
s = newSlide('WHITE', 'Part 3 · Power BI');
tag(s, 'POWER BI'); title(s, 'Same cleaning, two tools');
table(s, [['Step', 'Python (pandas)', 'Power BI (Power Query + DAX)'], ['Load', 'read_csv in chunks of 500K rows', 'Get Data → Folder, 21 parts'], ['Duplicates', 'drop_duplicates(VariationID)', 'Remove Duplicates'],
  ['Missing codes', 'replace(codes, NaN)', 'One replace step, whole cells only'], ['Data types', 'to_numeric · to_datetime', 'Change Type (dates read as English, US)'],
  ['Outliers', 'Dates < 1990 · IQR · 99.9th pct', 'DatePlaceholder flag · DAX measures'], ['Label groups', 'sig_group() and stars() functions', 'Custom columns Group and Stars'],
  ['Output', '8 static charts (matplotlib)', '1 interactive dashboard + slicers']], [1.7, 3.3, 3.9], 1.9, 10.5);

// ================= 20 LIVE DEMO (blue) =================
s = newSlide('BLUE_B', 'Part 3 · Power BI');
tag(s, 'POWER BI', true); title(s, 'Live demo: the dashboard reacts');
[['Tick “P/LP”', 'Clinical significance slicer: only harmful variants remain'], ['Pick chromosome 17', 'BRCA1 climbs in the Top 10 genes chart'],
 ['Year range 2023–2025', 'KPIs and charts show recent reviews only'], ['Click the Deletion bar', 'Every other visual filters to deletions']].forEach(([h, d], i) => {
  const x = i % 2 ? 5.15 : 0.55, y = i < 2 ? 1.95 : 3.3;
  circleNum(s, x, y, 0.5, i + 1, WHITE, 14);
  T(s, h, { x: x + 0.75, y, w: 3.7, h: 0.5, fontSize: 14, bold: true, color: WHITE, valign: 'middle' });
  T(s, d, { x: x + 0.75, y: y + 0.6, w: 3.6, h: 0.6, fontSize: 11, color: WHITE });
});
T(s, 'Clear all slicers (eraser icon) before and after the demo, so the numbers match the slides.', { x: 0.55, y: 4.7, w: 8.5, h: 0.4, fontSize: 10, italic: true, color: WHITE });

// ================= 21 DIVIDER 4 =================
pres.addSection({ title: 'Part 4 · Analysis & Insights' });
divider(4, 'PART 4', 'ANALYSIS & INSIGHTS', 'What the clean data shows', 'Part 4 · Analysis & Insights');

// ================= 22 BUBBLES =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'More than half is still “we don’t know”');
T(s, '4.39M labeled variants (circle area = share)', { x: 0.55, y: 1.85, w: 6, h: 0.3, fontSize: 11, bold: true, color: MUTE });
const bub = [['54.6%', 'Uncertain (VUS)', 2.6, 0.55, CYAN, 28, CYAN], ['32.5%', 'Benign (B/LB)', 2.0, 3.35, GREEN, 22, GREEN], ['8.6%', 'Pathogenic (P/LP)', 1.05, 5.55, BLUE, 13, BLUE], ['4.2%', 'Conflicting', 0.72, 6.75, LIME, 10, INK]];
bub.forEach(([v, name, d, x, c, fs, tc]) => {
  const y = 4.65 - d;
  s.addText(v, { x, y, w: d, h: d, shape: S.ellipse, line: { color: c, width: 3 }, align: 'center', valign: 'middle', margin: 0, fontSize: fs, bold: true, color: tc, objectName: name });
  T(s, name, { x: x - 0.25, y: 4.75, w: d + 0.5, h: 0.3, fontSize: 9, color: MUTE, align: 'center' });
});
stat(s, 7.7, 2.2, 1.8, '54.6%', 'are uncertain (VUS)', CYAN, 26);
stat(s, 7.7, 3.5, 1.8, '8.6%', 'are known to cause disease', BLUE, 26);

// ================= 23 LINE =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'Unknowns are growing faster than answers');
const yrs = ['2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'];
chart(s, pres.charts.LINE, [
  { name: 'Pathogenic (P/LP)', labels: yrs, values: [1510,3568,2284,2908,9489,9351,10187,14593,13944,21878,38378,52344,66791,72708] },
  { name: 'Uncertain (VUS)', labels: yrs, values: [919,1698,1864,2631,6016,13188,59584,30542,31864,145781,266067,308476,520671,877210] },
  { name: 'Benign (B/LB)', labels: yrs, values: [1317,1072,615,4608,3728,10094,105241,61570,32051,80575,139463,225880,250475,337211] },
  { name: 'Conflicting', labels: yrs, values: [34,55,36,45,164,227,1433,655,708,1679,5076,11890,26746,74438] }],
  { x: 0.55, y: 1.75, w: 6.4, h: 3.4, chartColors: [H.blue, H.cyan, H.green, H.lime], lineSize: 3, lineDataSymbolSize: 6, showLegend: true, legendPos: 'b',
    valAxisLabelFormatCode: '#,##0', catAxisLabelFontSize: 9, showTitle: true, title: 'Variants by year of last review, 2012–2025', titleFontSize: 11, titleColor: H.mute });
stat(s, 7.3, 2.1, 2.2, '1.36M', 'reviews in 2025 (only 33K in 2017)', BLUE, 30);
stat(s, 7.3, 3.5, 2.2, '877K', 'uncertain results in 2025 alone', CYAN, 30);

// ================= 24 STARS =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'Most labels rest on one lab’s opinion');
chart(s, pres.charts.BAR, [{ name: '% of variants', labels: ['0 stars', '1 star', '2 stars', '3 stars', '4 stars'], values: [5.4, 77.6, 16.5, 0.5, 0.0] }],
  { x: 0.55, y: 1.75, w: 6.2, h: 3.35, barDir: 'col', chartColors: [H.grey, H.cyan, H.green, H.blue, H.navy], showValue: true, dataLabelFormatCode: '0.0"%"', dataLabelPosition: 'outEnd', showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, valAxisMaxVal: 90, barGapWidthPct: 40, showTitle: true, title: 'Review status (trust stars)', titleFontSize: 11, titleColor: H.mute });
stat(s, 7.2, 2.2, 2.3, '77.4%', 'reported by only one lab', CYAN, 30);
stat(s, 7.2, 3.5, 2.3, '0.5%', 'checked by an expert panel', BLUE, 30);

// ================= 25 GENES CONFLICT =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'Experts disagree most on breast-cancer genes');
chart(s, pres.charts.BAR, [{ name: '% conflicting', labels: ['COL6A3', 'MUTYH', 'SETX', 'MSH2', 'COL6A1', 'RAD51C', 'BRCA1', 'BRCA2'], values: [16.9, 17.0, 17.6, 17.7, 18.5, 19.9, 21.6, 26.4] }],
  { x: 0.55, y: 1.75, w: 5.8, h: 3.4, barDir: 'bar', chartColors: [H.blue], showValue: true, dataLabelFormatCode: '0.0"%"', dataLabelPosition: 'outEnd', showLegend: false,
    valAxisHidden: true, valGridLine: { style: 'none' }, valAxisMaxVal: 32, barGapWidthPct: 40, showTitle: true, title: '% conflicting labels (genes with 2,000+ variants)', titleFontSize: 11, titleColor: H.mute });
bullets(s, ['BRCA2: 1 in 4 variants has conflicting labels', 'BRCA1/2 are the most-tested genes in the world', 'More labs testing = more chances to disagree'], { x: 6.7, y: 2.1, w: 2.75, h: 2.5, fontSize: 11.5 });

// ================= 26 TYPE STACKED =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'Big DNA changes are easier to judge');
const tl = ['Single-letter (SNV)', 'Microsatellite', 'Indel', 'Insertion', 'Duplication', 'Deletion'];
chart(s, pres.charts.BAR, [
  { name: 'Pathogenic (P/LP)', labels: tl, values: [4.9, 29.9, 43.2, 47.3, 54.1, 60.7] },
  { name: 'Uncertain (VUS)', labels: tl, values: [57.4, 28.3, 45.9, 17.4, 18.8, 17.4] },
  { name: 'Benign (B/LB)', labels: tl, values: [33.2, 37.0, 8.1, 33.7, 25.0, 19.7] },
  { name: 'Conflicting', labels: tl, values: [4.4, 4.6, 2.5, 1.4, 2.0, 2.0] },
  { name: 'Other', labels: tl, values: [0.1, 0.1, 0.3, 0.2, 0.1, 0.2] }],
  { x: 0.55, y: 1.75, w: 6.6, h: 3.4, barDir: 'bar', barGrouping: 'percentStacked', chartColors: [H.blue, H.cyan, H.green, H.lime, H.grey], showLegend: true, legendPos: 'b',
    valAxisLabelFormatCode: '0%', barGapWidthPct: 35, showTitle: true, title: 'Label mix by type of variant', titleFontSize: 11, titleColor: H.mute });
stat(s, 7.5, 2.1, 2.0, '61%', 'of deletions are pathogenic', BLUE, 30);
stat(s, 7.5, 3.5, 2.0, '57%', 'of single-letter changes are uncertain', CYAN, 30);

// ================= 27 TOP GENES / CONDITIONS =================
s = newSlide('WHITE', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS'); title(s, 'Which genes and diseases come up most');
chart(s, pres.charts.BAR, [{ name: 'Pathogenic variants', labels: ['PKD1', 'APC', 'FBN1', 'ATM', 'BRCA1', 'NF1', 'BRCA2', 'TTN'], values: [2593, 2646, 3742, 3918, 4335, 5753, 5790, 6143] }],
  { x: 0.55, y: 1.75, w: 4.4, h: 3.4, barDir: 'bar', chartColors: [H.blue], showValue: true, dataLabelFormatCode: '#,##0', dataLabelPosition: 'outEnd', showLegend: false, valAxisHidden: true,
    valGridLine: { style: 'none' }, valAxisMaxVal: 7600, barGapWidthPct: 40, showTitle: true, title: 'Top genes (pathogenic variants)', titleFontSize: 11, titleColor: H.mute });
chart(s, pres.charts.BAR, [{ name: 'Pathogenic variants', labels: ['Neurofibromatosis 1', 'Heart conditions', 'Breast/ovarian cancer syndrome', 'Familial breast cancer', 'Inborn genetic diseases', 'Hereditary cancer'], values: [4762, 5312, 5910, 6568, 7184, 22620] }],
  { x: 5.1, y: 1.75, w: 4.4, h: 3.4, barDir: 'bar', chartColors: [H.green], showValue: true, dataLabelFormatCode: '#,##0', dataLabelPosition: 'outEnd', showLegend: false, valAxisHidden: true,
    valGridLine: { style: 'none' }, valAxisMaxVal: 28000, barGapWidthPct: 40, catAxisLabelFontSize: 9, showTitle: true, title: 'Top linked conditions', titleFontSize: 11, titleColor: H.mute });

// ================= 28 TAKEAWAYS (blue) =================
s = newSlide('BLUE_A', 'Part 4 · Analysis & Insights');
tag(s, 'INSIGHTS', true); title(s, 'Key takeaways');
[['55% unknown', 'Most variants are still uncertain, and that pile grows every year.', LIME], ['Little double-checking', '77% come from one lab; only 0.5% were expert-reviewed.', WHITE],
 ['Disagreement where it matters', 'BRCA1/2, the most-tested genes, have the most conflicts.', LIME], ['Cleaning was essential', 'Without it, every number would be doubled or wrong.', WHITE]].forEach(([h, d, c], i) => {
  const x = i % 2 ? 5.15 : 0.55, y = i < 2 ? 1.95 : 3.2;
  T(s, h, { x, y, w: 4.1, h: 0.4, fontSize: 15, bold: true, color: c });
  T(s, d, { x, y: y + 0.5, w: 4.0, h: 0.7, fontSize: 11.5, color: WHITE });
});
T(s, 'Why it matters: clearer data means clearer test results for patients, better-aimed research, and knowing which labels to trust.', { x: 0.55, y: 4.65, w: 8.0, h: 0.5, fontSize: 10.5, color: WHITE });

// ================= 29 CLOSE =================
pres.addSection({ title: 'Close' });
s = newSlide('DIV1', 'Close');
T(s, 'THANK YOU! QUESTIONS?', { x: 0.55, y: 1.9, w: 6.0, h: 1.6, fontSize: 38, bold: true, color: WHITE, charSpacing: -0.5 });
T(s, 'Data: NCBI ClinVar, November 2026 release · Notebook: ClinVar_Final_Project.ipynb · Dashboard: Power BI', { x: 0.55, y: 3.8, w: 5.6, h: 0.6, fontSize: 10, color: WHITE });
T(s, 'Patterns in a public database, not medical advice.', { x: 0.55, y: 4.45, w: 5.6, h: 0.3, fontSize: 10, color: WHITE });

(async () => {
  await pres.writeFile({ fileName: 'ClinVar_Full_Presentation_DNA.pptx' });
  await applyTheme('ClinVar_Full_Presentation_DNA.pptx', THEME);
  console.log('done', n, 'slides');
})();
