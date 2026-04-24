import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Retail Sales Intelligence | Chinua Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── Custom CSS (executive dark style) ────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    .stApp { background-color: #0d1117; color: #e6edf3; }

    section[data-testid="stSidebar"] {
        background-color: #161b22;
        border-right: 1px solid #30363d;
    }

    .kpi-card {
        background: linear-gradient(135deg, #161b22 0%, #1c2128 100%);
        border: 1px solid #30363d;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
    }
    .kpi-value { font-size: 2rem; font-weight: 700; color: #58a6ff; margin: 0; }
    .kpi-label { font-size: 0.85rem; color: #8b949e; margin: 4px 0 0 0; letter-spacing: 0.05em; text-transform: uppercase; }

    .before-card {
        background: linear-gradient(135deg, #1c1117 0%, #2a1219 100%);
        border: 1px solid #f85149;
        border-radius: 12px;
        padding: 16px 20px;
    }
    .after-card {
        background: linear-gradient(135deg, #0d1b12 0%, #112318 100%);
        border: 1px solid #3fb950;
        border-radius: 12px;
        padding: 16px 20px;
    }
    .section-title {
        font-size: 0.75rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #8b949e;
        margin-bottom: 16px;
        font-weight: 600;
    }
    .divider { border-top: 1px solid #30363d; margin: 28px 0; }
    h1, h2, h3 { color: #e6edf3 !important; }
</style>
""", unsafe_allow_html=True)

# ── Load data ─────────────────────────────────────────────────────────────────
DATA_PATH = Path(__file__).parent / "02_CLEANED_DATA" / "SalesTable.csv"

@st.cache_data
def load_data():
    df = pd.read_csv(DATA_PATH, parse_dates=['Date'])
    df['Month']       = df['Date'].dt.to_period('M').astype(str)
    df['Total_Sales'] = pd.to_numeric(df['Total_Sales'], errors='coerce')
    return df

df_full = load_data()

# ── Sidebar filters ───────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 🎛️ Filters")
    st.markdown("---")

    regions    = ["All"] + sorted(df_full['Region'].dropna().unique().tolist())
    categories = ["All"] + sorted(df_full['Category'].dropna().unique().tolist())

    sel_region   = st.selectbox("Region",   regions)
    sel_category = st.selectbox("Category", categories)

    st.markdown("---")
    st.markdown("<p style='color:#8b949e;font-size:0.75rem;'>Chinua Analytics · Retail Sales v1</p>", unsafe_allow_html=True)

# Apply filters
df = df_full.copy()
if sel_region   != "All": df = df[df['Region']   == sel_region]
if sel_category != "All": df = df[df['Category'] == sel_category]

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("## 📊 Retail Sales Intelligence Dashboard")
st.markdown("<p class='section-title'>Chinua Analytics · After-Cleaning Insights · 2025</p>", unsafe_allow_html=True)

# ── BEFORE vs AFTER ───────────────────────────────────────────────────────────
st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
st.markdown("<p class='section-title'>01 · Data Quality Summary</p>", unsafe_allow_html=True)

col_b, col_a = st.columns(2)
with col_b:
    st.markdown("""
    <div class='before-card'>
        <p style='color:#f85149;font-weight:700;font-size:1rem;margin:0 0 12px 0;'>⚠️ BEFORE CLEANING</p>
        <p style='margin:6px 0;'>❌ Missing Product_Name: <strong>200 / 200</strong></p>
        <p style='margin:6px 0;'>❌ Missing Category: <strong>200 / 200</strong></p>
        <p style='margin:6px 0;'>❌ Missing Unit_Price: <strong>200 / 200</strong></p>
        <p style='margin:6px 0;'>❌ Missing Total_Sales: <strong>200 / 200</strong></p>
        <hr style='border-color:#f85149;margin:12px 0'>
        <p style='margin:0;'>📋 Usable Records: <strong style='color:#f85149;'>0</strong></p>
    </div>""", unsafe_allow_html=True)

with col_a:
    st.markdown(f"""
    <div class='after-card'>
        <p style='color:#3fb950;font-weight:700;font-size:1rem;margin:0 0 12px 0;'>✅ AFTER CLEANING</p>
        <p style='margin:6px 0;'>✅ Missing Product_Name: <strong>0</strong></p>
        <p style='margin:6px 0;'>✅ Missing Category: <strong>0</strong></p>
        <p style='margin:6px 0;'>✅ Missing Unit_Price: <strong>0</strong></p>
        <p style='margin:6px 0;'>✅ Missing Total_Sales: <strong>0</strong></p>
        <hr style='border-color:#3fb950;margin:12px 0'>
        <p style='margin:0;'>📋 Usable Records: <strong style='color:#3fb950;'>200</strong></p>
    </div>""", unsafe_allow_html=True)

# ── KPIs ──────────────────────────────────────────────────────────────────────
st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
st.markdown("<p class='section-title'>02 · Key Performance Indicators</p>", unsafe_allow_html=True)

total_revenue  = df['Total_Sales'].sum()
transactions   = len(df)
qty_sold       = df['Quantity'].sum()

k1, k2, k3 = st.columns(3)
with k1:
    st.markdown(f"""<div class='kpi-card'>
        <p class='kpi-value'>${total_revenue:,.0f}</p>
        <p class='kpi-label'>Total Revenue</p></div>""", unsafe_allow_html=True)
with k2:
    st.markdown(f"""<div class='kpi-card'>
        <p class='kpi-value'>{transactions:,}</p>
        <p class='kpi-label'>Transactions</p></div>""", unsafe_allow_html=True)
with k3:
    st.markdown(f"""<div class='kpi-card'>
        <p class='kpi-value'>{qty_sold:,}</p>
        <p class='kpi-label'>Units Sold</p></div>""", unsafe_allow_html=True)

# ── Plotly theme ──────────────────────────────────────────────────────────────
CHART_THEME = dict(
    paper_bgcolor='#161b22',
    plot_bgcolor ='#161b22',
    font         =dict(family='Inter', color='#8b949e', size=12),
    title_font   =dict(color='#e6edf3', size=14),
    xaxis        =dict(gridcolor='#21262d', linecolor='#30363d'),
    yaxis        =dict(gridcolor='#21262d', linecolor='#30363d'),
    margin       =dict(l=20, r=20, t=50, b=30),
)
COLORS = ['#58a6ff', '#3fb950', '#d2a8ff', '#ffa657', '#f85149', '#79c0ff']

# ── Charts ────────────────────────────────────────────────────────────────────
st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
st.markdown("<p class='section-title'>03 · Revenue Visuals</p>", unsafe_allow_html=True)

c1, c2 = st.columns(2)

with c1:
    rev_region = df.groupby('Region')['Total_Sales'].sum().sort_values(ascending=True).reset_index()
    fig1 = go.Figure(go.Bar(
        x=rev_region['Total_Sales'], y=rev_region['Region'],
        orientation='h', marker_color=COLORS[:len(rev_region)],
        text=[f'${v:,.0f}' for v in rev_region['Total_Sales']],
        textposition='outside'
    ))
    fig1.update_layout(title='Revenue by Region', **CHART_THEME)
    st.plotly_chart(fig1, use_container_width=True)

with c2:
    rev_prod = df.groupby('Product_Name')['Total_Sales'].sum().sort_values(ascending=False).head(10).reset_index()
    fig2 = px.bar(rev_prod, x='Product_Name', y='Total_Sales', color='Total_Sales',
                  color_continuous_scale=['#1c2128','#58a6ff'],
                  text=[f'${v:,.0f}' for v in rev_prod['Total_Sales']])
    fig2.update_traces(textposition='outside')
    fig2.update_layout(title='Revenue by Product (Top 10)', showlegend=False, coloraxis_showscale=False, **CHART_THEME)
    st.plotly_chart(fig2, use_container_width=True)

# Monthly trend (full width)
monthly = df.groupby('Month')['Total_Sales'].sum().reset_index().sort_values('Month')
fig3 = go.Figure()
fig3.add_trace(go.Scatter(
    x=monthly['Month'], y=monthly['Total_Sales'],
    mode='lines+markers',
    line=dict(color='#58a6ff', width=3),
    marker=dict(color='#58a6ff', size=8),
    fill='tozeroy',
    fillcolor='rgba(88,166,255,0.08)',
    name='Revenue'
))
fig3.update_layout(title='Monthly Revenue Trend', **CHART_THEME)
st.plotly_chart(fig3, use_container_width=True)
