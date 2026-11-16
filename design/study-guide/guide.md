---
title: "ClinVar Project: Presenter Study Guide"
subtitle: "The full script, explained slide by slide"
lang: en
---

# How to use this guide

This guide is the presentation script, rewritten so you understand every line before you say it.

Every slide has up to four parts:

- **On the slide:** what the audience is looking at.
- **What to say:** the script. This is the text you speak.
- **What this means:** a plain explanation, just for you. You don't read this part out loud.
- **Watch out:** a trap, or a question someone may ask.

Read the first three chapters once. They give you the whole story and the words you need. Then read your own slides.

**Who presents what**

| Presenter | Part | Slides |
|---|---|---|
| Presenter 1 | Opening, the dataset and the cleaning | 1–14 |
| Presenter 2 | Machine learning and the eight charts | 15–20 |
| Presenter 3 | The Power BI version and the live demo | 21–25 |
| Presenter 4 | Insights, takeaways and questions | 26–33 |

This follows your latest version of the script, where Presenter 1 also presents the cleaning slides. The timings from the old script no longer apply, because the machine learning part is now much longer. Time yourselves in a run-through.

# The whole project in two minutes

## What ClinVar is

ClinVar is a free, public database run by the U.S. National Institutes of Health. Labs and experts all over the world send it their opinion about changes in human DNA: is this change harmful, harmless, or do we not know yet?

## What we did with it

We treated ClinVar like any big, messy, real-world dataset:

1. **Loaded it.** It has 9.35 million rows, too big to open in one go.
2. **Cleaned it.** We removed copies, found hidden missing values, grouped messy labels and checked for impossible values.
3. **Analyzed it.** We made eight charts in Python.
4. **Modeled it.** We used machine learning to see if a computer can recognize harmful changes, and what makes labs disagree.
5. **Rebuilt it in Power BI.** The same project as an interactive dashboard.

## Our four questions

1. How much do we actually know about DNA changes?
2. How much can we trust the labels?
3. Where do experts disagree?
4. Which genes and types of change matter most?

## The main answers

- **We mostly don't know.** 54.6% of labeled changes are "uncertain". Only 8.6% are known to cause disease.
- **The unknown pile is growing fast.** In 2025 alone, 877 thousand reviews ended as "uncertain".
- **Most labels come from just one lab.** 77% rely on a single lab, and only 0.5% were checked by an expert panel.
- **Disagreement happens where testing happens.** The most-tested genes, BRCA1 and BRCA2, have the most conflicts.
- **Big changes are easier to judge.** Most deletions are known to be harmful. Most single-letter changes are still uncertain.
- **Cleaning mattered.** Without it, every number would be doubled or wrong.

# Words you need

## DNA and biology words

**DNA.** The instruction manual inside every cell. For a programmer, think of it as source code: a very long string written with only four letters, A, C, G and T.

**Gene.** One section of DNA that does one job, like one function in the code.

**Variant.** A change in the DNA string compared with the standard human version, like a diff or a typo. One variant is one row in our table. Some variants are harmless. Some break something.

**Reference genome (the "standard map").** One agreed-upon copy of the human DNA sequence that every lab compares against. It gives every position an address: a chromosome number plus a position. It is not one person's DNA. It was built from many donors.

**Genome build: GRCh37 and GRCh38.** Two versions of that standard map. GRCh37 is the older one, GRCh38 the newer one. The same DNA position can have a different number in each version, like line numbers changing after a code rewrite.

**Chromosome.** DNA is split into 23 pairs of long pieces, numbered 1 to 22, plus X and Y. Each position lives on one of them.

**Types of change.** Labs find a variant by comparing a patient's DNA with the reference, like running `git diff`. The shape of the difference gives the type:

| What happened | Type |
|---|---|
| One letter swapped for another | Single-letter change (ClinVar calls it "single nucleotide variant") |
| Letters removed | Deletion |
| Extra letters added | Insertion |
| A section copied again | Duplication |
| Some letters removed and others added at the same spot | Indel |
| A short pattern repeated more or fewer times | Microsatellite |

## The labels in ClinVar

**Pathogenic (P/LP).** The change causes disease, or likely does. This is the "harmful" class.

**Benign (B/LB).** The change is harmless, or likely harmless.

**Uncertain (VUS).** There isn't enough evidence yet to say either way. Think of it as "unlabeled".

**Conflicting.** Different labs sent different verdicts for the same variant, like a merge conflict.

**Review stars (0 to 4).** How much checking a label got, like code review approvals. 1 star means one lab's opinion. 3 or 4 stars mean an expert panel or an official guideline.

**Lab or submitter.** An organization that sends a verdict to ClinVar.

## Data words

**Row and column.** One row is one variant. One column is one fact about it, like its gene.

**DataFrame (df).** The table in Python (pandas) that holds all the data.

**Duplicate.** The same variant appearing more than once.

**Missing value (NaN).** An empty cell. ClinVar writes empty cells as codes like "-" or "not provided", so pandas doesn't see them as empty until we replace them.

**Outlier.** A value far from the rest. Some are mistakes (a 1965 review date). Some are real (a very popular variant reported by many labs).

## Machine learning words

**Model.** A program that learns a rule from examples, instead of us writing the rule by hand.

**Supervised learning.** Learning from examples where the correct answer is already known. Like learning from a stack of old exams with the answer key.

**Classification.** The answer is a category, here "pathogenic" or "benign".

**Regression.** The answer is a number, here "what percentage of this gene's variants are in conflict".

**Features (inputs).** The facts the model gets about each variant, turned into numbers: type, length, chromosome, number of labs, stars and year.

**Target (answer).** What the model has to predict. In the classification, 1 means pathogenic and 0 means benign.

**Training set and test set.** We teach the model on the training set. We keep the test set locked away and use it only once, at the end, like a final exam on questions the model has never seen.

**Baseline.** A lazy "model" that doesn't learn anything. Ours always answers "benign". A real model must beat it to be useful.

**Logistic regression.** A simple model. It gives each input a weight, adds them up, and turns the total into a score between 0 and 1.

