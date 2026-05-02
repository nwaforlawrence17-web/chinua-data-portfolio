import pandas as pd
import numpy as np
import re
import logging

logger = logging.getLogger(__name__)

CONVERSION_RATES = {'USD': 1.0, 'ZAR': 0.053, 'NGN': 0.0012, 'GHS': 0.075, 'KES': 0.0077}
UNIT_MAP = {'bag': 0.05, 'kg': 0.001, 'ton': 1.0}
CONTRACTOR_MAP = {
    'saharabuildgroup': 'Sahara Build Group',
    'saharabuildcompany': 'Sahara Build Group',
    'saharabuildco': 'Sahara Build Group',
    'primespanafrica': 'PrimeSpan Africa',
    'apexinfrastructure': 'Apex Infrastructure',
    'uboraconstruction': 'Ubora Construction',
    'kubwaengineering': 'Kubwa Engineering',
    'deltacorebuilders': 'DeltaCore Builders'
}

def clean_numeric(val):
    if pd.isna(val) or str(val).lower() in ['unknown', 'n/a', 'error', 'nan', '-', 'none']:
        return np.nan
    clean_val = re.sub(r'[^\d.]', '', str(val).replace(',', ''))
    try: return float(clean_val)
    except: return np.nan

def standardize_name(name, mapping):
    if pd.isna(name): return "Unknown"
    norm_name = re.sub(r'[^a-z]', '', str(name).lower())
    return mapping.get(norm_name, str(name).strip().title())

def parse_date(val):
    if pd.isna(val) or str(val).lower() in ['unknown', 'n/a', 'error', 'nan', 'none']:
        return pd.NaT
    val_str = str(val).split(' ')[0]
    formats = ['%m/%d/%Y', '%m/%d/%y', '%Y-%m-%d', '%d-%b-%Y', '%Y/%m/%d', '%d/%m/%Y', '%d/%m/%y']
    for fmt in formats:
        try: return pd.to_datetime(val_str, format=fmt)
        except: continue
    return pd.to_datetime(val_str, errors='coerce')

def normalize_quantity(val):
    if pd.isna(val) or str(val).lower() in ['unknown', 'n/a', 'none', '-']:
        return np.nan
    val_str = str(val).lower()
    num = clean_numeric(val_str)
    if np.isnan(num): return num
    for unit, factor in UNIT_MAP.items():
        if unit in val_str: return num * factor
    return num

def convert_to_usd(row_val, currency_code):
    val_str = str(row_val).upper()
    num = clean_numeric(val_str)
    if np.isnan(num): return np.nan
    curr = str(currency_code).strip().upper()
    for c in CONVERSION_RATES:
        if c in val_str: curr = c
    return num * CONVERSION_RATES.get(curr, 1.0)

def clean_dataset(df):
    logger.info("🛠️  Cleaning and standardizing dataset...")
    df = df.copy()
    
    # 1. Categorical Standardization
    df['Contractor_Name'] = df['Contractor_Name'].apply(lambda x: standardize_name(x, CONTRACTOR_MAP))
    df['Supplier_Name'] = df['Supplier_Name'].apply(lambda x: standardize_name(x, {}))
    df['Equipment_Type'] = df['Equipment_Type'].str.capitalize().fillna("Unknown")
    df['Maintenance_Status'] = df['Maintenance_Status'].str.lower().fillna("unknown")

    df['Quantity_Used_Tons'] = df['Quantity_Used'].apply(normalize_quantity)

    # 3. Currency Normalization to USD
    for col in ['Unit_Cost', 'Project_Budget', 'Actual_Cost']:
        df[f'{col}_USD'] = df.apply(lambda r: convert_to_usd(r[col], r['Currency']), axis=1)

    # 4. Date Normalization
    for col in ['Start_Date', 'End_Date', 'Actual_Completion_Date']:
        df[col] = df[col].apply(parse_date)

    # 5. Outlier Filtering
    df['Usage_Hours'] = df['Usage_Hours'].apply(clean_numeric).clip(lower=0)
    df['Downtime_Hours'] = df['Downtime_Hours'].apply(clean_numeric).clip(lower=0)
    
    logger.info("✅ Cleaning complete.")
    return df
