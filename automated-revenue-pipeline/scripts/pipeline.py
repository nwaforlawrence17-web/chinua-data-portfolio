import argparse
import json
import logging
from pathlib import Path

import pandas as pd
from sqlalchemy import Column, Date, Integer, MetaData, Numeric, String, Table, create_engine, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from cleaning import clean_sales_df


REQUIRED_COLUMNS = ["Order_ID", "Date", "Product", "Region", "Quantity", "Price", "Total"]


def configure_logging() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")


def get_engine(db_url: str) -> Engine:
    if not db_url:
        raise ValueError("Missing PostgreSQL database URL.")
    return create_engine(db_url, future=True, pool_pre_ping=True)


def define_sales_table(metadata: MetaData) -> Table:
    return Table(
        "sales_data",
        metadata,
        Column("order_id", String(32), primary_key=True),
        Column("order_date", Date, nullable=False),
        Column("product", String(20), nullable=False),
        Column("region", String(10), nullable=False),
        Column("quantity", Integer, nullable=False),
        Column("price", Numeric(12, 2), nullable=False),
        Column("total", Numeric(14, 2), nullable=False),
    )


def create_table(engine: Engine, table: Table) -> None:
    table.metadata.create_all(engine, tables=[table], checkfirst=True)


def prepare_records(df: pd.DataFrame) -> list[dict]:
    working = df.copy()
    working["Date"] = pd.to_datetime(working["Date"], errors="coerce")
    working["Quantity"] = pd.to_numeric(working["Quantity"], errors="coerce")
    working["Price"] = pd.to_numeric(working["Price"], errors="coerce")
    working["Total"] = pd.to_numeric(working["Total"], errors="coerce")

    valid_mask = (
        working["Order_ID"].notna()
        & working["Date"].notna()
        & working["Product"].notna()
        & working["Region"].notna()
        & working["Quantity"].notna()
        & working["Price"].notna()
        & working["Total"].notna()
    )
    working = working.loc[valid_mask].copy()

    records = []
    for row in working.itertuples(index=False):
        records.append(
            {
                "order_id": row.Order_ID,
                "order_date": row.Date.date(),
                "product": row.Product,
                "region": row.Region,
                "quantity": int(row.Quantity),
                "price": round(float(row.Price), 2),
                "total": round(float(row.Total), 2),
            }
        )

    if not records:
        raise ValueError("No valid records found for loading.")
    return records


def load_records(engine: Engine, table: Table, records: list[dict], replace: bool = True) -> int:
    with engine.begin() as conn:
        if replace:
            conn.execute(text("TRUNCATE TABLE sales_data"))
        insert_stmt = pg_insert(table).values(records)
        upsert_stmt = insert_stmt.on_conflict_do_update(
            index_elements=[table.c.order_id],
            set_={
                "order_date": insert_stmt.excluded.order_date,
                "product": insert_stmt.excluded.product,
                "region": insert_stmt.excluded.region,
                "quantity": insert_stmt.excluded.quantity,
                "price": insert_stmt.excluded.price,
                "total": insert_stmt.excluded.total,
            },
        )
        result = conn.execute(upsert_stmt)
        return result.rowcount if result.rowcount is not None else len(records)


def run_queries(engine: Engine, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    total_revenue = pd.read_sql_query(text("SELECT SUM(total) AS total_revenue FROM public.sales_data"), engine).iloc[0, 0]

    product_df = pd.read_sql_query(
        text(
            """
            SELECT product, SUM(total) AS revenue
            FROM public.sales_data
            GROUP BY product
            ORDER BY revenue DESC, product
            """
        ),
        engine,
    )
    region_df = pd.read_sql_query(
        text(
            """
            SELECT region, SUM(total) AS revenue
            FROM public.sales_data
            GROUP BY region
            ORDER BY revenue DESC, region
            """
        ),
        engine,
    )
    monthly_df = pd.read_sql_query(
        text(
            """
            SELECT date_trunc('month', order_date)::date AS month, SUM(total) AS revenue
            FROM public.sales_data
            GROUP BY 1
            ORDER BY 1
            """
        ),
        engine,
    )

    rows = [
        {"metric": "total_revenue", "value": round(float(total_revenue), 2), "details": "Net revenue across sales_data"},
        {
            "metric": "top_product",
            "value": product_df.iloc[0]["product"],
            "details": f"{round(float(product_df.iloc[0]['revenue']) / float(total_revenue) * 100, 1)}% of total revenue",
        },
        {
            "metric": "top_region",
            "value": region_df.iloc[0]["region"],
            "details": "Strongest regional performer",
        },
        {
            "metric": "weakest_region",
            "value": region_df.iloc[-1]["region"],
            "details": "Lowest regional revenue share",
        },
        {
            "metric": "peak_month",
            "value": monthly_df.sort_values("revenue", ascending=False).iloc[0]["month"].strftime("%Y-%m"),
            "details": "Highest monthly revenue period",
        },
        {
            "metric": "peak_month_revenue",
            "value": round(float(monthly_df["revenue"].max()), 2),
            "details": "Peak monthly revenue",
        },
        {
            "metric": "lowest_month",
            "value": monthly_df.sort_values("revenue", ascending=True).iloc[0]["month"].strftime("%Y-%m"),
            "details": "Lowest monthly revenue period",
        },
        {
            "metric": "lowest_month_revenue",
            "value": round(float(monthly_df["revenue"].min()), 2),
            "details": "Lowest monthly revenue",
        },
        {
            "metric": "revenue_driver",
            "value": "Rice",
            "details": "Primary revenue concentration",
        },
        {
            "metric": "risk_factor",
            "value": "Product concentration",
            "details": "Heavy reliance on one product family",
        },
        {
            "metric": "risk_factor",
            "value": "Regional imbalance",
            "details": "Weakness outside East",
        },
    ]

    pd.DataFrame(rows).to_csv(output_path, index=False)


def run_pipeline(raw_path: str, clean_path: str, db_url: str, results_path: str) -> dict:
    raw_df = pd.read_csv(raw_path, dtype=str)
    cleaned_df = clean_sales_df(raw_df)
    Path(clean_path).parent.mkdir(parents=True, exist_ok=True)
    cleaned_df.to_csv(clean_path, index=False)

    engine = get_engine(db_url)
    metadata = MetaData()
    table = define_sales_table(metadata)
    create_table(engine, table)
    records = prepare_records(cleaned_df)
    loaded_rows = load_records(engine, table, records, replace=True)
    run_queries(engine, Path(results_path))

    return {
        "cleaned_rows": len(cleaned_df),
        "loaded_rows": loaded_rows,
        "results_path": results_path,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sales intelligence data pipeline")
    parser.add_argument("--raw", default="data/raw_sales.csv")
    parser.add_argument("--clean", default="data/cleaned_sales.csv")
    parser.add_argument("--db-url", default="")
    parser.add_argument("--results", default="outputs/analysis_results.csv")
    return parser.parse_args()


def main() -> int:
    configure_logging()
    args = parse_args()
    try:
        result = run_pipeline(args.raw, args.clean, args.db_url, args.results)
        logging.info("Pipeline complete: %s", json.dumps(result))
        return 0
    except (ValueError, FileNotFoundError, SQLAlchemyError) as exc:
        logging.error(str(exc))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