**Decision tree.** A chain of if-else questions learned from the data, such as "is it a deletion? is it long?".

**Random forest.** Many decision trees (we used 200), each trained a little differently. They vote, and the share of "pathogenic" votes is the score.

**Cross-validation.** Splitting the training data into 5 parts, training on 4 and checking on the 5th, five times over. It shows whether a result is stable or just lucky.

**Leakage.** Giving the model an input that secretly contains the answer. The model then looks brilliant but has learned nothing real.

**Class imbalance.** When one answer is much rarer than the other. Only 21% of our training examples are pathogenic, so we told the models to take mistakes on that rare class more seriously.

## How we scored the models

**Accuracy.** The share of all answers that were right. Misleading here, because guessing "benign" every time is already right 79% of the time.

**Recall.** Of all the truly harmful variants, the share the model caught.

**Precision.** Of all the variants the model flagged as harmful, the share that really were.

**F1.** One number that balances recall and precision.

**AUC.** Pick one harmful and one harmless variant at random. AUC is how often the model ranks the harmful one higher. 0.5 means coin-flip guessing, 1.0 means perfect.

**ROC curve.** A line showing the trade-off: catching more harmful variants also means more false alarms. The closer the line gets to the top-left corner, the better.

**Confusion matrix.** A 2×2 table of right and wrong answers: correct "benign", correct "pathogenic", false alarms and misses.

**R² (R squared).** For regression: how much of the difference between genes the model explains. 0 means no better than guessing the average, 1 means perfect.

**Average error (MAE).** For regression: how far off a prediction is, on average.

# Presenter 1: Opening, the dataset and the cleaning

Slides 1–14.

## Slide 1 · ClinVar: What 9 Million Genetic Records Tell Us

**On the slide:** the title, the DNA helix and the course name.

**What to say:**

> Good morning everyone. We are [group name]. We took ClinVar, a huge public database of human genetic variants, and treated it like any messy real-world dataset: clean it, analyze it, model it. First in a Python notebook, then in Power BI. [Presenter 2] and I cover the notebook; [Presenter 3] and [Presenter 4] cover Power BI.

**What this means:** You are telling the class what kind of project this is. It isn't a biology project. It is a data project that happens to use biology data. "Clean it, analyze it, model it" is the data pipeline, and the class will recognize it.

## Slide 2 · Our project in four parts

**On the slide:** four numbered parts.

**What to say:**

> Four parts: the dataset; the Python notebook, where we clean nine million rows with pandas and compare machine-learning models; the same project in Power BI as an interactive dashboard; and the insights both tools gave us.

**What this means:** This is the table of contents. It tells the audience the order and that two different tools were used on the same data.

## Slide 3 · Part 1 divider · The Dataset

**What to say:**

> Let's start with the dataset.

## Slide 4 · Four terms you need first

**On the slide:** DNA, Gene, Variant and Genome build, each in a hexagon.

**What to say:**

> Four terms. Think of DNA as source code: a very long string over a four-letter alphabet, A, C, G, T. A gene is one function in that code. A variant is a change in the string, like a diff: some are harmless, some break the program. A genome build is a versioned reference map, like two releases of a library, GRCh37 and GRCh38. ClinVar lists every variant once per release, which matters for cleaning.

**What this means:**

- These four words are all the biology the class needs.
- The last sentence sets up the cleaning story. Because every variant appears once per map version, the raw file has every variant twice. We fix that on slide 11.

**Watch out:** if someone asks what a reference genome is, say it is an agreed-upon standard copy of human DNA that everyone compares against, so a position means the same thing to every lab.

## Slide 5 · ClinVar: the world's public variant archive

**On the slide:** four facts, plus the numbers 9.35M rows, 43 columns, 440 MB and 30K+ genes.

**What to say:**

> The data comes from NCBI, part of the U.S. National Institutes of Health, where labs and experts submit what they think each variant does to health. It is a free tab-separated file, about 440 megabytes compressed: 9.35 million rows, 43 columns, November 2026 release.

**What this means:**

- NCBI is the U.S. government body that runs ClinVar.
- "Tab-separated" means a text table where columns are split by tab characters, like a CSV with tabs.
- 440 MB is the zipped size. Unzipped, it is much bigger, which is why loading it is a problem (slide 10).

## Slide 6 · How ClinVar labels a variant

**On the slide:** four outlined label boxes (P/LP, VUS, B/LB, Conflicting) and five star circles (0 to 4).

**What to say:**

> Two columns matter most. The label is the verdict: pathogenic means it causes disease, benign means harmless, uncertain means not enough evidence, and conflicting means labs submitted different verdicts, like a merge conflict. The second is review status, turned into zero to four stars, a confidence score: one star is one lab's opinion, three or four is an expert panel.

**What this means:**

- The **label** is the answer column. The whole project is about these labels: how many are "uncertain", how much we can trust them, and whether a model can predict them.
- The **stars** say how much we should trust a label. Most labels have only 1 star (slide 28).
- "Conflicting" is a label of its own. It tells us labs disagree, and that is what slides 19 and 29 study.

## Slide 7 · The columns we used

**On the slide:** a table of columns, what each holds, and an example.

**What to say:**

> We loaded 12 of the 43 columns: ID, gene, type, label, review status, number of labs, condition, position, genome build and review date. We used the genome build only to keep one version of the map, then dropped it, so we worked with 11. The rest were ID codes or cancer-only columns over 99 percent empty. Dropping them let the file fit in memory.

**What this means:**

- Loading only the columns you need is a standard trick for big files: less memory, faster code.
- The 12 columns are: VariationID, Type, GeneSymbol, ClinicalSignificance, ReviewStatus, NumberSubmitters, PhenotypeList, Assembly, Chromosome, Start, Stop and LastEvaluated.
- "Assembly" is the genome build column (GRCh37 or GRCh38). We used it as a filter and then dropped it.
- During cleaning we added 4 columns of our own: Length, Group, Stars and Year.

**Watch out:** the slide's title says "11 columns", but its table lists 12, because Assembly shares a row with Chromosome, Start and Stop. The script above explains both numbers, so you're covered if someone counts.

