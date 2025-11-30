import sqlite3
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui_mude_em_producao'


# -------------------------------
# CRIAÇÃO DO BANCO
# -------------------------------
def criar_bd():
    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS despesas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            descricao TEXT NOT NULL,
            categoria TEXT NOT NULL,
            valor REAL NOT NULL DEFAULT 0,
            usuario_id INTEGER NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )
    """)

    conn.commit()
    conn.close()


# -------------------------------
# LOGIN
# -------------------------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()

        conn = sqlite3.connect("despesas.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
        usuario = cursor.fetchone()
        conn.close()

        if usuario and check_password_hash(usuario["senha"], password):
            session["usuario_id"] = usuario["id"]
            session["usuario_nome"] = usuario["nome"]
            return redirect(url_for("index"))
        else:
            return render_template("login.html", error="Email ou senha incorretos")

    return render_template("login.html")


# -------------------------------
# CADASTRO
# -------------------------------
@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        nome = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        confirm_password = request.form.get("confirm_password", "").strip()

        if password != confirm_password:
            return render_template("signup.html", error="As senhas não coincidem")

        if len(password) < 6:
            return render_template("signup.html", error="A senha deve ter pelo menos 6 caracteres")

        conn = sqlite3.connect("despesas.db")
        cursor = conn.cursor()

        try:
            senha_hash = generate_password_hash(password, method='pbkdf2:sha256')
            cursor.execute(
                "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
                (nome, email, senha_hash),
            )
            conn.commit()
            conn.close()
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            conn.close()
            return render_template("signup.html", error="Este email já está cadastrado")

    return render_template("signup.html")


# -------------------------------
# LOGOUT
# -------------------------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# -------------------------------
# INDEX (LISTAGEM)
# -------------------------------
@app.route("/")
def index():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM despesas WHERE usuario_id = ? ORDER BY data DESC", (usuario_id,))
    despesas = cursor.fetchall()

    total_geral = sum((d["valor"] or 0) for d in despesas) if despesas else 0

    conn.close()
    return render_template("index.html", despesas=despesas, total_geral=total_geral)


# -------------------------------
# RELATÓRIO EM HTML
# -------------------------------
@app.route("/relatorio")
def relatorio():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute(
        "SELECT categoria, SUM(valor) as total FROM despesas WHERE usuario_id = ? GROUP BY categoria",
        (usuario_id,),
    )
    categorias = cursor.fetchall()

    cursor.execute(
        "SELECT strftime('%Y-%m', data) as mes, SUM(valor) as total FROM despesas WHERE usuario_id = ? GROUP BY mes",
        (usuario_id,),
    )
    meses = cursor.fetchall()

    conn.close()

    categorias_labels = [c["categoria"] for c in categorias]
    categorias_valores = [c["total"] for c in categorias]

    meses_labels = [m["mes"] for m in meses]
    meses_valores = [m["total"] for m in meses]

    total_gasto = sum(categorias_valores) if categorias_valores else 0
    media_por_categoria = total_gasto / len(categorias_valores) if categorias_valores else 0
    categoria_maior_gasto = categorias_labels[categorias_valores.index(max(categorias_valores))] if categorias_valores else "Nenhuma"
    periodo = datetime.now().strftime("%B de %Y").capitalize()

    return render_template(
        "relatorio.html",
        categorias_labels=categorias_labels,
        categorias_valores=categorias_valores,
        meses_labels=meses_labels,
        meses_valores=meses_valores,
        total_gasto=total_gasto,
        media_por_categoria=media_por_categoria,
        categoria_maior_gasto=categoria_maior_gasto,
        periodo=periodo
    )


# -------------------------------
# RELATÓRIO EM PDF (VERSÃO NOVA)
# -------------------------------
@app.route("/exportar_pdf")
def exportar_pdf():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    usuario_id = session["usuario_id"]

    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT data, descricao, categoria, valor
        FROM despesas
        WHERE usuario_id = ?
        ORDER BY data DESC
    """, (usuario_id,))
    despesas = cursor.fetchall()

    cursor.execute("SELECT SUM(valor) FROM despesas WHERE usuario_id = ?", (usuario_id,))
    total = cursor.fetchone()[0] or 0

    cursor.execute("SELECT categoria, SUM(valor) FROM despesas WHERE usuario_id = ? GROUP BY categoria", (usuario_id,))
    categorias = cursor.fetchall()

    conn.close()

    media_por_categoria = total / len(categorias) if categorias else 0
    categoria_maior = max(categorias, key=lambda x: x[1])[0] if categorias else "Nenhuma"

    if not despesas:
        flash("Não há despesas para exportar.")
        return redirect(url_for("relatorio"))

    # Criar PDF
    buffer = BytesIO()
    pdf = SimpleDocTemplate(buffer, pagesize=A4)
    elementos = []
    styles = getSampleStyleSheet()

    # LOGO
    try:
        logo = Image("static/images/icon.png", width=80, height=80)
        logo.hAlign = "CENTER"
        elementos.append(logo)
    except:
        elementos.append(Paragraph("<b>Controller</b>", styles["Title"]))

    elementos.append(Spacer(1, 12))

    # TÍTULO
    titulo = Paragraph("<b>Relatório de Despesas Mensal</b>", styles["Title"])
    elementos.append(titulo)
    elementos.append(Spacer(1, 12))

    # INFO DO USUÁRIO
    info = Paragraph(
        f"Usuário: <b>{session['usuario_nome']}</b><br/>"
        f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles["Normal"]
    )
    elementos.append(info)
    elementos.append(Spacer(1, 18))

    # RESUMO
    resumo = [
        ["Total Gasto", f"R$ {total:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")],
        ["Média por Categoria", f"R$ {media_por_categoria:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")],
        ["Maior Categoria", categoria_maior],
        ["Período", datetime.now().strftime("%B de %Y").capitalize()],
    ]

    tabela_resumo = Table(resumo, colWidths=[7 * cm, 7 * cm])
    tabela_resumo.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a3c6e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey)
    ]))

    elementos.append(tabela_resumo)
    elementos.append(Spacer(1, 22))

    # TABELA DE DESPESAS
    dados = [["Data", "Descrição", "Categoria", "Valor (R$)"]]

    for d in despesas:
        valor = d["valor"] or 0
        dados.append([
            d["data"],
            d["descricao"],
            d["categoria"],
            f"{valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        ])

    dados.append(["", "", "Total Geral", f"R$ {total:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")])

    tabela = Table(dados, colWidths=[3*cm, 7*cm, 3*cm, 3*cm])
    tabela.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#374151")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
        ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#e5e7eb")),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
    ]))

    elementos.append(tabela)

    pdf.build(elementos)

    buffer.seek(0)
    response = make_response(buffer.read())
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "attachment; filename=relatorio_despesas.pdf"
    return response


