const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  AlignmentType, LevelFormat, PageBreak, HeadingLevel, Footer, PageNumber } = require('docx');

const SIZES = require('./sizes.json');
const COLS = require('./columns.json');
const USED = new Set(['VariationID', 'Type', 'GeneSymbol', 'ClinicalSignificance', 'ReviewStatus', 'NumberSubmitters', 'PhenotypeList',
  'Assembly', 'Chromosome', 'Start', 'Stop', 'LastEvaluated']);

const INK = '14213D', ACC = '1E4FFF', GREY = '5B6C8F', ZEBRA = 'EEF3F8', CODEBG = 'F3F5F9';
const W = 9360; // content width in DXA (US Letter, 1" margins)

// ---------- helpers ----------
const r = (text, o = {}) => new TextRun(Object.assign({ text }, o));
const P = (children, o = {}) => new Paragraph(Object.assign({ children: Array.isArray(children) ? children : [r(children)], spacing: { after: 120 } }, o));
const rich = (t) => t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s => s.startsWith('**') ? r(s.slice(2, -2), { bold: true }) : r(s));
const para = (t, o = {}) => P(rich(t), o);
const H = (level, text) => new Paragraph({ heading: level, children: [r(text)] });
const bullet = (t) => new Paragraph({ numbering: { reference: 'bul', level: 0 }, spacing: { after: 60 }, children: rich(t) });
const num = (t, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: rich(t) });
const code = (lines) => lines.map((l, i) => new Paragraph({ spacing: { after: 0, before: i === 0 ? 60 : 0 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: CODEBG },
  children: [r(l === '' ? ' ' : l, { font: 'Consolas', size: 18 })] })).concat([new Paragraph({ spacing: { after: 120 }, children: [] })]);
const caption = (t) => P([r(t, { italics: true, color: GREY, size: 19 })], { alignment: AlignmentType.CENTER, spacing: { after: 200 } });
function img(name, widthPx = 610) {
  const [w, h] = SIZES[name];
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 40 }, children: [
    new ImageRun({ type: 'png', data: fs.readFileSync(`img/${name}.png`), transformation: { width: widthPx, height: Math.round(widthPx * h / w) },
      altText: { title: name, description: name, name } })] });
}
const thin = { style: BorderStyle.SINGLE, size: 4, color: 'C8D3E8' };
function table(widths, header, rows) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (c, w, head, zebra) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 90, right: 90 },
    shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: INK } : (zebra ? { type: ShadingType.CLEAR, color: 'auto', fill: ZEBRA } : undefined),
    children: [new Paragraph({ children: (typeof c === 'string' ? rich(c) : c).map(x => x), spacing: { after: 0 } })] });
  const mk = (cells, head, zebra) => new TableRow({ tableHeader: head, cantSplit: true,
    children: cells.map((c, i) => cell(head ? [r(c, { bold: true, color: 'FFFFFF', size: 19 })] : (typeof c === 'string' ? rich(c).map(x => x) : c), widths[i], head, zebra)) });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
    rows: [mk(header, true), ...rows.map((x, i) => mk(x, false, i % 2 === 1))] });
}
const gap = () => new Paragraph({ spacing: { after: 120 }, children: [] });
const pb = () => new Paragraph({ children: [new PageBreak()] });

const K = []; // document body

// ---------- title block ----------
['ANGELES UNIVERSITY FOUNDATION', 'Angeles City', 'COLLEGE OF COMPUTER STUDIES', 'PTF10 – INTRODUCTION TO DATA SCIENCE', 'Final Project']
  .forEach((t, i) => K.push(P([r(t, { bold: i !== 1, size: i === 0 ? 26 : 22 })], { alignment: AlignmentType.CENTER, spacing: { after: 40 } })));
