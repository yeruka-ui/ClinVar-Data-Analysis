"""Draw a reproducible ~1M-row sample of ClinVar's variant_summary.txt.gz for Power BI.

Sampling unit is the variant (VariationID), not the row: every row of a sampled
variant is kept, so both genome-build rows and any duplicates stay together.
Rows are copied byte for byte; no values, columns or formats are changed, so all
cleaning still has to happen downstream (in Power Query).

Usage: python make_powerbi_sample.py variant_summary.txt.gz out.txt [target_rows]
"""
import gzip
import sys

import numpy as np

SEED = 42
src, out = sys.argv[1], sys.argv[2]
target_rows = int(sys.argv[3]) if len(sys.argv) > 3 else 1_000_000

# Pass 1: count rows and collect the unique variant IDs
with gzip.open(src, "rt", encoding="utf-8", newline="") as f:
    header = f.readline()
    vid_col = header.rstrip("\n").split("\t").index("VariationID")
    ids, n_rows = set(), 0
    for line in f:
        ids.add(line.split("\t", vid_col + 1)[vid_col])
        n_rows += 1

# Pick the same share of variants as the share of rows we want
fraction = target_rows / n_rows
ids = np.array(sorted(ids, key=int))
rng = np.random.default_rng(SEED)
chosen = set(ids[rng.random(len(ids)) < fraction].tolist())

# Pass 2: copy every row of the chosen variants, unchanged
kept = 0
with gzip.open(src, "rt", encoding="utf-8", newline="") as f, open(out, "w", encoding="utf-8", newline="") as w:
    w.write(f.readline())
    for line in f:
        if line.split("\t", vid_col + 1)[vid_col] in chosen:
            w.write(line)
            kept += 1

print(f"rows in file: {n_rows:,} | variants: {len(ids):,} | fraction: {fraction:.4%} | seed: {SEED}")
print(f"variants sampled: {len(chosen):,} | rows written: {kept:,}")
