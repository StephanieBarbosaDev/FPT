document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro")
  const mensagemErro = document.getElementById("mensagem-erro")
  const mensagemSucesso = document.getElementById("mensagem-sucesso")
  const senha = document.getElementById("senha")
  const confirmaSenha = document.getElementById("confirma-senha")
  const cpfInput = document.getElementById("cpf")
  const telefoneInput = document.getElementById("telefone")

  function aplicarMascaraCPF(value) {
    const nums = value.replace(/\D/g, "").slice(0, 11)
    let res = nums
    if (nums.length > 3) res = nums.replace(/^(\d{3})(\d+)/, "$1.$2")
    if (nums.length > 6) res = res.replace(/^(\d{3})\.(\d{3})(\d+)/, "$1.$2.$3")
    if (nums.length > 9)
      res = res.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d+)/, "$1.$2.$3-$4")
    return res
  }
  cpfInput.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraCPF(e.target.value)
  })

  function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "")
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    let soma = 0
    let resto

    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(9, 10), 10)) return false

    soma = 0
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i)
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.substring(10, 11), 10)) return false

    return true
  }

  cpfInput.addEventListener("blur", () => {
    const raw = cpfInput.value
    if (!raw) return
    if (!validarCPF(raw)) {
      mostrarErro("CPF inválido. Verifique os números.")
      cpfInput.classList.add("invalid")
    } else {
      ocultarMensagens()
      cpfInput.classList.remove("invalid")
    }
  })

  function aplicarMascaraTelefone(value) {
    const nums = value.replace(/\D/g, "").slice(0, 11)
    if (nums.length <= 2) return nums
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    if (nums.length <= 10)
      return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }
  telefoneInput.addEventListener("input", (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value)
  })

  function senhasIguais() {
    return senha.value === confirmaSenha.value
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    ocultarMensagens()

    if (!form.reportValidity()) {
      mostrarErro("Por favor, preencha os campos obrigatórios corretamente.")
      return
    }

    if (!senhasIguais()) {
      mostrarErro("As senhas informadas não coincidem.")
      return
    }

    const cpf = cpfInput.value.replace(/\D/g, "")
    if (!validarCPF(cpf)) {
      mostrarErro("CPF inválido. Verifique os números.")
      return
    }

    const cadastro = {
      nome: document.getElementById("nome").value.trim(),
      cpf: cpf,
      telefone: telefoneInput.value.trim(),
      email: document.getElementById("email").value.trim(),
      criadoEm: new Date().toISOString(),
    }

    const key = "civis"
    const existentesRaw = localStorage.getItem(key)
    const existentes = existentesRaw ? JSON.parse(existentesRaw) : []
    existentes.push(cadastro)
    localStorage.setItem(key, JSON.stringify(existentes))

    mostrarSucesso("Cadastro realizado com sucesso! Redirecionando...")
    setTimeout(() => {
  window.location.href = "homeCivil.html"
    }, 800)
  })

  function mostrarErro(msg) {
    mensagemErro.textContent = msg
    mensagemErro.style.display = "block"
    mensagemSucesso.style.display = "none"
  }
  function mostrarSucesso(msg) {
    mensagemSucesso.textContent = msg
    mensagemSucesso.style.display = "block"
    mensagemErro.style.display = "none"
  }
  function ocultarMensagens() {
    mensagemErro.style.display = "none"
    mensagemSucesso.style.display = "none"
  }
})
