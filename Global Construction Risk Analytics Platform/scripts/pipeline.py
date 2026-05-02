import pandas as pd
import json
import os
import logging
from datetime import datetime
from data_cleaning import clean_dataset
from analysis import engineer_kpis, run_analytics

# --- LOGGING CONFIGURATION ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

class ConstructionDataPlatform:
    """
    Integrated orchestrator for the Construction Intelligence Platform.
    Manages the lifecycle from raw data ingestion to dashboard generation.
    """
    
    def __init__(self, raw_data_path, output_dir):
        self.raw_data_path = raw_data_path
        self.output_dir = output_dir
        self.df = None
        self.analytics_summary = {}

    def run_flow(self):
        logger.info("🚀 Starting Intelligence Pipeline...")
        
        # 1. Ingestion
        self.df = pd.read_csv(self.raw_data_path)
        
        # 2. Cleaning (Modularized)
        self.df = clean_dataset(self.df)
        
        # 3. KPI Engineering (Modularized)
        self.df = engineer_kpis(self.df)
        
        # 4. Analytics Generation (Modularized)
        self.analytics_summary = run_analytics(self.df)
        
        # 5. Export and Dashboard Generation
        self.export_results()
        
        logger.info("🎉 PIPELINE EXECUTION SUCCESSFUL.")

    def export_results(self):
        logger.info("💾 Exporting Platform Artifacts...")
        
        # Standard Data Exports
        self.df.to_csv(os.path.join(self.output_dir, "cleaned_data.csv"), index=False)
        with open(os.path.join(self.output_dir, "dashboard_data.json"), 'w') as f:
            json.dump(self.analytics_summary, f, indent=4)
        
        # Dashboard Generation via Template
        template_path = os.path.join(os.path.dirname(self.output_dir), "assets", "template.html")
        dashboard_path = os.path.join(os.path.dirname(self.output_dir), "dashboard", "index.html")
        
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                template = f.read()
            
            # Inject Data
            populated = template.replace(
                "JSON_DATA_PLACEHOLDER", 
                json.dumps(self.analytics_summary)
            )
            
            with open(dashboard_path, 'w', encoding='utf-8') as f:
                f.write(populated)
                
            logger.info(f"✅ Dashboard generated: {dashboard_path}")
        except Exception as e:
            logger.error(f"❌ Dashboard generation failed: {e}")

if __name__ == "__main__":
    # Internal paths relative to the scripts folder
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAW_DATA = os.path.join(BASE_DIR, "data", "raw_data.csv")
    DATA_DIR = os.path.join(BASE_DIR, "data")
    
    platform = ConstructionDataPlatform(RAW_DATA, DATA_DIR)
    platform.run_flow()
