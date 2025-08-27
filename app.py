from flask import Flask, render_template, request, redirect, url_for
import csv, os
from datetime import datetime
from collections import defaultdict

import matplotlib
matplotlib.use("Agg")  # <<< força backend não-interativo (resolve erro no Mac)
import matplotlib.pyplot as plt

app = Flask(__name__)

ARQUIVO_CSV = "despesas.csv"
CATEGORIAS = ["comida", "transporte", "lazer"]


def garantir_arquivo_csv():
    if not os.path.exists(ARQUIVO_CSV):
        with open(ARQUIVO_CSV, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["data", "categoria", "descricao", "valor"])


def ler_despesas():
    garantir_arquivo_csv()
    despesas = []
    with open(ARQUIVO_CSV, "r", newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for row in r:
            if "valor" in row and row["valor"]:
                row["valor"] = float(row["valor"])
            despesas.append(row)
    return despesas


def salvar_despesa(data, categoria, descricao, valor):
    garantir_arquivo_csv()
    with open(ARQUIVO_CSV, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([data, categoria, descricao, valor])


def gerar_graficos():
    despesas = ler_despesas()
    totais = defaultdict(float)
    total_geral = 0

    for d in despesas:
        valor = float(d["valor"])
        totais[d["categoria"]] += valor
        total_geral += valor
    
    categorias = list(totais.keys())
    valores = list(totais.values())

    if not categorias:
        return

    # Gráfico de barras
    plt.figure()
    plt.bar(categorias, valores, color="skyblue", edgecolor="black")
    plt.title("Gastos por Categoria (R$)")
    plt.xlabel("Categoria")
    plt.ylabel("Valor (R$)")
    plt.tight_layout()
    plt.savefig("static/gastos_por_categoria.png")
    plt.close()

    # Gráfico de pizza
    plt.figure()
    plt.pie(valores, labels=categorias, autopct="%1.1f%%", startangle=90)
    plt.title("Participação por Categoria (%)")
    plt.tight_layout()
    plt.savefig("static/participacao_porcentual.png")
    plt.close()


# ----------------- Rotas -----------------
@app.route("/")
def index():
    despesas = ler_despesas()
    return render_template("index.html", despesas=despesas, categorias=CATEGORIAS)


@app.route("/adicionar", methods=["POST"])
def adicionar():
    data = request.form.get("data") or datetime.today().strftime("%Y-%m-%d")
    categoria = request.form.get("categoria")
    descricao = request.form.get("descricao")
    valor = request.form.get("valor")
    salvar_despesa(data, categoria, descricao, valor)
    return redirect(url_for("index"))


@app.route("/relatorio")
def relatorio():
    gerar_graficos()
    despesas = ler_despesas()

    totais = defaultdict(float)
    total_geral = 0
    for d in despesas:
        v = float(d["valor"])
        totais[d["categoria"]] += v
        total_geral += v
    return render_template("relatorio.html", totais=totais, total_geral=total_geral)


if __name__ == "__main__":
    garantir_arquivo_csv()
    app.run(debug=True)