K.push(gap());
K.push(new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [r('Project Documentation')] }));
K.push(P([r('ClinVar: What 9 Million Genetic Records Tell Us', { size: 28, color: ACC, bold: true })], { alignment: AlignmentType.CENTER, spacing: { after: 240 } }));
K.push(table([2600, 6760], ['Item', 'Details'], [
  ['Project title', 'ClinVar: What 9 Million Genetic Records Tell Us'],
  ['Group', '[group name]'],
  ['Members', '[Presenter 1] · [Presenter 2] · [Presenter 3] · [Presenter 4]'],
  ['Notebook', 'ClinVar_Final_Project.ipynb (Google Colab)'],
  ['Supporting files', 'ClinVar_Full_Presentation_DNA.pptx (33 slides) · Power BI dashboard (.pbix)'],
  ['Dataset release', 'NCBI ClinVar variant_summary, November 2026'],
]));
K.push(gap());
K.push(H(HeadingLevel.HEADING_2, 'General Objective'));
K.push(para('By group, using Python in a Jupyter Notebook, analyze an open-source dataset.'));
K.push(H(HeadingLevel.HEADING_2, 'Specific Objectives and how we met them'));
K.push(table([4200, 5160], ['Objective (from the guidelines)', 'How this project meets it'], [
  ['Read the data in the format it was created (.csv / .txt / .html / .json)', 'Read the original tab-separated **.txt.gz** file directly from NCBI with pandas.'],
  ['Dataset with at least 1,000 rows and 10 columns', '**9,354,555 rows** and **43 columns**.'],
  ['Choose a topic of interest (health, technology, …)', 'Health: public records of human genetic variants and what they mean for disease.'],
  ['Use NumPy / Pandas', 'pandas for loading, cleaning, grouping; NumPy for missing values and log scales.'],
  ['Use Matplotlib / Seaborn for visualization', '8 charts plus cleaning and model charts, styled with Matplotlib and a Seaborn theme.'],
]));
K.push(pb());

// ---------- PART 1 ----------
K.push(H(HeadingLevel.HEADING_1, 'PART 1: DATASET'));
K.push(H(HeadingLevel.HEADING_2, '1.1 Dataset Name/Title'));
K.push(para('ClinVar Variant Summary (variant_summary.txt.gz)'));
K.push(H(HeadingLevel.HEADING_2, '1.2 Data Source'));
K.push(para('National Center for Biotechnology Information (NCBI), U.S. National Institutes of Health (NIH).'));
K.push(H(HeadingLevel.HEADING_2, '1.3 URL'));
K.push(para('https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/variant_summary.txt.gz'));
K.push(para('About the database: https://www.ncbi.nlm.nih.gov/clinvar/'));
K.push(H(HeadingLevel.HEADING_2, '1.4 Overview'));
K.push(para('ClinVar is a free public archive where clinical labs, researchers and expert panels report what they think a human genetic variant (a change in the DNA letters) does to health: **pathogenic** (causes disease), **benign** (harmless) or **uncertain**. Each row is one variant on one genome build, with its gene, chromosome position, linked condition, clinical significance, review status (how strongly it was checked) and number of submitting labs. The file is updated regularly; we used the November 2026 release. It is a tab-separated text file, about 440 MB compressed.'));
K.push(para('**Why we chose it:** it is real health data, very large and messy, so it tests every step of the data science process: loading, cleaning, exploring, visualizing and modeling.'));
K.push(H(HeadingLevel.HEADING_2, '1.5 Number of Rows'));
K.push(para('**9,354,555** rows in the raw file; **4,641,203** unique variants after cleaning.'));
K.push(para('Every variant is listed once per genome build (GRCh37 and GRCh38), so keeping only GRCh38 halves the file (4,643,623 rows); 2,420 more duplicates were then removed.'));
K.push(H(HeadingLevel.HEADING_2, '1.6 Number of Columns'));
K.push(para('**43** columns. We loaded **12** and, after using Assembly as a filter, worked with **11**.'));
K.push(H(HeadingLevel.HEADING_2, '1.7 Column Descriptions'));
K.push(para('Columns marked ✓ are the 12 we loaded.'));
K.push(table([500, 3500, 4660, 700], ['#', 'Column', 'Description', 'Used'],
  COLS.map(([n, c, d]) => [n, [r(c, { bold: USED.has(c), size: 19 })], [r(d, { size: 19 })], USED.has(c) ? '✓' : ''])));
K.push(caption('Columns 35–43 were added recently for cancer (somatic) classifications.'));
K.push(pb());

// ---------- PART 2 ----------
K.push(H(HeadingLevel.HEADING_1, 'PART 2: THE PYTHON NOTEBOOK'));
K.push(H(HeadingLevel.HEADING_2, '2.1 Libraries used'));
K.push(table([2200, 7160], ['Library', 'Used for'], [
  ['pandas', 'Loading the file in chunks, cleaning, grouping and counting'],
  ['numpy', 'Missing values (np.nan), log-scale math'],
  ['matplotlib', 'All charts: titles, axis labels, legends, custom colors and fonts'],
  ['seaborn', 'Chart theme (whitegrid)'],
  ['scikit-learn', 'Machine learning (2.5): train/test split, cross-validation, models and metrics'],
  ['os / gc', 'File paths and freeing memory'],
]));
K.push(...code(['import os, gc', 'import numpy as np', 'import pandas as pd', 'import matplotlib.pyplot as plt', 'import seaborn as sns']));