## Slide 8 · Our questions, and what we don't do

**On the slide:** the four numbered questions, and a box: "We study the data, we don't diagnose."

**What to say:**

> Our four questions: how much do we know, how much can we trust it, where do experts disagree, and which genes matter most. One boundary: we analyze data. We don't diagnose anyone, and we never change an expert's label.

**What this means:** The boundary sentence protects you. Nothing in this project tells a real person whether they are sick. You only study patterns in how the database is filled in.

## Slide 9 · Part 2 divider · Data Cleaning

**What to say:**

> Now the cleaning, in the order we did it.

## Slide 10 · Loading a file too big to open

**On the slide:** four steps (Download, Peek, Read in chunks, Filter) and a screenshot of the code and its output.

**What to say:**

> The file is too big to open at once: nine million rows can crash Colab. So we streamed it, 500 thousand rows at a time, only our columns, everything as plain text. Each chunk kept the GRCh38 rows. Result: 9.35 million rows read, 4.64 million kept, peak memory 3.7 gigabytes.

**What this means:**

- Colab is the free online notebook we ran Python in. It has about 12 GB of memory.
- **Streaming in chunks:** instead of loading everything, we read 500,000 rows, kept what we needed, threw the rest away, then read the next 500,000. Like reading a huge log file line by line instead of opening it whole.
- **"Everything as plain text":** we told pandas not to guess the data types while loading. Guessing can go wrong on messy data. We converted the types ourselves later, on slide 14.
- **Kept the GRCh38 rows:** we kept only rows on the newer map. This is why only about half the rows remain.
- Peak memory of 3.7 GB out of 12 means the approach worked comfortably.

## Slide 11 · Cleaning cut the data in half

**On the slide:** a bar chart of rows after each step, three bullet points and a code screenshot.

**What to say:**

> Why did half the rows disappear? Each variant appears once per genome version, so keeping one version removes the copy. Then dropping duplicates on the variation ID, our primary key, removed 2,420 more. Without this, every count we report would be doubled.

**What this means:**

- The raw file lists each variant twice, once with its GRCh37 position and once with its GRCh38 position. Keeping only GRCh38 removes that copy: 9.35 million down to 4.64 million.
- **VariationID** is the variant's unique ID, like a primary key in a database. If the same ID appears twice, it's a duplicate. Removing those took away 2,420 more rows, leaving 4,641,203.
- The chart's last bar (4.39 million) is the variants that have a label at all. About 250 thousand are cancer-only (tumor) records with no regular label.

## Slide 12 · Missing data hides behind codes

**On the slide:** a bar chart of the % missing per column, two bullets and a code screenshot.

**What to say:**

> Pandas reported zero missing values, because ClinVar writes missing as sentinel codes: a dash, 'na', 'not provided'. We found 2.86 million of them and replaced them with real NaN. Forty-five percent of rows have no condition. We kept those rows and skip the blanks only in charts that need that column.

**What this means:**

- **Sentinel code:** a fake value that stands for "nothing", like writing -1 or "N/A". Pandas sees text, so it thinks the cell is filled.
- We listed these codes, counted them (2.86 million cells), and replaced them with NaN, pandas' real "empty" value.
- **Why we kept the rows:** a row missing its condition still has a good label, gene, type and so on. Deleting it would throw away almost half the data for one empty column.
- The "condition" column is the disease the variant is linked to. 45% of rows don't name one.

## Slide 13 · 104 label spellings, grouped into 5

**On the slide:** a bar chart of spellings per group, the grouping code, and example spellings.

**What to say:**

> The label column had 104 spellings of five categories. Our function checks keywords in a fixed order: conflicting first, then pathogenic without benign, benign without pathogenic, then uncertain. Order matters, because 'conflicting classifications of pathogenicity' contains the word pathogenic. The same idea turned review status into the zero-to-four star score.

**What this means:**

- ClinVar writes the same idea many ways, such as "Pathogenic", "Pathogenic/Likely pathogenic" and "Pathogenic, low penetrance". Charts would split these into separate bars, so we merged them.
- Our function `sig_group` reads each label and puts it into one of 5 groups: P/LP, VUS, B/LB, Conflicting, Other.
- **Why the order matters:** the label "Conflicting classifications of pathogenicity" contains the word "pathogenic". If we checked for "pathogenic" first, it would land in the wrong group. So "conflicting" is checked first.
- **Stars:** the same trick turns review status text, such as "reviewed by expert panel", into a number from 0 to 4.

## Slide 14 · Outliers and data types

**On the slide:** three outlier cases (fake dates, many submitters, huge variants), each with its decision, and a note about data types.

**What to say:**

> Outliers. 111 review dates were before 1990, but ClinVar started in 2013, so they are impossible and we set them to empty. The standard IQR rule flags 22 percent of rows for having more than one lab, but those are real, popular variants, so we kept them. The top 0.1 percent of variant lengths are left out of the length charts only. Now [Presenter 2] takes you into the machine learning.

**What this means:**

- **Fake dates:** the oldest date was 1965. ClinVar didn't exist then, so these are placeholder values. We blanked them.
- **The IQR rule:** a standard math rule for spotting unusual values. Here it says anything above 1 lab is unusual, which flags 22% of rows. But popular variants really do get reported by many labs. That is real data, so we kept it. Lesson: not every statistical outlier is an error.
- **Huge variants:** a few changes span up to 159 million DNA letters. They are real, but they squash the length chart, so we left out the top 0.1% (anything over about 1.4 million letters) from that chart only. They stay in the data everywhere else.
- **Data types:** we loaded everything as text on slide 10. Here we converted positions and lab counts to numbers, review dates to real dates, and repeated text to "category" to save memory.

**Watch out:** if asked "how did you decide what is extreme?", the honest answer is that it depends on the case. Impossible values (1965) are errors. Rare but real values (many labs) are kept. The 0.1% cut is a choice we made so the chart is readable, not a law.

## Questions Presenter 1 may get

