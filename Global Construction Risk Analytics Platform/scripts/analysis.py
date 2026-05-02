import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def sanitize_for_json(obj):
    """Recursively replace NaN/Inf with JSON-safe values."""
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_for_json(x) for x in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0
        return obj
    return obj

def engineer_kpis(df):
    logger.info("🧪 Engineering Performance KPIs...")
    df = df.copy()
    
    # Financial Risk
    df['Cost_Overrun_USD'] = df['Actual_Cost_USD'] - df['Project_Budget_USD']
    
    # Operational Efficiency
    df['Efficiency_Ratio'] = df['Usage_Hours'] / (df['Usage_Hours'] + df['Downtime_Hours'].fillna(0))
    df['Efficiency_Ratio'] = df['Efficiency_Ratio'].replace([np.inf, -np.inf], 0).fillna(0)
    
    # Timeline Reliability
    df['Actual_Duration'] = (df['Actual_Completion_Date'] - df['Start_Date']).dt.days.clip(lower=0)
    df['Delay_Days'] = (df['Actual_Completion_Date'] - df['End_Date']).dt.days.fillna(0).clip(lower=0)
    df['Delay_Flag'] = np.where(df['Delay_Days'] > 0, 'Yes', 'No')
    
    logger.info("✅ KPI engineering complete.")
    return df

def run_analytics(df):
    logger.info("📊 Generating Aggregated Intelligence...")
    
    # Financial Metrics
    gross_overrun = float(df[df['Cost_Overrun_USD'] > 0]['Cost_Overrun_USD'].sum())
    strategic_savings = float(df[df['Cost_Overrun_USD'] < 0]['Cost_Overrun_USD'].abs().sum())
    net_overrun = float(df['Cost_Overrun_USD'].sum())
    total_budget = float(df['Project_Budget_USD'].sum())
    total_actual = float(df['Actual_Cost_USD'].sum())
    overrun_pct = (net_overrun / total_budget) if total_budget > 0 else 0
    
    # Top 10 Worst Performing Projects (Overrun)
    top_10_overrun = df.sort_values(by='Cost_Overrun_USD', ascending=False).head(10)[
        ['Project_ID', 'Country', 'Contractor_Name', 'Cost_Overrun_USD', 'Actual_Cost_USD']
    ].to_dict('records')

    # Supplier Cost Index
    supplier_impact = df.groupby('Supplier_Name').agg({
        'Cost_Overrun_USD': 'mean',
        'Project_ID': 'count'
    }).rename(columns={'Project_ID': 'Project_Count'}).sort_values(by='Cost_Overrun_USD', ascending=False).head(10).to_dict('index')

    # Country Risk Profile
    country_risk = (df.groupby('Country')['Cost_Overrun_USD'].sum() / net_overrun).to_dict()

    summary = {
        "executive_summary": {
            "total_portfolio_value": total_actual,
            "gross_overrun": gross_overrun,
            "total_savings": strategic_savings,
            "net_overrun": net_overrun,
            "total_budget": total_budget,
            "overrun_percentage": float(overrun_pct),
            "avg_efficiency": float(df['Efficiency_Ratio'].mean()),
            "total_delayed_projects": int((df['Delay_Flag'] == 'Yes').sum()),
            "delay_rate": float((df['Delay_Flag'] == 'Yes').mean())
        },
        "risk_analysis": {
            "top_10_overruns": top_10_overrun,
            "country_risk_contribution": country_risk,
            "supplier_impact": supplier_impact
        },
        "operational_metrics": {
            "equipment_efficiency": df.groupby('Equipment_Type')['Efficiency_Ratio'].mean().to_dict(),
            "maintenance_to_delay": df.groupby('Maintenance_Status')['Delay_Days'].mean().to_dict(),
            "downtime_vs_delay": df[['Downtime_Hours', 'Delay_Days']].dropna().values.tolist()
        },
        "raw_data": df[['Project_ID', 'Country', 'Contractor_Name', 'Equipment_Type', 'Actual_Cost_USD', 'Cost_Overrun_USD', 'Efficiency_Ratio', 'Delay_Days']].to_dict('records')
    }
    
    logger.info("✅ Analytics generated and sanitized.")
    return sanitize_for_json(summary)
