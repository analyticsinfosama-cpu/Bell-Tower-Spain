# -*- coding: utf-8 -*-
"""Graficas del informe SEO Bell Tower Spain (identidad visual Infosama)."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Wedge
import numpy as np

AZUL = "#4688A8"
VERDE = "#A4D76C"
CARBON = "#2A2A2A"
GRIS = "#9AA0A6"
ROJO = "#D9534F"
NARANJA = "#E8A33D"
AMARILLO = "#E8D04D"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 11,
    "axes.edgecolor": "#cccccc",
    "axes.linewidth": 0.8,
    "figure.dpi": 150,
})

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "informe-assets")
os.makedirs(OUT, exist_ok=True)


def color_nota(v):
    if v < 33:
        return ROJO
    if v < 60:
        return NARANJA
    return VERDE


# 1) Gauge puntuacion global --------------------------------------------------
def gauge():
    fig, ax = plt.subplots(figsize=(5.2, 3.0), subplot_kw={"aspect": "equal"})
    score = 47
    segs = [(0, 33, ROJO), (33, 60, NARANJA), (60, 100, VERDE)]
    for a0, a1, c in segs:
        t0 = 180 - (a0 / 100 * 180)
        t1 = 180 - (a1 / 100 * 180)
        ax.add_patch(Wedge((0, 0), 1.0, t1, t0, width=0.32, facecolor=c, alpha=0.28))
    ang = 180 - (score / 100 * 180)
    rad = np.deg2rad(ang)
    ax.plot([0, 0.78 * np.cos(rad)], [0, 0.78 * np.sin(rad)],
            color=CARBON, lw=3.2, solid_capstyle="round")
    ax.add_patch(plt.Circle((0, 0), 0.045, color=CARBON, zorder=5))
    ax.text(0, -0.18, f"{score}", ha="center", va="center",
            fontsize=42, fontweight="bold", color=AZUL)
    ax.text(0, -0.42, "/ 100", ha="center", va="center", fontsize=13, color=GRIS)
    ax.text(-0.92, -0.05, "0", ha="center", color=GRIS, fontsize=9)
    ax.text(0.92, -0.05, "100", ha="center", color=GRIS, fontsize=9)
    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-0.5, 1.1)
    ax.axis("off")
    ax.set_title("Puntuacion SEO global", fontsize=13, fontweight="bold",
                 color=CARBON, pad=6)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "01_gauge.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


# 2) Barras por categoria ------------------------------------------------------
def categorias():
    cats = [
        ("Visibilidad IA (GEO)", 32),
        ("Autoridad / enlaces", 32),
        ("Competitividad", 38),
        ("E-commerce / Shopping", 45),
        ("Tecnico (crawl/index)", 52),
        ("Datos estructurados", 55),
        ("Contenido / E-E-A-T", 58),
        ("On-page (titles/meta)", 62),
    ]
    cats = sorted(cats, key=lambda x: x[1])
    labels = [c[0] for c in cats]
    vals = [c[1] for c in cats]
    cols = [color_nota(v) for v in vals]
    fig, ax = plt.subplots(figsize=(8.2, 4.2))
    y = np.arange(len(labels))
    ax.barh(y, vals, color=cols, height=0.62, zorder=3)
    ax.barh(y, [100] * len(labels), color="#eeeeee", height=0.62, zorder=1)
    for i, v in enumerate(vals):
        ax.text(v + 2, i, f"{v}", va="center", fontsize=10.5, fontweight="bold", color=CARBON)
    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=10.5)
    ax.set_xlim(0, 100)
    ax.set_xlabel("Puntuacion (0-100)", fontsize=10, color=GRIS)
    ax.set_title("Diagnostico por area SEO", fontsize=13, fontweight="bold", color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "02_categorias.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


# 3) Trafico organico mensual estimado vs competidores -------------------------
def autoridad():
    comp = [
        ("Bell Tower\nSpain", 129, AZUL),
        ("Barada Bags", 193, GRIS),
        ("Ferpiel", 217, GRIS),
        ("El Potro", 1136, GRIS),
    ]
    labels = [c[0] for c in comp]
    vals = [c[1] for c in comp]
    cols = [c[2] for c in comp]
    fig, ax = plt.subplots(figsize=(8.2, 3.8))
    x = np.arange(len(labels))
    bars = ax.bar(x, vals, color=cols, width=0.55, zorder=3)
    bars[0].set_edgecolor(VERDE)
    bars[0].set_linewidth(2.5)
    for i, v in enumerate(vals):
        ax.text(i, v + 18, f"{v}", ha="center", fontsize=10.5, fontweight="bold", color=CARBON)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10)
    ax.set_ylim(0, 1250)
    ax.set_ylabel("Trafico organico estimado / mes", fontsize=10, color=GRIS)
    ax.set_title("Trafico organico estimado: Bell Tower Spain vs. competidores directos",
                 fontsize=12.5, fontweight="bold", color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.grid(axis="y", color="#eeeeee", zorder=0)
    ax.set_axisbelow(True)
    fig.text(0.5, -0.02, "Estimacion basada en palabras clave posicionadas y volumen de busqueda (fuente: base de datos SEO), mes de referencia 06/2026",
             ha="center", fontsize=8, color=GRIS, style="italic")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "03_autoridad.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


# 4) Matriz de presencia de elementos SEO (gap analysis) -----------------------
def matriz():
    elems = ["Product\nSchema", "FAQ /\nschema GEO", "Meta\ndescriptions",
             "Blog /\ncontenido", "Resenas\nverificadas", "Backlinks\nrelevantes", "Catalogo\namplio"]
    actores = ["Bell Tower\nSpain", "El Potro", "Ferpiel"]
    data = np.array([
        [1, 0, 0],     # product schema
        [1, 0, 0],     # FAQ/GEO schema
        [1, 0, 0],     # meta description
        [1, 0, 1],     # blog/contenido
        [0, 0.5, 1],   # resenas
        [0.5, 1, 0.5], # backlinks
        [0.5, 1, 1],   # catalogo amplio
    ])
    fig, ax = plt.subplots(figsize=(6.0, 4.8))
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            v = data[i, j]
            c = VERDE if v == 1 else (NARANJA if v == 0.5 else "#f0f0f0")
            ax.add_patch(plt.Rectangle((j, i), 0.92, 0.92, facecolor=c, edgecolor="white", lw=2))
            mark = "Si" if v == 1 else ("~" if v == 0.5 else "No")
            tc = "white" if v != 0 else GRIS
            ax.text(j + 0.46, i + 0.46, mark, ha="center", va="center", fontsize=10, fontweight="bold", color=tc)
    ax.set_xlim(0, 3)
    ax.set_ylim(0, len(elems))
    ax.set_xticks([0.46, 1.46, 2.46])
    ax.set_xticklabels(actores, fontsize=9.5)
    ax.set_yticks([i + 0.46 for i in range(len(elems))])
    ax.set_yticklabels(elems, fontsize=9)
    ax.invert_yaxis()
    ax.xaxis.tick_top()
    for s in ax.spines.values():
        s.set_visible(False)
    ax.tick_params(length=0)
    ax.set_title("Presencia de elementos SEO clave (gap analysis)",
                 fontsize=12.5, fontweight="bold", color=CARBON, pad=28)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "04_matriz.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


# 5) Hallazgos por severidad ----------------------------------------------------
def severidad():
    labels = ["Criticos", "Alta prioridad", "Media prioridad", "Bajo / backlog"]
    vals = [5, 6, 5, 4]
    cols = [ROJO, NARANJA, AMARILLO, VERDE]
    fig, ax = plt.subplots(figsize=(5.4, 3.8))
    wedges, _ = ax.pie(vals, colors=cols, startangle=90,
                       wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2))
    ax.text(0, 0, f"{sum(vals)}\nhallazgos", ha="center", va="center", fontsize=15, fontweight="bold", color=CARBON)
    leg = [f"{l}  ({v})" for l, v in zip(labels, vals)]
    ax.legend(wedges, leg, loc="center left", bbox_to_anchor=(1.0, 0.5), frameon=False, fontsize=10)
    ax.set_title("Hallazgos por nivel de severidad", fontsize=12.5, fontweight="bold", color=CARBON, pad=6)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "05_severidad.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


# 6) Composicion del sitemap ------------------------------------------------
def sitemap():
    labels = ["Entradas de\nblog", "Productos", "Categorias", "Paginas\nestaticas"]
    vals = [70, 22, 4, 4]
    cols = [AZUL, VERDE, NARANJA, GRIS]
    fig, ax = plt.subplots(figsize=(6.2, 3.6))
    x = np.arange(len(labels))
    ax.bar(x, vals, color=cols, width=0.6, zorder=3)
    for i, v in enumerate(vals):
        ax.text(i, v + 1, f"{v}%", ha="center", fontsize=10.5, fontweight="bold", color=CARBON)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=9.5)
    ax.set_ylim(0, 85)
    ax.set_ylabel("% de URLs (sobre ~313 URLs)", fontsize=10, color=GRIS)
    ax.set_title("Composicion del sitemap (5 sub-sitemaps, ~313 URLs)",
                 fontsize=12.5, fontweight="bold", color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.grid(axis="y", color="#eeeeee", zorder=0)
    ax.set_axisbelow(True)
    fig.text(0.5, -0.03, "Conteo real por sub-sitemap: post (219), producto (68), categoria+product_cat (12), page (14)",
             ha="center", fontsize=8, color=GRIS, style="italic")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "06_sitemap.png"), bbox_inches="tight", facecolor="white")
    plt.close(fig)


gauge()
categorias()
autoridad()
matriz()
severidad()
sitemap()
print("Graficas generadas en", OUT)
print(os.listdir(OUT))