K.push(H(HeadingLevel.HEADING_2, '2.2 Data Acquisition (How the dataset was loaded)'));
K.push(num('**Downloaded** the compressed file (about 440 MB) from NCBI with wget inside Google Colab.', 'acq'));
K.push(num('**Peeked** at 5 rows to see all 43 columns and how values are written.', 'acq'));
K.push(num('**Loaded** the full file with pd.read_csv in chunks of 500,000 rows, because the full file is too big for Colab\'s memory, keeping only the 12 columns we need, reading everything as text, and keeping only rows on genome build GRCh38.', 'acq'));
K.push(...code([
  'for chunk in pd.read_csv(RAW_FILE, sep="\\t", usecols=COLS, dtype=str,',
  '                         chunksize=500_000, quoting=3):   # quoting=3: quote marks are plain text',
  '    parts.append(chunk[chunk["Assembly"] == "GRCh38"].drop(columns="Assembly"))',
  'df = pd.concat(parts, ignore_index=True)']));
K.push(para('**Result:** 9,354,555 rows read; **4,643,623** kept (GRCh38). Peak memory about 3.7 GB, well under Colab\'s 12 GB.'));

K.push(H(HeadingLevel.HEADING_2, '2.3 Data Cleaning and Exploration'));
K.push(H(HeadingLevel.HEADING_3, '2.3.1 Data Cleaning'));
K.push(para('**Duplicates:** kept one row per VariationID (the variant\'s unique ID), removing 2,420 rows and leaving **4,641,203** unique variants.'));
K.push(...code(['df = df.drop_duplicates(subset="VariationID").reset_index(drop=True)']));

K.push(H(HeadingLevel.HEADING_4, '2.3.1.1 Handling Missing Values'));
K.push(para('ClinVar never leaves a cell empty: it writes missing data as codes such as "-", "na", "not provided", "not specified", "See cases" or -1. df.isna() found **0** missing values, but we counted **2,864,360** hidden missing codes. We replaced them all with np.nan, then decided per column:'));
K.push(table([3000, 1200, 5160], ['Column', 'Missing', 'Decision'], [
  ['PhenotypeList (condition)', '45%', 'Kept as NaN; skipped only in the condition chart (dropping would lose almost half the data).'],
  ['LastEvaluated (date)', '6%', 'Kept as NaN; skipped only in the yearly chart.'],
  ['ClinicalSignificance / ReviewStatus', '~5%', 'Kept; treated as "no germline label" (mostly tumor records that use a different system).'],
  ['GeneSymbol', '<0.1%', 'Kept; skipped in gene charts.'],
]));
K.push(para('We did not drop whole rows, because a row missing one field still has useful information in the others.'));
K.push(...code(['MISSING = ["-", "na", "NA", "", "not provided", "not specified", "See cases", "-1"]',
  'for c in df.columns:', '    df[c] = df[c].replace(MISSING, np.nan)']));
K.push(img('missing', 560)); K.push(caption('Figure 1. Missing values per column after replacing the codes.'));

K.push(H(HeadingLevel.HEADING_4, '2.3.1.2 Removing Outliers'));
K.push(bullet('**Dates:** 111 review dates before 1990 are impossible placeholders (ClinVar began in 2013; the oldest value was 1965-01-01). Set to missing.'));
K.push(bullet('**NumberSubmitters:** the IQR rule (fence = 1.0) would flag 22.5% of rows. These are real (popular variants get many labs), so we kept them. Not every statistical outlier is an error.'));
K.push(bullet('**Variant length** (Stop − Start + 1): most variants are 1 letter long, but some span up to about 159 million letters. We removed the top 0.1% (above 1,414,442 letters; 4,642 rows) from the length analysis only.'));
K.push(img('length', 610)); K.push(caption('Figure 2. Variant length before and after removing the top 0.1% (log scales).'));

