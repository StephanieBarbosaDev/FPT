document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-login")
  const usuario = document.getElementById("usuario")
  const senha = document.getElementById("senha")
  const erro = document.getElementById("erro")

  form.addEventListener("submit", function (e) {
    e.preventDefault()

    if (usuario.value.trim() === "" || senha.value.trim() === "") {
      erro.textContent = "Preencha o nome de usuário e a senha."
      erro.style.display = "block"
    } else {
      erro.style.display = "none"

  window.location.href = "homeCivil.html"
    }
  })
})
