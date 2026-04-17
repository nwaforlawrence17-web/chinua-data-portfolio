# Construction Intelligence Platform
### End-to-End Analytics Pipeline for Multi-Regional Risk Discovery

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Tests: Pytest](https://img.shields.io/badge/Tests-Pytest-green.svg)](https://docs.pytest.org/en/7.1.x/)

---

## 🔗 Live Demo
Access the interactive dashboard and full case study:  
👉 **[chinua-data-porfolio.vercel.app](https://chinua-data-porfolio.vercel.app)**

---

## 📋 Executive Summary
This platform is a standalone data engineering and analytics solution designed for executive oversight of high-value construction portfolios. It automates the lifecycle from **Raw Data Ingestion** to **Strategic Risk Insight**, specifically engineered to handle the complexities of multi-currency, multi-regional operational datasets.

## 🚀 Key Features
- **Automated ETL Pipeline:** Sanitizes and standardizes 2,240+ inconsistent operational records.
- **Regional Currency Normalization:** Real-time conversion of NGN, KES, GHS, and ZAR into a unified USD baseline for global parity.
- **Financial Risk Discovery:** Automated identification of cost-variance "leakage" across 4 international regions.
- **Interactive Executive Dashboard:** Glassmorphism UI delivering real-time portfolio health monitoring via Plotly.js.
- **Strategic Briefing:** Auto-generated executive summaries highlighting contractors with the highest risk profiles.

## 🛠️ Tech Stack
- **Engine:** Python (Pandas, NumPy, Re)
- **Visualization:** Plotly.js, Glassmorphism UI (HTML5/CSS3)
- **Testing:** Pytest (Unit & Integration)
- **Documentation:** Markdown (Strategic Briefing Engine)

## 📈 Business Impact
- **Recovery Identification:** Uncovered **$7.8M** in gross cost overruns across the portfolio.
- **Operational Efficiency:** Identified regional "Downtime Loops" leading to a average 12% delay rate in KES-denominated projects.
- **Decision Speed:** Reduced monthly executive reporting cycles from 3 days to **under 5 seconds** via automated pipeline execution.

## 🧪 Testing & Reliability
This system follows senior engineering standards with a dedicated test suite verifying all mathematical and cleaning logic.

To run the full test suite:
```powershell
pytest
```
*Current Coverage: 11/11 tests passing (Currency Conversion, KPI Logic, Data Cleaning).*

---
*Created for senior executive analytics and portfolio optimization.*