# -------------------------------
# ADICIONAR DESPESA
# -------------------------------
@app.route("/adicionar", methods=["POST"])
def adicionar():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    data = request.form.get("data", "").strip()
    descricao = request.form.get("descricao", "").strip()
    categoria = request.form.get("categoria", "").strip()
    valor_str = request.form.get("valor", "").strip()

    try:
        valor = float(valor_str)
    except:
        valor = 0.0

    usuario_id = session["usuario_id"]

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO despesas (data, descricao, categoria, valor, usuario_id) VALUES (?, ?, ?, ?, ?)",
        (data, descricao, categoria, valor, usuario_id),
    )
    conn.commit()
    conn.close()

    return redirect(url_for("index"))


# -------------------------------
# EDITAR DESPESA
# -------------------------------
@app.route("/editar/<int:id>", methods=["POST"])
def editar(id):
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    data = request.form.get("data", "").strip()
    descricao = request.form.get("descricao", "").strip()
    categoria = request.form.get("categoria", "").strip()
    valor_str = request.form.get("valor", "").strip()

    try:
        valor = float(valor_str)
    except:
        valor = 0.0

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE despesas SET data = ?, descricao = ?, categoria = ?, valor = ? "
        "WHERE id = ? AND usuario_id = ?",
        (data, descricao, categoria, valor, id, session["usuario_id"]),
    )
    conn.commit()
    conn.close()

    return redirect(url_for("index"))


# -------------------------------
# DELETAR DESPESA
# -------------------------------
@app.route("/deletar/<int:id>", methods=["POST"])
def deletar(id):
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM despesas WHERE id = ? AND usuario_id = ?",
        (id, session["usuario_id"]),
    )
    conn.commit()
    conn.close()

    return redirect(url_for("index"))


# -------------------------------
# START APP
# -------------------------------
if __name__ == "__main__":
    criar_bd()
    app.run(debug=True)
