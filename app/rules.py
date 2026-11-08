from __future__ import annotations

REGULATORY_PROFILES = {
    "IN": {
        "code": "IN-FSSAI",
        "name": "India · FSSAI",
        "authority": "Food Safety and Standards Authority of India",
        "framework": "Food Safety and Standards Act, 2006 · Section 28; Food Safety and Standards (Food Recall Procedure) Regulations, 2017",
        "requirements": [
            "Maintain traceable records for the affected food and relevant distribution chain.",
            "Where the operator has reason to believe food is non-compliant, initiate withdrawal/recall procedures and inform the competent authority as required.",
            "Coordinate with supplied businesses and verify that affected product is no longer distributed or sold.",
            "Track returned product, recall progress and follow-up actions; preserve the post-recall record.",
        ],
        "workflow": ["Confirm affected food and lot codes", "Map supplier, processing and distribution records", "Prepare required authority and recipient information", "Coordinate withdrawal / recall actions", "Verify recipients stopped sale and distribution", "Reconcile returns and complete post-recall review"],
        "sources": [
            {"label": "FSSAI · Food Recall", "url": "https://fssai.gov.in/food-law/food-recall"},
            {"label": "FSSAI · Food Recall FAQs", "url": "https://fssai.gov.in/upload/uploadfiles/files/08_05_2024-Frequently%20Asked%20Questions%20on%20food%20recall-%20revised.pdf"},
        ],
        "notice": "Operational checklist only. This is not legal advice or an official FSSAI filing. Confirm current requirements with qualified regulatory counsel and the competent authority.",
    },
    "US": {
        "code": "US-FDA",
        "name": "United States · FDA",
        "authority": "U.S. Food and Drug Administration",
        "framework": "Applicable FDA recall guidance and, where applicable, 21 CFR Part 117 / FSMA requirements",
        "requirements": [
            "Assess the hazard and determine whether a recall is appropriate with qualified decision-makers.",
            "Maintain a written recall plan where required by applicable preventive-controls rules.",
            "Identify consignees and prepare direct notification and public communication as appropriate.",
            "Conduct effectiveness checks and document product disposition and recall progress.",
            "Apply FSMA Section 204 enhanced traceability obligations only to covered foods, entities and activities.",
        ],
        "workflow": ["Assess hazard and affected product scope", "Identify direct consignees and distribution records", "Prepare recall communications and strategy", "Coordinate removal and product disposition", "Perform effectiveness checks", "Document outcome and required notifications"],
        "sources": [
            {"label": "FDA · Recalls, Market Withdrawals & Safety Alerts", "url": "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"},
            {"label": "FDA · Recalls Guidance and Industry Resources", "url": "https://www.fda.gov/food/compliance-enforcement-food/industry-guidance-recalls"},
            {"label": "FDA · Food Traceability Rule", "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods"},
        ],
        "notice": "Operational checklist only. FDA requirements are fact-specific. FSMA Section 204 applies to covered foods and activities; the FDA has announced it will not enforce the traceability rule before July 20, 2028. Confirm current rules with qualified counsel.",
    },
}

def profile_for_market(market: str) -> list[dict]:
    if market == "IN": return [REGULATORY_PROFILES["IN"]]
    if market == "US": return [REGULATORY_PROFILES["US"]]
    return [REGULATORY_PROFILES["IN"], REGULATORY_PROFILES["US"]]