**Why does a genetic database make a good computer science project?** It is a real, messy, large dataset: 9 million rows, hidden missing values and duplicates. It exercises the whole pipeline: loading, cleaning, analysis and modeling.

**What is a "variant" in data terms?** One row: a change at one position on a chromosome, plus a label, a review level and how many labs reported it.

**Why do GRCh37 and GRCh38 matter?** They are two coordinate systems for the same genome. ClinVar lists every variant once per system, so combining both doubles every row.

**Why read the file in chunks?** Loading 9 million rows at once can run out of memory in Colab. Chunks of 500,000 kept peak memory at 3.7 GB.

**Why not drop rows with missing values?** One blank field doesn't erase the useful information in the other columns. We skip blanks only where a chart needs that column.

**Why keep the 22.5% submitter outliers?** The IQR limit is 1 lab, but popular variants really are reported by many labs. They are real data, not errors.

# Presenter 2: Machine learning and the eight charts

Slides 15–20. These are the hardest slides, so this chapter explains the most.

## Slide 15 · How we trained and tested the models

**On the slide:** eight numbered steps and a box with the fair-test rules.

**What to say:**

> Now we move from cleaning the data to machine learning. First, why we are doing it.
>
> Our cleaning showed that more than half of ClinVar is labeled "uncertain", which means doctors don't know yet if the change is harmful. So we asked a practical question: can a computer learn what a harmful change looks like, using only the facts we recorded about each variant, like its type, its length and how many labs reported it? If it can, it could help experts decide which uncertain variants to look at first.
>
> In machine learning this is called classification. We give the model a variant, and it answers with one of two labels: pathogenic, meaning harmful, or benign, meaning harmless. It is "supervised" because we train it on examples where the correct answer is already known.
>
> Now the steps, and the reason for each one.
>
> Step 1, only variants with a known answer. We kept only variants that experts labeled pathogenic or benign. A model can only learn from examples where we know the right answer. The uncertain variants have no answer, so we can't use them to teach. We keep them for the very end.
>
> Step 2, a sample. That leaves about 1.8 million variants. We took a random sample of 200 thousand, because training a random forest on 1.8 million rows is too slow in Colab. The sample keeps the same mix as the full data: about 21 percent pathogenic and 79 percent benign.
>
> Step 3, turning each variant into numbers. A model can only read numbers, not text. So each variant became 38 numbers, called features: its type, its chromosome, its length, how many labs reported it, its review stars and the year it was reviewed. Text categories, like "deletion", became yes-or-no columns.
>
> Step 4, a locked-away test set. 160 thousand variants are for training. 40 thousand are locked away and never used for learning. It is like testing your code on inputs it has never seen. If we tested on the training data, the model could just memorize the answers and look perfect.
>
> Step 5, three models on exactly the same data. First, a baseline that always answers "benign": the score a real model has to beat. Second, logistic regression, a simple model that adds up the features with weights and turns the total into a score. Third, a random forest: many decision trees, basically nested if-else rules, that vote together. One simple model and one flexible model lets us check whether the extra complexity is worth it. Because only 21 percent of the data is pathogenic, we told both real models to treat mistakes on the rare pathogenic class as more costly. Otherwise a model can score well by saying "benign" almost every time.
>
> Step 6, cross-validation. Before touching the locked-away data, we compare the models inside the training data: split it into five parts, train on four, check on the fifth, and repeat five times. That gives a score and how much it wobbles, so one lucky split can't decide.
>
> Step 7, one final exam on the 40 thousand locked-away variants. We do this once.
>
> Step 8, apply it. The winner scores all the uncertain variants.
>
> And one rule through all of it: no feature may contain the answer. That mistake is called leakage, and it makes a model look brilliant while learning nothing real.

**What this means:**

- **The goal:** a shortlist. 2.4 million variants are "uncertain", far too many for experts to review. A model that recognizes harmful-looking ones can point to where to start.
- **Where the labels come from:** we didn't invent them. They are the experts' verdicts in ClinVar's label column, grouped on slide 13. Pathogenic became 1, benign became 0.
- **What the model sees:** it never sees the DNA letters themselves. It sees a short row of facts per variant. Example: "deletion, chromosome 17, 1,200 letters long, 3 labs, 1 star, reviewed in 2021". From thousands of such rows with their answers, it learns which facts tend to go with "pathogenic".
- **Why "yes-or-no columns":** a model can't do math on the word "deletion". So "type" became several columns, such as "is it a deletion? 1 or 0", "is it a single-letter change? 1 or 0". This is called one-hot encoding.
- **Why the sample keeps the same mix:** if the sample had, say, 50% pathogenic, the model would learn a world that doesn't exist.
- **Why the test set is locked away:** the score on the test set is the honest one, because the model never learned from those variants.
- **Why a baseline:** without it, "79% accuracy" would sound good. The baseline shows that 79% is what you get for free.

## Slide 16 · Which model spots harmful variants?

**On the slide:** a bar chart with four groups (ROC-AUC, Accuracy, Recall, F1) and three colors (grey baseline, blue logistic regression, green random forest). On the right: "Winner: Random Forest" and "60,497".

**What to say:**

> Here are the results. Everything on this slide is measured only on the 40 thousand locked-away variants, the ones no model saw during training.
>
> Let's start with the grey bars, the baseline that always says "benign". It gets 79 percent accuracy. That sounds good, but it is a trap. Most variants are benign, so always guessing benign is right most of the time. Yet this baseline catches zero harmful variants. You can see it on the chart: its recall and F1 bars are at zero. And finding harmful variants is the whole point of our project. So accuracy alone would fool us. That is why we use two other measures.
>
> The first is recall. Look at all the variants that are truly pathogenic, and ask what share the model caught.
>
> The second is AUC. Imagine picking one truly pathogenic variant and one truly benign variant at random, and asking the model which one looks more harmful. AUC is how often it ranks the pathogenic one higher. 0.5 means guessing, like a coin flip. 1.0 means perfect.
>
> With those measures, both real models clearly learned something. Logistic regression gets an AUC of 0.78 and catches 56 percent of the pathogenic variants. The random forest, in green, is better on every measure: AUC 0.81, and it catches about 60 percent. It was also ahead in cross-validation, so it wasn't luck.