K.push(H(HeadingLevel.HEADING_4, '2.3.1.3 Converting data types if necessary'));
K.push(para('All columns were loaded as text (object). We converted:'));
K.push(bullet('Start, Stop, NumberSubmitters → numbers with pd.to_numeric'));
K.push(bullet('LastEvaluated → datetime with pd.to_datetime(format="%b %d, %Y"), plus a new **Year** column'));
K.push(bullet('Type, Chromosome, labels, ReviewStatus → category (saves memory)'));
K.push(para('**New columns:** Length; **Group** (104 label spellings → 5 groups: P/LP, VUS, B/LB, Conflicting, Other, checked in a fixed order so "conflicting" is caught first); **Stars** (review-status text → ClinVar\'s 0–4 trust score).'));

K.push(H(HeadingLevel.HEADING_3, '2.3.2 Data Exploration'));
K.push(para('We used df.head(), df.tail(), df.info(), df.describe() (numeric and category columns) and value_counts(). Key results:'));
K.push(bullet('Clean table: **4,641,203 rows × 15 columns**; **4,391,047** have a germline label.'));
K.push(bullet('Labels: **54.6%** uncertain (VUS), **32.5%** benign, **8.6%** pathogenic, **4.2%** conflicting, 0.1% other.'));
K.push(bullet('**30,373** unique genes; median submitters per variant = 1 (maximum 97).'));
K.push(pb());

K.push(H(HeadingLevel.HEADING_2, '2.4 Exploratory Data Analysis (EDA)'));
K.push(H(HeadingLevel.HEADING_3, '2.4.1 Visualize Data'));
K.push(para('We made **8 charts** (pie, bar, line, histogram, scatter, stacked bar), more than the 5 required. Each has a title, x and y axis labels and a legend, a custom font and size, and consistent colors: red = pathogenic, amber = uncertain, green = benign, slate = conflicting.'));
[['chart1', 'Chart 1 – Pie (donut) chart: clinical significance of labeled variants.'],
 ['chart2', 'Chart 2 – Bar chart: top 15 genes by number of pathogenic variants.'],
 ['chart3', 'Chart 3 – Line plot: variants by year of last review, 2012–2025.'],
 ['chart4', 'Chart 4 – Histogram: number of labs reporting each variant (log scale).'],
 ['chart5', 'Chart 5 – Scatter plot: gene size vs. share of conflicting labels.'],
 ['chart6', 'Chart 6 – Stacked bar chart: clinical significance by variant type.'],
 ['chart7', 'Chart 7 – Bar chart: review status (trust stars).'],
 ['chart8', 'Chart 8 – Bar chart: top 12 conditions linked to pathogenic variants.']]
  .forEach(([n, c]) => { K.push(img(n, 560)); K.push(caption(c)); });

K.push(H(HeadingLevel.HEADING_3, '2.4.2 Insights'));
[
  '**Most variants are still unknown (Chart 1).** 54.6% are uncertain (VUS); only 8.6% are pathogenic. A VUS on a DNA test leaves doctors unable to say if it is dangerous.',
  '**A few genes dominate (Chart 2).** TTN, BRCA2, NF1, BRCA1 and ATM have the most pathogenic variants. TTN is the largest human gene; BRCA1/2 are the main breast/ovarian cancer genes.',
  '**Uncertainty grows faster than answers (Chart 3).** Reviews rose from about 33K variants (2017) to about 1.36M (2025); 877K of the 2025 reviews were uncertain.',
  '**Most variants have no second opinion (Chart 4).** About 77% are reported by only one lab.',
  '**Genes with more variants have more disagreement (Chart 5).** Across 7,288 genes the rank correlation between gene size and conflict rate is 0.68. BRCA2 (26%) and BRCA1 (22%) stand out.',
  '**Big DNA changes are easier to judge (Chart 6).** Deletions are 61% pathogenic; single-letter changes are only 5% pathogenic and 57% uncertain.',
  '**Expert review is rare (Chart 7).** 77.6% of variants have 1 star (one lab); only 0.5% were checked by an expert panel or guideline.',
  '**Cancer leads the conditions (Chart 8).** "Hereditary cancer-predisposing syndrome" is linked to about 22,600 pathogenic variants, far ahead of the rest.',
  '**Cleaning was essential.** Without it every count would be doubled, 104 label spellings would split the charts, and 45% of conditions hide behind "not provided".',
].forEach(t => K.push(num(t, 'ins')));
K.push(para('These are patterns in a public database, not medical advice.', { spacing: { before: 120, after: 120 } }));
K.push(pb());

