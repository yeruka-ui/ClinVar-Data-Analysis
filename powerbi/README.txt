ClinVar 1M-row sample for Power BI
==================================

FILE
  ClinVar_sample_1M.txt  - 999,346 rows + header, 43 columns, tab-separated, UTF-8
  Source: NCBI ClinVar variant_summary.txt.gz (release with 9,354,555 rows)
  https://ftp.ncbi.nlm.nih.gov/pub/clinvar/tab_delimited/variant_summary.txt.gz

HOW IT WAS MADE (make_powerbi_sample.py)
  1. Listed all 4,711,633 unique variants (VariationID) in the full file.
  2. Randomly picked 10.69% of them (numpy, seed 42), = 503,407 variants.
  3. Copied EVERY row of each picked variant, byte for byte.
  Nothing else was changed: same 43 columns, same duplicates (both genome
  builds), same missing-value codes ("-", "na", "not provided", -1), same messy
  labels and placeholder dates. All cleaning is still to be done in Power BI.

WHY SAMPLE BY VARIANT, NOT BY ROW
  Each variant appears once per genome build (GRCh37 / GRCh38). Sampling whole
  variants keeps those pairs together, so the Power BI steps "keep GRCh38" and
  "remove duplicates" work exactly as on the full data.

CHECK: sample vs full dataset (see sample_vs_full.csv)
  After the same cleaning, every percentage is within 0.12 points of the full
  data (e.g. VUS 54.59% vs 54.63%, 1-star 77.54% vs 77.55%).
  Expected after cleaning in Power BI: 496,036 GRCh38 rows -> 495,788 unique variants.
  Counts are ~10.7% of the full data: compare percentages, not counts.
  Note: rare label spellings drop out (54 of 104 appear), so the label column
  is still messy but less varied than in the full file.

LOAD IN POWER BI
  Get Data > Text/CSV > ClinVar_sample_1M.txt, Delimiter: Tab.
  If quote marks cause errors, use Transform Data > Advanced Editor and set
  QuoteStyle = QuoteStyle.None in Csv.Document.
