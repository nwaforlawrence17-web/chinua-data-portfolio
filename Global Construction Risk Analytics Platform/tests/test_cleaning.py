import pytest
import pandas as pd
import numpy as np
import sys
import os

# Ensure scripts folder is accessible
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from data_cleaning import clean_numeric, standardize_name, parse_date, normalize_quantity

def test_clean_numeric_standard():
    assert clean_numeric("1,200.50") == 1200.50
    assert clean_numeric("USD 100") == 100.0
    assert clean_numeric("15.5 kg") == 15.5

def test_clean_numeric_edge_cases():
    assert np.isnan(clean_numeric("Unknown"))
    assert np.isnan(clean_numeric(None))
    assert np.isnan(clean_numeric("-"))
    assert np.isnan(clean_numeric("N/A"))

def test_standardize_name():
    mapping = {
        'saharabuildgroup': 'Sahara Build Group',
        'saharabuildco': 'Sahara Build Group'
    }
    assert standardize_name("Saharabuild co", mapping) == "Sahara Build Group"
    assert standardize_name("SAHARA BUILD GROUP", mapping) == "Sahara Build Group"
    assert standardize_name("Random Dev", mapping) == "Random Dev"
    assert standardize_name(None, mapping) == "Unknown"

def test_parse_date_formats():
    assert parse_date("04/17/2026").year == 2026
    assert parse_date("2026-04-17").month == 4
    assert parse_date("17-Apr-2026").day == 17
    assert pd.isna(parse_date("Bad Date"))

def test_normalize_quantity_units():
    assert normalize_quantity("120 bags") == 6.0  # 120 * 0.05 tons
    assert normalize_quantity("500 kg") == 0.5    # 500 * 0.001 tons
    assert normalize_quantity("1.5 tons") == 1.5
    assert np.isnan(normalize_quantity("None"))
