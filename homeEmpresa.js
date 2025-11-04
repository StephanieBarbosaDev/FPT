document.addEventListener("DOMContentLoaded", () => {
  const KEY = "remedios"
  const area = document.getElementById("cards-area")

  function carregar() {
    area.innerHTML = "";
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];

    if (!arr.length) {
      area.classList.remove("has-items");
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent =
        'Nenhum remédio cadastrado. Clique em "CADASTRAR REMÉDIO" para adicionar.';
      area.appendChild(empty);
    } else {
      area.classList.add("has-items");
      const grid = document.createElement("div");
      grid.className = "cards-grid";

      arr.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "card";

        const img = document.createElement("img");
        img.className = "thumb";
        img.src = item.foto ? item.foto : "remedio-exemplo.jpg";
        img.alt = item.nome || "medicamento";

        const title = document.createElement("h3");
        title.textContent = item.nome || "—";
        title.style.margin = "0";
        title.style.color = "var(--brand)";

        const meta = document.createElement("div");
        meta.className = "meta-row";
        meta.innerHTML = `<div style="font-weight:800">${item.quantidade ?? 0} unidade(s)</div><div style="margin-left:auto"><span class="badge ${item.status === "Indisponível" ? "unavailable" : "available"}">${item.status || "Disponível"}</span></div>`;

        const desc = document.createElement("div");
        desc.className = "hint";
        desc.style.width = "100%";
        desc.style.textAlign = "left";
        desc.textContent = item.descricao || "";

        const actions = document.createElement("div");
        actions.className = "card-actions";
        const row = document.createElement("div");
        row.className = "row";

        const btnEdit = document.createElement("button");
        btnEdit.className = "pill pill-edit";
        btnEdit.textContent = "Editar";
        btnEdit.addEventListener("click", () => {
          location.href = `cadastroRemedio.html?editar=${index}`;
        });

        const btnDel = document.createElement("button");
        btnDel.className = "pill pill-delete";
        btnDel.textContent = "Excluir";
        btnDel.addEventListener("click", () => {
          if (confirm("Deseja realmente excluir este remédio?")) {
            excluir(index);
          }
        });

        row.appendChild(btnEdit);
        row.appendChild(btnDel);
        actions.appendChild(row);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(desc);
        card.appendChild(actions);

        grid.appendChild(card);
      });

      area.appendChild(grid);
    }

    // Exibe solicitações recebidas
    exibirSolicitacoes();
  }

  function exibirSolicitacoes() {
    const solicitacoesRaw = localStorage.getItem("solicitacoes");
    const solicitacoes = solicitacoesRaw ? JSON.parse(solicitacoesRaw) : [];
    if (!solicitacoes.length) return;
    let container = document.getElementById("solicitacoes-area");
    if (!container) {
      container = document.createElement("div");
      container.id = "solicitacoes-area";
      container.style.marginTop = "32px";
      container.innerHTML = `<h2 style='color:var(--brand)'>Solicitações Recebidas</h2>`;
      area.parentNode.insertBefore(container, area.nextSibling);
    }
    container.innerHTML = `<h2 style='color:var(--brand)'>Solicitações Recebidas</h2>`;
    solicitacoes.forEach((sol, idx) => {
      const div = document.createElement("div");
      div.className = "solicitacao-card";
      div.style.border = "1px solid #ccc";
      div.style.padding = "12px";
      div.style.marginBottom = "8px";
      div.innerHTML = `<b>${sol.nome}</b> <span style='margin-left:8px'>Status: <span class='badge ${sol.status.toLowerCase()}' style='font-weight:bold'>${sol.status}</span></span>`;
      if (sol.status === "Pendente") {
        const btnAprovar = document.createElement("button");
        btnAprovar.textContent = "Aprovar";
        btnAprovar.className = "pill pill-edit";
        btnAprovar.style.marginLeft = "12px";
        btnAprovar.onclick = () => atualizarStatusSolicitacao(idx, "Aprovada");
        const btnRecusar = document.createElement("button");
        btnRecusar.textContent = "Recusar";
        btnRecusar.className = "pill pill-delete";
        btnRecusar.style.marginLeft = "8px";
        btnRecusar.onclick = () => atualizarStatusSolicitacao(idx, "Recusada");
        div.appendChild(btnAprovar);
        div.appendChild(btnRecusar);
      }
      container.appendChild(div);
    });
  }

  function atualizarStatusSolicitacao(idx, novoStatus) {
    const solicitacoesRaw = localStorage.getItem("solicitacoes");
    const solicitacoes = solicitacoesRaw ? JSON.parse(solicitacoesRaw) : [];
    if (idx < 0 || idx >= solicitacoes.length) return;
    if (novoStatus === "Aprovada" || novoStatus === "Aprovado") {
      // Atualiza estoque
      const remRaw = localStorage.getItem(KEY);
      const remedios = remRaw ? JSON.parse(remRaw) : [];
      const sol = solicitacoes[idx];
      const idxRem = remedios.findIndex(r => r.nome && r.nome.toLowerCase() === (sol.nome || "").toLowerCase());
      if (idxRem !== -1) {
        const pedidoQuantidade = Number(sol.quantidade || 0);
        remedios[idxRem].quantidade = Math.max(0, remedios[idxRem].quantidade - pedidoQuantidade);
        localStorage.setItem(KEY, JSON.stringify(remedios));
        window.dispatchEvent(new Event("storage"));
      }
    }
    solicitacoes[idx].status = novoStatus;
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
    carregar();
  }

  function excluir(i) {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    if (i < 0 || i >= arr.length) return
    arr.splice(i, 1)
    localStorage.setItem(KEY, JSON.stringify(arr))
    carregar()
  }

  window.addEventListener("storage", carregar)
  carregar()
})
