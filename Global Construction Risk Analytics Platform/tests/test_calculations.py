import pytest
import pandas as pd
import numpy as np
import sys
import os

# Ensure scripts folder is accessible
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from analysis import engineer_kpis, sanitize_for_json

def test_engineer_kpis_overruns():
    df = pd.DataFrame({
        'Project_Budget_USD': [1000, 2000],
        'Actual_Cost_USD': [1200, 1800],
        'Usage_Hours': [100, 200],
        'Downtime_Hours': [10, 0],
        'Start_Date': pd.to_datetime(['2026-01-01', '2026-01-01']),
        'End_Date': pd.to_datetime(['2026-01-10', '2026-01-10']),
        'Actual_Completion_Date': pd.to_datetime(['2026-01-12', '2026-01-08'])
    })
    
    result = engineer_kpis(df)
    
    # Overruns: 1200-1000=200, 1800-2000=-200
    assert result['Cost_Overrun_USD'].iloc[0] == 200
    assert result['Cost_Overrun_USD'].iloc[1] == -200
    
    # Efficiency: 100/(100+10) = 0.909, 200/(200+0) = 1.0
    assert round(result['Efficiency_Ratio'].iloc[0], 3) == 0.909
    assert result['Efficiency_Ratio'].iloc[1] == 1.0

def test_engineer_kpis_delays():
    df = pd.DataFrame({
        'Start_Date': pd.to_datetime(['2026-01-01']),
        'End_Date': pd.to_datetime(['2026-01-10']),
        'Actual_Completion_Date': pd.to_datetime(['2026-01-12']),
        'Project_Budget_USD': [1000],
        'Actual_Cost_USD': [1000],
        'Usage_Hours': [100],
        'Downtime_Hours': [0]
    })
    
    result = engineer_kpis(df)
    assert result['Delay_Days'].iloc[0] == 2
    assert result['Delay_Flag'].iloc[0] == 'Yes'

def test_sanitize_for_json():
    messy_data = {
        "val": np.nan,
        "list": [1.0, np.inf, 3.0],
        "nested": {"key": np.nan}
    }
    
    clean = sanitize_for_json(messy_data)
    
    assert clean["val"] == 0.0
    assert clean["list"][1] == 0.0
    assert clean["nested"]["key"] == 0.0
