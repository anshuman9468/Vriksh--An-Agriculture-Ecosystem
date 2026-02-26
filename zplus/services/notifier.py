import logging
from typing import List

from models.schemas import Alert
from .file_reader import read_risk_output


logger = logging.getLogger(__name__)


def derive_alerts_from_risk() -> List[Alert]:
    """
    Convert risk scores into human-readable alerts.

    This is intentionally simple: high-risk harvests generate HIGH_RISK alerts.
    """
    risk_records = read_risk_output()
    alerts: List[Alert] = []

    for record in risk_records:
        risk_score = int(record.get("risk_score", 0))
        harvest_id = int(record.get("harvest_id", 0))

        if risk_score >= 70:
            level = record.get("risk_level", "HIGH")
            message = record.get(
                "message",
                "High transport or market risk detected",
            )
            alerts.append(
                Alert(
                    type="HIGH_RISK",
                    harvest_id=harvest_id,
                    message=f"{message} (risk_level={level}, score={risk_score})",
                    related_markets=record.get("markets") or None,
                )
            )

    return alerts