**What this means:**

- **How we know the baseline catches zero:** by design. It never answers "pathogenic", so it can't catch a harmful variant. The notebook output confirms it: recall 0.000.
- **Where 79% comes from:** the test set has 31,638 benign and 8,362 pathogenic variants. Always saying "benign" is right 31,638 times out of 40,000, which is 79.1%.
- **Reading the chart:** higher is better for all four groups. Green is the tallest in every group.
- **F1** combines recall with precision, so a model can't score well by flagging everything as harmful.
- **The right side:** after choosing the winner, we used it to score the uncertain variants. Slide 18 explains that number.

**Watch out:** the slide says 60,497, but the notebook's saved output says 59,650. Say "about 60 thousand" until you re-run the notebook and fix the slide.

## Slide 17 · Why the random forest wins

**On the slide:** an ROC curve (left), the random forest's confusion matrix (middle), and the inputs the forest relied on most (right).

**What to say:**

> Let's look at why the forest wins.
>
> On the left is the ROC curve. It shows a trade-off. Going right means accepting more false alarms: harmless variants wrongly flagged as harmful. Going up means catching more of the truly harmful ones. A perfect model would go straight up the left side, so the closer a line gets to the top-left corner, the better. The grey diagonal is pure guessing. The green forest line stays above the blue line the whole way. That is the 0.81 against 0.78.
>
> In the middle is the confusion matrix, just a table of right and wrong answers. In our test set there were 8,362 truly pathogenic variants. The forest found 4,982 of them, about 60 percent, and missed 3,380. It also raised 2,709 false alarms. The green boxes are correct answers, the grey boxes are mistakes.
>
> On the right are the inputs the forest relied on most. The top ones are the type of change and its length. Single-letter changes point toward benign, and deletions point toward pathogenic. That matches what our own charts showed before any machine learning. It is a good sanity check: the model learned a pattern that makes sense, not a random trick.

**What this means:**

- **The ROC curve** shows the same model at different strictness levels. A strict model flags only very suspicious variants: few false alarms, but more misses. A loose model flags more: more catches, but more false alarms. A better model gets more catches for the same number of false alarms.
- **The confusion matrix, box by box:**

| | Model said benign | Model said pathogenic |
|---|---|---|
| **Really benign** | 28,929 correct | 2,709 false alarms |
| **Really pathogenic** | 3,380 missed | 4,982 caught |

- Logistic regression caught 4,687 (56%), so the forest finds about 300 more harmful variants.
- **"Inputs it relied on most":** after training, the forest can report which inputs its trees used most to decide. Single-letter change (0.37), deletion (0.19), length (0.14) and year of review (0.12) lead.
- **Why single-letter means benign and deletion means pathogenic:** the model doesn't know biology. It counted. In the training data, deletions were usually labeled pathogenic, and single-letter changes rarely were. Our chart 6 shows the same: 61% of deletions are pathogenic, only about 5% of single-letter changes.
- **Why that makes sense biologically:** removing a chunk of DNA is like deleting lines of code. It often breaks a whole part. Swapping one letter is a smaller edit, and often the result still works. These are tendencies, not laws.

**Watch out:** say "the model relies on", not "this is what makes a variant harmful". Importance shows what the model used, not what causes disease.

## Slide 18 · Scoring the uncertain variants

**On the slide:** a histogram of scores for 2.4 million uncertain variants, "about 60K" and the limits.

**What to say:**

> Now the reason we built this model: the uncertain variants. The model never saw them during training. We now ask it about all 2.4 million of them: on a scale from 0 to 1, how much does this variant look like the known harmful ones?
>
> The histogram shows the answers. Most variants score around 0.3. Most uncertain variants are single-letter changes, which the model has learned are rarely harmful, but nothing about them is clear enough to call them harmless either. So they land in a "leans harmless, not sure" zone.
>
> But look at the far right. About 60 thousand variants, around 2.5 percent, score 0.8 or higher. They look a lot like known harmful variants. We chose 0.8 as the cut-off to flag only the strongest cases. A lower cut-off would flag more variants, with less confidence. Experts have limited time, and this gives them a shortlist to start with.
>
> We also need to be honest about the limits. The model still misses about 40 percent of harmful variants, so a low score does not mean safe. And it only sees what kind of change it is, not what the change actually does in the body. So this tool helps prioritize work. It does not diagnose anyone.

**What this means:**

- **The score:** for the random forest, it is the share of the 200 trees that voted "pathogenic". 60 of 200 trees voting pathogenic gives 0.3.
- **The histogram:** each bar is a group of variants with similar scores. Taller means more variants. The big lump is around 0.3. The small group past 0.8 is the shortlist.
- **The 0.8 cut-off is our choice,** not a law. It is a dial: lower flags more variants, higher flags fewer but more confident ones.
- **Why it misses 40%:** it only knows facts like type and length. It doesn't know what the change does to the protein the gene makes. Adding that would probably help.

**Watch out:** don't say "a score of 0.3 means a 30% chance of being harmful". Because we told the model to take the rare harmful class extra seriously, the scores are not true probabilities. Treat them as a ranking: higher means more like known harmful variants.

## Slide 19 · Predicting disagreement per gene

**On the slide:** two bar charts (R² and average error) for baseline, linear regression and random forest, plus a box: "A tie, so pick the simpler model", "+6.6" and "+0.6".

**What to say:**

