const MAX_W = 900
const MAX_H = 900
const OUTPUT_TYPE = "image/jpeg"
const QUALITY = 0.75
const STORAGE_KEY = "remedios"
const EMP_KEY = "empresas"

document.addEventListener("DOMContentLoaded", () => {
  const qs = new URLSearchParams(location.search)
  const editarIndex = qs.has("editar") ? Number(qs.get("editar")) : null

  const fotoInput = document.getElementById("foto")
  const nomeInput = document.getElementById("nome")
  const quantidadeInput = document.getElementById("quantidade")
  const descricaoInput = document.getElementById("descricao")
  const statusEl = document.getElementById("status")
  const titulo = document.getElementById("form-title")
  const btnSave = document.getElementById("btn-save")
  const btnCancel = document.getElementById("btn-cancel")
  const btnBack = document.getElementById("btn-back-cadastrar")

  // Funções para carregar localStorage
  function loadArr() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  }
  function loadEmp() {
    return JSON.parse(localStorage.getItem(EMP_KEY) || "[]")
  }

  const empresas = loadEmp()
  const empresaAtual = empresas.length
    ? empresas[empresas.length - 1].razao ||
      empresas[empresas.length - 1].nome ||
      "Empresa"
    : "—"

  // Armazena a foto antiga quando editar
  let originalFotoData = null

  // Preencher campos se estiver editando
  if (editarIndex !== null && !Number.isNaN(editarIndex)) {
    const arr = loadArr()
    const item = arr[editarIndex]
    if (!item) {
  alert("Remédio não encontrado.")
  location.href = "homeEmpresa.html"
      return
    }
    nomeInput.value = item.nome || ""
    quantidadeInput.value = item.quantidade ?? 0
    descricaoInput.value = item.descricao || ""
    statusEl.value = item.status || "Disponível"
    titulo.textContent = "Editar Remédio"
    btnSave.textContent = "Salvar alterações"
    originalFotoData = item.foto || null
  }

  // Compressão de imagem
  async function compressFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(1, MAX_W / img.width, MAX_H / img.height)
          const canvas = document.createElement("canvas")
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext("2d")
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL(OUTPUT_TYPE, QUALITY))
        }
        img.onerror = () => reject(new Error("Erro ao carregar imagem"))
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Salvar ou editar remédio
  async function doSave() {
    const nome = nomeInput.value.trim()
    const quantidade = Number(quantidadeInput.value || 0)
    const descricao = descricaoInput.value.trim()
    const status = statusEl.value || "Disponível"

    if (!nome) {
      alert("Informe o nome do medicamento")
      return
    }
    if (quantidade < 0) {
      alert("Quantidade inválida")
      return
    }

    btnSave.disabled = true
    btnSave.textContent = "Salvando..."

    const arr = loadArr()
    let fotoData = null

    if (fotoInput.files && fotoInput.files[0]) {
      try {
        fotoData = await compressFile(fotoInput.files[0])
      } catch {
        alert("Erro ao processar a imagem")
        btnSave.disabled = false
        btnSave.textContent =
          editarIndex !== null ? "Salvar alterações" : "Salvar"
        return
      }
    } else {
      // Mantém a foto antiga se estiver editando, senão fica null
      fotoData =
        editarIndex !== null && originalFotoData ? originalFotoData : null
    }

    const novoItem = {
      nome,
      quantidade,
      descricao,
      foto: fotoData,
      status,
      empresa: empresaAtual,
      criadoEm: new Date().toISOString(),
    }
    if (editarIndex !== null && !Number.isNaN(editarIndex))
      arr[editarIndex] = novoItem
    else arr.push(novoItem)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
      window.dispatchEvent(new Event("storage"))
    } catch {
      alert("Erro ao salvar (espaço insuficiente)")
      btnSave.disabled = false
      btnSave.textContent =
        editarIndex !== null ? "Salvar alterações" : "Salvar"
      return
    }

  location.href = "homeEmpresa.html"
  }

  // Botões Cancelar e Voltar
  btnCancel.addEventListener(
    "click",
  () => (location.href = "homeEmpresa.html")
  )
  if (btnBack)
    btnBack.addEventListener(
      "click",
  () => (location.href = "homeEmpresa.html")
    )

  btnSave.addEventListener("click", doSave)
})


// parte para pessoa civil
document.getElementById("form-cadastro-remedio").addEventListener("submit", function (e) {
  e.preventDefault();

  // Pega os valores do formulário
  const nome = document.getElementById("nome").value;
  const quantidade = document.getElementById("quantidade").value;
  const descricao = document.getElementById("descricao").value;
  const imagem = document.getElementById("imagem").value; // pode ser um URL

  // Busca os remédios salvos
  let remedios = JSON.parse(localStorage.getItem("remedios")) || [];

  // Cria o novo remédio
  const novoRemedio = {
    nome,
    quantidade,
    descricao,
    imagem,
    status: "Disponível"
  };

  // Salva no localStorage
  remedios.push(novoRemedio);
  localStorage.setItem("remedios", JSON.stringify(remedios));

  alert("Remédio cadastrado com sucesso!");
  e.target.reset();
});
