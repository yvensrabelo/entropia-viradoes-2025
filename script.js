// Configurações
// Token agora é protegido via função serverless - não exposto no frontend
const WEBHOOK_URL = 'https://webhook.cursoentropia.com/webhook/REGISTRODOPEDIDOVIR2025';

// Variáveis globais
let userData = {};
let selectedCourses = [];
let totalPrice = 0;

// Animação de abertura
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        const mainContainer = document.getElementById('main-container');

        splashScreen.classList.add('fade-out');

        setTimeout(() => {
            splashScreen.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            mainContainer.classList.add('fade-in');
        }, 500);
    }, 2500);

    // Inicializar eventos
    initializeEventListeners();
});

function initializeEventListeners() {
    // Máscara de CPF
    const cpfInput = document.getElementById('cpf-input');
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})/, '$1-$2');
        e.target.value = value;
    });

    // Submit CPF
    document.getElementById('cpf-submit').addEventListener('click', handleCPFSubmit);
    cpfInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleCPFSubmit();
    });

    // Continuar para WhatsApp
    document.getElementById('continue-to-whatsapp').addEventListener('click', () => {
        if (selectedCourses.length > 0) {
            updateOrderSummary();
            populateStudentName(); // Preencher nome automaticamente
            showStep('step-4');
        }
    });

    // Máscara de WhatsApp
    const whatsappInput = document.getElementById('whatsapp-input');
    whatsappInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });

    // Submit final
    document.getElementById('submit-order').addEventListener('click', handleFinalSubmit);
    whatsappInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleFinalSubmit();
    });
}

// Inicializar checkboxes dos cursos (chamado quando a tela de viradões é mostrada)
function initializeCourseCheckboxes() {
    document.querySelectorAll('.course-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateCartTotal);
    });
}

// Mostrar página de saudação
function showGreetingPage(firstName = null) {
    const loadingBrain = document.getElementById('loading-brain');
    const greetingText = document.getElementById('greeting-text');

    if (firstName) {
        // Se API retornou dados, mostrar "Olá, {nome}"
        const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        greetingText.textContent = `Olá, ${formattedName}`;

        // Aguardar, trocar para saudação e depois ir para viradões
        setTimeout(() => {
            loadingBrain.classList.add('hidden');
            greetingText.classList.remove('hidden');

            // Após mais 2 segundos, ir para seleção de viradões
            setTimeout(() => {
                showStep('step-3');
                initializeCourseCheckboxes();
            }, 2000);
        }, 1500); // Tempo para mostrar o loading
    } else {
        // Se API NÃO retornou dados, NÃO mostrar "Olá", ir direto para viradões
        setTimeout(() => {
            showStep('step-3');
            initializeCourseCheckboxes();
        }, 2000); // Tempo total da animação EntroInteligência
    }
}

// Validação de CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;

    return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
}

