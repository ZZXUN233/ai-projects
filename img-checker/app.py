import streamlit as st
import numpy as np
import cv2
from PIL import Image
from scipy.ndimage import uniform_filter
import tempfile
import os
from datetime import datetime
import time

st.set_page_config(page_title="截图篡改检测 - Streamlit", layout="wide")

# =========================
# 工具函数
# =========================

def ensure_dir(path: str):
    """创建目录（如果不存在）"""
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)

def cache_uploaded_file(upload_file):
    """缓存上传的文件到 ./temp/YYYY-MM-DD/ 目录"""
    today = datetime.now().strftime("%Y-%m-%d")
    base_dir = f"./temp/{today}"
    ensure_dir(base_dir)

    save_path = os.path.join(base_dir, upload_file.name)
    with open(save_path, "wb") as f:
        f.write(upload_file.getbuffer())

    return save_path


def to_cv2(img: Image.Image):
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

def normalize(x):
    x = x.astype(np.float32)
    return (x - x.min()) / (x.max() - x.min() + 1e-9)


# ----------- 1. ELA 检测 ------------
def ela_heatmap(img: Image.Image, quality=90):
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
    mean_scores = [
        ela_h.mean(),
        noise_h.mean(),
        edge_h.mean(),
    ]
    return float(np.clip(np.mean(mean_scores) * 2.0, 0, 1))


# =========================
# Streamlit UI
# =========================
st.title("📷 截图是否被修改？— 基于像素矩阵的篡改检测")
st.markdown("上传任意截图，我将使用 ELA、噪声分析、边缘异常分析检测是否被修改。")

uploaded = st.file_uploader("上传一个 PNG/JPEG 截图", type=["png", "jpg", "jpeg"])

if uploaded:

    # ---------- 文件缓存 ----------
    saved_path = cache_uploaded_file(uploaded)
    # st.info(f"📁 已缓存到：`{saved_path}`")

    # ---------- 懒加载处理 ----------
    progress = st.progress(0, text="正在加载图像...")

    # 加载图像
    img = Image.open(uploaded).convert("RGB")
    img_cv = to_cv2(img)
    time.sleep(0.3)
    progress.progress(20, text="图像加载完成，正在计算 ELA...")

    # ELA
    ela_h = ela_heatmap(img)
    time.sleep(0.3)
    progress.progress(50, text="ELA 完成，正在计算噪声残差...")

    # 噪声
    noise_h = noise_residual_heatmap(img_cv)
    time.sleep(0.3)
    progress.progress(75, text="噪声分析完成，正在检测边缘异常...")

    # 边缘异常
    edge_h = edge_discontinuity_heatmap(img_cv)
    time.sleep(0.3)

    fusion = (ela_h + noise_h + edge_h) / 3.0
    score = fusion_score(ela_h, noise_h, edge_h)

    progress.progress(100, text="分析完成！")

    # ---------- 原图 ----------
    st.subheader("原图")
    st.image(img, width="stretch")

    # ---------- 结果 ----------
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

    # ---------- 热力图 ----------
    tab1, tab2, tab3, tab4 = st.tabs(["综合热力图", "ELA", "噪声分析", "边缘异常"])

    with tab1:
        st.image(colorize_heatmap(fusion), caption="融合热力图", width="stretch")

    with tab2:
        st.image(colorize_heatmap(ela_h), caption="ELA 热力图", width="stretch")

    with tab3:
        st.image(colorize_heatmap(noise_h), caption="噪声残差热力图", width="stretch")

    with tab4:
        st.image(colorize_heatmap(edge_h), caption="边缘不连续热力图", width="stretch")
