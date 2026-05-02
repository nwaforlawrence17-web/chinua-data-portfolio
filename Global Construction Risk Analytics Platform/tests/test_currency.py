import pytest
import numpy as np
import sys
import os

# Ensure scripts folder is accessible
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

from data_cleaning import convert_to_usd

def test_convert_to_usd_base_rates():
    # CONVERSION_RATES: {'USD': 1.0, 'ZAR': 0.053, 'NGN': 0.0012, 'GHS': 0.075, 'KES': 0.0077}
    
    # Simple explicit currency codes
    assert convert_to_usd(100, "USD") == 100.0
    assert convert_to_usd(1000, "ZAR") == 53.0
    assert convert_to_usd(1, "NGN") == 0.0012
    assert convert_to_usd(100, "GHS") == 7.5
    assert convert_to_usd(1000, "KES") == 7.7

def test_convert_to_usd_embedded_currency():
    # Text-embedded currency codes (common in messy construction datasets)
    assert convert_to_usd("KES 1,000", "USD") == 7.7
    assert convert_to_usd("ZAR 500", "ZAR") == 26.5
    assert convert_to_usd("AFR 100", "Unknown") == 100.0  # Defaults to 1.0 if unknown

def test_convert_to_usd_fail_cases():
    assert np.isnan(convert_to_usd("Error", "USD"))
    assert np.isnan(convert_to_usd(None, "NGN"))