// ---------- 2.5 ML ----------
K.push(H(HeadingLevel.HEADING_2, '2.5 Machine Learning Application'));
K.push(para('We applied supervised learning to two questions and compared a simple model with a flexible one on identical data, always against a baseline that does not learn.'));
K.push(table([1100, 1500, 3600, 3160], ['Task', 'Type', 'Question', 'Models compared'], [
  ['A', 'Classification', 'Can recorded facts tell a pathogenic variant from a benign one? Then: which uncertain variants look pathogenic?', 'Baseline (always benign), Logistic Regression, Random Forest'],
  ['B', 'Regression', 'Can a gene\'s size and testing profile predict how often labs disagree on it?', 'Baseline (predict the average), Linear Regression, Random Forest'],
]));
K.push(gap());
K.push(para('**Fair-comparison rules:** same features and the same train/test split for every model (random_state = 42); a baseline every model must beat; 5-fold cross-validation on the training set, then one final test on a held-out 20%; no feature that already contains the answer (no data leakage).'));

K.push(H(HeadingLevel.HEADING_3, '2.5.1 Task A setup: pathogenic vs. benign'));
K.push(table([2800, 6560], ['Step', 'What we did and why'], [
  ['Target (answer)', '1 = pathogenic / likely pathogenic, 0 = benign / likely benign. Uncertain and conflicting variants are left out of training because their true answer is unknown.'],
  ['Sample', '200,000 variants drawn from about 1.8 million known ones, keeping the same 20.9% pathogenic share (a random forest on all rows is too slow in Colab).'],
  ['Features (38 numbers)', 'Length (log scale), number of labs, review stars, year, variant type (8 most common + "other", as yes/no columns) and chromosome (25 yes/no columns).'],
  ['Split', '160,000 for training, 40,000 locked away for the final test (stratified, same pathogenic share in both).'],
  ['Class imbalance', 'Only about 21% are pathogenic, so both models use class_weight="balanced": mistakes on the rare class count more.'],
  ['Models', 'Logistic Regression (with feature scaling) and Random Forest (200 trees, max depth 12, at least 5 rows per leaf).'],
]));
K.push(...code(['X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)',
  'cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)',
  'RandomForestClassifier(n_estimators=200, max_depth=12, min_samples_leaf=5, class_weight="balanced")']));

K.push(H(HeadingLevel.HEADING_3, '2.5.2 Task A results'));
K.push(para('**5-fold cross-validation (training set, ROC-AUC):** Logistic Regression 0.772 ± 0.002; Random Forest 0.805 ± 0.002.'));
K.push(para('**Held-out test set (40,000 unseen variants):**'));
K.push(table([2800, 1300, 1300, 1320, 1320, 1320], ['Model', 'ROC-AUC', 'Accuracy', 'Precision', 'Recall', 'F1'], [
  ['Baseline (always benign)', '0.500', '0.791', '0.000', '0.000', '0.000'],
  ['Logistic Regression', '0.779', '0.828', '0.594', '0.561', '0.577'],
  ['**Random Forest**', '**0.812**', '**0.848**', '**0.648**', '**0.596**', '**0.621**'],
]));
K.push(gap());
K.push(bullet('**Accuracy alone is misleading:** the baseline reaches 79.1% accuracy by always answering benign, yet catches zero pathogenic variants (recall 0).'));
K.push(bullet('**The random forest wins on every measure.** Of 8,362 pathogenic test variants it found 4,982 (about 60%), missed 3,380, and raised 2,709 false alarms.'));
K.push(bullet('**Both models rely on the same signal:** the type and length of the DNA change (single-letter changes lean benign; deletions lean pathogenic).'));
K.push(img('ml_roc_cm', 620)); K.push(caption('Figure 3. ROC curves and confusion matrices on the test set.'));
K.push(img('ml_importance', 620)); K.push(caption('Figure 4. Random forest feature importance and logistic regression coefficients.'));

K.push(H(HeadingLevel.HEADING_3, '2.5.3 Applying the model to uncertain variants'));
K.push(para('The best model (random forest) scored all **2,398,705** uncertain (VUS) variants, which it never saw in training. Most score around 0.3. **59,650 (2.5%)** score 0.8 or higher: they resemble known pathogenic variants and are sensible candidates for expert review first. Only 2,558 (0.1%) score 0.2 or lower. This is a way to prioritize review, not a diagnosis.'));
K.push(img('ml_vus', 540)); K.push(caption('Figure 5. Predicted probability of being pathogenic for uncertain variants.'));