> Our second machine learning task has a different goal. Instead of asking "is this variant harmful", we ask: why do labs disagree? Can we predict how often labs disagree about a gene?
>
> This is a regression problem. Classification gives a category, harmful or harmless. Regression gives a number. Here the number is the percentage of a gene's variants that have conflicting labels.
>
> We built one row per gene, for genes with at least 100 labeled variants: 7,288 genes. A percentage from just a few variants is too noisy. The model had three inputs: how many variants the gene has, the average number of labs per variant, and the share of single-letter changes.
>
> We deliberately left out the review stars. A conflicting variant's review status literally says "conflicting", so using it would give the model the answer. That is the leakage we mentioned earlier.
>
> We compared three models again: a baseline that always predicts the average, linear regression, and a random forest. Both real models explain about 72 percent of the differences between genes. That number is R squared: 0 means no better than the average, 1 means perfect. And the average error drops from about 2.2 percentage points to about 0.9.
>
> The two models tie. When a complex model doesn't beat a simple one, we choose the simple one, because we can read its formula. It says that each extra lab per variant adds about 6.6 points of conflict, while a gene ten times bigger adds only about 0.6. So disagreement is driven mostly by how many labs test a gene, not by how big the gene is. Part of this is built in, because you need at least two labs to have a conflict. But it explains why heavily tested genes, like BRCA1 and BRCA2, show so many conflicts.

**What this means:**

- **The question in plain words:** some genes have lots of lab disagreement, some have little. Can we predict which, from simple facts about the gene?
- **One row per gene:** for this task, each row is a gene, not a variant. Its answer is "what percentage of my variants are in conflict" (BRCA2: 26%).
- **R² of 0.72:** of all the up-and-down between genes, the model explains about 72%.
- **Average error:** the lazy guess ("every gene has the average conflict rate") is off by 2.16 points. The models are off by about 0.86, much closer.
- **Why pick the simpler model:** 0.723 against 0.725 is no real difference. Linear regression gives a readable formula. A forest of 200 trees can't be read.
- **The +6.6 and +0.6, with an example.** Linear regression gives a recipe: predicted conflict ≈ 6.6 × (average labs per variant) + 0.6 × (a size number) + a small rest.
  - Gene A has 1.5 labs per variant, gene B has 2.5. B is predicted to have about 6.6 percentage points more conflict.
  - Gene C has 100 variants, gene D has 1,000 (ten times more). D is predicted to have only about 0.6 points more.
  - So one extra lab per variant moves disagreement far more than a tenfold bigger gene.
- **Why labs matter more than size:** disagreement needs at least two labs looking at the same variant. A bigger gene has more variants, but that doesn't make labs disagree more often. More labs per variant means more chances that one sees things differently. Think of restaurant reviews: a longer menu doesn't create disagreement, but more reviewers per dish does.
- **Why labs disagree at all** (general background, not something our project tested): labs see different patients and evidence, judge at different times as knowledge grows, apply the shared rules with some judgment, and some variants sit right on the line between categories.

**Watch out:** don't say more labs *cause* disagreement as a fact. Say "genes tested by more labs tend to have more conflicts", and mention the built-in part.

## Slide 20 · The eight charts from the notebook

**On the slide:** all eight notebook charts in a grid, with short captions.

**What to say:**

> To close the notebook part, here are all eight charts we built in Python. They show the label mix, the top genes, reviews per year, how many labs report each variant, gene size against disagreement, the type of DNA change, the trust stars and the linked conditions. [Presenter 3] will now show you the same project in Power BI, where you can click through these views yourself.

**What this means:** This slide is a bridge. You don't explain each chart here. Presenter 3's dashboard and Presenter 4's insights do that.

## Questions Presenter 2 may get

**Why compare against a baseline?** Always saying "benign" already scores 79% accuracy but finds no pathogenic variants. A model must beat that to be useful.

**What do AUC and recall mean?** AUC: how well the model ranks harmful variants above harmless ones. 0.5 is a coin flip, 1.0 is perfect. Recall: of the truly harmful variants, the share we catch (about 60%).

**Why five-fold cross-validation?** One split can be lucky. Five rounds give a score and its spread, so we know the result is stable. The spread is tiny, about 0.002 AUC.

**Why only a 200,000-row sample?** A random forest on 1.8 million rows is too slow on Colab. The sample keeps the same 21% pathogenic share.

**Why leave the uncertain variants out of training?** We don't know their true label, so they can't be training answers. We score them afterwards.

**How do you know it isn't overfitting?** Overfitting means memorizing the training data. We limited the trees (200 trees, at most 12 questions deep, at least 5 variants per leaf), never tuned on the test set, and cross-validation and the final test give similar scores (about 0.80 and 0.81 AUC).

**Why does the random forest still miss about 40% of harmful variants?** Our features describe the kind of DNA change, not what it does in the body.

**Why not use review stars to predict conflict?** The review status of a conflicting variant literally says "conflicting", which would leak the answer.

# Presenter 3: The Power BI version and the live demo

Slides 21–25.

## Slide 21 · Part 3 divider · The Power BI Version

**What to say:**

> Thank you. We rebuilt the same project in Power BI, to make the results interactive.

## Slide 22 · Loading 4.6 million rows into Power BI

**On the slide:** five steps: Get Data, Parse, Headers, Combine, Choose columns.

**What to say:**

> For Power BI we kept only the GRCh38 rows, because Power BI loaded extremely slowly with 9 million rows on some of our devices, and we would have filtered to GRCh38 anyway. The result is 21 tab-separated files. Get Data, Folder reads them and stacks them into one table, like a UNION in SQL. Two settings matter: QuoteStyle None, and promoting the first row to headers once per file.

**What this means:**

- **Why 21 files:** one giant file was hard to download and open reliably, so the data was split into parts under 100 MB each.
- **Get Data → Folder:** Power BI reads every file in a folder and stacks them on top of each other into one long table. In SQL, stacking tables like this is called UNION.
- **QuoteStyle None:** some ClinVar text contains stray quote marks. Normally a quote mark means "the text continues until the next quote", which would push values into the wrong columns without any error. This setting tells Power BI to treat quote marks as ordinary characters.
- **Headers once per file:** each file starts with a row of column names. Power BI must use that row as the names in every file, not as data.

## Slide 23 · Same cleaning, two tools

**On the slide:** a table comparing each cleaning step in Python and in Power BI.

**What to say:**

> Every cleaning step has a Power BI twin. Drop duplicates becomes Remove Duplicates, the missing-value codes are replaced in one step, types are set with Change Type, the outlier checks become DAX measures, and the label groups and stars become custom columns. The big difference is the output: eight static charts in Python, one interactive dashboard in Power BI.

