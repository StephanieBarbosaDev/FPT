document.addEventListener("DOMContentLoaded", () => {
  const KEY = "remedios";
  const area = document.getElementById("cards-area");

  function carregar(filtro = "") {
    area.innerHTML = "";
    const raw = localStorage.getItem(KEY);
    let arr = raw ? JSON.parse(raw) : [];
    if (filtro) {
      const termo = filtro.trim().toLowerCase();
      arr = arr.filter(item => (item.nome || "").toLowerCase().includes(termo));
    }
    if (!arr.length) {
      area.classList.remove("has-items");
      const empty = document.createElement("div");
      empty.className = "empty-note";
      empty.textContent = filtro ? "Nenhum remédio encontrado." : "Nenhum remédio disponível no momento.";
      area.appendChild(empty);
      return;
    }
    area.classList.add("has-items");
    const grid = document.createElement("div");
    grid.className = "cards-grid";
    arr.forEach((item) => {
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
      meta.innerHTML = `
        <div style="font-weight:800">${item.quantidade ?? 0} unidade(s)</div>
        <div style="margin-left:auto">
          <span class="badge ${item.status === "Indisponível" ? "unavailable" : "available"}">
            ${item.status || "Disponível"}
          </span>
        </div>`;
      const desc = document.createElement("div");
      desc.className = "hint";
      desc.style.width = "100%";
      desc.style.textAlign = "left";
      desc.textContent = item.descricao || "";
      const actions = document.createElement("div");
      actions.className = "card-actions";
      const row = document.createElement("div");
      row.className = "row";
      const btnSolicitar = document.createElement("button");
      btnSolicitar.className = "pill pill-edit";
      btnSolicitar.textContent = "Solicitar";
      btnSolicitar.addEventListener("click", () => {
        // Cria card/modal para upload da receita
  const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';

        const card = document.createElement('div');
        card.style.background = '#fff';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
        card.style.padding = '32px 24px';
        card.style.maxWidth = '350px';
        card.style.width = '100%';
        card.style.textAlign = 'center';

        card.innerHTML = `
          <h2 style='color:var(--brand);margin-bottom:8px'>Solicitar Remédio</h2>
          <div style='margin-bottom:12px'>
            <b>Nome:</b> ${item.nome || '—'}<br>
            <b>Quantidade:</b> ${item.quantidade ?? 1}<br>
            <b>Status:</b> Pendente
          </div>
          <label style='display:block;margin-bottom:8px'>Envie a foto da receita:</label>
          <input type='file' accept='image/*' id='input-receita' style='margin-bottom:12px'>
          <div id='preview-receita' style='margin-bottom:12px'></div>
          <button id='btn-enviar-receita' style='background:#1976d2;color:#fff;padding:8px 18px;border:none;border-radius:6px;cursor:pointer'>Enviar Solicitação</button>
          <button id='btn-cancelar-receita' style='margin-left:8px;background:#eee;color:#333;padding:8px 18px;border:none;border-radius:6px;cursor:pointer'>Cancelar</button>
        `;

        modal.appendChild(card);
        document.body.appendChild(modal);

        // Preview da imagem
        const inputFile = card.querySelector('#input-receita');
        const preview = card.querySelector('#preview-receita');
        inputFile.addEventListener('change', function() {
          const file = inputFile.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
              preview.innerHTML = `<img src='${e.target.result}' style='max-width:120px;border-radius:8px;border:1px solid #ccc'>`;
            };
            reader.readAsDataURL(file);
          } else {
            preview.innerHTML = '';
          }
        });

        // Cancelar
        card.querySelector('#btn-cancelar-receita').onclick = function() {
          document.body.removeChild(modal);
        };

        // Enviar solicitação
        card.querySelector('#btn-enviar-receita').onclick = function() {
          const file = inputFile.files[0];
          if (!file) {
            // Permite enviar sem receita
            const solicitacoesRaw = localStorage.getItem("solicitacoes");
            const solicitacoes = solicitacoesRaw ? JSON.parse(solicitacoesRaw) : [];
            const agora = new Date();
            const expiraEm = new Date(agora.getTime() + 5 * 60 * 60 * 1000); // 5 horas
            solicitacoes.push({
              remedioId: item.id ?? item.nome,
              nome: item.nome,
              quantidade: item.quantidade ?? 1,
              status: "Pendente",
              data: agora.toISOString(),
              expiraEm: expiraEm.toISOString(),
              solicitante: "civil"
            });
            localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
            alert(`Solicitação enviada para o remédio: ${item.nome}`);
            document.body.removeChild(modal);
          } else {
            const reader = new FileReader();
            reader.onload = function(e) {
              const fotoReceita = e.target.result;
              const solicitacoesRaw = localStorage.getItem("solicitacoes");
              const solicitacoes = solicitacoesRaw ? JSON.parse(solicitacoesRaw) : [];
              const agora = new Date();
              const expiraEm = new Date(agora.getTime() + 5 * 60 * 60 * 1000); // 5 horas
              solicitacoes.push({
                remedioId: item.id ?? item.nome,
                nome: item.nome,
                quantidade: item.quantidade ?? 1,
                status: "Pendente",
                data: agora.toISOString(),
                expiraEm: expiraEm.toISOString(),
                solicitante: "civil",
                receita: fotoReceita
              });
              localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
              alert(`Solicitação enviada para o remédio: ${item.nome}`);
              document.body.removeChild(modal);
            };
            reader.readAsDataURL(file);
          }
        };
      });
      row.appendChild(btnSolicitar);
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

  window.addEventListener("storage", () => carregar(document.getElementById("search-input")?.value || ""));
  carregar();

  // Filtro de busca
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      carregar(e.target.value);
    });
  }
});
