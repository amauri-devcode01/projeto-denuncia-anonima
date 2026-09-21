        /* =========================================================================
           STATE & LOCAL STORAGE INITIALIZATION
           ========================================================================= */
        const STORAGE_KEY = 'NYPD_REPORTS_1900_DATA_V2';
        const DETECTIVES_KEY = 'NYPD_DETECTIVES_1900_DATA_V2';
        
        let reportsData = [];
        let detectivesData = [];
        let currentAdminLoggedIn = false;
        let activeModalCaseId = null;

        // Mock Inicial de Denúncias
        const initialReports = [
            {
                id: 'NYPD-1900-8492',
                date: '1900-05-10T22:15',
                category: 'Contrabando & Jogo Ilegal',
                district: 'Docks do East River',
                address: 'Galpão 14-B perto do Pier de Madeira',
                urgency: 'Alta',
                description: 'Carregamento clandestino de caixas de bebidas importadas e jogo de cartas ilegal ocorrendo todas as quartas à meia-noite no galpão abandoned do Pier 14.',
                status: 'Em Investigação',
                assignedDetective: 'Thomas Byrnes',
                notes: [
                    { author: 'Thomas Byrnes', date: '11/05/1900 09:00', text: 'Vigilância discreta posicionada no Pier 14. Confirmada movimentação de carruagens suspeitas.' }
                ]
            },
            {
                id: 'NYPD-1900-3104',
                date: '1900-05-12T18:40',
                category: 'Extorsão & Ameaças',
                district: 'Five Points',
                address: 'Esquina da Mulberry Street com Paradise Alley',
                urgency: 'Crítica',
                description: 'Grupo extorquindo comerciantes locais cobrando "taxa de proteção" diária. Quebraram a vitrine do padeiro que se recusou a pagar ontem.',
                status: 'Pendente',
                assignedDetective: 'Não atribuído',
                notes: []
            },
            {
                id: 'NYPD-1900-1902',
                date: '1900-05-08T11:00',
                category: 'Corrupção & Propina',
                district: 'Bowery Street',
                address: 'Taverna Gold Coin, Bowery #88',
                urgency: 'Média',
                description: 'Propina sendo paga em envelopes pardo no fundo da taverna para vistas grossas sobre loteamento ilegal.',
                status: 'Resolvido',
                assignedDetective: 'James O\'Connor',
                notes: [
                    { author: 'James O\'Connor', date: '09/05/1900 15:30', text: 'Inspecção realizada no local com mandado. Prisões efetuadas e taverna interditada.' }
                ]
            }
        ];

        // Mock Inicial de Agentes do Gabinete
        const initialDetectives = [
            { id: 'DET-01', badge: '#NYPD-101', name: 'Thomas Byrnes', rank: 'Inspector Chief', district: 'Manhattan Central', active: true },
            { id: 'DET-02', badge: '#NYPD-204', name: 'James O\'Connor', rank: 'Captain Investigator', district: 'Five Points', active: true },
            { id: 'DET-03', badge: '#NYPD-309', name: 'Patrick O\'Malley', rank: 'Detective 1st Class', district: 'Docks do East River', active: true },
            { id: 'DET-04', badge: '#NYPD-412', name: 'Arthur Conan', rank: 'Sergeant Analyst', district: 'Wall Street & Financial', active: true }
        ];

        window.onload = function() {
            loadReportsFromStorage();
            loadDetectivesFromStorage();
            
            // Set datetime input default to current
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            if (document.getElementById('crimeDate')) {
                document.getElementById('crimeDate').value = now.toISOString().slice(0,16);
            }

            // Tenta iniciar a vitrola automaticamente ao carregar a página
            initAutoVitrola();
        };

        function loadReportsFromStorage() {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try { reportsData = JSON.parse(stored); } catch(e) { reportsData = initialReports; }
            } else {
                reportsData = initialReports;
                saveReportsToStorage();
            }
        }

        function saveReportsToStorage() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(reportsData));
        }

        function loadDetectivesFromStorage() {
            const stored = localStorage.getItem(DETECTIVES_KEY);
            if (stored) {
                try { detectivesData = JSON.parse(stored); } catch(e) { detectivesData = initialDetectives; }
            } else {
                detectivesData = initialDetectives;
                saveDetectivesToStorage();
            }
        }

        function saveDetectivesToStorage() {
            localStorage.setItem(DETECTIVES_KEY, JSON.stringify(detectivesData));
        }

        function switchTab(tab) {
            // Toca o efeito sonoro de página sendo virada ao trocar de aba
            playPageTurnSound();

            ['submit', 'track', 'admin'].forEach(t => {
                document.getElementById(`view-${t}`).classList.add('hidden');
                const navBtn = document.getElementById(`nav-${t}`);
                navBtn.className = "px-3 py-1.5 text-xs sm:text-sm rounded font-heading uppercase transition-all flex items-center gap-2 text-parchment-300 hover:text-brass";
            });

            document.getElementById(`view-${tab}`).classList.remove('hidden');
            const activeNav = document.getElementById(`nav-${tab}`);
            activeNav.className = "px-3 py-1.5 text-xs sm:text-sm rounded font-heading uppercase transition-all flex items-center gap-2 text-brass bg-noir-700 border border-brass/40";
        }

        function switchAdminSubtab(subtab) {
            playPageTurnSound();

            ['dash', 'reports', 'admins'].forEach(s => {
                document.getElementById(`admin-subview-${s}`).classList.add('hidden');
                const btn = document.getElementById(`subnav-${s}`);
                btn.className = "px-5 py-3 text-xs font-heading uppercase tracking-wider border-b-2 border-transparent text-parchment-400 hover:text-brass flex items-center gap-2 whitespace-nowrap transition-all";
            });

            document.getElementById(`admin-subview-${subtab}`).classList.remove('hidden');
            const activeBtn = document.getElementById(`subnav-${subtab}`);
            activeBtn.className = "px-5 py-3 text-xs font-heading uppercase tracking-wider border-b-2 border-brass text-brass bg-noir-800 flex items-center gap-2 whitespace-nowrap transition-all";

            if (subtab === 'dash') renderAdminDashboardView();
            if (subtab === 'reports') renderAdminTable();
            if (subtab === 'admins') renderDetectivesTable();
        }

        async function handleReportSubmit(e) {
            e.preventDefault();

            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const protocolCode = `NYPD-1900-${randomNum}`;

            // Lidar com a evidência (Converter Imagem para Base64)
            const fileInput = document.getElementById('crimeEvidence');
            let evidenceBase64 = null;
            
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                evidenceBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            }

            const newReport = {
                id: protocolCode,
                date: document.getElementById('crimeDate').value || new Date().toISOString(),
                category: document.getElementById('crimeCategory').value,
                district: document.getElementById('crimeDistrict').value,
                address: document.getElementById('crimeAddress').value || 'Não especificado',
                urgency: document.getElementById('crimeUrgency').value,
                description: document.getElementById('crimeDescription').value,
                evidence: evidenceBase64,
                status: 'Pendente',
                assignedDetective: 'Não atribuído',
                notes: []
            };

            reportsData.unshift(newReport);
            
            // Tratativa de erro para limite de Storage do navegador (imagens grandes)
            try {
                saveReportsToStorage();
            } catch (err) {
                console.error("Erro ao salvar no LocalStorage (possível limite de cota de imagem):", err);
                showToast("Aviso: A imagem enviada é muito pesada para a memória local. O registro foi feito, mas a foto não será exibida futuramente.");
            }

            showToast(`Denúncia #${protocolCode} registrada com sucesso.`);

            // Exibir protocolo gerado
            document.getElementById('view-submit').innerHTML = `
                <div class="parchment-card p-8 rounded-lg text-center space-y-6 max-w-xl mx-auto border-2 border-brass">
                    <div class="w-16 h-16 rounded-full bg-brass/20 border-2 border-brass text-brass mx-auto flex items-center justify-center text-3xl">
                        <i class="fa-solid fa-stamp"></i>
                    </div>
                    <div>
                        <span class="stamp stamp-pending mb-3">REGISTRADO NO PRONTUÁRIO</span>
                        <h2 class="font-heading text-2xl text-brass font-bold uppercase mt-2">Denúncia Enviada com Sucesso</h2>
                        <p class="text-xs text-parchment-300 mt-2">Guarde seu código de protocolo secreto. Ele é a sua única chave para acompanhar o andamento deste dossier sem revelar sua identidade.</p>
                    </div>

                    <div class="p-4 bg-noir-900 border border-brass rounded font-mono text-center">
                        <span class="text-xs text-parchment-400 block uppercase">Código de Protocolo Secreto</span>
                        <span class="text-2xl text-brass font-bold tracking-widest">${protocolCode}</span>
                    </div>

                    <div class="flex justify-center gap-4">
                        <button onclick="window.location.reload()" class="btn-brass px-6 py-2.5 rounded text-xs font-bold uppercase">
                            Fazer Nova Denúncia
                        </button>
                        <button onclick="switchTab('track'); document.getElementById('trackProtocolInput').value='${protocolCode}'; searchProtocol();" class="px-6 py-2.5 rounded bg-noir-700 text-parchment-200 hover:text-white text-xs font-heading uppercase">
                            Consultar Este Dossier
                        </button>
                    </div>
                </div>
            `;
        }

        function searchProtocol() {
            const input = document.getElementById('trackProtocolInput').value.trim().toUpperCase();
            const container = document.getElementById('trackResultContainer');

            if (!input) {
                showToast('Informe um número de protocolo válido.');
                return;
            }

            const item = reportsData.find(r => r.id === input);
            container.classList.remove('hidden');

            if (!item) {
                container.innerHTML = `
                    <div class="parchment-card p-6 rounded-lg text-center space-y-3 border-l-4 border-l-crimson">
                        <i class="fa-solid fa-circle-exclamation text-3xl text-crimson"></i>
                        <h3 class="font-heading text-lg text-parchment-100 font-bold uppercase">Dossier Não Encontrado</h3>
                        <p class="text-xs text-parchment-400">Nenhum registro localizado para o código "<span class="font-mono text-brass">${input}</span>". Verifique a grafia do protocolo.</p>
                    </div>
                `;
                return;
            }

            let stampClass = 'stamp-pending';
            if (item.status === 'Em Investigação') stampClass = 'stamp-investigating';
            if (item.status === 'Resolvido') stampClass = 'stamp-resolved';
            if (item.status === 'Arquivado') stampClass = 'stamp-archived';

            const formattedDate = new Date(item.date).toLocaleString('pt-BR');

            const notesHTML = item.notes && item.notes.length > 0 
                ? item.notes.map(n => `
                    <div class="bg-noir-900 p-3 rounded border-l-2 border-l-brass text-xs space-y-1">
                        <div class="flex justify-between text-parchment-400">
                            <span class="font-bold text-brass">${n.author}</span>
                            <span class="font-mono">${n.date}</span>
                        </div>
                        <p class="text-parchment-200 font-typewriter">${n.text}</p>
                    </div>
                `).join('')
                : '<p class="text-xs text-parchment-400 italic">Nenhum despacho policial público anexado até o momento.</p>';

            const evidenceHTML = item.evidence
                ? `<div class="mt-4 p-2 bg-noir-900/50 border border-dashed border-brass/40 inline-block rounded">
                    <span class="block text-[10px] text-brass uppercase font-heading mb-2"><i class="fa-solid fa-camera-retro"></i> Fotografia / Evidência Anexada</span>
                    <img src="${item.evidence}" alt="Evidência" class="max-h-60 object-contain rounded border border-noir-600 sepia-[.6] hover:sepia-0 transition-all duration-300">
                   </div>`
                : '';

            container.innerHTML = `
                <div class="parchment-card p-6 rounded-lg space-y-6">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-noir-500 pb-4 gap-2">
                        <div>
                            <span class="text-xs text-parchment-400 font-mono">FICHA DE PROTOCOLO</span>
                            <h3 class="font-heading text-xl font-bold text-brass uppercase">${item.id}</h3>
                            <p class="text-xs text-parchment-400">Registrado em ${formattedDate}</p>
                        </div>
                        <div>
                            <span class="stamp ${stampClass}">${item.status}</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-noir-900 p-4 rounded border border-noir-600">
                        <div>
                            <span class="text-parchment-400 uppercase font-heading block">Categoria</span>
                            <span class="text-parchment-200 font-bold">${item.category}</span>
                        </div>
                        <div>
                            <span class="text-parchment-400 uppercase font-heading block">Distrito</span>
                            <span class="text-brass font-bold">${item.district}</span>
                        </div>
                        <div>
                            <span class="text-parchment-400 uppercase font-heading block">Nível Urgência</span>
                            <span class="text-parchment-200 font-bold">${item.urgency}</span>
                        </div>
                    </div>

                    <div>
                        <h4 class="font-heading text-xs text-brass uppercase font-bold mb-2">Relato Registrado:</h4>
                        <p class="text-xs text-parchment-300 p-3 bg-noir-900 rounded border border-noir-600 leading-relaxed">${item.description}</p>
                        ${evidenceHTML}
                    </div>

                    <div class="border-t border-noir-500 pt-4 space-y-3">
                        <h4 class="font-heading text-xs text-brass uppercase font-bold flex items-center gap-2">
                            <i class="fa-solid fa-book-bookmark"></i> Diário de Bordo Policial (Anotações Públicas)
                        </h4>
                        <div class="space-y-2">${notesHTML}</div>
                    </div>
                </div>
            `;
        }

        function handleAdminLogin(e) {
            e.preventDefault();
            const pass = document.getElementById('adminPassword').value;
            if (pass === '1900') {
                currentAdminLoggedIn = true;
                document.getElementById('admin-login-box').classList.add('hidden');
                document.getElementById('admin-dashboard').classList.remove('hidden');
                switchAdminSubtab('dash');
                showToast('Acesso autorizado. Bem-vindo, Inspector Chief.');
            } else {
                showToast('Senha incorreta! Código negado pelo Gabinete.');
            }
        }

        function handleAdminLogout() {
            currentAdminLoggedIn = false;
            document.getElementById('adminPassword').value = '';
            document.getElementById('admin-dashboard').classList.add('hidden');
            document.getElementById('admin-login-box').classList.remove('hidden');
            showToast('Plantão encerrado com sucesso.');
        }

        function renderAdminDashboardView() {
            const total = reportsData.length;
            const pending = reportsData.filter(r => r.status === 'Pendente').length;
            const investigating = reportsData.filter(r => r.status === 'Em Investigação').length;
            const resolved = reportsData.filter(r => r.status === 'Resolvido').length;
            const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            document.getElementById('stat-total').innerText = total;
            document.getElementById('stat-pending').innerText = pending;
            document.getElementById('stat-investigating').innerText = investigating;
            document.getElementById('stat-resolved').innerText = resolved;
            document.getElementById('stat-rate').innerText = `${rate}%`;

            // Breakdown por Urgência
            const urgencyCounts = { 'Crítica': 0, 'Alta': 0, 'Média': 0, 'Baixa': 0 };
            reportsData.forEach(r => { if (urgencyCounts[r.urgency] !== undefined) urgencyCounts[r.urgency]++; });

            document.getElementById('urgencyBreakdown').innerHTML = Object.entries(urgencyCounts).map(([level, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                let colorClass = 'bg-brass';
                if (level === 'Crítica') colorClass = 'bg-crimson';
                if (level === 'Alta') colorClass = 'bg-orange-500';
                if (level === 'Média') colorClass = 'bg-yellow-500';

                return `
                    <div>
                        <div class="flex justify-between mb-1 text-parchment-200">
                            <span>${level}</span>
                            <span class="font-mono text-brass">${count} (${pct}%)</span>
                        </div>
                        <div class="w-full bg-noir-900 h-2.5 rounded border border-noir-600 overflow-hidden">
                            <div class="${colorClass} h-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('');

            // Breakdown por Distrito
            const districtCounts = {};
            reportsData.forEach(r => { districtCounts[r.district] = (districtCounts[r.district] || 0) + 1; });

            document.getElementById('districtBreakdown').innerHTML = Object.entries(districtCounts).map(([dist, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return `
                    <div>
                        <div class="flex justify-between mb-1 text-parchment-200">
                            <span>${dist}</span>
                            <span class="font-mono text-brass">${count} caso(s)</span>
                        </div>
                        <div class="w-full bg-noir-900 h-2 rounded border border-noir-600 overflow-hidden">
                            <div class="bg-brass h-full transition-all duration-500" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            }).join('') || '<p class="text-parchment-400 italic">Nenhum distrito registrado.</p>';

            // Casos Críticos
            const criticals = reportsData.filter(r => r.urgency === 'Crítica' && r.status !== 'Resolvido');
            const criticalContainer = document.getElementById('criticalCasesList');
            if (criticals.length === 0) {
                criticalContainer.innerHTML = '<p class="text-parchment-400 italic p-2">Nenhuma ocorrência crítica pendente neste momento.</p>';
            } else {
                criticalContainer.innerHTML = criticals.map(c => `
                    <div class="bg-noir-900 p-2.5 rounded border border-crimson/50 flex justify-between items-center">
                        <div>
                            <span class="font-mono text-crimson font-bold mr-2">${c.id}</span>
                            <span class="text-parchment-100 font-bold">${c.category} (${c.district})</span>
                            <p class="text-[11px] text-parchment-400 truncate max-w-md">${c.description}</p>
                        </div>
                        <button onclick="switchAdminSubtab('reports'); openDossierModal('${c.id}');" class="px-2 py-1 rounded bg-crimson/20 border border-crimson text-red-300 text-[10px] uppercase hover:bg-crimson hover:text-white">
                            Assumir Caso
                        </button>
                    </div>
                `).join('');
            }

            // Atividade Recente
            let allNotes = [];
            reportsData.forEach(r => {
                if (r.notes) {
                    r.notes.forEach(n => allNotes.push({ protocol: r.id, ...n }));
                }
            });

            const recentContainer = document.getElementById('recentActivityList');
            if (allNotes.length === 0) {
                recentContainer.innerHTML = '<p class="text-parchment-400 italic p-2">Nenhuma atualização de campo registrada pelos detetives.</p>';
            } else {
                recentContainer.innerHTML = allNotes.slice(-4).reverse().map(n => `
                    <div class="bg-noir-900 p-2.5 rounded border-l-2 border-l-brass flex justify-between items-center">
                        <div>
                            <span class="font-mono text-brass font-bold mr-2">${n.protocol}</span>
                            <span class="text-parchment-200">${n.text}</span>
                        </div>
                        <span class="text-[10px] text-parchment-400 font-mono">${n.date}</span>
                    </div>
                `).join('');
            }
        }

        function renderAdminTable() {
            const statusFilter = document.getElementById('adminFilterStatus').value;
            const urgencyFilter = document.getElementById('adminFilterUrgency').value;
            const districtFilter = document.getElementById('adminFilterDistrict') ? document.getElementById('adminFilterDistrict').value : 'ALL';
            const searchQuery = document.getElementById('adminSearchInput').value.toLowerCase();

            const tbody = document.getElementById('adminTableBody');
            tbody.innerHTML = '';

            const filtered = reportsData.filter(r => {
                const matchStatus = (statusFilter === 'ALL' || r.status === statusFilter);
                const matchUrgency = (urgencyFilter === 'ALL' || r.urgency === urgencyFilter);
                const matchDistrict = (districtFilter === 'ALL' || r.district === districtFilter);
                const matchSearch = (
                    r.id.toLowerCase().includes(searchQuery) ||
                    r.category.toLowerCase().includes(searchQuery) ||
                    r.district.toLowerCase().includes(searchQuery) ||
                    r.description.toLowerCase().includes(searchQuery)
                );
                return matchStatus && matchUrgency && matchDistrict && matchSearch;
            });

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="p-6 text-center text-parchment-400 italic">
                            Nenhum dossier policial encontrado com os filtros aplicados.
                        </td>
                    </tr>
                `;
                return;
            }

            filtered.forEach(r => {
                let stampClass = 'stamp-pending';
                if (r.status === 'Em Investigação') stampClass = 'stamp-investigating';
                if (r.status === 'Resolvido') stampClass = 'stamp-resolved';
                if (r.status === 'Arquivado') stampClass = 'stamp-archived';

                const tr = document.createElement('tr');
                tr.className = "hover:bg-noir-800 transition-colors border-b border-noir-600";
                tr.innerHTML = `
                    <td class="p-3 font-mono font-bold text-brass">${r.id}</td>
                    <td class="p-3 text-parchment-400">${new Date(r.date).toLocaleDateString('pt-BR')}</td>
                    <td class="p-3 text-parchment-200">${r.category}</td>
                    <td class="p-3 text-brass">${r.district}</td>
                    <td class="p-3 font-bold ${r.urgency === 'Crítica' ? 'text-crimson' : 'text-parchment-300'}">${r.urgency}</td>
                    <td class="p-3 text-parchment-400 font-mono">${r.assignedDetective || 'Pendente'}</td>
                    <td class="p-3"><span class="stamp ${stampClass}">${r.status}</span></td>
                    <td class="p-3 text-right">
                        <button onclick="openDossierModal('${r.id}')" class="px-3 py-1.5 rounded text-xs font-heading uppercase btn-brass">
                            <i class="fa-solid fa-folder-open"></i> Dossiê
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openDossierModal(caseId) {
            const item = reportsData.find(r => r.id === caseId);
            if (!item) return;

            activeModalCaseId = caseId;

            document.getElementById('modalProtocolTitle').innerText = `DOSSIÊ #${item.id}`;
            document.getElementById('modalSubTitle').innerText = `Registrado em ${new Date(item.date).toLocaleString('pt-BR')}`;
            document.getElementById('modalCategory').innerText = item.category;
            document.getElementById('modalDistrict').innerText = item.district;
            document.getElementById('modalAddress').innerText = item.address || 'Não especificado';
            document.getElementById('modalUrgency').innerText = item.urgency;
            document.getElementById('modalDescription').innerText = item.description;

            // Exibir a imagem da evidência no modal, se existir
            if (item.evidence) {
                document.getElementById('modalEvidenceImage').src = item.evidence;
                document.getElementById('modalEvidenceContainer').classList.remove('hidden');
            } else {
                document.getElementById('modalEvidenceContainer').classList.add('hidden');
                document.getElementById('modalEvidenceImage').src = '';
            }

            // Preencher select de detetives com os agentes cadastrados
            const detSelect = document.getElementById('modalDetectiveSelect');
            detSelect.innerHTML = '<option value="Não atribuído">Não atribuído (Pendente)</option>' + 
                detectivesData.filter(d => d.active).map(d => `<option value="${d.name}">${d.rank} ${d.name}</option>`).join('');
            
            document.getElementById('modalDetectiveSelect').value = item.assignedDetective || 'Não atribuído';
            document.getElementById('modalStatusSelect').value = item.status;
            document.getElementById('modalUrgencySelect').value = item.urgency;
            document.getElementById('modalNoteText').value = '';

            // Render Stamp
            let stampClass = 'stamp-pending';
            if (item.status === 'Em Investigação') stampClass = 'stamp-investigating';
            if (item.status === 'Resolvido') stampClass = 'stamp-resolved';
            if (item.status === 'Arquivado') stampClass = 'stamp-archived';
            document.getElementById('modalStampContainer').innerHTML = `<span class="stamp ${stampClass}">${item.status}</span>`;

            // History notes
            renderModalNotesHistory(item.notes);

            document.getElementById('dossierModal').classList.remove('hidden');
        }

        function renderModalNotesHistory(notes) {
            const container = document.getElementById('modalNotesHistory');
            if (!notes || notes.length === 0) {
                container.innerHTML = '<p class="text-xs text-parchment-400 italic">Nenhum despacho anexado a este dossier.</p>';
                return;
            }

            container.innerHTML = notes.map(n => `
                <div class="bg-noir-900 p-2.5 rounded border-l-2 border-l-brass text-xs">
                    <div class="flex justify-between text-parchment-400 mb-1">
                        <span class="font-bold text-brass">${n.author}</span>
                        <span class="font-mono text-[10px]">${n.date}</span>
                    </div>
                    <p class="text-parchment-200">${n.text}</p>
                </div>
            `).join('');
        }

        function saveDossierChanges() {
            if (!activeModalCaseId) return;

            const item = reportsData.find(r => r.id === activeModalCaseId);
            if (!item) return;

            const newStatus = document.getElementById('modalStatusSelect').value;
            const newUrgency = document.getElementById('modalUrgencySelect').value;
            const newDetective = document.getElementById('modalDetectiveSelect').value;
            const noteText = document.getElementById('modalNoteText').value.trim();

            item.status = newStatus;
            item.urgency = newUrgency;
            item.assignedDetective = newDetective;

            if (noteText) {
                const now = new Date();
                const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
                item.notes.push({
                    author: newDetective !== 'Não atribuído' ? newDetective : 'Inspector Chief',
                    date: formattedDate,
                    text: noteText
                });
            }

            saveReportsToStorage();
            closeDossierModal();
            renderAdminTable();
            renderAdminDashboardView();
            showToast(`Dossiê ${activeModalCaseId} atualizado no prontuário.`);
        }

        function closeDossierModal() {
            document.getElementById('dossierModal').classList.add('hidden');
            activeModalCaseId = null;
        }

        function renderDetectivesTable() {
            const total = detectivesData.length;
            const activeCount = detectivesData.filter(d => d.active).length;
            const chiefsCount = detectivesData.filter(d => d.rank === 'Inspector Chief').length;

            document.getElementById('det-stat-total').innerText = total;
            document.getElementById('det-stat-active').innerText = activeCount;
            document.getElementById('det-stat-chiefs').innerText = chiefsCount;

            const tbody = document.getElementById('detectivesTableBody');
            tbody.innerHTML = '';

            detectivesData.forEach(det => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-noir-800 transition-colors border-b border-noir-600";
                tr.innerHTML = `
                    <td class="p-3 font-mono font-bold text-brass">${det.badge}</td>
                    <td class="p-3 text-parchment-100 font-bold">${det.name}</td>
                    <td class="p-3 text-parchment-300">${det.rank}</td>
                    <td class="p-3 text-brass">${det.district}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${det.active ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30' : 'border-gray-500 text-gray-400'}">
                            ${det.active ? 'Em Atividade' : 'Em Licença / Inativo'}
                        </span>
                    </td>
                    <td class="p-3 text-right">
                        <button onclick="toggleDetectiveStatus('${det.id}')" class="px-3 py-1 rounded text-[10px] font-bold uppercase border border-noir-500 hover:border-brass text-parchment-300">
                            ${det.active ? 'Dar Licença' : 'Reativar'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openAddDetectiveModal() {
            document.getElementById('detectiveModal').classList.remove('hidden');
        }

        function closeDetectiveModal() {
            document.getElementById('detectiveModal').classList.add('hidden');
        }

        function handleSaveDetective(e) {
            e.preventDefault();
            const newDet = {
                id: 'DET-' + Date.now(),
                name: document.getElementById('detName').value.trim(),
                badge: document.getElementById('detBadge').value.trim(),
                rank: document.getElementById('detRank').value,
                district: document.getElementById('detDistrict').value,
                active: true
            };

            detectivesData.push(newDet);
            saveDetectivesToStorage();
            renderDetectivesTable();
            closeDetectiveModal();
            showToast(`Novo oficial ${newDet.name} cadastrado no corpo policial.`);
        }

        function toggleDetectiveStatus(detId) {
            const det = detectivesData.find(d => d.id === detId);
            if (det) {
                det.active = !det.active;
                saveDetectivesToStorage();
                renderDetectivesTable();
                showToast(`Status do oficial ${det.name} alterado.`);
            }
        }

        function showToast(msg) {
            const toast = document.getElementById('toastNotification');
            document.getElementById('toastMessage').innerText = msg;
            toast.classList.remove('translate-y-20', 'opacity-0');
            
            setTimeout(() => {
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3500);
        }

        let isAudioPlaying = false;
        let noirRain, noirBass, noirPiano, noirLead, bassLoop, pianoLoop, leadLoop, rainFilter;

        // Sintetizador para Efeito Sonoro de Página Sendo Virada (Papel)
        function playPageTurnSound() {
            try {
                if (Tone.context.state !== 'running') {
                    Tone.start();
                }
                
                const noise = new Tone.Noise("pink");
                const filter = new Tone.Filter({
                    type: "bandpass",
                    frequency: 1100,
                    Q: 2
                }).toDestination();

                const env = new Tone.AmplitudeEnvelope({
                    attack: 0.02,
                    decay: 0.16,
                    sustain: 0.02,
                    release: 0.08
                }).connect(filter);

                noise.connect(env);

                // Varredura de frequência para simular o atrito do papel
                filter.frequency.setValueAtTime(600, Tone.now());
                filter.frequency.exponentialRampToValueAtTime(2600, Tone.now() + 0.08);
                filter.frequency.exponentialRampToValueAtTime(450, Tone.now() + 0.22);

                noise.start();
                env.triggerAttackRelease(0.22);

                setTimeout(() => {
                    noise.stop();
                    noise.dispose();
                    filter.dispose();
                    env.dispose();
                }, 300);
            } catch (err) {
                console.log("Aguardando permissão de áudio do usuário.");
            }
        }

        async function initAutoVitrola() {
            const startJazz = async () => {
                try {
                    await Tone.start();
                    if (!isAudioPlaying) {
                        startJazzEnsemble();
                    }
                    document.removeEventListener('click', startJazz);
                    document.removeEventListener('keydown', startJazz);
                } catch (e) {
                    console.log("Autoplay bloqueado pelo navegador, aguardando clique.");
                }
            };

            // Tenta ativar diretamente
            try {
                await Tone.start();
                if (Tone.context.state === 'running') {
                    startJazzEnsemble();
                    return;
                }
            } catch (e) {}

            // Caso o navegador exija interação prévia, ativa na primeira ação do usuário na página
            document.addEventListener('click', startJazz, { once: true });
            document.addEventListener('keydown', startJazz, { once: true });
        }

        async function toggleNoirAudio() {
            if (!isAudioPlaying) {
                await Tone.start();
                startJazzEnsemble();
            } else {
                stopJazzEnsemble();
            }
        }

        function startJazzEnsemble() {
            const icon = document.getElementById('audio-icon');
            const btn = document.getElementById('nav-audio');

            if (noirBass) {
                Tone.Transport.start();
                if (noirRain) noirRain.start();
            } else {
                setupNoirJazzAudio();
                Tone.Transport.start();
            }

            isAudioPlaying = true;
            if (icon) {
                icon.classList.add('fa-spin');
                icon.classList.replace('fa-record-vinyl', 'fa-music');
            }
            if (btn) {
                btn.classList.add('text-brass');
                btn.classList.remove('text-parchment-300');
            }
            showToast("Vitrola ligada. Sintonia ativa.");
        }

        function stopJazzEnsemble() {
            const icon = document.getElementById('audio-icon');
            const btn = document.getElementById('nav-audio');

            Tone.Transport.stop();
            if (noirRain) noirRain.stop();

            isAudioPlaying = false;
            if (icon) {
                icon.classList.remove('fa-spin');
                icon.classList.replace('fa-music', 'fa-record-vinyl');
            }
            if (btn) {
                btn.classList.remove('text-brass');
                btn.classList.add('text-parchment-300');
            }
            showToast("Vitrola desligada. Silêncio no gabinete.");
        }

        function setupNoirJazzAudio() {
            // Tempo Lento de Jazz Swing (68 BPM)
            Tone.Transport.bpm.value = 68;

            // 1. Vinil / Ruído de Fundo Estético
            rainFilter = new Tone.Filter(320, "lowpass").toDestination();
            noirRain = new Tone.Noise("pink").connect(rainFilter);
            noirRain.volume.value = -20;
            noirRain.start();

            // 2. Baixo Acústico Walking Bass (Grave Suave e Aveludado)
            noirBass = new Tone.FMSynth({
                harmonicity: 1,
                modulationIndex: 1.2,
                oscillator: { type: "triangle" },
                envelope: { attack: 0.04, decay: 1.8, sustain: 0.3, release: 0.8 }
            }).toDestination();
            noirBass.volume.value = -4;

            // Linha de Baixo Walking Jazz em Ré Menor / Blues
            const bassLine = ["D2", "F2", "G2", "G#2", "A2", "C3", "A2", "F2", "D2", "F2", "A2", "D3", "C3", "A2", "G2", "F2"];
            let bassIdx = 0;
            
            bassLoop = new Tone.Loop(time => {
                noirBass.triggerAttackRelease(bassLine[bassIdx % bassLine.length], "4n", time);
                bassIdx++;
            }, "4n").start(0);

            // 3. Piano de Jazz com Acordes Aveludados (7ths e 9ths)
            noirPiano = new Tone.PolySynth(Tone.Synth).toDestination();
            noirPiano.volume.value = -16;
            noirPiano.set({
                oscillator: { type: "sine" },
                envelope: { attack: 0.08, decay: 2, sustain: 0.2, release: 1.5 }
            });

            // Progressão Clássica de Jazz Noir (Dm9, G13, Cmaj9, Fmaj7, E7b9)
            const jazzChords = [
                ["D3", "F3", "A3", "C4", "E4"],  // Dm9
                ["G2", "F3", "A3", "B3", "E4"],  // G13
                ["C3", "E3", "G3", "B3", "D4"],  // Cmaj9
                ["F2", "A3", "C4", "E4"],        // Fmaj7
                ["E2", "G#3", "B3", "D4", "F4"]  // E7b9
            ];
            
            let chordIdx = 0;
            pianoLoop = new Tone.Loop(time => {
                if (Math.random() > 0.2) {
                    noirPiano.triggerAttackRelease(jazzChords[chordIdx % jazzChords.length], "2n", time);
                    chordIdx++;
                }
            }, "2m").start(0);

            // 4. Solo Suave Sopro/Sax/Trompete Mute
            noirLead = new Tone.MonoSynth({
                oscillator: { type: "triangle" },
                envelope: { attack: 0.2, decay: 0.8, sustain: 0.4, release: 1 },
                filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.5, baseFrequency: 300, octaves: 3 }
            }).toDestination();
            noirLead.volume.value = -18;

            const leadNotes = ["D4", "F4", "G4", "G#4", "A4", "C5", "D5", "F5"];
            leadLoop = new Tone.Loop(time => {
                if (Math.random() > 0.5) {
                    const note = leadNotes[Math.floor(Math.random() * leadNotes.length)];
                    noirLead.triggerAttackRelease(note, "2n", time);
                }
            }, "1m").start("1m");
        }
