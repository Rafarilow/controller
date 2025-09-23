import sqlite3
from flask import Flask, render_template, request, redirect, url_for, jsonify

app = Flask(__name__)


def criar_bd():
    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS despesas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            descricao TEXT NOT NULL,
            categoria TEXT NOT NULL,
            valor REAL NOT NULL DEFAULT 0
        )
        """
    )
    conn.commit()
    conn.close()



@app.route("/")
def index():
    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM despesas ORDER BY data DESC")
    despesas = cursor.fetchall()

    total_geral = sum((d["valor"] or 0) for d in despesas) if despesas else 0

    conn.close()
    return render_template("index.html", despesas=despesas, total_geral=total_geral)



@app.route("/relatorio")
def relatorio():
    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT categoria, SUM(valor) as total FROM despesas GROUP BY categoria")
    categorias = cursor.fetchall()

    cursor.execute("SELECT strftime('%Y-%m', data) as mes, SUM(valor) as total FROM despesas GROUP BY mes")
    meses = cursor.fetchall()

    conn.close()

    # Preparar dados para Chart.js
    categorias_labels = [c["categoria"] for c in categorias]
    categorias_valores = [c["total"] or 0 for c in categorias]

    meses_labels = [m["mes"] for m in meses]
    meses_valores = [m["total"] or 0 for m in meses]

    return render_template(
        "relatorio.html",
        categorias_labels=categorias_labels,
        categorias_valores=categorias_valores,
        meses_labels=meses_labels,
        meses_valores=meses_valores,
    )



@app.route("/adicionar", methods=["POST"])
def adicionar():
    data = request.form.get("data", "").strip()
    descricao = request.form.get("descricao", "").strip()
    categoria = request.form.get("categoria", "").strip()

    valor_str = request.form.get("valor", "").strip()
    try:
        valor = float(valor_str) if valor_str else 0.0
    except ValueError:
        valor = 0.0

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO despesas (data, descricao, categoria, valor) VALUES (?, ?, ?, ?)",
        (data, descricao, categoria, valor),
    )
    conn.commit()
    conn.close()

    return redirect(url_for("index"))



@app.route("/editar/<int:id>", methods=["POST"])
def editar(id):
    data = request.form.get("data", "").strip()
    descricao = request.form.get("descricao", "").strip()
    categoria = request.form.get("categoria", "").strip()

    valor_str = request.form.get("valor", "").strip()
    try:
        valor = float(valor_str) if valor_str else 0.0
    except ValueError:
        valor = 0.0

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE despesas SET data = ?, descricao = ?, categoria = ?, valor = ? WHERE id = ?",
        (data, descricao, categoria, valor, id),
    )
    conn.commit()
    conn.close()

    return redirect(url_for("index"))


# ======================
# Rota: Deletar despesa
# ======================
@app.route("/deletar/<int:id>", methods=["POST"])
def deletar(id):
    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM despesas WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return redirect(url_for("index"))



if __name__ == "__main__":
    criar_bd()
    app.run(debug=True)
