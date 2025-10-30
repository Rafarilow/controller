import sqlite3
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, flash
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'sua_chave_secreta_aqui_mude_em_producao'


def criar_bd():
    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

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
            senha_hash = generate_password_hash(password)
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


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
def index():
    if "usuario_id" not in session:
        return redirect(url_for("login"))

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
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    conn = sqlite3.connect("despesas.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("SELECT categoria, SUM(valor) as total FROM despesas GROUP BY categoria")
    categorias = cursor.fetchall()

    cursor.execute("SELECT strftime('%Y-%m', data) as mes, SUM(valor) as total FROM despesas GROUP BY mes")
    meses = cursor.fetchall()

    conn.close()

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
    if "usuario_id" not in session:
        return redirect(url_for("login"))

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
    if "usuario_id" not in session:
        return redirect(url_for("login"))

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


@app.route("/deletar/<int:id>", methods=["POST"])
def deletar(id):
    if "usuario_id" not in session:
        return redirect(url_for("login"))

    conn = sqlite3.connect("despesas.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM despesas WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return redirect(url_for("index"))



if __name__ == "__main__":
    criar_bd()
    app.run(debug=True)
