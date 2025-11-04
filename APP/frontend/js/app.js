// App Principal
class App {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    getApiBasePath() {
        // Calcular caminho base da API dinamicamente
        const pathname = window.location.pathname;
        let basePath = '';
        
        // Detectar caminho base (case-insensitive)
        const pathLower = pathname.toLowerCase();
        
        if (pathLower.includes('/frontend/')) {
            const index = pathname.toLowerCase().indexOf('/frontend/');
            basePath = pathname.substring(0, index);
        } else if (pathLower.includes('/app/')) {
            // Detectar APP ou app (case-insensitive)
            const index = pathname.toLowerCase().indexOf('/app/');
            basePath = pathname.substring(0, index + 4); // Incluir /APP ou /app
        } else {
            // Tentar detectar o caminho base
            const parts = pathname.split('/').filter(p => p);
            if (parts.length > 0 && parts[0].toLowerCase() === 'app') {
                basePath = '/' + parts[0];
            } else {
                // Se estiver na raiz do localhost, usar caminho relativo
                basePath = window.location.origin;
            }
        }
        
        // Corrigir barra dupla
        if (basePath && !basePath.endsWith('/')) {
            basePath += '/';
        }
        
        // Se basePath for apenas a origin, ajustar
        if (basePath.startsWith('http')) {
            return basePath;
        }
        
        return basePath;
    }

    getApiBaseUrl() {
        // Retornar URL base da API (backend/public)
        // O index.php faz o roteamento para /auth, /produtos, etc.
        // O .htaccess redireciona URLs amigáveis para o index.php
        const basePath = this.getApiBasePath();
        return `${basePath}backend/public`;
    }

    getApiEndpoint(endpoint, params = {}) {
        // Construir URL completa do endpoint
        const baseUrl = this.getApiBaseUrl();
        
        // Se o .htaccess não estiver funcionando, usar index.php explicitamente
        // Primeiro, tentar URL amigável (/auth?action=login)
        // Se falhar, usar index.php?route=auth&action=login
        const useIndexPhp = localStorage.getItem('api_use_index_php') === 'true';
        
        let url;
        if (useIndexPhp) {
            // Usar index.php explicitamente
            // Criar novo objeto para não modificar o original
            const indexParams = { route: endpoint, ...params };
            const queryString = new URLSearchParams(indexParams).toString();
            url = `${baseUrl}/index.php?${queryString}`;
        } else {
            // Tentar URL amigável (requer .htaccess funcionando)
            const queryString = new URLSearchParams(params).toString();
            url = `${baseUrl}/${endpoint}${queryString ? '?' + queryString : ''}`;
        }
        
        // Debug: log da URL construída
        console.log('API Endpoint construído:', url);
        console.log('Base URL:', baseUrl);
        console.log('Endpoint:', endpoint);
        console.log('Params:', params);
        console.log('Usando index.php:', useIndexPhp);
        
        return url;
    }

    init() {
        // Verificar autenticação primeiro
        this.checkAuthentication().then(() => {
        // Carregar nome do usuário do localStorage
        this.loadUserName();
        
        // Carregar página inicial
        this.loadPage('home');
        
        // Configurar navegação
        this.setupNavigation();
        
        // Configurar eventos
        this.setupEvents();
        
        // Iniciar banner rotativo
        this.initBannerSlider();
        }).catch(() => {
            // Se não estiver autenticado, carregar página de login
            this.loadPage('login');
            this.setupNavigation();
            this.setupEvents();
        });
    }

    loadUserName() {
        // Verificar se há nome salvo no localStorage
        let userName = localStorage.getItem('userName');
        if (!userName) {
            userName = 'Cliente';
            localStorage.setItem('userName', userName);
        }
        
        // Inicializar dados do usuário se não existirem
        if (!localStorage.getItem('userEmail')) {
            localStorage.setItem('userEmail', 'joao.silva@email.com');
        }
        if (!localStorage.getItem('userPhone')) {
            localStorage.setItem('userPhone', '(11) 99999-9999');
        }
        if (!localStorage.getItem('userCPF')) {
            localStorage.setItem('userCPF', '000.000.000-00');
        }
        if (!localStorage.getItem('userFullName')) {
            localStorage.setItem('userFullName', 'João Silva');
        }
    }

    updateUserNameInPage() {
        // Atualizar nome na interface
        const userName = localStorage.getItem('userName') || 'Cliente';
        const userNameElements = document.querySelectorAll('#user-name, #profile-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = userName;
        });

        // Atualizar dados completos na página de conta
        const fullName = localStorage.getItem('userFullName') || 'João Silva';
        const email = localStorage.getItem('userEmail') || 'joao.silva@email.com';
        const phone = localStorage.getItem('userPhone') || '(11) 99999-9999';
        const cpf = localStorage.getItem('userCPF') || '000.000.000-00';

        const nomeEl = document.getElementById('info-nome');
        const emailEl = document.getElementById('info-email');
        const telefoneEl = document.getElementById('info-telefone');
        const cpfEl = document.getElementById('info-cpf');

