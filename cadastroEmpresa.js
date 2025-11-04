

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  const cepInput = document.getElementById('cep');
  const logradouroInput = document.getElementById('logradouro');
  const bairroInput = document.getElementById('bairro');
  const cidadeInput = document.getElementById('cidade');
  const ufInput = document.getElementById('uf');
  const mensagemErro = document.getElementById('mensagem-erro');
  const mensagemSucesso = document.getElementById('mensagem-sucesso');
  const senha = document.getElementById('senha');
  const confirmaSenha = document.getElementById('confirma-senha');
  const cnpjInput = document.getElementById('cnpj');
  const telefoneInput = document.getElementById('telefone');

  // --- cnpj  ---
  function aplicarMascaraCNPJ(value) {
    const nums = value.replace(/\D/g, '').slice(0,14);
    let res = nums;
    if (nums.length > 2) res = nums.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (nums.length > 5) res = res.replace(/^(\d{2})\.(\d{3})(\d+)/, '$1.$2.$3');
    if (nums.length > 8) res = res.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d+)/, '$1.$2.$3/$4');
    if (nums.length > 12) res = res.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
    return res;
  }
  cnpjInput.addEventListener('input', (e) => {
    e.target.value = aplicarMascaraCNPJ(e.target.value);
  });

  
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const calcular = (base, pesos) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) soma += parseInt(base[i],10) * pesos[i];
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const b = cnpj.slice(0,12);
    const d = cnpj.slice(12);
    const p1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    const v1 = calcular(b, p1);
    const p2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const v2 = calcular(b + v1, p2);
    return d === `${v1}${v2}`;
  }

  cnpjInput.addEventListener('blur', () => {
    const raw = cnpjInput.value;
    if (!raw) return;
    if (!validarCNPJ(raw)) {
      mostrarErro('CNPJ inválido. Verifique os números.');
      cnpjInput.classList.add('invalid');
    } else {
      ocultarMensagens();
      cnpjInput.classList.remove('invalid');
    }
  });

  // ---  TELEFONE ---
  function aplicarMascaraTelefone(value) {
    const nums = value.replace(/\D/g, '').slice(0,11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 6) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`;
    return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
  }
  telefoneInput.addEventListener('input', (e) => {
    e.target.value = aplicarMascaraTelefone(e.target.value);
  });

  // --- CEP preenche, mas usuário pode editar depois ---
  cepInput.addEventListener('blur', async () => {
    const cepRaw = cepInput.value || '';
    const cep = cepRaw.replace(/\D/g, '');
    if (!/^\d{8}$/.test(cep)) {
      
      limparEnderecoTemporario();
      return;
    }

    preencherEnderecoProvisorio();
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Erro ao consultar CEP.');
      const data = await response.json();
      if (data.erro) {
        limparEnderecoTemporario();
        mostrarErro('CEP não encontrado.');
        return;
      }

      // Preenche, mas deixa os campos editáveis para o usuário ajustar
      logradouroInput.value = data.logradouro || '';
      bairroInput.value = data.bairro || '';
      cidadeInput.value = data.localidade || '';
      ufInput.value = data.uf || '';
      ocultarMensagens();
    } catch (err) {
      limparEnderecoTemporario();
      mostrarErro('Não foi possível consultar o CEP no momento.');
      console.error(err);
    }
  });

  function limparEnderecoTemporario() {
    logradouroInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';
    ufInput.value = '';
  }
  function preencherEnderecoProvisorio() {
    logradouroInput.value = 'Consultando...';
    bairroInput.value = 'Consultando...';
    cidadeInput.value = 'Consultando...';
    ufInput.value = '';
  }

  //  salvar no localStorage e redirecionar ---
  function senhasIguais() { return senha.value === confirmaSenha.value; }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ocultarMensagens();

    if (!form.reportValidity()) {
      mostrarErro('Por favor, preencha os campos obrigatórios corretamente.');
      return;
    }

    if (!senhasIguais()) {
      mostrarErro('As senhas informadas não coincidem.');
      return;
    }

    const cnpj = cnpjInput.value.replace(/\D/g, '');
    if (!validarCNPJ(cnpj)) {
      mostrarErro('CNPJ inválido. Verifique os números.');
      return;
    }

    const cadastro = {
      cnpj,
      razao: document.getElementById('razao').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefone: telefoneInput.value.trim(),
      cep: cepInput.value.replace(/\D/g, ''),
      logradouro: logradouroInput.value.trim(),
      numero: document.getElementById('numero').value.trim(),
      bairro: bairroInput.value.trim(),
      cidade: cidadeInput.value.trim(),
      uf: ufInput.value.trim().toUpperCase(),
      criadoEm: new Date().toISOString()
    };

    // salva no localStorage (simulação)
    const key = 'empresas';
    const existentesRaw = localStorage.getItem(key);
    const existentes = existentesRaw ? JSON.parse(existentesRaw) : [];
    existentes.push(cadastro);
    localStorage.setItem(key, JSON.stringify(existentes));

    // feedback e redirecionamento
    mostrarSucesso('Cadastro realizado com sucesso! Redirecionando...');
    setTimeout(() => {
      // redireciona para home
  window.location.href = 'homeEmpresa.html';
    }, 800); // pequeno delay para o usuário ver a mensagem
  });

  function mostrarErro(msg) {
    mensagemErro.textContent = msg;
    mensagemErro.style.display = 'block';
    mensagemSucesso.style.display = 'none';
  }
  function mostrarSucesso(msg) {
    mensagemSucesso.textContent = msg;
    mensagemSucesso.style.display = 'block';
    mensagemErro.style.display = 'none';
  }
  function ocultarMensagens() {
    mensagemErro.style.display = 'none';
    mensagemSucesso.style.display = 'none';
  }
});

