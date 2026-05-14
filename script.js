document.getElementById('btnIniciar').addEventListener('click', async () => {
    const ra = document.getElementById('ra').value;
    const digito = document.getElementById('digito').value;
    const senha = document.getElementById('senha').value;
    const statusTxt = document.getElementById('statusTxt');

    if (!ra || !digito || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    statusTxt.innerText = "Obtendo token de acesso...";
    statusTxt.style.color = "#ecc94b"; 

    try {
        // Envia os dados para a API do Leia SP obter o token de login
        // IMPORTANTE: Mude a URL abaixo para o endpoint real do Leia SP que você descobriu
        const loginResponse = await fetch('educacao.sp.gov.br', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: `${ra}${digito}sp`, 
                password: senha
            })
        });

        const loginData = await loginResponse.json();
        const token = loginData.token || loginData.accessToken; 

        if (!token) {
            throw new Error('Falha ao gerar o token. Verifique as credenciais.');
        }

        statusTxt.innerText = "Conectado! Iniciando automação...";
        
        // Dispara o loop de leitura passando o token válido
        iniciarLeituraAutomatica(token, statusTxt);

    } catch (error) {
        statusTxt.innerText = "Erro: " + error.message;
        statusTxt.style.color = "#e53e3e"; 
    }
});

async function iniciarLeituraAutomatica(token, statusElement) {
    let paginaAtual = 1;
    let totalPaginas = 15; 

    statusElement.style.color = "#48bb78"; 

    const loopLeitura = setInterval(async () => {
        if (paginaAtual > totalPaginas) {
            statusElement.innerText = "Livro concluído com sucesso!";
            clearInterval(loopLeitura);
            return;
        }

        statusElement.innerText = `Lendo página ${paginaAtual} de ${totalPaginas}... (Aguardando 2 min)`;

        // Envia a requisição de leitura direto com o token injetado no cabeçalho
        // IMPORTANTE: Ajuste a URL e o corpo JSON conforme o padrão do Leia SP
        await fetch(`educacao.sp.gov.br`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pagina: paginaAtual })
        });

        // Se chegar na última página, dispara a resposta do Quiz
        if (paginaAtual === totalPaginas) {
            statusElement.innerText = "Respondendo ao Quiz final...";
            
            await fetch(`educacao.sp.gov.br`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ resposta: "A" }) 
            });
        }

        paginaAtual++;
    }, 120000); // 2 minutos exatos por página para simular leitura humana
                  }
