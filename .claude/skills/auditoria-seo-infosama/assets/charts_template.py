# -*- coding: utf-8 -*-
"""PLANTILLA de graficas para el informe SEO (identidad visual Infosama).

Los valores dentro de cada funcion son un EJEMPLO (cliente Motroy). Sustituyelos por
los datos reales del cliente antes de ejecutar. La paleta Infosama NO se cambia.
Ejecutar:  python charts_template.py   ->  genera los PNG en ./informe-assets/
Funciones: gauge (puntuacion global) | categorias (areas) | autoridad (vs competidores) |
matriz (gap analysis) | severidad (hallazgos) | sitemap (composicion) | imagenes (pesos KB)."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Wedge
import numpy as np

# Paleta Infosama
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

OUT = r"F:\Claude Code\informe-assets"
os.makedirs(OUT, exist_ok=True)


def color_nota(v):
    if v < 33:
        return ROJO
    if v < 60:
        return NARANJA
    return VERDE


# 1) Gauge / donut puntuacion global 42/100 -----------------------------------
def gauge():
    fig, ax = plt.subplots(figsize=(5.2, 3.0), subplot_kw={"aspect": "equal"})
    score = 42
    # semicirculo de fondo segmentado
    segs = [(0, 33, ROJO), (33, 60, NARANJA), (60, 100, VERDE)]
    for a0, a1, c in segs:
        t0 = 180 - (a0 / 100 * 180)
        t1 = 180 - (a1 / 100 * 180)
        ax.add_patch(Wedge((0, 0), 1.0, t1, t0, width=0.32, facecolor=c, alpha=0.28))
    # aguja del score
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
    fig.savefig(os.path.join(OUT, "01_gauge.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


# 2) Barras horizontales por categoria ---------------------------------------
def categorias():
    cats = [
        ("Autoridad de dominio", 12),
        ("Competitividad", 15),
        ("Datos estructurados", 10),
        ("Visibilidad IA (GEO)", 20),
        ("E-commerce / Shopping", 25),
        ("On-page (titles/meta)", 30),
        ("Contenido / E-E-A-T", 45),
        ("Tecnico (crawl/index)", 58),
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
        ax.text(v + 2, i, f"{v}", va="center", fontsize=10.5,
                fontweight="bold", color=CARBON)
    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=10.5)
    ax.set_xlim(0, 100)
    ax.set_xlabel("Puntuacion (0-100)", fontsize=10, color=GRIS)
    ax.set_title("Diagnostico por area SEO", fontsize=13, fontweight="bold",
                 color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.set_axisbelow(True)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "02_categorias.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


# 3) Autoridad competitiva estimada ------------------------------------------
def autoridad():
    comp = [
        ("Motroy", 8, AZUL),
        ("Ubricarmotos", 42, GRIS),
        ("Motos Garrido", 55, GRIS),
        ("XLMoto", 68, GRIS),
        ("Motardinn", 74, GRIS),
        ("Motocard", 78, GRIS),
    ]
    labels = [c[0] for c in comp]
    vals = [c[1] for c in comp]
    cols = [c[2] for c in comp]
    fig, ax = plt.subplots(figsize=(8.2, 3.8))
    x = np.arange(len(labels))
    bars = ax.bar(x, vals, color=cols, width=0.6, zorder=3)
    bars[0].set_edgecolor(VERDE)
    bars[0].set_linewidth(2.5)
    for i, v in enumerate(vals):
        ax.text(i, v + 1.5, f"{v}", ha="center", fontsize=10.5,
                fontweight="bold", color=CARBON)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10)
    ax.set_ylim(0, 90)
    ax.set_ylabel("Autoridad estimada", fontsize=10, color=GRIS)
    ax.set_title("Autoridad de dominio estimada vs. competidores",
                 fontsize=13, fontweight="bold", color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.grid(axis="y", color="#eeeeee", zorder=0)
    ax.set_axisbelow(True)
    fig.text(0.5, -0.02, "Valores estimados (escala tipo DA 0-100) a falta de datos de herramientas de pago",
             ha="center", fontsize=8, color=GRIS, style="italic")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "03_autoridad.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


# 4) Matriz de presencia de elementos SEO (heatmap binario) -------------------
def matriz():
    elems = ["Product\nSchema", "Reseñas\nverificadas", "Meta\ndescriptions",
             "Blog /\ncontenido", "Backlinks\nrelevantes", "Catalogo\namplio",
             "Open\nGraph"]
    actores = ["Motroy", "Competidores\nnacionales", "Ubricarmotos"]
    # 1 = presente, 0 = ausente, 0.5 = parcial
    data = np.array([
        [0, 1, 1],   # product schema
        [0, 1, 1],   # reseñas
        [0, 1, 1],   # meta desc
        [0, 1, 0.5], # blog
        [0, 1, 1],   # backlinks
        [0, 1, 0.5], # catalogo
        [0, 1, 0.5], # OG
    ])
    fig, ax = plt.subplots(figsize=(6.0, 4.6))
    for i in range(data.shape[0]):
        for j in range(data.shape[1]):
            v = data[i, j]
            c = VERDE if v == 1 else (NARANJA if v == 0.5 else "#f0f0f0")
            ax.add_patch(plt.Rectangle((j, i), 0.92, 0.92, facecolor=c,
                         edgecolor="white", lw=2))
            mark = "Si" if v == 1 else ("~" if v == 0.5 else "No")
            tc = "white" if v != 0 else GRIS
            ax.text(j + 0.46, i + 0.46, mark, ha="center", va="center",
                    fontsize=10, fontweight="bold", color=tc)
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
    fig.savefig(os.path.join(OUT, "04_matriz.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


# 5) Hallazgos por severidad (donut) -----------------------------------------
def severidad():
    labels = ["Criticos", "Alta prioridad", "Media prioridad", "Bajo / backlog"]
    vals = [5, 6, 5, 4]
    cols = [ROJO, NARANJA, AMARILLO, VERDE]
    fig, ax = plt.subplots(figsize=(5.4, 3.8))
    wedges, _ = ax.pie(vals, colors=cols, startangle=90,
                       wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2))
    ax.text(0, 0, f"{sum(vals)}\nhallazgos", ha="center", va="center",
            fontsize=15, fontweight="bold", color=CARBON)
    leg = [f"{l}  ({v})" for l, v in zip(labels, vals)]
    ax.legend(wedges, leg, loc="center left", bbox_to_anchor=(1.0, 0.5),
              frameon=False, fontsize=10)
    ax.set_title("Hallazgos por nivel de severidad", fontsize=12.5,
                 fontweight="bold", color=CARBON, pad=6)
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "05_severidad.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


# 6) Composicion del sitemap / indexabilidad ---------------------------------
def sitemap():
    labels = ["Productos\nutiles", "Categorias /\nmodelos", "Contenido\ndemo", "Duplicados\nmulticategoria"]
    vals = [55, 20, 10, 15]
    cols = [VERDE, AZUL, ROJO, NARANJA]
    fig, ax = plt.subplots(figsize=(6.2, 3.6))
    x = np.arange(len(labels))
    ax.bar(x, vals, color=cols, width=0.6, zorder=3)
    for i, v in enumerate(vals):
        ax.text(i, v + 1, f"{v}%", ha="center", fontsize=10.5,
                fontweight="bold", color=CARBON)
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=9.5)
    ax.set_ylim(0, 70)
    ax.set_ylabel("% aprox. de URLs", fontsize=10, color=GRIS)
    ax.set_title("Composicion estimada del sitemap (~250 URLs)",
                 fontsize=12.5, fontweight="bold", color=CARBON, pad=8)
    for s in ["top", "right", "left"]:
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.grid(axis="y", color="#eeeeee", zorder=0)
    ax.set_axisbelow(True)
    fig.text(0.5, -0.03, "Estimacion basada en patrones detectados en el sitemap (demo PrestaShop + multicategoria)",
             ha="center", fontsize=8, color=GRIS, style="italic")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "06_sitemap.png"), bbox_inches="tight",
                facecolor="white")
    plt.close(fig)


gauge()
categorias()
autoridad()
matriz()
severidad()
sitemap()
print("Graficas generadas en", OUT)
print(os.listdir(OUT))