**What this means:**

- Power Query is Power BI's cleaning tool. Each step you click is recorded and re-run whenever the data refreshes, a bit like a saved script.
- **DAX** is Power BI's formula language. DAX measures are calculations, like "count of variants before 1990".
- **Custom columns** are new columns built from formulas, the same idea as our Group and Stars columns in Python.
- **Static versus interactive:** Python gives finished pictures. Power BI lets the viewer filter and click.

## Slide 24 · Live demo: the dashboard reacts

**On the slide:** four numbered demo steps.

**What to say:**

> Let me show it live. [Clear all slicers first.] One: tick P/LP in the slicer, which is a filter widget, and the cards and charts show only harmful variants. Two: pick chromosome 17, where BRCA1 sits, and BRCA1 climbs in the gene chart. Three: drag the year range to 2023 to 2025. Four: click the Deletion bar, and every other visual filters to deletions. [Clear everything with the eraser icon, then return to the slides.]

**What this means:**

- **Slicer:** a filter control on the dashboard. Picking a value filters every chart at once.
- **Cross-filtering:** clicking a bar in one chart filters all the other charts too. This is the main thing static Python charts can't do.
- **Why clear the slicers first and last:** so the numbers on screen match the slides before and after the demo.

## Slide 25 · Part 4 divider · Analysis & Insights

**What to say:**

> Both tools found the same patterns. Now [Presenter 4] takes you through what the data shows.

## Questions Presenter 3 may get

**Why 21 files instead of one?** The single file was too big to download and extract reliably. Each part is under 100 MB, and Power BI's Folder import combines them.

**Why does the Power BI data start at 4.6 million rows?** The GRCh38 filter was applied before loading. Every variant is listed once per genome map.

**What is QuoteStyle.None for?** ClinVar text contains stray quote marks. Without it, values shift into the wrong columns without any error.

**Why use Power BI as well as Python?** Python is better for custom cleaning and machine learning. Power BI makes the same results interactive for people who don't code.

# Presenter 4: Insights, takeaways and questions

Slides 26–33.

## Slide 26 · More than half is still "we don't know"

**On the slide:** circles sized by share: 54.6% uncertain, 32.5% benign, 8.6% pathogenic, 4.2% conflicting.

**What to say:**

> Thank you. First: more than half of all labeled variants, 54.6 percent, are uncertain, and only 8.6 percent are known to cause disease. In data terms, the biggest class in this dataset is "unknown". So a genetic test is more likely to say "we don't know" than anything else.

**What this means:** If someone's DNA test finds a change, the most likely ClinVar answer is "uncertain". This is the main finding of the whole project, and it's why the machine learning tried to help with the uncertain pile.

## Slide 27 · Unknowns are growing faster than answers

**On the slide:** a line chart of variants by year of last review, 2012 to 2025.

**What to say:**

> The unknowns are growing faster than the answers. Reviews jumped from about 33 thousand variants in 2017 to 1.36 million in 2025, and 877 thousand of the 2025 reviews were uncertain. Data is being collected faster than it can be labeled.

**What this means:** DNA testing is getting cheaper, so labs find new variants much faster than research can explain them. The uncertain line rises far faster than the others.

**Watch out:** the chart uses the date of the *latest* review. A variant first reviewed in 2015 and reviewed again in 2025 counts in 2025. That is partly why 2025 is so high.

## Slide 28 · Most labels rest on one lab's opinion

**On the slide:** a bar chart of review stars, with 77.4% and 0.5% called out.

**What to say:**

> Most labels rest on one source: 77 percent of variants come from a single lab, and only half a percent were checked by an expert panel. Like code with no code review, check the stars before trusting a label.

**What this means:** A 1-star label is one lab's opinion, never double-checked. That's fine as a starting point, but it's weaker evidence than an expert panel's verdict.

## Slide 29 · Experts disagree most on breast-cancer genes

**On the slide:** a bar chart of the percentage of conflicting labels for big genes, led by BRCA2 (26.4%) and BRCA1 (21.6%).

**What to say:**

> Experts disagree most on well-known breast cancer genes. In BRCA2, one in four variants has conflicting labels. These are the most tested genes in the world, so more labs means more chances to disagree. That is exactly what our regression found.

**What this means:** This is the real-world example of slide 19. BRCA1 and BRCA2 are tested by many labs, so they have many chances for different verdicts.

## Slide 30 · Big DNA changes are easier to judge

**On the slide:** a stacked bar chart of the label mix by type of change, with 61% and 57% called out.

**What to say:**

> Big DNA changes are easier to judge: 61 percent of deletions are pathogenic, while 57 percent of single-letter changes are uncertain. Our classifier agreed: the type of change was its most important feature.

**What this means:**

- A big change, such as a deletion, is often clearly harmful, so experts can label it.
- A single-letter change is subtle, so experts often can't tell, and it ends up "uncertain".
- This links to slide 17: the model's top input was the type of change.

## Slide 31 · Which genes and diseases come up most

**On the slide:** two bar charts: top genes and top linked conditions by number of pathogenic variants.

**What to say:**

> Which genes and conditions come up most? TTN, BRCA2 and NF1 lead the genes, and hereditary cancer leads the conditions by far. TTN is simply the largest human gene, so it has the most places to change.

**What this means:**

- A gene with more DNA letters has more places where a harmful change can happen. That is why TTN leads.
- BRCA2 and NF1 lead because they are tested very often and linked to serious diseases.
- "Hereditary cancer" means cancer risk passed down in families. It is by far the most common linked condition.

## Slide 32 · Key takeaways

**On the slide:** four takeaways and a "why it matters" line.

**What to say:**

> To sum up. Fifty-five percent of variants are still unknown, and that pile grows every year. Most labels come from one lab and are rarely expert-checked. Disagreement is highest where testing is highest. And none of this was visible until we cleaned the data, in both Python and Power BI. Garbage in, garbage out.

**What this means:** These four lines answer the four questions from slide 8. "Garbage in, garbage out" means that a messy dataset gives wrong answers, which is why so much of the project was cleaning.