        if (nomeEl) nomeEl.textContent = fullName;
        if (emailEl) emailEl.textContent = email;
        if (telefoneEl) telefoneEl.textContent = phone;
        if (cpfEl) cpfEl.textContent = cpf;
    }

    async loadPage(pageName) {
        try {
            // Verificar autenticação para páginas protegidas (exceto login e cadastro)
            const protectedPages = ['home', 'loja', 'produtos', 'financeiro', 'suporte', 'conta'];
            if (protectedPages.includes(pageName)) {
                const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
                if (!isAuthenticated) {
                    // Redirecionar para login
                    pageName = 'login';
                }
            }

            // Determinar caminho base corretamente
            const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
            const pagePath = `${basePath}pages/${pageName}.html`;
            
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar página: ${pageName} - Status: ${response.status}`);
            }
            
            const html = await response.text();
            const pageContainer = document.getElementById('page-container');
            
            if (!pageContainer) {
                console.error('page-container não encontrado!');
                return;
            }

            // Esconder navegação inferior se for página de login ou cadastro
            const bottomNav = document.querySelector('.bottom-nav');
            if (pageName === 'login' || pageName === 'cadastro') {
                if (bottomNav) bottomNav.style.display = 'none';
            } else {
                if (bottomNav) bottomNav.style.display = 'flex';
            }
            
            // Animação de saída
            pageContainer.style.opacity = '0';
            pageContainer.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                pageContainer.innerHTML = html;
                this.currentPage = pageName;
                
                // Adicionar classe active para animação
                const pageElement = pageContainer.querySelector('.page');
                if (pageElement) {
                    pageElement.classList.add('active');
                }
                
                // Animação de entrada
                pageContainer.style.opacity = '1';
                pageContainer.style.transform = 'translateY(0)';
                
                // Atualizar navegação ativa
                this.updateActiveNav();
                
                // Atualizar nome do usuário na nova página
                this.updateUserNameInPage();
                
                // Configurar eventos específicos da página
                this.setupPageSpecificEvents(pageName);
            }, 150);
        } catch (error) {
            console.error('Erro ao carregar página:', error);
            const pageContainer = document.getElementById('page-container');
            if (pageContainer) {
                pageContainer.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <h2>Erro ao carregar página</h2>
                        <p>${error.message}</p>
                        <p style="color: #666; margin-top: 10px; font-size: 14px;">Verifique o console para mais detalhes.</p>
                    </div>
                `;
            }
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page && page !== this.currentPage) {
                    this.loadPage(page);
                }
            });
        });
    }

    updateActiveNav() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === this.currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    setupEvents() {
        // Eventos globais
        document.addEventListener('click', (e) => {
            // Botões de ação rápida na home
            if (e.target.closest('.action-btn')) {
                const action = e.target.closest('.action-btn').getAttribute('data-action');
                this.handleQuickAction(action);
            }
        });
    }

    setupPageSpecificEvents(pageName) {
        switch (pageName) {
            case 'home':
                this.setupHomeEvents();
                // Reinicializar banner slider na home
                setTimeout(() => this.initBannerSlider(), 100);
                break;
            case 'loja':
                this.setupLojaEvents();
                break;
            case 'produtos':
                this.setupProdutosEvents();
                break;
            case 'suporte':
                this.setupSuporteEvents();
                break;
            case 'conta':
                this.setupContaEvents();
                break;
            case 'financeiro':
                this.setupFinanceiroEvents();
                break;
            case 'login':
                this.setupLoginEvents();
                break;
            case 'cadastro':
                this.setupCadastroEvents();
                break;
        }
    }

    setupHomeEvents() {
        // Botões de ação rápida já são tratados no setupEvents
        // Banner slider já é iniciado automaticamente

        // Card "Total de Planos" - toggle para mostrar/esconder planos
        const cardTotalPlanos = document.getElementById('card-total-planos');
        if (cardTotalPlanos) {
            cardTotalPlanos.addEventListener('click', () => {
                this.toggleMeusPlanos();
            });
        }

        // Carregar planos contratados
        this.loadPlanosContratados();
    }

    toggleMeusPlanos() {
        const meusPlanosSection = document.getElementById('meus-planos-section');
        if (meusPlanosSection) {
            const isVisible = meusPlanosSection.style.display !== 'none';
            
            if (isVisible) {
                // Esconder com animação
                meusPlanosSection.style.opacity = '0';
                meusPlanosSection.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    meusPlanosSection.style.display = 'none';
                }, 200);
            } else {
                // Mostrar com animação
                meusPlanosSection.style.display = 'block';
                setTimeout(() => {
                    meusPlanosSection.style.opacity = '1';
                    meusPlanosSection.style.transform = 'translateY(0)';
                }, 10);
            }
        }
    }

    async loadPlanosContratados() {
        try {
            // Carregar planos do localStorage
            let planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo');
            
            // Corrigir velocidades dos planos WiFi que podem estar com preço em vez de velocidade
            planosContratados = this.corrigirVelocidadesPlanos(planosContratados);
            
            // Renderizar planos na home
            this.renderPlanosContratados(planosContratados);
            
            // Atualizar total de planos
            const totalElement = document.getElementById('total-planos');
            if (totalElement) {
                totalElement.textContent = planosContratados.length;
            }

            // Verificar quais tipos de planos existem e mostrar/esconder cards
            this.verificarTiposPlanos(planosContratados);
            
            // Calcular consumo de dados móveis (só se houver planos móveis)
            this.calcularConsumoMovel();
            
            // Calcular consumo de ligações e SMS (só se houver planos móveis)
            this.calcularConsumoLigacoes();
            this.calcularConsumoSMS();
            
            // Calcular próxima fatura
            this.calcularProximaFatura(planosContratados);
        } catch (error) {
            console.error('Erro ao carregar planos contratados:', error);
        }
    }

    renderPlanosContratados(planos) {
        const container = document.getElementById('planos-contratados');
        if (!container) return;

        if (planos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>Nenhum plano contratado ainda.</p>
                    <p style="margin-top: 8px; font-size: 14px;">Acesse a Loja para assinar um plano!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = planos.map(plano => this.renderPlanoCard(plano)).join('');
    }

    renderPlanoCard(plano) {
        const tipoIcon = this.getTipoIcon(plano.tipo);
        const detalhes = this.getDetalhesPlano(plano);

        if (plano.tipo === 'pacotes') {
            return `
                <div class="plano-detalhado-card" data-tipo="${plano.tipo}" data-id="${plano.id}" onclick="verDetalhesPlano(${plano.id})">
                    <div class="plano-card-header">
                        <div class="plano-icon-header">
                            ${tipoIcon}
                            <span class="plano-status-badge ativo">Ativo</span>
                        </div>
                        <h3>${plano.nome}</h3>
                        <span class="plano-tipo-label">Pacote Completo</span>
                    </div>
                    <div class="plano-card-body">
                        <div class="pacote-servicos">
                            <h4>Serviços Inclusos:</h4>
                            <div class="servicos-list">
                                ${plano.features.map(feature => `
                                    <div class="servico-item">
                                        <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>${feature}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="plano-info-grid">
                            ${detalhes.map(d => `
                                <div class="info-item">
                                    <span class="info-label">${d.label}:</span>
                                    <span class="info-value">${d.value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="plano-detalhado-card" data-tipo="${plano.tipo}" data-id="${plano.id}" onclick="verDetalhesPlano(${plano.id})">
                    <div class="plano-card-header">
                        <div class="plano-icon-header">
                            ${tipoIcon}
                            <span class="plano-status-badge ativo">Ativo</span>
                        </div>
                        <h3>${plano.nome}</h3>
                        <span class="plano-tipo-label">${this.getTipoLabel(plano.tipo)}</span>
                    </div>
                    <div class="plano-card-body">
                        <div class="plano-info-grid">
                            ${detalhes.map(d => `
                                <div class="info-item">
                                    <span class="info-label">${d.label}:</span>
                                    <span class="info-value">${d.value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getTipoIcon(tipo) {
        const icons = {
            wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" y1="20" x2="12.01" y2="20"></line>
            </svg>`,
            celular: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>`,
            pacotes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>`,
            streaming: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M17 2l-5 5-5-5"></path>
            </svg>`
        };
        return icons[tipo] || icons.wifi;
    }

    getTipoLabel(tipo) {
        const labels = {
            wifi: 'Internet WiFi',
            celular: 'Internet Móvel',
            pacotes: 'Pacote Completo',
            streaming: 'Streaming'
        };
        return labels[tipo] || 'Plano';
    }

    getDetalhesPlano(plano) {
        const detalhes = [];
        
        if (plano.tipo === 'wifi') {
            const velocidade = plano.velocidade || 'N/A';
            detalhes.push({ label: 'Velocidade', value: velocidade });
            
            // Extrair upload das features
            const uploadFeature = plano.features.find(f => f.toLowerCase().includes('upload'));
            if (uploadFeature) {
                const uploadMatch = uploadFeature.match(/(\d+)\s*Mbps/i);
                if (uploadMatch) {
                    detalhes.push({ label: 'Upload', value: uploadMatch[1] + ' Mbps' });
                }
            }
            
            detalhes.push({ label: 'Consumo', value: 'Ilimitado' });
            
            // Extrair WiFi das features
            const wifiFeature = plano.features.find(f => f.toLowerCase().includes('wifi'));
            if (wifiFeature) {
                detalhes.push({ label: 'WiFi', value: wifiFeature.replace('WiFi', '').trim() || 'Incluído' });
            }
            
        } else if (plano.tipo === 'celular') {
            const dadosMatch = plano.nome.match(/(\d+)\s*GB/i) || plano.velocidade.match(/(\d+)\s*GB/i);
            if (dadosMatch) {
                const dados = dadosMatch[1] + ' GB';
                detalhes.push({ label: 'Dados', value: dados });
                detalhes.push({ label: 'Consumo', value: '0 GB / ' + dados });
            }
            
            detalhes.push({ label: 'Ligações', value: 'Ilimitadas' });
            detalhes.push({ label: 'SMS', value: 'Ilimitado' });
            
        } else if (plano.tipo === 'streaming') {
            detalhes.push({ label: 'Qualidade', value: '4K Ultra HD' });
            detalhes.push({ label: 'Telas', value: '4 simultâneas' });
            detalhes.push({ label: 'Download', value: 'Disponível' });
            detalhes.push({ label: 'Anúncios', value: 'Sem anúncios' });
        } else if (plano.tipo === 'pacotes') {
            const velocidadeMatch = plano.velocidade.match(/(\d+)\s*Mbps/i);
            if (velocidadeMatch) {
                detalhes.push({ label: 'Velocidade', value: velocidadeMatch[1] + ' Mbps' });
            }
            detalhes.push({ label: 'Canais TV', value: '200+ canais' });
        }
        
        detalhes.push({ label: 'Vencimento', value: plano.vencimento });
        detalhes.push({ label: 'Valor', value: plano.precoFormatado });
        
        return detalhes;
    }

    verificarTiposPlanos(planos) {
        // Verificar se há planos WiFi (apenas tipo 'wifi', não pacotes)
        const temPlanosWifi = planos.some(p => p.tipo === 'wifi');
        
        // Verificar se há planos móveis
        const temPlanosMoveis = planos.some(p => p.tipo === 'celular');
        
        // Verificar se há planos com telefonia (móveis ou pacotes)
        const temTelefonia = planos.some(p => p.tipo === 'celular' || p.tipo === 'pacotes');
        
        // Esconder/mostrar card de WiFi (calcularVelocidadeWifi já faz isso, mas garantimos aqui também)
        const cardWifi = document.getElementById('card-wifi');
        if (cardWifi) {
            if (temPlanosWifi) {
                this.calcularVelocidadeWifi(planos);
            } else {
                cardWifi.style.display = 'none';
            }
        }
        
        // Esconder/mostrar card de dados móveis
        const cardMovel = document.getElementById('card-consumo-movel');
        if (cardMovel) {
            cardMovel.style.display = temPlanosMoveis ? 'flex' : 'none';
        }
        
        // Esconder/mostrar card de ligações
        const cardLigacoes = document.getElementById('card-consumo-ligacoes');
        if (cardLigacoes) {
            cardLigacoes.style.display = temTelefonia ? 'flex' : 'none';
        }
        
        // Esconder/mostrar card de SMS
        const cardSMS = document.getElementById('card-consumo-sms');
        if (cardSMS) {
            cardSMS.style.display = temPlanosMoveis ? 'flex' : 'none';
        }
    }

    corrigirVelocidadesPlanos(planos) {
        // Corrigir velocidades dos planos WiFi que podem estar incorretas
        let precisaSalvar = false;
        
        planos.forEach(plano => {
            if (plano.tipo === 'wifi') {
                // Verificar se velocidade está vazia ou contém preço
                if (!plano.velocidade || plano.velocidade.includes('R$') || plano.velocidade.includes('$')) {
                    // Tentar extrair do nome do plano
                    const nomeMatch = plano.nome.match(/(\d+)\s*(MB|Mbps|Gbps|GB)/i);
                    if (nomeMatch) {
                        const valor = nomeMatch[1];
                        let unidade = nomeMatch[2];
                        // Normalizar unidade
                        if (unidade.toLowerCase() === 'mb' || unidade.toLowerCase() === 'gb') {
                            unidade = 'Mbps';
                        } else if (unidade.toLowerCase() === 'gbps') {
                            plano.velocidade = (parseInt(valor) * 1000) + ' Mbps';
                        } else {
                            plano.velocidade = valor + ' ' + unidade;
                        }
                        precisaSalvar = true;
                    }
                }
            }
        });
        
        // Se corrigiu algum plano, salvar de volta no localStorage
        if (precisaSalvar) {
            const todosPlanos = this.getPlanosContratados();
            todosPlanos.forEach((plano, index) => {
                const planoCorrigido = planos.find(p => p.id === plano.id);
                if (planoCorrigido && plano.tipo === 'wifi' && planoCorrigido.velocidade) {
                    todosPlanos[index].velocidade = planoCorrigido.velocidade;
                }
            });
            localStorage.setItem('planosContratados', JSON.stringify(todosPlanos));
        }
        
        return planos;
    }

    calcularVelocidadeWifi(planos) {
        const velocidadeElement = document.getElementById('velocidade-wifi');
        const cardWifi = document.getElementById('card-wifi');
        
        if (!velocidadeElement || !cardWifi) return;

        // Buscar APENAS planos WiFi (não pacotes, pois podem ter WiFi mas não mostrar velocidade específica)
        const planosWifi = planos.filter(p => p.tipo === 'wifi');
        
        // Se não houver planos WiFi, esconder o card
        if (planosWifi.length === 0) {
            cardWifi.style.display = 'none';
            return;
        }

        // Mostrar o card
        cardWifi.style.display = 'flex';

        // Função auxiliar para extrair velocidade de um plano WiFi
        const extrairVelocidade = (plano) => {
            // PRIORIDADE 1: Extrair do nome do plano (ex: "Fibra 200MB" -> "200 Mbps")
            const nomeMatch = plano.nome.match(/(\d+)\s*(MB|Mbps|Gbps|GB)/i);
            if (nomeMatch) {
                const valor = nomeMatch[1];
                let unidade = nomeMatch[2];
                // Normalizar unidade
                if (unidade.toLowerCase() === 'mb' || unidade.toLowerCase() === 'gb') {
                    unidade = 'Mbps';
                } else if (unidade.toLowerCase() === 'gbps') {
                    // Converter Gbps para Mbps
                    const valorNum = parseInt(valor);
                    return (valorNum * 1000) + ' Mbps';
                }
                return valor + ' ' + unidade;
            }
            
            // PRIORIDADE 2: Tentar do campo velocidade (mas verificar se não é preço)
            let velocidade = plano.velocidade || '';
            if (velocidade && !velocidade.includes('R$') && !velocidade.includes('$')) {
                const velocidadeMatch = velocidade.match(/(\d+)\s*(Mbps|Gbps|MB|GB)/i);
                if (velocidadeMatch) {
                    const valor = velocidadeMatch[1];
                    let unidade = velocidadeMatch[2];
                    if (unidade.toLowerCase() === 'mb' || unidade.toLowerCase() === 'gb') {
                        unidade = 'Mbps';
                    } else if (unidade.toLowerCase() === 'gbps') {
                        const valorNum = parseInt(valor);
                        return (valorNum * 1000) + ' Mbps';
                    }
                    return valor + ' ' + unidade;
                }
            }
            
            // PRIORIDADE 3: Tentar extrair das features
            const features = plano.features || [];
            const velocidadeFeature = features.find(f => {
                const text = f.toLowerCase();
                return text.includes('mbps') || text.includes('gbps') || 
                       (text.includes('upload') && text.match(/\d+\s*mbps/i));
            });
            if (velocidadeFeature) {
                const match = velocidadeFeature.match(/(\d+)\s*(Mbps|Gbps)/i);
                if (match) {
                    const valor = match[1];
                    let unidade = match[2];
                    if (unidade.toLowerCase() === 'gbps') {
                        const valorNum = parseInt(valor);
                        return (valorNum * 1000) + ' Mbps';
                    }
                    return valor + ' ' + unidade;
                }
            }
            
            return '';
        };

        // Se houver múltiplos planos WiFi, mostrar a maior velocidade
        if (planosWifi.length === 1) {
            const velocidade = extrairVelocidade(planosWifi[0]);
            
            if (velocidade) {
                velocidadeElement.textContent = velocidade;
            } else {
                // Se não conseguir extrair, tentar do nome diretamente
                const nomeMatch = planosWifi[0].nome.match(/(\d+)\s*(MB|Mbps|Gbps)/i);
                if (nomeMatch) {
                    const valor = nomeMatch[1];
                    let unidade = nomeMatch[2];
                    if (unidade.toLowerCase() === 'mb') {
                        unidade = 'Mbps';
                    } else if (unidade.toLowerCase() === 'gbps') {
                        velocidadeElement.textContent = (parseInt(valor) * 1000) + ' Mbps';
                        return;
                    }
                    velocidadeElement.textContent = valor + ' ' + unidade;
                } else {
                    velocidadeElement.textContent = 'N/A';
                }
            }
        } else {
            // Múltiplos planos WiFi - mostrar a maior velocidade
            let maiorVelocidade = 0;
            let unidade = 'Mbps';
            
            planosWifi.forEach(plano => {
                const velocidade = extrairVelocidade(plano);
                
                if (!velocidade) {
                    // Tentar extrair do nome diretamente
                    const nomeMatch = plano.nome.match(/(\d+)\s*(MB|Mbps|Gbps)/i);
                    if (nomeMatch) {
                        const valor = parseInt(nomeMatch[1]);
                        const unid = nomeMatch[2].toLowerCase();
                        
                        if (unid === 'gbps') {
                            const valorMbps = valor * 1000;
                            if (valorMbps > maiorVelocidade) {
                                maiorVelocidade = valorMbps;
                                unidade = 'Mbps';
                            }
                        } else {
                            if (valor > maiorVelocidade) {
                                maiorVelocidade = valor;
                                unidade = 'Mbps';
                            }
                        }
                    }
                    return;
                }
                
                // Tentar extrair velocidade numérica
                const match = velocidade.match(/(\d+)\s*(Mbps|Gbps)/i);
                if (match) {
                    const valor = parseInt(match[1]);
                    const unid = match[2].toLowerCase();
                    if (unid === 'gbps') {
                        const valorMbps = valor * 1000;
                        if (valorMbps > maiorVelocidade) {
                            maiorVelocidade = valorMbps;
                            unidade = 'Mbps';
                        }
                    } else if (valor > maiorVelocidade) {
                        maiorVelocidade = valor;
                        unidade = 'Mbps';
                    }
                }
            });
            
            if (maiorVelocidade > 0) {
                velocidadeElement.textContent = maiorVelocidade + ' ' + unidade;
            } else {
                velocidadeElement.textContent = 'Múltiplos planos';
            }
        }
    }

    calcularProximaFatura(planos) {
        // Calcular total somando todos os planos ativos
        const totalFatura = planos.reduce((sum, plano) => {
            let preco = 0;
            
            // Se o preço é um número, usar diretamente
            if (typeof plano.preco === 'number') {
                preco = plano.preco;
            } 
            // Se é string, tentar extrair o valor numérico
            else if (typeof plano.preco === 'string') {
                // Tentar extrair formato "R$ 79,90" ou "79.90" ou "79,90"
                const precoStr = plano.preco.replace(/[^\d,.-]/g, '').replace(',', '.');
                preco = parseFloat(precoStr) || 0;
            }
            // Se tem precoFormatado, tentar extrair dele
            else if (plano.precoFormatado) {
                const precoMatch = plano.precoFormatado.match(/R\$\s*([\d,]+)/);
                if (precoMatch) {
                    preco = parseFloat(precoMatch[1].replace(',', '.')) || 0;
                }
            }
            
            return sum + preco;
        }, 0);
        
        // Atualizar valor da fatura
        const faturaElement = document.getElementById('valor-fatura');
        if (faturaElement) {
            // Formatar valor em reais (R$ X.XXX,XX)
            const valorFormatado = totalFatura.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            faturaElement.textContent = `R$ ${valorFormatado}`;
        }
        
        // Calcular vencimento baseado no primeiro plano (ou próximo mês, dia 15)
        const vencimentoElement = document.getElementById('vencimento-fatura');
        if (vencimentoElement) {
            let vencimento = null;
            
            // Se algum plano tem vencimento, usar o mais próximo
            if (planos.length > 0 && planos[0].vencimento) {
                try {
                    // Tentar parsear data no formato DD/MM/YYYY ou DD/MM
                    const partes = planos[0].vencimento.split('/');
                    if (partes.length >= 2) {
                        const dia = parseInt(partes[0]);
                        const mes = parseInt(partes[1]) - 1; // Meses são 0-indexed
                        const ano = partes[2] ? parseInt(partes[2]) : new Date().getFullYear();
                        vencimento = new Date(ano, mes, dia);
                    }
                } catch (e) {
                    // Se falhar, usar padrão
                }
            }
            
            // Se não conseguiu extrair, usar padrão (próximo mês, dia 15)
            if (!vencimento) {
                const hoje = new Date();
                vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15);
            }
            
            const dia = String(vencimento.getDate()).padStart(2, '0');
            const mes = String(vencimento.getMonth() + 1).padStart(2, '0');
            vencimentoElement.textContent = `Vencimento: ${dia}/${mes}`;
        }
    }

    calcularConsumoLigacoes() {
        const consumoElement = document.getElementById('consumo-ligacoes');
        const progressElement = document.getElementById('progress-ligacoes');

        if (!consumoElement || !progressElement) return;

        // Buscar planos com telefonia (móveis ou pacotes)
        const planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo');
        const planosTelefonia = planosContratados.filter(p => p.tipo === 'celular' || p.tipo === 'pacotes');
        
        if (planosTelefonia.length === 0) {
            // Se não tem telefonia, esconder o card (já feito em verificarTiposPlanos)
            return;
        }

        // Buscar informações dos planos renderizados
        const planosRenderizados = document.querySelectorAll('.plano-detalhado-card[data-tipo="celular"], .plano-detalhado-card[data-tipo="pacotes"]');
        
        let temIlimitado = false;
        let usadoTotal = 0;
        let limiteTotal = 0;

        planosRenderizados.forEach(planoCard => {
            const infoItems = planoCard.querySelectorAll('.info-item');
            
            infoItems.forEach(item => {
                const label = item.querySelector('.info-label');
                if (label && label.textContent.trim() === 'Ligações:') {
                    const value = item.querySelector('.info-value');
                    if (value) {
                        const ligacoesText = value.textContent.trim();
                        
                        // Verificar se é ilimitado
                        if (ligacoesText.toLowerCase().includes('ilimitado') || ligacoesText.toLowerCase().includes('ilimitadas')) {
                            temIlimitado = true;
                        } else {
                            // Tentar extrair valores (ex: "150 / 300 min")
                            const match = ligacoesText.match(/(\d+)\s*\/\s*(\d+)\s*min/i);
                            if (match) {
                                usadoTotal += parseInt(match[1]);
                                limiteTotal += parseInt(match[2]);
                            }
                        }
                    }
                }
            });
        });

        // Se nenhum plano renderizado encontrou, verificar nas features dos planos
        if (!temIlimitado && usadoTotal === 0 && limiteTotal === 0) {
            planosTelefonia.forEach(plano => {
                const ligacoesFeature = plano.features.find(f => 
                    f.toLowerCase().includes('ligação') || 
                    f.toLowerCase().includes('ligaç')
                );
                
                if (ligacoesFeature) {
                    if (ligacoesFeature.toLowerCase().includes('ilimitado') || 
                        ligacoesFeature.toLowerCase().includes('ilimitadas')) {
                        temIlimitado = true;
                    } else {
                        // Tentar extrair limite de minutos das features
                        const match = ligacoesFeature.match(/(\d+)\s*min/i);
                        if (match) {
                            limiteTotal += parseInt(match[1]);
                        }
                    }
                } else {
                    // Se não especificado, assumir ilimitado para planos móveis
                    if (plano.tipo === 'celular') {
                        temIlimitado = true;
                    }
                }
            });
        }

        // Atualizar display
        if (temIlimitado) {
            consumoElement.textContent = 'Ilimitado';
            progressElement.style.width = '0%';
            progressElement.style.background = 'transparent';
        } else if (limiteTotal > 0) {
            // Calcular porcentagem (usar um valor simulado de uso se não tiver)
            const usado = usadoTotal > 0 ? usadoTotal : Math.floor(limiteTotal * 0.5); // 50% de exemplo
            const porcentagem = Math.min((usado / limiteTotal) * 100, 100);

            consumoElement.textContent = `${usado} / ${limiteTotal} min`;
            progressElement.style.width = `${porcentagem}%`;

            // Atualizar cor do progresso baseado no uso
            if (porcentagem >= 90) {
                progressElement.style.background = '#ef4444'; // Vermelho
            } else if (porcentagem >= 70) {
                progressElement.style.background = '#f59e0b'; // Amarelo
            } else {
                progressElement.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))';
            }
        } else {
            // Fallback: mostrar como ilimitado
            consumoElement.textContent = 'Ilimitado';
            progressElement.style.width = '0%';
            progressElement.style.background = 'transparent';
        }
    }

    calcularConsumoSMS() {
        const consumoElement = document.getElementById('consumo-sms');
        const progressElement = document.getElementById('progress-sms');

        if (!consumoElement || !progressElement) return;

        // Buscar planos móveis
        const planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo');
        const planosMoveis = planosContratados.filter(p => p.tipo === 'celular');
        
        if (planosMoveis.length === 0) {
            // Se não tem planos móveis, esconder o card (já feito em verificarTiposPlanos)
            return;
        }

        // Buscar informações dos planos renderizados
        const planosRenderizados = document.querySelectorAll('.plano-detalhado-card[data-tipo="celular"]');
        
        let temIlimitado = false;
        let usadoTotal = 0;
        let limiteTotal = 0;

        planosRenderizados.forEach(planoCard => {
            const infoItems = planoCard.querySelectorAll('.info-item');
            
            infoItems.forEach(item => {
                const label = item.querySelector('.info-label');
                if (label && label.textContent.trim() === 'SMS:') {
                    const value = item.querySelector('.info-value');
                    if (value) {
                        const smsText = value.textContent.trim();
                        
                        // Verificar se é ilimitado
                        if (smsText.toLowerCase().includes('ilimitado')) {
                            temIlimitado = true;
                        } else {
                            // Tentar extrair valores (ex: "250 / 500 SMS")
                            const match = smsText.match(/(\d+)\s*\/\s*(\d+)\s*SMS/i);
                            if (match) {
                                usadoTotal += parseInt(match[1]);
                                limiteTotal += parseInt(match[2]);
                            }
                        }
                    }
                }
            });
        });

        // Se nenhum plano renderizado encontrou, verificar nas features dos planos
        if (!temIlimitado && usadoTotal === 0 && limiteTotal === 0) {
            planosMoveis.forEach(plano => {
                const smsFeature = plano.features.find(f => 
                    f.toLowerCase().includes('sms')
                );
                
                if (smsFeature) {
                    if (smsFeature.toLowerCase().includes('ilimitado')) {
                        temIlimitado = true;
                    } else {
                        // Tentar extrair limite de SMS das features
                        const match = smsFeature.match(/(\d+)\s*SMS/i);
                        if (match) {
                            limiteTotal += parseInt(match[1]);
                        }
                    }
                } else {
                    // Se não especificado, assumir ilimitado para planos móveis
                    temIlimitado = true;
                }
            });
        }

        // Atualizar display
        if (temIlimitado) {
            consumoElement.textContent = 'Ilimitado';
            progressElement.style.width = '0%';
            progressElement.style.background = 'transparent';
        } else if (limiteTotal > 0) {
            // Calcular porcentagem (usar um valor simulado de uso se não tiver)
            const usado = usadoTotal > 0 ? usadoTotal : Math.floor(limiteTotal * 0.5); // 50% de exemplo
            const porcentagem = Math.min((usado / limiteTotal) * 100, 100);

            consumoElement.textContent = `${usado} / ${limiteTotal} SMS`;
            progressElement.style.width = `${porcentagem}%`;

            // Atualizar cor do progresso baseado no uso
            if (porcentagem >= 90) {
                progressElement.style.background = '#ef4444'; // Vermelho
            } else if (porcentagem >= 70) {
                progressElement.style.background = '#f59e0b'; // Amarelo
            } else {
                progressElement.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))';
            }
        } else {
            // Fallback: mostrar como ilimitado
            consumoElement.textContent = 'Ilimitado';
            progressElement.style.width = '0%';
            progressElement.style.background = 'transparent';
        }
    }

    calcularConsumoMovel() {
        const consumoElement = document.getElementById('consumo-movel');
        const progressElement = document.getElementById('progress-movel');

        if (!consumoElement || !progressElement) return;

        // Buscar planos móveis do localStorage
        const planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo' && p.tipo === 'celular');
        
        if (planosContratados.length === 0) {
            // Se não tem planos móveis, o card já foi escondido em verificarTiposPlanos
            return;
        }

        // Buscar todos os planos móveis renderizados
        const planosMoveis = document.querySelectorAll('.plano-detalhado-card[data-tipo="celular"]');
        
        let consumoTotal = 0;
        let limiteTotal = 0;

        planosMoveis.forEach(planoCard => {
            // Buscar o valor no info-item que contém "Consumo:"
            const infoItems = planoCard.querySelectorAll('.info-item');
            
            infoItems.forEach(item => {
                const label = item.querySelector('.info-label');
                if (label && label.textContent.trim() === 'Consumo:') {
                    const value = item.querySelector('.info-value');
                    if (value) {
                        const consumoText = value.textContent.trim();
                        const match = consumoText.match(/([\d,]+)\s*GB\s*\/\s*([\d,]+|∞|Ilimitado)\s*GB/i);
                        
                        if (match) {
                            const usado = parseFloat(match[1].replace(',', '.'));
                            const limite = match[2] === '∞' || match[2].toLowerCase() === 'ilimitado' ? Infinity : parseFloat(match[2].replace(',', '.'));
                            
                            if (!isNaN(usado)) {
                                consumoTotal += usado;
                            }
                            if (!isNaN(limite) && limite !== Infinity) {
                                limiteTotal += limite;
                            } else if (limite === Infinity) {
                                limiteTotal = Infinity;
                            }
                        }
                    }
                }
            });
        });

        // Atualizar o card de consumo móvel

        if (consumoElement && progressElement) {
            let consumoText;
            let porcentagem = 0;

            if (limiteTotal === Infinity) {
                consumoText = `${consumoTotal.toFixed(1).replace('.', ',')} GB / Ilimitado`;
                porcentagem = 0; // Não mostra progresso se for ilimitado
            } else if (limiteTotal > 0) {
                consumoText = `${consumoTotal.toFixed(1).replace('.', ',')} GB / ${limiteTotal.toFixed(0)} GB`;
                porcentagem = Math.min((consumoTotal / limiteTotal) * 100, 100);
            } else {
                consumoText = '0 GB / 0 GB';
                porcentagem = 0;
            }

            consumoElement.textContent = consumoText;
            progressElement.style.width = `${porcentagem}%`;

            // Atualizar cor do progresso baseado no uso
            if (porcentagem >= 90) {
                progressElement.style.background = '#ef4444'; // Vermelho
            } else if (porcentagem >= 70) {
                progressElement.style.background = '#f59e0b'; // Amarelo
            } else {
                progressElement.style.background = 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))';
            }
        }
    }

    setupLojaEvents() {
        // Botões de assinar plano
        const assinarButtons = document.querySelectorAll('.btn-assinar');
        assinarButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const planoCard = btn.closest('.plano-card');
                const planoSection = planoCard.closest('.planos-section');
                const tipoPlano = planoSection ? planoSection.getAttribute('data-tipo') : null;
                
                // Extrair dados do plano
                const planoData = this.extrairDadosPlano(planoCard, tipoPlano);
                this.handleAssinarPlano(planoData);
            });
        });

        // Filtros de tipo de plano (WiFi, Pacotes, Streaming)
        const filtroButtons = document.querySelectorAll('.filtros-section .filtro-btn');
        filtroButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos os botões
                filtroButtons.forEach(b => b.classList.remove('active'));
                // Adicionar active no botão clicado
                btn.classList.add('active');
                
                // Obter o tipo de plano
                const tipo = btn.getAttribute('data-tipo');
                
                // Esconder todas as seções
                const todasSections = document.querySelectorAll('.planos-section');
                todasSections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Mostrar apenas a seção correspondente
                const sectionToShow = document.querySelector(`.planos-section[data-tipo="${tipo}"]`);
                if (sectionToShow) {
                    sectionToShow.style.display = 'block';
                }
            });
        });
    }

    extrairDadosPlano(planoCard, tipoPlano) {
                const planoNome = planoCard.querySelector('.plano-header h3')?.textContent || 'Plano';
        const speedValue = planoCard.querySelector('.speed-value')?.textContent || '';
        const speedUnit = planoCard.querySelector('.speed-unit')?.textContent || '';
        const priceCurrent = planoCard.querySelector('.price-current')?.textContent || '';
        const priceOld = planoCard.querySelector('.price-old')?.textContent || '';
        
        // Extrair features
        const features = [];
        const featuresList = planoCard.querySelectorAll('.plano-features li');
        featuresList.forEach(li => {
            const text = li.textContent.trim();
            features.push(text);
        });
        
        // Calcular preço numérico (formatos: R$ 79,90 ou R$ 79,90/mês)
        const precoMatch = priceCurrent.match(/R\$\s*([\d,]+)/);
        const preco = precoMatch ? parseFloat(precoMatch[1].replace(',', '.')) : 0;
        
        // Gerar ID único
        const planoId = Date.now();
        
        // Determinar tipo se não fornecido
        if (!tipoPlano) {
            if (planoNome.toLowerCase().includes('fibra') || planoNome.toLowerCase().includes('wifi')) {
                tipoPlano = 'wifi';
            } else if (planoNome.toLowerCase().includes('gb') || planoNome.toLowerCase().includes('móvel') || planoNome.toLowerCase().includes('celular')) {
                tipoPlano = 'celular';
            } else if (planoNome.toLowerCase().includes('pacote') || planoNome.toLowerCase().includes('família')) {
                tipoPlano = 'pacotes';
            } else if (planoNome.toLowerCase().includes('streaming')) {
                tipoPlano = 'streaming';
            } else {
                tipoPlano = 'wifi'; // default
            }
        }
        
        // PRIORIDADE 1: SEMPRE extrair velocidade do NOME do plano (mais confiável)
        // Exemplos: "Fibra 100MB" -> "100 Mbps", "Fibra 200MB" -> "200 Mbps"
        let velocidade = '';
        const nomeMatch = planoNome.match(/(\d+)\s*(MB|Mbps|Gbps|GB)/i);
        if (nomeMatch) {
            const valor = nomeMatch[1];
            let unidade = nomeMatch[2];
            // Normalizar unidade
            if (unidade.toLowerCase() === 'mb' || unidade.toLowerCase() === 'gb') {
                unidade = 'Mbps';
            } else if (unidade.toLowerCase() === 'gbps') {
                // Converter Gbps para Mbps
                const valorNum = parseInt(valor);
                velocidade = (valorNum * 1000) + ' Mbps';
            } else {
                velocidade = valor + ' ' + unidade;
            }
        }
        
        // PRIORIDADE 2: Se não encontrou no nome, tentar dos campos speed-value/speed-unit
        // Mas apenas se não contiver preço
        if (!velocidade && speedValue && speedUnit) {
            const speedValueClean = speedValue.trim();
            const speedUnitClean = speedUnit.trim();
            
            // Verificar se não é preço (R$ ou $) e são números válidos
            if (!speedValueClean.includes('R$') && !speedValueClean.includes('$') && 
                !speedUnitClean.includes('R$') && !speedUnitClean.includes('$') &&
                /^\d+$/.test(speedValueClean)) {
                let unidade = speedUnitClean;
                if (unidade.toLowerCase() === 'mb' || unidade.toLowerCase() === 'gb') {
                    unidade = 'Mbps';
                } else if (unidade.toLowerCase() === 'gbps') {
                    velocidade = (parseInt(speedValueClean) * 1000) + ' Mbps';
                } else {
                    velocidade = speedValueClean + ' ' + unidade;
                }
            }
        }
        
        // PRIORIDADE 3: Tentar extrair das features (último recurso)
        if (!velocidade) {
            const velocidadeFeature = features.find(f => {
                const text = f.toLowerCase();
                return (text.includes('mbps') || text.includes('gbps')) && /\d+/.test(text);
            });
            if (velocidadeFeature) {
                const match = velocidadeFeature.match(/(\d+)\s*(Mbps|Gbps)/i);
                if (match) {
                    const valor = match[1];
                    const unid = match[2].toLowerCase();
                    if (unid === 'gbps') {
                        velocidade = (parseInt(valor) * 1000) + ' Mbps';
                    } else {
                        velocidade = valor + ' ' + match[2];
                    }
                }
            }
        }
        
        return {
            id: planoId,
            nome: planoNome,
            tipo: tipoPlano,
            velocidade: velocidade, // Sempre velocidade em Mbps, nunca preço
            preco: preco,
            precoFormatado: priceCurrent.trim(),
            precoAntigo: priceOld.trim(),
            features: features,
            dataAssinatura: new Date().toISOString(),
            vencimento: this.calcularVencimento(),
            status: 'ativo'
        };
    }

    calcularVencimento() {
        const hoje = new Date();
        const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, hoje.getDate());
        return proximoMes.toLocaleDateString('pt-BR');
    }

    handleAssinarPlano(planoData) {
        if (confirm(`Deseja assinar o plano ${planoData.nome} por ${planoData.precoFormatado}?`)) {
            // Salvar plano no localStorage
            const planosContratados = this.getPlanosContratados();
            
            // Se for plano WiFi, verificar se já existe outro plano WiFi ativo para substituir
            if (planoData.tipo === 'wifi') {
                const planoWifiExistente = planosContratados.find(p => p.tipo === 'wifi' && p.status === 'ativo');
                if (planoWifiExistente) {
                    if (!confirm(`Você já possui o plano ${planoWifiExistente.nome} ativo. Deseja substituir por ${planoData.nome}?`)) {
                        return;
                    }
                    // Marcar antigo como cancelado
                    planoWifiExistente.status = 'cancelado';
                }
            } else {
                // Verificar se já existe plano do mesmo nome
                const planoExistente = planosContratados.find(p => p.nome === planoData.nome && p.status === 'ativo');
                if (planoExistente) {
                    if (!confirm('Você já possui este plano ativo. Deseja substituir?')) {
                        return;
                    }
                    // Marcar antigo como cancelado
                    planoExistente.status = 'cancelado';
                }
            }
            
            planosContratados.push(planoData);
            localStorage.setItem('planosContratados', JSON.stringify(planosContratados));
            
            alert(`Plano ${planoData.nome} assinado com sucesso!`);
            
            // Sempre atualizar a home se estiver nela, ou redirecionar para home
            if (this.currentPage === 'home') {
                this.loadPlanosContratados();
            } else {
                // Redirecionar para home após assinar
                this.loadPage('home');
            }
        }
    }

    getPlanosContratados() {
        const planosJson = localStorage.getItem('planosContratados');
        return planosJson ? JSON.parse(planosJson) : [];
    }

    setupProdutosEvents() {
        // Carregar produtos
        this.loadProdutos();

        // Filtros de categoria
        const filtroButtons = document.querySelectorAll('.filtro-btn');
        filtroButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos
                filtroButtons.forEach(b => b.classList.remove('active'));
                // Adicionar active no clicado
                btn.classList.add('active');
                
                const categoria = btn.getAttribute('data-categoria');
                this.loadProdutos(categoria === 'todos' ? null : categoria);
            });
        });

        // Modal de produto
        const modal = document.getElementById('produto-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal('produto-modal');
                });
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('produto-modal');
                }
            });
        }
    }

    async loadProdutos(categoria = null) {
        const loadingEl = document.getElementById('produtos-loading');
        const gridEl = document.getElementById('produtos-grid');
        const emptyEl = document.getElementById('produtos-empty');

        if (loadingEl) loadingEl.style.display = 'block';
        if (gridEl) gridEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const params = { action: 'list' };
            if (categoria) {
                params.categoria = categoria;
            }
            let url = this.getApiEndpoint('produtos', params);

            console.log('Carregando produtos de:', url); // Debug
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (loadingEl) loadingEl.style.display = 'none';

            if (data.status === 'ok' && data.data.produtos.length > 0) {
                this.renderProdutos(data.data.produtos);
                if (gridEl) gridEl.style.display = 'grid';
            } else {
                if (emptyEl) emptyEl.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            if (loadingEl) loadingEl.style.display = 'none';
            if (emptyEl) {
                emptyEl.innerHTML = '<p>Erro ao carregar produtos. Tente novamente.</p>';
                emptyEl.style.display = 'block';
            }
        }
    }

    renderProdutos(produtos) {
        const gridEl = document.getElementById('produtos-grid');
        if (!gridEl) return;

        gridEl.innerHTML = produtos.map(produto => {
            const imgSrc = this.getProductImage(produto);
            const precoFormatado = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(produto.preco);

            const precoAntigoFormatado = produto.preco_antigo 
                ? new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(produto.preco_antigo)
                : '';

            const estoqueBadge = produto.estoque <= 0 
                ? '<span class="produto-badge esgotado">Esgotado</span>'
                : produto.estoque < 10
                ? `<span class="produto-badge">Últimas ${produto.estoque} unidades</span>`
                : '';

            return `
                <div class="produto-card ${produto.destaque ? 'destaque' : ''}" data-id="${produto.id}">
                    <div class="produto-imagem"><img src="${imgSrc}" alt="${produto.nome}"></div>
                    <div class="produto-nome">${produto.nome}</div>
                    <div class="produto-marca">${produto.marca || ''}</div>
                    <div class="produto-preco">
                        ${produto.preco_antigo ? `<div class="produto-preco-antigo">${precoAntigoFormatado}</div>` : ''}
                        <div class="produto-preco-atual">${precoFormatado}</div>
                    </div>
                    ${estoqueBadge}
                    <div class="produto-acoes">
                        <button class="btn-ver-detalhes" onclick="app.viewProduto(${produto.id})">Ver Detalhes</button>
                        <button class="btn-comprar" ${produto.estoque <= 0 ? 'disabled' : ''} onclick="app.comprarProduto(${produto.id})">
                            ${produto.estoque <= 0 ? 'Esgotado' : 'Comprar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async viewProduto(id) {
        try {
            let url = this.getApiEndpoint('produtos', { action: 'view', id: id });
            console.log('Carregando produto:', url); // Debug
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.status === 'ok') {
                this.openProdutoModal(data.data.produto);
            } else {
                alert(data.message || 'Erro ao carregar produto');
            }
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            alert('Erro ao carregar produto');
        }
    }

    openProdutoModal(produto) {
        const modal = document.getElementById('produto-modal');
        const nomeEl = document.getElementById('modal-produto-nome');
        const bodyEl = document.getElementById('modal-produto-body');

        if (!modal || !nomeEl || !bodyEl) return;

        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(produto.preco);

        const precoAntigoFormatado = produto.preco_antigo 
            ? new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(produto.preco_antigo)
            : '';

        nomeEl.textContent = produto.nome;
        
        let especificacoesHTML = '';
        if (produto.especificacoes && Object.keys(produto.especificacoes).length > 0) {
            especificacoesHTML = `
                <div class="produto-especificacoes">
                    <h4>Especificações</h4>
                    <ul>
                        ${Object.entries(produto.especificacoes).map(([key, value]) => `
                            <li>
                                <span>${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:</span>
                                <span>${value}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        const imgSrc = this.getProductImage(produto);
        bodyEl.innerHTML = `
            <div class="produto-detalhes">
                <div class="produto-detalhes-imagem">
                    <div class="produto-imagem"><img src="${imgSrc}" alt="${produto.nome}"></div>
                </div>
                <div class="produto-detalhes-info">
                    <h3>${produto.nome}</h3>
                    <div class="produto-marca">${produto.marca || ''}</div>
                    <div class="produto-descricao">${produto.descricao || ''}</div>
                    <div class="produto-preco">
                        ${produto.preco_antigo ? `<div class="produto-preco-antigo">${precoAntigoFormatado}</div>` : ''}
                        <div class="produto-preco-atual" style="font-size: 28px;">${precoFormatado}</div>
                    </div>
                    <div style="margin-top: 20px;">
                        <p style="color: ${produto.estoque > 0 ? 'var(--accent-color)' : '#dc2626'}; font-weight: 600;">
                            ${produto.estoque > 0 ? `Estoque: ${produto.estoque} unidades` : 'Esgotado'}
                        </p>
                    </div>
                    <div style="margin-top: 24px;">
                        <button class="btn-primary btn-full" ${produto.estoque <= 0 ? 'disabled' : ''} onclick="app.comprarProduto(${produto.id})">
                            ${produto.estoque <= 0 ? 'Produto Esgotado' : 'Comprar Agora'}
                        </button>
                    </div>
                    ${especificacoesHTML}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    getAssetsBasePath() {
        // Retorna o caminho base para a pasta de assets (imagens)
        const pathname = window.location.pathname;
        const frontIndex = pathname.indexOf('/frontend/');
        if (frontIndex !== -1) {
            return pathname.substring(0, frontIndex + '/frontend/'.length) + 'assets/img/';
        }
        // fallback relativo
        return 'assets/img/';
    }

    getProductImage(produto) {
        const base = this.getAssetsBasePath();
        // Se o backend retornar um caminho válido, usa direto
        if (produto.imagem && /\.(svg|png|jpg|jpeg|webp)$/i.test(produto.imagem)) {
            return produto.imagem.startsWith('http') ? produto.imagem : base + produto.imagem;
        }
        // Fallback por categoria
        switch ((produto.categoria || '').toLowerCase()) {
            case 'celular':
                return base + 'phone.svg';
            case 'fone':
                return base + 'headphones.svg';
            case 'tablet':
                return base + 'tablet.svg';
            case 'acessorio':
                // Tentar inferir pelo nome
                if ((produto.nome || '').toLowerCase().includes('capa')) return base + 'case.svg';
                if ((produto.nome || '').toLowerCase().includes('carreg')) return base + 'charger.svg';
                return base + 'charger.svg';
            default:
                return base + 'generic.svg';
        }
    }

    comprarProduto(id) {
        if (confirm('Deseja adicionar este produto ao carrinho?')) {
            // Aqui você pode implementar o carrinho de compras
            console.log('Produto adicionado ao carrinho:', id);
            alert('Produto adicionado ao carrinho com sucesso!');
            // Em uma implementação completa, você salvaria no localStorage ou enviaria para o backend
        }
    }

    setupSuporteEvents() {
        // Botões para abrir modal de chamado
        const categoryButtons = document.querySelectorAll('.btn-category');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.closest('.category-card').getAttribute('data-category');
                this.openChamadoModal(category);
            });
        });

        // Fechar modal
        const modal = document.getElementById('chamado-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            const closeButton = closeBtn;
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.closeModal('chamado-modal');
                });
            }

            // Fechar ao clicar fora do modal
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('chamado-modal');
                }
            });

            // Formulário de chamado
            const form = document.getElementById('chamado-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitChamado();
                });
            }
        }
    }

    setupContaEvents() {
        // Botão editar dados
        const btnEditar = document.getElementById('btn-editar-dados');
        if (btnEditar) {
            btnEditar.addEventListener('click', () => {
                this.openEditarModal();
            });
        }

        // Botão sair
        const btnSair = document.getElementById('btn-sair');
        if (btnSair) {
            btnSair.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Modal de edição
        const modal = document.getElementById('editar-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModal('editar-modal');
                });
            }

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal('editar-modal');
                }
            });

            // Formulário de edição
            const form = document.getElementById('editar-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.submitEditarForm();
                });
            }
        }
    }

    setupFinanceiroEvents() {
        // Carregar e renderizar faturas
        this.renderizarFaturas();
    }

    renderizarFaturas() {
        const faturasSection = document.getElementById('faturas-section');
        if (!faturasSection) return;

        // Carregar planos ativos
        const planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo');
        
        if (planosContratados.length === 0) {
            faturasSection.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>Você não possui planos contratados.</p>
                    <p style="margin-top: 10px;">Assine um plano na loja para ver suas faturas aqui.</p>
                </div>
            `;
            return;
        }

        // Calcular valor total da fatura
        const calcularValorTotal = () => {
            return planosContratados.reduce((sum, plano) => {
                let preco = 0;
                if (typeof plano.preco === 'number') {
                    preco = plano.preco;
                } else if (typeof plano.preco === 'string') {
                    const precoStr = plano.preco.replace(/[^\d,.-]/g, '').replace(',', '.');
                    preco = parseFloat(precoStr) || 0;
                } else if (plano.precoFormatado) {
                    const precoMatch = plano.precoFormatado.match(/R\$\s*([\d,]+)/);
                    if (precoMatch) {
                        preco = parseFloat(precoMatch[1].replace(',', '.')) || 0;
                    }
                }
                return sum + preco;
            }, 0);
        };

        const valorTotal = calcularValorTotal();

        // Gerar faturas para os últimos 3 meses e próximo mês
        const hoje = new Date();
        const faturas = [];
        
        // Próxima fatura (pendente)
        const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 15);
        faturas.push({
            mes: proximoMes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            dataVencimento: proximoMes,
            valor: valorTotal,
            status: 'pending',
            statusLabel: 'Pendente'
        });

        // Faturas dos últimos 3 meses (pagas)
        for (let i = 1; i <= 3; i++) {
            const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - i, 15);
            const diasAtraso = Math.floor((hoje - mesAnterior) / (1000 * 60 * 60 * 24));
            
            let status = 'paid';
            let statusLabel = 'Paga';
            
            // Se a fatura está vencida e não foi paga, marcar como atrasada
            if (diasAtraso > 0 && diasAtraso <= 30) {
                status = 'overdue';
                statusLabel = 'Atrasada';
            }
            
            faturas.push({
                mes: mesAnterior.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                dataVencimento: mesAnterior,
                valor: valorTotal,
                status: status,
                statusLabel: statusLabel
            });
        }

        // Ordenar faturas por data (mais recente primeiro)
        faturas.sort((a, b) => b.dataVencimento - a.dataVencimento);

        // Renderizar faturas
        faturasSection.innerHTML = faturas.map(fatura => {
            const dia = String(fatura.dataVencimento.getDate()).padStart(2, '0');
            const mes = String(fatura.dataVencimento.getMonth() + 1).padStart(2, '0');
            const ano = fatura.dataVencimento.getFullYear();
            
            const valorFormatado = fatura.valor.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            const mesCapitalizado = fatura.mes.charAt(0).toUpperCase() + fatura.mes.slice(1);

            let botoes = '';
            if (fatura.status === 'pending' || fatura.status === 'overdue') {
                botoes = `
                    <button class="btn-primary" onclick="app.pagarFatura('${fatura.mes}')">Pagar Agora</button>
                    <button class="btn-secondary" onclick="app.verDetalhesFatura('${fatura.mes}')">Ver Detalhes</button>
                    <button class="btn-secondary" onclick="app.baixarPDFFatura('${fatura.mes}')">Baixar PDF</button>
                `;
            } else {
                botoes = `
                    <button class="btn-secondary" onclick="app.verDetalhesFatura('${fatura.mes}')">Ver Detalhes</button>
                    <button class="btn-secondary" onclick="app.baixarPDFFatura('${fatura.mes}')">Baixar PDF</button>
                `;
            }

            return `
                <div class="fatura-card status-${fatura.status}">
                    <div class="fatura-header">
                        <div class="fatura-info">
                            <h3>${mesCapitalizado}</h3>
                            <span class="fatura-date">Vencimento: ${dia}/${mes}/${ano}</span>
                        </div>
                        <span class="status-badge ${fatura.status}">${fatura.statusLabel}</span>
                    </div>
                    <div class="fatura-body">
                        <div class="fatura-value">
                            <span class="label">Valor:</span>
                            <span class="value">R$ ${valorFormatado}</span>
                        </div>
                        <div class="fatura-detalhes" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Planos incluídos:</p>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                ${planosContratados.map(plano => {
                                    const planoPreco = plano.precoFormatado || 
                                        (typeof plano.preco === 'number' ? `R$ ${plano.preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00');
                                    return `
                                        <li style="padding: 5px 0; font-size: 14px;">
                                            <span style="color: #333;">• ${plano.nome}</span>
                                            <span style="color: #666; margin-left: 10px;">${planoPreco}</span>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                        <div class="fatura-actions" style="margin-top: 15px;">
                            ${botoes}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    pagarFatura(mes) {
        if (confirm(`Deseja pagar a fatura de ${mes}?`)) {
            alert('Pagamento realizado com sucesso!');
            // Aqui você pode adicionar lógica para atualizar o status da fatura
            this.renderizarFaturas();
        }
    }

    verDetalhesFatura(mes) {
        const planosContratados = this.getPlanosContratados().filter(p => p.status === 'ativo');
        const valorTotal = planosContratados.reduce((sum, plano) => {
            let preco = 0;
            if (typeof plano.preco === 'number') {
                preco = plano.preco;
            } else if (plano.precoFormatado) {
                const precoMatch = plano.precoFormatado.match(/R\$\s*([\d,]+)/);
                if (precoMatch) {
                    preco = parseFloat(precoMatch[1].replace(',', '.')) || 0;
                }
            }
            return sum + preco;
        }, 0);

        const detalhes = `
Detalhes da Fatura - ${mes}

Valor Total: R$ ${valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Planos:
${planosContratados.map(plano => {
            const planoPreco = plano.precoFormatado || 
                (typeof plano.preco === 'number' ? `R$ ${plano.preco.toFixed(2).replace('.', ',')}` : 'R$ 0,00');
            return `• ${plano.nome} - ${planoPreco}`;
        }).join('\n')}
        `;
        
        alert(detalhes);
    }

    baixarPDFFatura(mes) {
        alert(`Download da fatura de ${mes} será iniciado em breve.`);
        // Aqui você pode adicionar lógica para gerar e baixar o PDF
    }

    handleQuickAction(action) {
        const actionMap = {
            'fatura': 'financeiro',
            'suporte': 'suporte',
            'planos': 'loja',
            'loja': 'produtos'
        };

        const page = actionMap[action];
        if (page) {
            this.loadPage(page);
        }
    }

    initBannerSlider() {
        // Limpar intervalo anterior se existir
        if (this.bannerInterval) {
            clearInterval(this.bannerInterval);
        }

        const slides = document.querySelectorAll('.banner-slide');
        const indicators = document.querySelectorAll('.indicator');

        if (slides.length === 0) return;

        let currentSlide = 0;

        const nextSlide = () => {
            if (slides.length === 0) return;
            
            slides[currentSlide].classList.remove('active');
            if (indicators[currentSlide]) {
                indicators[currentSlide].classList.remove('active');
            }

            currentSlide = (currentSlide + 1) % slides.length;

            slides[currentSlide].classList.add('active');
            if (indicators[currentSlide]) {
                indicators[currentSlide].classList.add('active');
            }
        };

        // Mudar slide a cada 4 segundos
        this.bannerInterval = setInterval(() => {
            if (document.querySelector('.home-page')) {
                nextSlide();
            }
        }, 4000);

        // Clique nos indicadores
        indicators.forEach((indicator, index) => {
            // Remover listeners anteriores se existirem
            const newIndicator = indicator.cloneNode(true);
            indicator.parentNode.replaceChild(newIndicator, indicator);
            
            newIndicator.addEventListener('click', () => {
                slides[currentSlide].classList.remove('active');
                if (indicators[currentSlide]) {
                    indicators[currentSlide].classList.remove('active');
                }
                
                currentSlide = index;
                
                slides[currentSlide].classList.add('active');
                if (indicators[currentSlide]) {
                    indicators[currentSlide].classList.add('active');
                }
            });
        });
    }

    openChamadoModal(category = '') {
        const modal = document.getElementById('chamado-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Preencher categoria se fornecida
            const categoriaSelect = document.getElementById('categoria');
            if (categoriaSelect && category) {
                categoriaSelect.value = category;
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    submitChamado() {
        const form = document.getElementById('chamado-form');
        if (!form) return;

        const formData = new FormData(form);
        const categoria = formData.get('categoria');
        const assunto = formData.get('assunto');
        const descricao = formData.get('descricao');

        // Simular envio (aqui seria a chamada para API)
        console.log('Chamado enviado:', { categoria, assunto, descricao });

        // Mostrar feedback
        alert('Chamado enviado com sucesso! Número: #' + Math.floor(Math.random() * 10000));

        // Fechar modal e resetar formulário
        this.closeModal('chamado-modal');
        form.reset();
    }

    openEditarModal() {
        const modal = document.getElementById('editar-modal');
        if (modal) {
            // Preencher campos com dados atuais
            const nomeEl = document.getElementById('info-nome');
            const emailEl = document.getElementById('info-email');
            const telefoneEl = document.getElementById('info-telefone');

            const editNome = document.getElementById('edit-nome');
            const editEmail = document.getElementById('edit-email');
            const editTelefone = document.getElementById('edit-telefone');

            if (editNome && nomeEl) editNome.value = nomeEl.textContent;
            if (editEmail && emailEl) editEmail.value = emailEl.textContent;
            if (editTelefone && telefoneEl) editTelefone.value = telefoneEl.textContent;

            modal.classList.add('active');
        }
    }

    submitEditarForm() {
        const form = document.getElementById('editar-form');
        if (!form) return;

        const formData = new FormData(form);
        const nome = formData.get('nome');
        const email = formData.get('email');
        const telefone = formData.get('telefone');

        // Atualizar na interface
        const nomeEl = document.getElementById('info-nome');
        const emailEl = document.getElementById('info-email');
        const telefoneEl = document.getElementById('info-telefone');

        if (nomeEl) nomeEl.textContent = nome;
        if (emailEl) emailEl.textContent = email;
        if (telefoneEl) telefoneEl.textContent = telefone;

        // Salvar dados no localStorage
        localStorage.setItem('userName', nome);
        localStorage.setItem('userFullName', nome);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPhone', telefone);

        // Atualizar nome na home se estiver visível
        const userNameElements = document.querySelectorAll('#user-name, #profile-name');
        userNameElements.forEach(el => {
            if (el) el.textContent = nome;
        });

        // Simular salvamento (aqui seria a chamada para API)
        console.log('Dados atualizados:', { nome, email, telefone });

        // Mostrar feedback
        alert('Dados atualizados com sucesso!');

        // Fechar modal
        this.closeModal('editar-modal');
    }

    handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            // Usar a função de logout da autenticação
            this.logout();
        }
    }

    // ========================================
    // FUNÇÕES DE AUTENTICAÇÃO
    // ========================================

    /**
     * Verificar se o usuário está autenticado
     */
    async checkAuthentication() {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const authToken = localStorage.getItem('authToken');
        
        if (!isAuthenticated || !authToken) {
            return Promise.reject('Não autenticado');
        }

        // Verificar com o backend se a sessão ainda é válida
        try {
            const response = await fetch(this.getApiEndpoint('auth', { action: 'check' }), {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.status === 'ok' && data.data && data.data.user) {
                // Atualizar dados do usuário no localStorage
                localStorage.setItem('userName', data.data.user.nome);
                localStorage.setItem('userEmail', data.data.user.email);
                localStorage.setItem('userFullName', data.data.user.nome);
                if (data.data.user.telefone) {
                    localStorage.setItem('userPhone', data.data.user.telefone);
                }
                if (data.data.user.cpf) {
                    localStorage.setItem('userCPF', data.data.user.cpf);
                }
                return Promise.resolve();
            } else {
                // Sessão inválida
                this.logout();
                return Promise.reject('Sessão inválida');
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            // Em caso de erro de rede, manter autenticação se existir no localStorage
            if (isAuthenticated) {
                return Promise.resolve();
            }
            return Promise.reject('Erro ao verificar autenticação');
        }
    }

    /**
     * Realizar login
     */
    async login(email, senha) {
        try {
            const url = this.getApiEndpoint('auth', { action: 'login' });
            console.log('Tentando fazer login em:', url); // Debug
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            // Ler resposta como texto primeiro para verificar se é JSON
            const text = await response.text();
            
            // Verificar se a resposta é HTML (erro PHP) em vez de JSON
            if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<br />')) {
                console.error('Resposta não é JSON (possível erro PHP):', text.substring(0, 200));
                
                // Se não estiver usando index.php, tentar com index.php
                if (localStorage.getItem('api_use_index_php') !== 'true') {
                    console.log('Resposta HTML detectada. Tentando novamente com index.php...');
                    localStorage.setItem('api_use_index_php', 'true');
                    // Tentar novamente com index.php
                    return await this.login(email, senha);
                }
                
                // Se já estiver usando index.php e ainda receber HTML, é erro do backend
                return { 
                    success: false, 
                    message: 'Erro no servidor. Verifique se o backend está configurado corretamente.' 
                };
            }

            // Tentar fazer parse do JSON
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                console.error('Resposta recebida:', text.substring(0, 500));
                return { 
                    success: false, 
                    message: 'Resposta inválida do servidor. Verifique se o backend está funcionando.' 
                };
            }

            if (!response.ok) {
                console.error('Erro na resposta:', response.status, data);
                
                // Se for 404 e não estiver usando index.php, tentar com index.php
                if (response.status === 404 && localStorage.getItem('api_use_index_php') !== 'true') {
                    console.log('404 detectado. Tentando novamente com index.php...');
                    localStorage.setItem('api_use_index_php', 'true');
                    // Tentar novamente com index.php
                    return await this.login(email, senha);
                }
                
                return { 
                    success: false, 
                    message: data.message || `Erro ${response.status}: ${response.status === 404 ? 'Endpoint não encontrado. Verifique a URL da API.' : 'Erro ao conectar com o servidor.'}` 
                };
            }

            if (data.status === 'ok' && data.data && data.data.user) {
                // Salvar informações de autenticação
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('authToken', 'session_' + Date.now());
                localStorage.setItem('userName', data.data.user.nome);
                localStorage.setItem('userEmail', data.data.user.email);
                localStorage.setItem('userFullName', data.data.user.nome);
                
                if (data.data.user.telefone) {
                    localStorage.setItem('userPhone', data.data.user.telefone);
                }
                if (data.data.user.cpf) {
                    localStorage.setItem('userCPF', data.data.user.cpf);
                }

                // Se usou index.php e funcionou, manter a preferência
                // (não limpar, pois o .htaccess pode não estar funcionando)
                
                return { success: true, user: data.data.user };
            } else {
                return { success: false, message: data.message || 'Erro ao fazer login' };
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            
            // Se for erro de JSON e não estiver usando index.php, tentar com index.php
            if (error.message && error.message.includes('JSON') && localStorage.getItem('api_use_index_php') !== 'true') {
                console.log('Erro de JSON detectado. Tentando novamente com index.php...');
                localStorage.setItem('api_use_index_php', 'true');
                // Tentar novamente com index.php
                return await this.login(email, senha);
            }
            
            return { success: false, message: 'Erro de conexão. Verifique sua internet e se o backend está funcionando.' };
        }
    }

    /**
     * Registrar novo usuário
     */
    async register(nome, email, senha, cpf = null, telefone = null) {
        try {
            const body = {
                nome: nome,
                email: email,
                senha: senha
            };

            if (cpf && cpf.trim() !== '') {
                body.cpf = cpf;
            }
            if (telefone && telefone.trim() !== '') {
                body.telefone = telefone;
            }

            const response = await fetch(this.getApiEndpoint('auth', { action: 'register' }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.status === 'ok' && data.data && data.data.user) {
                // Auto-login após cadastro
                return await this.login(email, senha);
            } else {
                return { success: false, message: data.message || 'Erro ao criar conta' };
            }
        } catch (error) {
            console.error('Erro ao registrar:', error);
            return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
        }
    }

    /**
     * Fazer logout
     */
    async logout() {
        try {
            await fetch(this.getApiEndpoint('auth', { action: 'logout' }), {
                method: 'GET',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        } finally {
            // Limpar localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('authToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userCPF');
            localStorage.removeItem('userFullName');
            localStorage.removeItem('planosContratados');
            
            // Redirecionar para login
            this.loadPage('login');
        }
    }

    /**
     * Configurar eventos da página de login
     */
    setupLoginEvents() {
        const loginForm = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        const senhaInput = document.getElementById('senha');
        const linkCadastro = document.getElementById('link-cadastro');

        // Toggle mostrar/ocultar senha
        if (togglePassword && senhaInput) {
            togglePassword.addEventListener('click', () => {
                const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
                senhaInput.setAttribute('type', type);
            });
        }

        // Navegação para cadastro
        if (linkCadastro) {
            linkCadastro.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage('cadastro');
            });
        }

        // Submissão do formulário
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const senha = document.getElementById('senha').value;
                const loginButton = document.getElementById('login-button');
                const errorDiv = document.getElementById('login-error');
                const lembrarMe = document.getElementById('lembrar-me').checked;

                // Limpar erro anterior
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                    errorDiv.textContent = '';
                }

                // Desabilitar botão
                if (loginButton) {
                    loginButton.disabled = true;
                    loginButton.innerHTML = '<span>Entrando...</span>';
                }

                // Fazer login
                const result = await this.login(email, senha);

                if (result.success) {
                    // Salvar credenciais se "lembrar-me" estiver marcado
                    if (lembrarMe) {
                        localStorage.setItem('savedEmail', email);
                    } else {
                        localStorage.removeItem('savedEmail');
                    }

                    // Redirecionar para home
                    this.loadPage('home');
                    this.setupNavigation();
                } else {
                    // Mostrar erro
                    if (errorDiv) {
                        errorDiv.textContent = result.message;
                        errorDiv.style.display = 'block';
                    }

                    // Reabilitar botão
                    if (loginButton) {
                        loginButton.disabled = false;
                        loginButton.innerHTML = '<span>Entrar</span><svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
                    }
                }
            });
        }

        // Carregar email salvo se existir
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = savedEmail;
            }
            const lembrarMeCheckbox = document.getElementById('lembrar-me');
            if (lembrarMeCheckbox) {
                lembrarMeCheckbox.checked = true;
            }
        }
    }

    /**
     * Configurar eventos da página de cadastro
     */
    setupCadastroEvents() {
        const cadastroForm = document.getElementById('cadastro-form');
        const togglePasswordCadastro = document.getElementById('toggle-password-cadastro');
        const togglePasswordConfirm = document.getElementById('toggle-password-confirm');
        const senhaCadastroInput = document.getElementById('senha-cadastro');
        const confirmarSenhaInput = document.getElementById('confirmar-senha');
        const linkLogin = document.getElementById('link-login');

        // Toggle mostrar/ocultar senha (cadastro)
        if (togglePasswordCadastro && senhaCadastroInput) {
            togglePasswordCadastro.addEventListener('click', () => {
                const type = senhaCadastroInput.getAttribute('type') === 'password' ? 'text' : 'password';
                senhaCadastroInput.setAttribute('type', type);
            });
        }

        // Toggle mostrar/ocultar senha (confirmação)
        if (togglePasswordConfirm && confirmarSenhaInput) {
            togglePasswordConfirm.addEventListener('click', () => {
                const type = confirmarSenhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
                confirmarSenhaInput.setAttribute('type', type);
            });
        }

        // Navegação para login
        if (linkLogin) {
            linkLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage('login');
            });
        }

        // Submissão do formulário
        if (cadastroForm) {
            cadastroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const nome = document.getElementById('nome').value.trim();
                const email = document.getElementById('email-cadastro').value.trim();
                const cpf = document.getElementById('cpf').value.trim();
                const telefone = document.getElementById('telefone').value.trim();
                const senha = document.getElementById('senha-cadastro').value;
                const confirmarSenha = document.getElementById('confirmar-senha').value;
                const cadastroButton = document.getElementById('cadastro-button');
                const errorDiv = document.getElementById('cadastro-error');
                const successDiv = document.getElementById('cadastro-success');

                // Limpar mensagens anteriores
                if (errorDiv) {
                    errorDiv.style.display = 'none';
                    errorDiv.textContent = '';
                }
                if (successDiv) {
                    successDiv.style.display = 'none';
                    successDiv.textContent = '';
                }

                // Validações
                if (senha !== confirmarSenha) {
                    if (errorDiv) {
                        errorDiv.textContent = 'As senhas não coincidem';
                        errorDiv.style.display = 'block';
                    }
                    return;
                }

                if (senha.length < 6) {
                    if (errorDiv) {
                        errorDiv.textContent = 'A senha deve ter no mínimo 6 caracteres';
                        errorDiv.style.display = 'block';
                    }
                    return;
                }

                // Desabilitar botão
                if (cadastroButton) {
                    cadastroButton.disabled = true;
                    cadastroButton.innerHTML = '<span>Criando conta...</span>';
                }

                // Registrar
                const result = await this.register(nome, email, senha, cpf, telefone);

                if (result.success) {
                    // Mostrar sucesso
                    if (successDiv) {
                        successDiv.textContent = 'Conta criada com sucesso! Redirecionando...';
                        successDiv.style.display = 'block';
                    }

                    // Redirecionar para home após 1 segundo
                    setTimeout(() => {
                        this.loadPage('home');
                        this.setupNavigation();
                    }, 1000);
                } else {
                    // Mostrar erro
                    if (errorDiv) {
                        errorDiv.textContent = result.message;
                        errorDiv.style.display = 'block';
                    }

                    // Reabilitar botão
                    if (cadastroButton) {
                        cadastroButton.disabled = false;
                        cadastroButton.innerHTML = '<span>Criar conta</span><svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
                    }
                }
            });
        }
    }
}
// Funções globais para os botões dos planos
function verDetalhesPlano(planoId) {
    if (window.app) {
        // Aqui pode abrir um modal ou navegar para detalhes
        console.log('Ver detalhes do plano:', planoId);
        // window.app.navigateToPage('detalhes-plano');
        alert(`Detalhes do plano #${planoId} - Em desenvolvimento`);
    }
}

function gerenciarPlano(planoId) {
    if (window.app) {
        // Navegar para página de gerenciamento ou abrir modal
        console.log('Gerenciar plano:', planoId);
        // window.app.navigateToPage('gerenciar-plano');
        alert(`Gerenciar plano #${planoId} - Em desenvolvimento`);
    }
}

// Criar instância global do app
let appInstance;

// Inicializar app quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    appInstance = new App();
    window.app = appInstance;
});

