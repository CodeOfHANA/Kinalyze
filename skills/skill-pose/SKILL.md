---
name: skill-pose
description: >
  All pose estimation, joint angle calculation, body normalization, and MediaPipe
  integration work in kinalyze-backend. Use this skill whenever working on pose detection,
  landmark extraction, angle math, threshold comparison, confidence filtering, or
  body-type normalization. Trigger on tasks like "wire up MediaPipe", "calculate joint
  angle", "compare pose against reference model", "normalize for body type", "build
  the analyze endpoint", or any Python code touching landmarks, keypoints, or exercise
  evaluation logic.
---

# skill-pose — Kinalyze Pose Engine

Read the relevant reference file before writing any pose-related code.

## Reference Map

| Task | File |
|------|------|
| MediaPipe setup + landmark extraction | `references/mediapipe.md` |
| Angle calculation + normalization | `references/angles.md` |
| Threshold comparison + feedback logic | `references/threshold.md` |
| FastAPI `/analyze` endpoint integration | See `skill-fastapi` |

---

## Core Concepts

### Coordinate System
MediaPipe returns normalized coordinates: `x`, `y` in [0,1] relative to frame dimensions,
`z` for depth (less reliable from webcam), `visibility` in [0,1].

Always multiply by frame dimensions before pixel operations:
```python
px = landmark.x * frame_width
py = landmark.y * frame_height
```

### Visibility Filtering — Always Apply
```python
MIN_VISIBILITY = 0.6

def is_visible(lm) -> bool:
    return lm.visibility >= MIN_VISIBILITY
```
Never compute angles on landmarks below this threshold — suppress feedback instead.

### The Three-Step Pipeline
```
Frame (JPEG bytes)
    ↓
1. MediaPipe → 33 landmarks + visibility scores
    ↓
2. Angle calculator → joint angles (normalized by limb ratios)
    ↓
3. Threshold comparator → feedback {message, isCorrect, joint, angle}
```

---

## Body-Type Normalization — Core USP

Never compare raw pixel distances. Always use **limb-ratio normalization**:
compute angles using vector math (dot product), which is inherently scale-invariant.

```python
import numpy as np

def angle_between(a: tuple, b: tuple, c: tuple) -> float:
    """
    Angle at point B formed by vectors BA and BC.
    Works regardless of body size, distance from camera, or frame resolution.
    a, b, c are (x, y) tuples in any consistent unit.
    """
    ba = np.array(a) - np.array(b)
    bc = np.array(c) - np.array(b)
    cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
    return float(np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0))))
```

This is the **only** angle function to use. Never use pixel-distance ratios.

---

## Reference Model Format

```json
{
  "exercise": "squat",
  "phases": [
    {
      "phase": "bottom",
      "joints": [
        {
          "name": "right_knee",
          "landmarks": [24, 26, 28],
          "min_angle": 80,
          "max_angle": 100,
          "tolerance": 5,
          "feedback_low": "Bend your knee more — aim for 90°",
          "feedback_high": "Don't overextend — ease up slightly"
        }
      ]
    }
  ]
}
```

MediaPipe landmark indices for key joints:
```python
LANDMARK_INDICES = {
    "left_shoulder": 11,  "right_shoulder": 12,
    "left_elbow":    13,  "right_elbow":    14,
    "left_wrist":    15,  "right_wrist":    16,
    "left_hip":      23,  "right_hip":      24,
    "left_knee":     25,  "right_knee":     26,
    "left_ankle":    27,  "right_ankle":    28,
}
```

---

## Reference Files

- **`references/mediapipe.md`** — MediaPipe install, initialization, frame processing, landmark extraction
- **`references/angles.md`** — Angle calculation for all 3 exercises, phase detection, velocity check
- **`references/threshold.md`** — Threshold comparison, feedback priority, rep counting, session scoring