## Slide 33 · Thank you! Questions?

**What to say:**

> Thank you for listening. We're happy to take your questions, and we can open the notebook or the dashboard if you'd like to see either.

## Questions Presenter 4 may get

**Why does 2025 look so high in the year chart?** The chart uses the latest review date, so re-reviewed variants move into recent years.

**Can this tell a patient if they are sick?** No. These are patterns in a public database, not medical advice. We never change an expert's label.

**Why are BRCA genes so prominent?** They are among the most tested genes in the world, so they collect the most submissions, and the most disagreement.

# Numbers cheat sheet

| What | Number |
|---|---|
| Rows in the raw file | 9,354,555 |
| Columns in the raw file | 43 |
| Columns loaded / worked with | 12 / 11 |
| Rows kept after the GRCh38 filter | 4,643,623 |
| Duplicates removed | 2,420 |
| Unique variants | 4,641,203 |
| Variants with a label | 4,391,047 |
| Hidden missing codes replaced | 2.86 million cells |
| Rows with no condition | 45% |
| Label spellings → groups | 104 → 5 |
| Fake dates before 1990 | 111 (oldest 1965) |
| Rows flagged by the IQR rule (kept) | 22.5% |
| Uncertain (VUS) | 54.6% (2,398,705) |
| Benign (B/LB) | 32.5% (1,425,907) |
| Pathogenic (P/LP) | 8.6% (376,848) |
| Conflicting | 4.2% (184,341) |
| Variants from a single lab | 77.4% |
| Checked by an expert panel | 0.5% |
| ML sample / features | 200,000 / 38 |
| Train / test | 160,000 / 40,000 |
| Pathogenic share | about 21% |
| Baseline accuracy | 79% (recall 0) |
| Logistic regression AUC / recall | 0.78 / 56% |
| Random forest AUC / recall | 0.81 / 60% |
| Harmful variants caught by the forest | 4,982 of 8,362 |
| False alarms by the forest | 2,709 |
| Uncertain variants scored | 2.4 million |
| Scoring 0.8 or higher | about 60 thousand (2.5%) |
| Genes in the regression | 7,288 |
| R², linear regression / forest | 0.723 / 0.725 |
| Average error, baseline / linear | 2.16 / 0.86 points |
| Conflict per extra lab per variant | +6.6 points |
| Conflict for a 10× bigger gene | +0.6 points |
| BRCA2 conflicting labels | 26.4% |
| Deletions that are pathogenic | 61% |
| Single-letter changes that are uncertain | 57% |

# What I changed, and what to fix before presenting

## Changes I made in the script

- **Slides 9 and 10:** you had merged them as "Slide 9-10", starting with "Thank you". Since Presenter 1 now keeps talking, slide 9 says "Now the cleaning, in the order we did it", and slide 10 no longer starts with "Thank you".
- **Slide 14:** added the hand-over line to Presenter 2 at the end.
- **Slide 7:** the script now says "we loaded 12 columns and worked with 11", so it matches both the slide's title and its table.
- **Slide 16:** added one line pointing at the zero bars, so the audience can see that the baseline catches nothing.
- **Slide 18:** "look like neither group very strongly" became "leans harmless, not sure", which matches what a score around 0.3 means.
- **Questions:** the cleaning questions moved from Presenter 2 to Presenter 1, because Presenter 1 now presents the cleaning.

## Fix before presenting

1. **60,497 against 59,650.** Slide 16 says 60,497 uncertain variants score 0.8 or higher. Your notebook's saved output says 59,650. Say "about 60 thousand" until you re-run the notebook and update the slide.
2. **Gene counts don't match.** The appendix table below says TTN 6,134, BRCA2 5,779 and PKD1 2,559. Slide 31's chart says 6,143, 5,790 and 2,593. Check which is right.
3. **Time.** The machine learning slides are now much longer. Do a timed run-through and trim if you go over 15 minutes.
4. **The PowerPoint repair prompt.** Confirm the latest deck opens without it.

# Appendix: top 10 genes in plain language

Use this if someone asks what a gene does. The counts are from your original script. See fix number 2 above.

| # | Gene | Pathogenic variants | What it does | What goes wrong when it breaks |
|---|---|---|---|---|
| 1 | TTN | 6,134 | Builds titin, a giant "spring" protein that keeps muscles, including the heart, stretchy | Weak, enlarged heart muscle (cardiomyopathy) |
| 2 | BRCA2 | 5,779 | Part of the cell's DNA repair crew: it fixes broken DNA before damage builds up | Much higher risk of breast, ovarian and prostate cancer |
| 3 | NF1 | 5,740 | A brake on cell growth | Cells grow unchecked, causing lumps on the nerves and skin spots (neurofibromatosis type 1) |
| 4 | BRCA1 | 4,330 | Another member of the DNA repair crew, working alongside BRCA2 | Much higher risk of breast and ovarian cancer |
| 5 | ATM | 3,908 | The cell's damage alarm: it spots broken DNA and calls the repair crew | Higher cancer risk; when both copies are broken, a rare movement and immune disorder (ataxia-telangiectasia) |
| 6 | FBN1 | 3,742 | Builds fibrillin, the "elastic glue" that holds connective tissue together, like the walls of blood vessels | Marfan syndrome: very tall, long limbs, and a dangerously weak main artery (aorta) |
| 7 | APC | 2,640 | A gatekeeper that stops gut cells from multiplying too much | Hundreds of growths (polyps) in the colon and a very high risk of colon cancer |
| 8 | PKD1 | 2,559 | Helps kidney cells keep their shape, like a structural sensor | Fluid-filled cysts in the kidneys (polycystic kidney disease) that can lead to kidney failure |
| 9 | DMD | 2,471 | Builds dystrophin, a "shock absorber" that protects muscle cells when they contract | Muscles slowly break down (Duchenne / Becker muscular dystrophy), mostly in boys |
| 10 | USH2A | 2,320 | Builds a protein that keeps the light-sensing cells in the eye and the hearing cells in the ear working | Hearing loss from birth plus vision loss over time (Usher syndrome) |
