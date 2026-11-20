"""
Sentinel AI - Unit Tests for Effective Cluster Maximum Confidence & Severity Logic
Validates that compute_severity() derives its triage ratings exclusively from valid
clustered detections, ignoring invalid/zero-area bounding boxes.
"""

import sys
from pathlib import Path
import pytest

# Ensure the backend directory is in sys.path so app.services resolves reliably from any working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.yolo_service import compute_severity, cluster_detections


def test_invalid_zero_area_box_returns_low():
    """An invalid zero-area box at 95% confidence must produce 0 clusters and return Low."""
    detections = [
        {
            "id": "det-zero",
            "damageType": "Pothole",
            "confidence": 95.0,
            "boundingBox": {"x1": 50.0, "y1": 50.0, "x2": 50.0, "y2": 50.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 0, "Zero-area boxes must not form valid clusters"

    severity = compute_severity(detections, max_confidence=95.0)
    assert severity == "Low", "Zero-area detection at 95% must not trigger Critical; expected Low"


def test_invalid_inverted_box_returns_low():
    """An invalid inverted box (x2 < x1, y2 < y1) at 99% confidence must return Low."""
    detections = [
        {
            "id": "det-inverted",
            "damageType": "Pothole",
            "confidence": 99.0,
            "boundingBox": {"x1": 100.0, "y1": 100.0, "x2": 80.0, "y2": 80.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 0, "Inverted boxes must not form valid clusters"

    severity = compute_severity(detections, max_confidence=99.0)
    assert severity == "Low", "Inverted detection at 99% must not trigger Critical; expected Low"


def test_invalid_95_box_plus_valid_20_box_returns_medium():
    """An invalid 95% box plus a valid 20% box must evaluate to Medium, NOT Critical."""
    detections = [
        {
            "id": "det-invalid",
            "damageType": "Pothole",
            "confidence": 95.0,
            "boundingBox": {"x1": 50.0, "y1": 50.0, "x2": 50.0, "y2": 50.0}  # zero-area
        },
        {
            "id": "det-valid",
            "damageType": "Pothole",
            "confidence": 20.0,
            "boundingBox": {"x1": 10.0, "y1": 10.0, "x2": 60.0, "y2": 60.0}  # valid 50x50 box
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1, "Only the valid box should form a cluster"
    assert clusters[0]["max_conf"] == 20.0, "Effective maximum confidence must be 20%, not 95%"

    # Even if caller passes max_confidence=95.0, compute_severity derives from valid clusters
    severity = compute_severity(detections, max_confidence=95.0)
    assert severity == "Medium", "Severity must be Medium (derived from 20% valid cluster), NOT Critical"


def test_one_valid_cluster_at_10_percent_returns_low():
    """One valid cluster at 10% confidence is below the Medium (15%) threshold -> Low."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 10.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1

    severity = compute_severity(detections, max_confidence=10.0)
    assert severity == "Low"


def test_one_valid_cluster_at_20_percent_returns_medium():
    """One valid cluster at 20% confidence meets the Medium (15% - 44.9%) threshold -> Medium."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 20.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1

    severity = compute_severity(detections, max_confidence=20.0)
    assert severity == "Medium"


def test_one_valid_cluster_at_50_percent_returns_high():
    """One valid cluster at 50% confidence meets the High (>= 45%, < 85%) threshold -> High."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 50.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1

    severity = compute_severity(detections, max_confidence=50.0)
    assert severity == "High"


def test_one_valid_cluster_at_90_percent_returns_critical():
    """One valid cluster at 90% confidence meets the single-cluster Critical (>= 85%) threshold -> Critical."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 90.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1

    severity = compute_severity(detections, max_confidence=90.0)
    assert severity == "Critical"


def test_two_valid_clusters_at_80_and_80_returns_critical():
    """Two distinct valid clusters each having confidence >= 75% -> Critical."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 80.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        },
        {
            "id": "det-2",
            "damageType": "Pothole",
            "confidence": 80.0,
            "boundingBox": {"x1": 200.0, "y1": 200.0, "x2": 250.0, "y2": 250.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 2, "Disjoint boxes must form 2 separate clusters"
    assert all(c["max_conf"] >= 75.0 for c in clusters)

    severity = compute_severity(detections, max_confidence=80.0)
    assert severity == "Critical"


def test_two_valid_clusters_at_90_and_20_returns_critical():
    """Two distinct clusters where one has 90% (>= 85%) -> Critical."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 90.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        },
        {
            "id": "det-2",
            "damageType": "Pothole",
            "confidence": 20.0,
            "boundingBox": {"x1": 200.0, "y1": 200.0, "x2": 250.0, "y2": 250.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 2

    severity = compute_severity(detections, max_confidence=90.0)
    assert severity == "Critical"


def test_two_valid_clusters_at_80_and_20_returns_high():
    """Two distinct clusters where neither is >= 85% and only one is >= 75% -> High (two-cluster rule)."""
    detections = [
        {
            "id": "det-1",
            "damageType": "Pothole",
            "confidence": 80.0,
            "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 50.0, "y2": 50.0}
        },
        {
            "id": "det-2",
            "damageType": "Pothole",
            "confidence": 20.0,
            "boundingBox": {"x1": 200.0, "y1": 200.0, "x2": 250.0, "y2": 250.0}
        }
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 2

    severity = compute_severity(detections, max_confidence=80.0)
    assert severity == "High", "80% and 20% across two clusters must evaluate to High, NOT Critical"


def test_cluster_connected_component_transitive_merging():
    """Three connected boxes (Box C overlapping disjoint Box A and Box B) must merge into 1 cluster."""
    detections = [
        {"id": "A", "confidence": 50.0, "boundingBox": {"x1": 0.0, "y1": 0.0, "x2": 100.0, "y2": 100.0}},
        {"id": "B", "confidence": 60.0, "boundingBox": {"x1": 150.0, "y1": 0.0, "x2": 250.0, "y2": 100.0}},
        {"id": "C", "confidence": 70.0, "boundingBox": {"x1": 60.0, "y1": 0.0, "x2": 190.0, "y2": 100.0}}
    ]
    clusters = cluster_detections(detections)
    assert len(clusters) == 1, "Transitive overlapping boxes must form 1 single cluster"
    assert clusters[0]["max_conf"] == 70.0