// Manipular envio de CPF
async function handleCPFSubmit() {
    const cpfInput = document.getElementById('cpf-input');
    const cpfError = document.getElementById('cpf-error');
    const submitBtn = document.getElementById('cpf-submit');
    const cpf = cpfInput.value.replace(/\D/g, '');

    // Limpar erro anterior
    cpfError.textContent = '';

    // Validar CPF
    if (!validateCPF(cpf)) {
        cpfError.textContent = 'CPF inválido. Por favor, digite um CPF válido.';
        cpfInput.classList.add('error');
        return;
    }

    // Mostrar tela verde com loading imediatamente
    showStep('step-2');
    const loadingBrain = document.getElementById('loading-brain');
    const greetingText = document.getElementById('greeting-text');
    loadingBrain.classList.remove('hidden');
    greetingText.classList.add('hidden');

    // Mostrar loading no botão também
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';
    cpfInput.classList.remove('error');

    try {
        console.log('Fazendo chamada para API com CPF:', cpf);

        // Fazer chamada à API via função serverless para proteger o token
        const response = await fetch('/api/consulta-cpf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cpf: cpf
            })
        });

        userData.cpf = cpf;

        // CPFs especiais para demonstração da animação
        if (cpf === '98660608291') {
            userData.nome = 'YVENS FERNANDO DOS SANTOS RABELO';
            userData.dataNascimento = '13/07/2003';

            const birthday = parseBirthday(userData.dataNascimento);
            const daysUntilBirthday = calculateDaysUntilBirthday(birthday);

            console.log('Usando CPF de demonstração (Yvens):', userData.nome, daysUntilBirthday);
            const firstName = userData.nome.split(' ')[0];
            showGreetingPage(firstName);
            return;
        }

        if (cpf === '51837587272') {
            userData.nome = 'VALERIA FERREIRA DOS SANTOS';
            userData.dataNascimento = '07/01/1981';

            const birthday = parseBirthday(userData.dataNascimento);
            const daysUntilBirthday = calculateDaysUntilBirthday(birthday);

            console.log('Usando CPF de demonstração (Valeria):', userData.nome, daysUntilBirthday);
            const firstName = userData.nome.split(' ')[0];
            showGreetingPage(firstName);
            return;
        }

        console.log('Status da resposta:', response.status, response.statusText);

        if (response.ok) {
            const data = await response.json();
            console.log('Resposta completa da API:', data);

            // Verificar estrutura correta da resposta da API Brasil
            if (data && data.response && data.response.content && data.response.content.nome && data.response.content.nome.conteudo) {
                const conteudo = data.response.content.nome.conteudo;

                // Processar dados retornados da API
                userData.nome = conteudo.nome;
                userData.dataNascimento = conteudo.data_nascimento;

                console.log('Dados extraídos:', userData.nome, userData.dataNascimento);

                // Calcular dias até o aniversário
                const birthday = parseBirthday(userData.dataNascimento);
                const daysUntilBirthday = calculateDaysUntilBirthday(birthday);

                console.log('Dados encontrados na API:', userData.nome, daysUntilBirthday);
                // Mostrar página de saudação com nome da API
                const firstName = userData.nome.split(' ')[0];
                showGreetingPage(firstName);
            } else {
                console.log('Estrutura de dados da API não é a esperada:', data);
                console.log('API não retornou dados válidos, mostrando saudação sem nome');
                // Se não retornou dados, mostrar saudação apenas com "Olá"
                showGreetingPage();
            }
        } else {
            console.log('API retornou erro:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Corpo da resposta de erro:', errorText);
            // Se API falhar, mostrar saudação apenas com "Olá"
            showGreetingPage();
        }
    } catch (error) {
        console.error('Erro na chamada da API:', error);
        console.error('Tipo do erro:', error.name);
        console.error('Mensagem do erro:', error.message);
        // Em caso de erro de rede, mostrar saudação apenas com "Olá"
        showGreetingPage();
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Continuar';
    }
}

// Parse data de nascimento
function parseBirthday(dateStr) {
    const parts = dateStr.split('/');
    return {
        day: parseInt(parts[0]),
        month: parseInt(parts[1])
    };
}

