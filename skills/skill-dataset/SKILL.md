---
name: skill-dataset
description: >
  Pose reference dataset research, construction, and validation for kinalyze-data repo.
  Use this skill for: researching correct joint angle ranges via NotebookLM, documenting
  findings in Obsidian, downloading and processing Kaggle pose datasets, extracting
  MediaPipe landmarks from videos/images, deriving JSON threshold models, and validating
  models against test samples. Trigger on: "research exercise angles", "process Kaggle
  dataset", "extract landmarks", "build reference model", "validate thresholds",
  "update the JSON model", or any data pipeline task in kinalyze-data.
  NOTE: This skill integrates with your existing NotebookLM and Obsidian skills —
  use those for the research phase, then return here for the data pipeline steps.
---

# skill-dataset — Kinalyze Data Pipeline

## Pipeline Overview

```
Phase 1: Research (NotebookLM + Obsidian)
    → validated angle ranges per exercise
          ↓
Phase 2: Kaggle Dataset Processing
    → landmark CSVs from public pose datasets
          ↓
Phase 3: Threshold Derivation
    → JSON model files with min/max angles
          ↓
Phase 4: Validation
    → test against team recordings, adjust tolerances
          ↓
Output: arm_lift_model.json, leg_raise_model.json, squat_model.json
```

## Reference Map

| Task | File |
|------|------|
| Research phase (angles from literature) | Use your NotebookLM + Obsidian skills |
| Kaggle download + landmark extraction | `references/kaggle-pipeline.md` |
| JSON model construction + validation | `references/model-builder.md` |

---

## Repo Layout
```
kinalyze-data/
├── research/
│   ├── arm_lift_angles.md       # Obsidian export — research findings
│   ├── leg_raise_angles.md
│   └── squat_angles.md
├── datasets/
│   └── raw/                     # gitignored (large files)
├── notebooks/
│   ├── 01_landmark_extraction.ipynb
│   ├── 02_threshold_derivation.ipynb
│   └── 03_validation.ipynb
├── models/                      # committed — these are the outputs
│   ├── arm_lift_model.json
│   ├── leg_raise_model.json
│   └── squat_model.json
├── validation/
│   ├── test_videos/             # gitignored
│   └── ground_truth.csv         # joint annotations
└── requirements-data.txt
```

## requirements-data.txt
```
mediapipe==0.10.14
opencv-python==4.9.0.80
numpy==1.26.4
pandas==2.2.0
matplotlib==3.8.0
kaggle==1.6.12
jupyter==1.0.0
```

---

## Research Integration Notes

When using NotebookLM for angle research:
- Search for: "physiotherapy exercise joint angles", "squat biomechanics knee angle",
  "shoulder abduction range of motion", "hip flexion normal range"
- Target sources: PubMed, physiotherapy clinical guidelines, sports science journals
- Extract: min/max angle ranges for correct form, common error patterns

When documenting in Obsidian:
- Create one note per exercise: `[[arm-lift-angles]]`, `[[squat-angles]]`, `[[leg-raise-angles]]`
- Use frontmatter: `exercise`, `source`, `min_angle`, `max_angle`, `confidence`
- Tag with `#kinalyze-research` for easy retrieval
- Export as Markdown to `kinalyze-data/research/` when ready for pipeline

---

## Reference Files

- **`references/kaggle-pipeline.md`** — Kaggle CLI setup, dataset selection, landmark extraction notebook
- **`references/model-builder.md`** — Threshold derivation, JSON model schema, validation workflow
