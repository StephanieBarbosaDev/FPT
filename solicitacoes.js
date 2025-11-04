// aprovar/recusar/excluir
document.addEventListener("DOMContentLoaded", () => {
  const KEY = "solicitacoes"
  const REM_KEY = "remedios"
  const listEl = document.getElementById("list")

  function load() {
    listEl.innerHTML = ""
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []

    if (!arr.length) {
      const empty = document.createElement("div")
      empty.style.textAlign = "center"
      empty.style.color = "#444"
      empty.textContent = "Nenhuma solicitação por enquanto."
      listEl.appendChild(empty)
      return
    }

    arr.forEach((s, idx) => {
      const card = document.createElement("article")
      card.className = "sol-card"

      const thumbSrc = s.receita || "remedio-exemplo.jpg"

  let corStatus = '#FFC107'; // amarelo padrão para pendente
      if (s.status === 'Aprovado' || s.status === 'Aprovada') corStatus = '#43A047'; // verde
      if (s.status === 'Recusado' || s.status === 'Recusada') corStatus = '#E53935'; // vermelho
      if (s.status === 'Expirada') corStatus = '#E53935'; // vermelho para expirada

      card.innerHTML = `
        <img class="thumb" src="${thumbSrc}" alt="receita">
        <div class="sol-info">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="font-weight:800;color:var(--brand)">${escape(
              s.usuario || "—"
            )}</div>
            <div style="color:#666">CPF: ${escape(s.cpf || "—")}</div>
            <div style="margin-left:auto"><span class="status-pill" style="background:${corStatus};color:#fff;padding:2px 12px;border-radius:6px;font-weight:bold">${
        s.status || "Pendente"
      }</span></div>
          </div>
          <div class="sol-meta">
            <div>Remédio: <strong>${escape(s.remedioNome || s.nome || "—")}</strong></div>
            <div>Quantidade: <strong>${escape(
              String(s.quantidade || "—")
            )}</strong></div>
            <div>Data: ${
              s.criadoEm ? new Date(s.criadoEm).toLocaleString() : (s.data ? new Date(s.data).toLocaleString() : "")
            }</div>
          </div>
          <div style="margin-top:8px;color:#333">${escape(
            s.observacoes || ""
          )}</div>
          <div style="margin-top:8px;color:#333">
            <b>Foto da receita:</b><br>
            ${s.receita ? `<img src='${s.receita}' alt='Receita' style='max-width:180px;border:1px solid #ccc;border-radius:8px;margin-top:4px'>` : '<span style="color:red">Não enviada</span>'}
          </div>
        </div>
        <div class="sol-actions">
          ${s.status === 'Pendente' ? `
            <button class="btn-approve" data-index="${idx}">Aprovar</button>
            <button class="btn-reject" data-index="${idx}">Recusar</button>
          ` : ''}
          <button class="btn-del" data-index="${idx}">Excluir</button>
        </div>
      `
      listEl.appendChild(card)
    })

    // attach events
    listEl.querySelectorAll(".btn-approve").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const i = Number(e.currentTarget.dataset.index)
        aprovar(i)
      })
    )
    listEl.querySelectorAll(".btn-reject").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const i = Number(e.currentTarget.dataset.index)
        recusar(i)
      })
    )
    listEl.querySelectorAll(".btn-del").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const i = Number(e.currentTarget.dataset.index)
        if (confirm("Deseja realmente excluir essa solicitação?")) excluir(i)
      })
    )
  }

  function salvarArray(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr))
  }
  function salvarRemedios(arr) {
    localStorage.setItem(REM_KEY, JSON.stringify(arr))
    window.dispatchEvent(new Event("storage"))
  }

  function aprovar(index) {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    const s = arr[index]
    if (!s) return alert("Solicitação não encontrada.")

    const remRaw = localStorage.getItem(REM_KEY)
    const remedios = remRaw ? JSON.parse(remRaw) : []
    const idx = remedios.findIndex(
      (r) =>
        r.nome && r.nome.toLowerCase() === (s.remedioNome || "").toLowerCase()
    )

    if (idx === -1) {
      alert("Remédio não encontrado no estoque. Não é possível aprovar.")
      return
    }

    const pedidoQuantidade = Number(s.quantidade || 0)
    if (remedios[idx].quantidade < pedidoQuantidade) {
      alert("Estoque insuficiente para aprovar essa solicitação.")
      return
    }

    remedios[idx].quantidade = Math.max(
      0,
      remedios[idx].quantidade - pedidoQuantidade
    )
    salvarRemedios(remedios)

    s.status = "Aprovado"
    s.respondidoEm = new Date().toISOString()
    arr[index] = s
    salvarArray(arr)

    alert("Solicitação aprovada e estoque atualizado.")
    load()
  }

  function recusar(index) {
  const raw = localStorage.getItem(KEY)
  const arr = raw ? JSON.parse(raw) : []
  const s = arr[index]
  if (!s) return alert("Solicitação não encontrada.")
  s.status = "Recusado"
  s.respondidoEm = new Date().toISOString()
  arr[index] = s
  salvarArray(arr)
  alert("Solicitação recusada.")
  load()
  }

  function excluir(index) {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    arr.splice(index, 1)
    salvarArray(arr)
    load()
  }

  function escape(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
  }

  load()
})