// Calcular dias até o aniversário
function calculateDaysUntilBirthday(birthday) {
    const today = new Date();
    const currentYear = today.getFullYear();
    let nextBirthday = new Date(currentYear, birthday.month - 1, birthday.day);

    if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthday.month - 1, birthday.day);
    }

    const diffTime = Math.abs(nextBirthday - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Mostrar mensagem personalizada com efeito hacker
function showPersonalizedMessage(fullName, daysUntilBirthday, apiData = null) {
    const firstName = fullName.split(' ')[0];
    const greetingDiv = document.getElementById('greeting-message');
    const continueBtn = document.getElementById('continue-to-courses');

    // Formatar nome (primeira letra maiúscula, resto minúscula)
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    // Criar mensagens baseadas nos dados da API
    let messages = [
        `> ACESSANDO BANCO DE DADOS...`,
        `> IDENTIFICAÇÃO CONFIRMADA: ${formattedName.toUpperCase()}`,
        `> ANIVERSÁRIO EM ${daysUntilBirthday} DIAS`,
    ];

    // Adicionar dados extras se vieram da API
    if (apiData && apiData.response && apiData.response.content) {
        const content = apiData.response.content;

        if (content.nome && content.nome.conteudo) {
            const pessoa = content.nome.conteudo;
            messages.push(`> CPF: ${pessoa.documento || 'N/A'}`);
            messages.push(`> DATA NASCIMENTO: ${pessoa.data_nascimento || 'N/A'}`);
            messages.push(`> IDADE: ${pessoa.idade || 'N/A'}`);
            messages.push(`> SEXO: ${pessoa.sexo || 'N/A'}`);
            messages.push(`> SITUAÇÃO RFB: ${pessoa.situacao_receita || 'N/A'}`);
        }

        if (content.pesquisa_enderecos && content.pesquisa_enderecos.conteudo && content.pesquisa_enderecos.conteudo.length > 0) {
            const endereco = content.pesquisa_enderecos.conteudo[0];
            messages.push(`> CIDADE: ${endereco.cidade || 'N/A'} - ${endereco.estado || 'N/A'}`);
        }

        if (content.pesquisa_telefones && content.pesquisa_telefones.conteudo && content.pesquisa_telefones.conteudo.length > 0) {
            const telefone = content.pesquisa_telefones.conteudo[0];
            messages.push(`> TELEFONE: ${telefone.numero || 'N/A'}`);
        }
    }

    messages.push(`> INICIANDO PROTOCOLO DE APROVAÇÃO...`);
    messages.push(`> BEM-VINDO(A) AO SISTEMA, ${formattedName}.`);

    // Mostrar a etapa 2 (mensagem personalizada)
    showStep('step-2');

    // Limpar conteúdo anterior
    greetingDiv.innerHTML = '';
    greetingDiv.style.fontFamily = 'Courier New, monospace';
    greetingDiv.style.backgroundColor = '#0d1117';
    greetingDiv.style.color = '#00ff00';
    greetingDiv.style.padding = '2rem';
    greetingDiv.style.borderRadius = '10px';
    greetingDiv.style.border = '1px solid #30363d';

    // Caracteres para efeito glitch
    const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?~`';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let messageIndex = 0;

    const showNextMessage = () => {
        if (messageIndex < messages.length) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'hacker-line';
            messageDiv.style.margin = '0.8rem 0';
            messageDiv.style.fontSize = '1.1rem';
            messageDiv.style.letterSpacing = '1px';
            greetingDiv.appendChild(messageDiv);

            const targetText = messages[messageIndex];
            let iterations = 0;
            const maxIterations = targetText.length * 2;

            const hackerEffect = () => {
                messageDiv.textContent = targetText
                    .split('')
                    .map((char, index) => {
                        if (char === ' ') return ' ';
                        if (char === '>') return '>';

                        if (index < iterations / 2) {
                            return targetText[index];
                        }

                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join('');

                if (iterations < maxIterations) {
                    iterations++;
                    setTimeout(hackerEffect, 30);
                } else {
                    // Texto final com efeito de brilho
                    messageDiv.textContent = targetText;
                    messageDiv.style.textShadow = '0 0 10px #00ff00';

                    // Adicionar cursor piscante apenas na última linha ativa
                    if (messageIndex === messages.length - 1) {
                        const cursor = document.createElement('span');
                        cursor.textContent = '_';
                        cursor.style.animation = 'blink 1s infinite';
                        cursor.style.color = '#00ff00';
                        messageDiv.appendChild(cursor);
                    }

                    messageIndex++;
                    setTimeout(showNextMessage, 800);
                }
            };

            // Iniciar efeito hacker
            setTimeout(hackerEffect, 200);
        } else {
            // Efeito final de "SISTEMA PRONTO"
            setTimeout(() => {
                const finalDiv = document.createElement('div');
                finalDiv.style.margin = '2rem 0 1rem 0';
                finalDiv.style.fontSize = '1.2rem';
                finalDiv.style.color = '#00ff00';
                finalDiv.style.textAlign = 'center';
                finalDiv.style.fontWeight = 'bold';
                finalDiv.style.textShadow = '0 0 15px #00ff00';
                finalDiv.textContent = '>>> SISTEMA PRONTO <<<';
                greetingDiv.appendChild(finalDiv);

                // Mostrar botão com estilo hacker
                setTimeout(() => {
                    continueBtn.classList.remove('hidden');
                    continueBtn.style.opacity = '0';
                    continueBtn.style.transform = 'translateY(20px)';
                    continueBtn.style.transition = 'all 0.8s ease';
                    continueBtn.style.background = 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)';
                    continueBtn.style.color = '#000';
                    continueBtn.style.fontWeight = 'bold';
                    continueBtn.style.textShadow = 'none';
                    continueBtn.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
                    continueBtn.textContent = 'ACESSAR VIRADÕES';

                    setTimeout(() => {
                        continueBtn.style.opacity = '1';
                        continueBtn.style.transform = 'translateY(0)';
                    }, 100);
                }, 1000);
            }, 1000);
        }
    };

    // Efeito de inicialização
    const initDiv = document.createElement('div');
    initDiv.style.color = '#00ff00';
    initDiv.style.fontSize = '1rem';
    initDiv.style.marginBottom = '1rem';
    initDiv.textContent = '> INICIALIZANDO SISTEMA...';
    greetingDiv.appendChild(initDiv);

    // Iniciar a sequência após delay
    setTimeout(showNextMessage, 1500);
}

// Atualizar total do carrinho
function updateCartTotal() {
    selectedCourses = [];
    totalPrice = 0;

    document.querySelectorAll('.course-card').forEach(card => {
        const checkbox = card.querySelector('.course-checkbox');
        if (checkbox.checked) {
            const courseName = card.querySelector('.course-title').textContent;
            const price = parseFloat(card.dataset.price);

            selectedCourses.push({
                name: courseName,
                price: price,
                id: card.dataset.course
            });

            totalPrice += price;
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });

    // Atualizar display do total
    document.getElementById('total-price').textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

    // Habilitar/desabilitar botão
    const continueBtn = document.getElementById('continue-to-whatsapp');
    continueBtn.disabled = selectedCourses.length === 0;

    if (selectedCourses.length > 0) {
        continueBtn.classList.add('pulse');
        setTimeout(() => continueBtn.classList.remove('pulse'), 600);
    }
}

// Atualizar resumo do pedido
function updateOrderSummary() {
    const summaryDiv = document.getElementById('order-summary');
    const finalTotal = document.getElementById('final-total');

    summaryDiv.innerHTML = '';

    selectedCourses.forEach(course => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.innerHTML = `
            <span>${course.name}</span>
            <span>R$ ${course.price.toFixed(2).replace('.', ',')}</span>
        `;
        summaryDiv.appendChild(itemDiv);
    });

    finalTotal.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Preencher nome do aluno automaticamente
function populateStudentName() {
    const studentNameInput = document.getElementById('student-name-input');
    if (userData.nome && userData.nome.trim() !== '') {
        // Se temos o nome da API, preencher automaticamente
        studentNameInput.value = userData.nome;
    } else {
        // Se não temos o nome da API, deixar vazio para o usuário preencher
        studentNameInput.value = '';
    }
}

// Validar nome do aluno
function validateStudentName(name) {
    return name && name.trim().length >= 2;
}

// Validar WhatsApp
function validateWhatsApp(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && cleaned[2] === '9';
}

// Manipular envio final
async function handleFinalSubmit() {
    const studentNameInput = document.getElementById('student-name-input');
    const studentNameError = document.getElementById('student-name-error');
    const whatsappInput = document.getElementById('whatsapp-input');
    const whatsappError = document.getElementById('whatsapp-error');
    const submitBtn = document.getElementById('submit-order');

    const studentName = studentNameInput.value.trim();
    const whatsapp = whatsappInput.value;

    // Limpar erros anteriores
    studentNameError.textContent = '';
    whatsappError.textContent = '';

    // Validar nome do aluno
    if (!validateStudentName(studentName)) {
        studentNameError.textContent = 'Nome do aluno é obrigatório (mínimo 2 caracteres)';
        studentNameInput.classList.add('error');
        return;
    }

    // Validar WhatsApp
    if (!validateWhatsApp(whatsapp)) {
        whatsappError.textContent = 'WhatsApp inválido. Use o formato (92) 99999-9999';
        whatsappInput.classList.add('error');
        return;
    }

    // Mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    studentNameInput.classList.remove('error');
    whatsappInput.classList.remove('error');

    // Obter IP do usuário (se disponível)
    let userIP = 'N/A';
    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIP = ipData.ip;
    } catch (error) {
        console.log('Não foi possível obter o IP:', error);
    }

    // Preparar mapeamento de viradões com V/F
    const viradaoMapping = {
        'psi': 'F',
        'sis1': 'F',
        'sis2': 'F',
        'macro': 'F',
        'enem': 'F',
        'psc3': 'F'
    };

    // Marcar viradões selecionados como V
    selectedCourses.forEach(course => {
        // Mapear nomes dos cursos para as chaves corretas
        const courseName = course.name.toUpperCase();
        if (courseName.includes('PSI')) {
            viradaoMapping.psi = 'V';
        } else if (courseName.includes('SIS 1')) {
            viradaoMapping.sis1 = 'V';
        } else if (courseName.includes('SIS 2')) {
            viradaoMapping.sis2 = 'V';
        } else if (courseName.includes('MACRO')) {
            viradaoMapping.macro = 'V';
        } else if (courseName.includes('ENEM')) {
            viradaoMapping.enem = 'V';
        } else if (courseName.includes('PSC 3')) {
            viradaoMapping.psc3 = 'V';
        }
    });

    // Formatar data e hora para horário de Manaus (UTC-4)
    const now = new Date();
    const manausDate = new Date(now.getTime() - (4 * 60 * 60 * 1000)); // UTC-4
    const dataFormatada = manausDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const horaFormatada = manausDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(':', 'h');

    // Preparar dados para envio no formato solicitado
    const orderData = {
        "NOME": studentName.toUpperCase(),
        "DATA E HORA": `${dataFormatada} ${horaFormatada}`,
        "CPF": userData.cpf.replace(/\D/g, ''),
        "WhatsApp": `55${whatsapp.replace(/\D/g, '')}`,
        "VIRADÃO PSI": viradaoMapping.psi,
        "VIRADÃO SIS 1": viradaoMapping.sis1,
        "VIRADÃO SIS 2": viradaoMapping.sis2,
        "VIRADÃO MACRO": viradaoMapping.macro,
        "VIRADÃO ENEM": viradaoMapping.enem,
        "VIRADÃO PSC 3": viradaoMapping.psc3,
        "VALOR TOTAL": totalPrice.toFixed(2),
        "IP": userIP
    };

    try {
        // Enviar para webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        // Mostrar sucesso independente da resposta
        showStep('step-5');

    } catch (error) {
        console.error('Erro ao enviar:', error);
        // Mesmo com erro, mostrar sucesso
        showStep('step-5');
    }
}

// Mudar etapa
function showStep(stepId) {
    // Esconder todas as etapas
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
        step.classList.remove('active');
    });

    // Mostrar etapa específica
    const targetStep = document.getElementById(stepId);
    targetStep.classList.remove('hidden');

    // Adicionar animação
    setTimeout(() => {
        targetStep.classList.add('active');
        targetStep.classList.add('fade-in');

        // Se é a tela de viradões, inicializar checkboxes
        if (stepId === 'step-3') {
            setTimeout(() => {
                initializeCourseCheckboxes();
            }, 100);
        }
    }, 50);

    // Scroll suave para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}