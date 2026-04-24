# 📊 xlookup Retail_Sales_Project

## 🚀 Project Overview
This project demonstrates an end-to-end data engineering and business intelligence pipeline. It starts with a intentionally "messy" and incomplete retail sales dataset and transforms it into a production-ready analysis environment through automated Python-driven Excel manipulation and a live interactive dashboard.

The core of the engineering logic centers on **automated XLOOKUP injections** to resolve missing product names, categories, and unit prices from secondary lookup tables, ensuring 100% data integrity before billionaire-level insights are generated.

---

## 🛠️ Tech Stack
*   **Engineering**: Python 3.x
*   **Data Processing**: Pandas, OpenPyXL
*   **Business Intelligence**: Streamlit
*   **Visualizations**: Plotly Express, Plotly Graph Objects
*   **Automation**: Custom Python ETL scripts

---

## 💎 Key Features

### 1. Automated XLOOKUP Pipeline
*   **Before State**: 200 raw transaction rows with critical blanks in `Product_Name`, `Category`, and `Unit_Price`.
*   **Transformation**: Python script scans `Product_Lookup` and `Supplier_Lookup` tables to resolve all missing identifiers.
*   **Calculations**: Automated computation of `Total_Sales` accounting for quantity, unit price, and dynamic discount percentages.
*   **Output**: Official Excel `SalesTable` with standardized formatting and zero null values.

### 2. Side-by-Side QA Reporting
*   **Data Quality Comparison**: A dedicated report sheet that tracks "Before vs After" metrics, proving exactly how many records were salvaged and standardizing the proof-of-work for stakeholders.

### 3. Interactive executive Dashboard
*   **Live Metrics**: Real-time tracking of Total Revenue, Transactions, and Units Sold.
*   **Visual Insights**:
    *   📍 Revenue by Region (Horizontal Bar)
    *   🛒 Revenue by Product (Top 10)
    *   📈 Monthly Revenue Trend (Area Chart)
*   **Dynamic Filtering**: Sidebar controls for `Region` and `Category` allow for instant granular analysis.

---

## 📁 Project Structure
```text
xlookup Retail_Sales_Project/
├── 📁 01_RAW_DATA/          # Original incomplete dataset
├── 📁 02_CLEANED_DATA/      # Target SalesTable and source for Dashboard
├── 📁 03_LOOKUP_TABLES/     # Product and Supplier reference files
├── 📁 04_REPORTS/           # QA Comparison & Pivot Insight summaries
├── streamlit_app.py         # Main Streamlit application file
├── requirements.txt         # Deployment dependencies
└── README.md                # Project documentation (this file)
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have Python installed, then install the dependencies:
```bash
pip install -r requirements.txt
```

### 2. Launch the Dashboard
Run the following command in your terminal:
```bash
streamlit run streamlit_app.py
```

### 3. Portfolio Deployment
For cloud deployment (Streamlit Community Cloud), connect your GitHub repository and point the main file path to `dashboard.py`.

---

**Developed by Chinua Analytics**  
*Structured work. Proven results. Clean handoff.*
