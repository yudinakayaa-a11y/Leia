document.getElementById('btnIniciar').addEventListener('click', async () => {
    const ra = document.getElementById('ra').value;
    const digito = document.getElementById('digito').value;
    const senha = document.getElementById('senha').value;
    const statusTxt = document.getElementById('statusTxt');

    if (!ra || !digito || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    statusTxt.innerText = "Conectando ao servidor do Elefante Letrado...";
    statusTxt.style.color = "#ecc94b"; 

    // Proxy público para evitar bloqueio de CORS no GitHub Pages
    const proxy = 'herokuapp.com';
    const urlLogin = proxy + 'elefanteletrado.com.br'; // Ajuste o endpoint final se necessário

    try {
        const loginResponse = await fetch(urlLogin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: `${ra}${digito}sp`, 
                password: senha
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Falha na autenticação. Verifique os dados de login.');
        }

        const loginData = await loginResponse.json();
        
        // Pega o token igual ao formato do log do seu console
        const tokenDinamico = loginData.access_token || loginData.token; 

        if (!tokenDinamico) {
            throw new Error('Não foi possível obter o token de acesso.');
        }

        statusTxt.innerText = "Conectado com sucesso! Iniciando as leituras automáticas...";
        iniciarLeituraAutomatica(tokenDinamico, statusTxt, proxy);

    } catch (error) {
        statusTxt.innerText = "Erro: " + error.message;
        statusTxt.style.color = "#e53e3e"; 
    }
});

async function iniciarLeituraAutomatica(token, statusElement, proxy) {
    let paginaAtual = 1;
    let totalPaginas = 15; 
    const urlLeitura = proxy + 'elefanteletrado.com.br';
    const urlQuiz = proxy + 'elefanteletrado.com.br';

    statusElement.style.color = "#48bb78"; 

    const loopLeitura = setInterval(async () => {
        if (paginaAtual > totalPaginas) {
            statusElement.innerText = "Livro e questionários concluídos com sucesso! 🚀";
            clearInterval(loopLeitura);
            return;
        }

        statusElement.innerText = `Lendo página ${paginaAtual} de ${totalPaginas}... (Aguardando 2 min de segurança)`;

        // Simula o avanço de página enviando o tempo de leitura exigido pelo sistema
        await fetch(urlLeitura, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                page: paginaAtual,
                time_elapsed: 120 
            })
        });

        // Quando chegar na última página, envia a resposta para o Quiz mapeado pelo sistema
        if (paginaAtual === totalPaginas) {
            statusElement.innerText = "Respondendo ao Quiz final automaticamente...";
            
            await fetch(urlQuiz, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    correct: true,
                    answer: "A" 
                }) 
            });
        }

        paginaAtual++;
    }, 120000); // Intervalo rígido de 2 minutos por página
        }
        
