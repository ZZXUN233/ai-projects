import streamlit as st
import numpy as np
import cv2
from PIL import Image
from scipy.ndimage import uniform_filter

st.set_page_config(page_title="截图篡改检测 - Streamlit", layout="wide")

# =========================
# 工具函数
# =========================

def to_cv2(img: Image.Image):
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def normalize(x):
    x = x.astype(np.float32)
    return (x - x.min()) / (x.max() - x.min() + 1e-9)


# ----------- 1. ELA 检测 ------------
def ela_heatmap(img: Image.Image, quality=90):
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
        temp_path = f.name
    img.convert("RGB").save(temp_path, "JPEG", quality=quality)
    recompressed = Image.open(temp_path)

    arr_orig = np.asarray(img).astype(np.int16)
    arr_rec = np.asarray(recompressed).astype(np.int16)

    diff = np.abs(arr_orig - arr_rec).astype(np.uint8)
    heat = np.max(diff, axis=2)
    return normalize(heat)


# ----------- 2. 噪声残差方差 ------------
def noise_residual_heatmap(img_cv):
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY).astype(np.float32)

    low = uniform_filter(gray, size=3)
    residual = gray - low

    patch = 16
    mean = uniform_filter(residual, patch)
    mean_sq = uniform_filter(residual * residual, patch)
    var = mean_sq - mean * mean
    return normalize(var)


# ----------- 3. 边缘异常检测 -------------
def edge_discontinuity_heatmap(img_cv, patch=16):
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    edge_strength = np.abs(lap)
    local_mean = cv2.blur(edge_strength, (patch, patch))
    diff = np.abs(edge_strength - local_mean)
    return normalize(diff)


# ----------- 热力图着色 ------------
def colorize_heatmap(heat):
    heat_color = cv2.applyColorMap((heat * 255).astype(np.uint8), cv2.COLORMAP_JET)
    return cv2.cvtColor(heat_color, cv2.COLOR_BGR2RGB)


# ----------- 融合评分 ------------
def fusion_score(ela_h, noise_h, edge_h):
    # 简易融合：取均值
    mean_scores = [
        ela_h.mean(),
        noise_h.mean(),
        edge_h.mean(),
    ]
    # 归一化综合评分
    score = float(np.clip(np.mean(mean_scores) * 2.0, 0, 1))
    return score


# =========================
# Streamlit UI
# =========================
st.title("📷 截图是否被修改？— 基于像素矩阵的篡改检测")
st.markdown("上传任意截图，我将使用 ELA、噪声分析、边缘异常分析检测是否被修改。")

uploaded = st.file_uploader("上传一个 PNG/JPEG 截图", type=["png", "jpg", "jpeg"])

if uploaded:
    img = Image.open(uploaded).convert("RGB")
    img_cv = to_cv2(img)

    st.subheader("原图")
    st.image(img, use_column_width=True)

    # 分析
    ela_h = ela_heatmap(img)
    noise_h = noise_residual_heatmap(img_cv)
    edge_h = edge_discontinuity_heatmap(img_cv)

    fusion = (ela_h + noise_h + edge_h) / 3.0
    score = fusion_score(ela_h, noise_h, edge_h)

    st.subheader("检测结果")

    col1, col2 = st.columns(2)
    with col1:
        st.metric("疑似修改概率", f"{score*100:.1f}%")
    with col2:
        st.write("判断：")
        if score > 0.5:
            st.error("⚠️ **疑似被修改**（包含明显异常纹理或压缩痕迹）")
        else:
            st.success("✔️ 无明显修改痕迹")

    st.markdown("---")

    tab1, tab2, tab3, tab4 = st.tabs(["综合热力图", "ELA", "噪声分析", "边缘异常"])

    with tab1:
        st.image(colorize_heatmap(fusion), caption="融合热力图", use_column_width=True)

    with tab2:
        st.image(colorize_heatmap(ela_h), caption="ELA 热力图", use_column_width=True)

    with tab3:
        st.image(colorize_heatmap(noise_h), caption="噪声残差热力图", use_column_width=True)

    with tab4:
        st.image(colorize_heatmap(edge_h), caption="边缘不连续热力图", use_column_width=True)