K.push(H(HeadingLevel.HEADING_3, '2.5.4 Task B: predicting disagreement per gene'));
K.push(bullet('**Data:** one row per gene with at least 100 labeled variants (7,288 genes); 80/20 split.'));
K.push(bullet('**Target:** the percentage of the gene\'s variants with conflicting labels.'));
K.push(bullet('**Features:** number of variants (log scale), average labs per variant, share of single-letter changes. Review stars were excluded because a conflicting variant\'s review status literally says "conflicting" (leakage).'));
K.push(table([3400, 2000, 3960], ['Model (test set)', 'R²', 'Average error (MAE, % points)'], [
  ['Baseline (predict the average)', '0.00', '2.16'],
  ['**Linear Regression**', '**0.723**', '**0.86**'],
  ['Random Forest', '0.725', '0.87'],
]));
K.push(gap());
K.push(para('The two models tie, so we choose the simpler, explainable **linear regression**. Its coefficients show that each extra lab per variant adds about **6.6 percentage points** of conflict, while a gene with 10× more variants adds only about **0.6 points**: disagreement is driven mostly by how many labs test a gene, not by its size. Part of this is built in, since a conflict needs at least two labs.'));
K.push(img('ml_regression', 600)); K.push(caption('Figure 6. Actual vs. predicted conflict rate per gene (test set).'));

K.push(H(HeadingLevel.HEADING_3, '2.5.5 Limitations'));
K.push(bullet('The classifier still misses about 40% of pathogenic variants; a low score does not mean safe.'));
K.push(bullet('Features describe the kind of change, not what it does to the protein; adding the protein effect from the Name column would likely help.'));
K.push(bullet('Labels are expert opinions, mostly from a single lab; the model learns their patterns, including any mistakes.'));
K.push(pb());

// ---------- PART 3 ----------
K.push(H(HeadingLevel.HEADING_1, 'PART 3: PROJECT DEMONSTRATION'));
K.push(para('The project is presented in class in **at most 15 minutes**, using a 33-slide deck (ClinVar_Full_Presentation_DNA.pptx) with the full script in its speaker notes.'));
K.push(H(HeadingLevel.HEADING_2, '3.1 Presentation flow and roles'));
K.push(table([1900, 2400, 3860, 1200], ['Presenter', 'Part', 'Content', 'Slides'], [
  ['[Presenter 1]', 'Opening, dataset and cleaning', 'Project goal, key terms, ClinVar, columns, questions; loading, duplicates, missing values, label groups, outliers', '1–14'],
  ['[Presenter 2]', 'Machine learning and charts', 'Training process, results, why the random forest wins, scoring uncertain variants, gene regression, the eight notebook charts', '15–20'],
  ['[Presenter 3]', 'Power BI version and live demo', 'Loading in Power Query, cleaning in both tools, live dashboard demo', '21–25'],
  ['[Presenter 4]', 'Insights and takeaways', 'Main findings, key takeaways, questions', '26–33'],
]));
K.push(H(HeadingLevel.HEADING_2, '3.2 Supplementary: Power BI dashboard'));
K.push(para('To make the results interactive, the same cleaning was rebuilt in Power BI (not required by the guidelines; it supports the demonstration).'));
K.push(table([2300, 3500, 3560], ['Step', 'Python (pandas)', 'Power BI (Power Query + DAX)'], [
  ['Load', 'read_csv in chunks of 500K rows', 'Get Data → Folder, 21 GRCh38 parts'],
  ['Duplicates', 'drop_duplicates(VariationID)', 'Remove Duplicates'],
  ['Missing codes', 'replace(codes, NaN)', 'One replace step, whole cells only'],
  ['Data types', 'to_numeric · to_datetime', 'Change Type (dates read as English, US)'],
  ['Outliers', 'Dates < 1990 · IQR · 99.9th percentile', 'Date placeholder flag · DAX measures'],
  ['Label groups', 'sig_group() and stars() functions', 'Custom columns Group and Stars'],
  ['Output', '8 static charts', '1 interactive dashboard with slicers'],
]));
K.push(gap());
K.push(para('**Dashboard components:** 5 KPI cards (unique variants, labeled variants, % uncertain, % expert-reviewed, % reported by one lab); 3 slicers (clinical significance, chromosome, year of last review); 6 visuals (label mix by variant type, top 10 genes, top 8 conditions, label donut, review stars, variants by year). Both tools show the same results.'));
K.push(H(HeadingLevel.HEADING_2, '3.3 Live demo steps'));
['Clear all slicers.', 'Select P/LP in the clinical significance slicer: every card and chart shows only harmful variants.',
 'Pick chromosome 17 (where BRCA1 sits): BRCA1 rises in the gene chart.', 'Set the year range to 2023–2025: the cards show recent reviews only.',
 'Click the Deletion bar: every other visual filters to deletions.', 'Clear all slicers again and return to the slides.'].forEach(t => K.push(num(t, 'demo')));
K.push(H(HeadingLevel.HEADING_2, '3.4 Key takeaways presented'));
[
  'More than half of labeled variants (54.6%) are still uncertain, and that pile grows every year.',
  'Most labels come from one lab (77%); only 0.5% were expert-reviewed.',
  'Disagreement is highest where testing is highest (BRCA2: 1 in 4 variants conflicting).',
  'Cleaning was essential: without it, every number would be doubled or wrong.',
].forEach(t => K.push(bullet(t)));
K.push(pb());

// ---------- Appendix: rubric ----------
K.push(H(HeadingLevel.HEADING_1, 'APPENDIX: EVALUATION CRITERIA CHECKLIST'));
K.push(table([2300, 900, 6160], ['Criterion', 'Weight', 'Where it is addressed'], [
  ['Purpose', '5%', 'General objective and research questions (Part 1.4, slide 8); results answer each question (2.4.2, 3.4).'],
  ['Error Handling', '5%', 'Notebook runs top to bottom without errors; checks for renamed columns (assert), hidden missing codes, impossible dates, extreme lengths and leakage.'],
  ['Features / Functionalities', '20%', 'Full pipeline: chunked loading, deduplication, missing values, outliers, type conversion, exploration, EDA and two machine-learning tasks (2.2–2.5).'],
  ['Visualizations', '25%', '8 styled EDA charts with titles, axis labels and legends (2.4.1), plus cleaning and model figures and an interactive Power BI dashboard (3.2).'],
  ['Project Presentation', '25%', '33-slide deck with a scripted, timed 15-minute talk across four presenters (Part 3).'],
  ['Ability to Respond to Questions', '10%', 'Prepared answers per presenter in the presenter study guide.'],
  ['Overall Impact', '10%', 'Real-world insights on genetic test uncertainty, label trust and lab disagreement; ML shortlist of about 60 thousand variants for expert review.'],
]));
K.push(gap());
K.push(H(HeadingLevel.HEADING_2, 'Submission checklist'));
['Run the notebook top to bottom (Runtime → Run all) and keep all outputs visible.', 'Submit ClinVar_Final_Project.ipynb in MyClass.',
 'Check that slide numbers match the notebook output (e.g. 59,650 uncertain variants scoring ≥ 0.8).', 'Do a timed run-through: the talk must fit in 15 minutes.']
  .forEach(t => K.push(bullet(t)));

// ---------- document ----------
const hd = (size, color, before, after, outline) => ({ run: { font: 'Calibri', size, bold: true, color }, paragraph: { spacing: { before, after }, keepNext: true, outlineLevel: outline } });
const doc = new Document({
  creator: '[group name]', title: 'ClinVar Project Documentation',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 21, color: '1B2433' } } },
    paragraphStyles: [
      Object.assign({ id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal' }, hd(44, INK, 120, 80, undefined)),
      Object.assign({ id: 'Heading1', name: 'heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true }, hd(30, INK, 240, 160, 0)),
      Object.assign({ id: 'Heading2', name: 'heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true }, hd(25, ACC, 240, 100, 1)),
      Object.assign({ id: 'Heading3', name: 'heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true }, hd(22, INK, 200, 80, 2)),
      Object.assign({ id: 'Heading4', name: 'heading 4', basedOn: 'Normal', next: 'Normal', quickFormat: true }, hd(21, GREY, 160, 60, 3)),
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] },
    ...['acq', 'ins', 'demo'].map(ref => ({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } }] })),
  ] },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      r('ClinVar Project Documentation · page ', { size: 16, color: GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY })] })] }) },
    children: K,
  }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync('ClinVar_Project_Documentation.docx', b); console.log('written'); });
