document.addEventListener("DOMContentLoaded", () => {

    const DEMANDAS_KEY = "sigdHDemandas";
    const HISTORY_KEY = "sigdHImportHistory";
    const THEME_KEY = "sigdHTheme";
    const SESSION_KEY = "sigdHSession";

    let demandas = [];
    let charts = {};

    localStorage.removeItem(DEMANDAS_KEY);
    localStorage.removeItem(HISTORY_KEY);

    demandas = [];

    const session = sessionStorage.getItem(SESSION_KEY);

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    let usuario;

    try {
        usuario = JSON.parse(session);
    } catch (error) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = "index.html";
        return;
    }

    

    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarUserName = document.getElementById("sidebarUserName");
    const sidebarUserRole = document.getElementById("sidebarUserRole");
    const topbarAvatar = document.getElementById("topbarAvatar");
    const topbarUserName = document.getElementById("topbarUserName");
    const topbarUserRole = document.getElementById("topbarUserRole");
    const welcomeUser = document.getElementById("welcomeUser");
    const nomeUsuario = usuario.name || usuario.username || "Usuário";
    const cargoUsuario = usuario.role || "Usuário";

    const iniciais =
        usuario.initials ||
        nomeUsuario
            .split(" ")
            .map(nome => nome.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    if (sidebarAvatar) {
        sidebarAvatar.textContent = iniciais;
    }

    if (sidebarUserName) {
        sidebarUserName.textContent = nomeUsuario;
    }

    if (sidebarUserRole) {
        sidebarUserRole.textContent = cargoUsuario;
    }

    if (topbarAvatar) {
        topbarAvatar.textContent = iniciais;
    }

    if (topbarUserName) {
        topbarUserName.textContent = nomeUsuario;
    }

    if (topbarUserRole) {
        topbarUserRole.textContent = cargoUsuario;
    }

    if (welcomeUser) {
        welcomeUser.textContent = nomeUsuario;
    }

    const menuItems = document.querySelectorAll("[data-section]");
    const sections = document.querySelectorAll(".content-section");
    const pageTitle = document.getElementById("pageTitle");

    menuItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const sectionName = item.dataset.section;

            showSection(sectionName);

            document
                .querySelector(".sidebar")
                ?.classList.remove("open");

            document
                .querySelector(".mobile-overlay")
                ?.classList.remove("active");

        });

    });

    function showSection(sectionName) {

        sections.forEach(section => {
            section.classList.remove("active");
        });

        const target = document.getElementById(sectionName);

        if (target) {
            target.classList.add("active");
        }

        menuItems.forEach(item => {

            item.classList.remove("active");

            if (item.dataset.section === sectionName) {
                item.classList.add("active");
            }

        });

        const titles = {
            dashboard: "Dashboard",
            demandas: "Demandas",
            importar: "Importar Excel",
            indicadores: "Indicadores",
            ranking: "Ranking",
            exportacao: "Exportação",
            historico: "Histórico",
            configuracoes: "Configurações"
        };

        if (pageTitle) {
            pageTitle.textContent =
                titles[sectionName] || "SIGDH";
        }

    }

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const sidebar =
        document.querySelector(".sidebar");

    const mobileOverlay =
        document.querySelector(".mobile-overlay");

    mobileMenuButton?.addEventListener("click", () => {

        sidebar?.classList.toggle("open");

        mobileOverlay?.classList.toggle("active");

    });

    mobileOverlay?.addEventListener("click", () => {

        sidebar?.classList.remove("open");

        mobileOverlay.classList.remove("active");

    });

    const logoutButton =
        document.getElementById("logoutButton");

    logoutButton?.addEventListener("click", () => {

        sessionStorage.removeItem(SESSION_KEY);

        window.location.href = "index.html";

    });
    const themeButton =
        document.getElementById("themeButton");

    const settingsThemeButton =
        document.getElementById("settingsThemeButton");

    function applyTheme() {

        const theme =
            localStorage.getItem(THEME_KEY) || "light";

        document.body.classList.toggle(
            "dark-mode",
            theme === "dark"
        );

        updateThemeButtons();

    }

    function updateThemeButtons() {

        const dark =
            document.body.classList.contains("dark-mode");

        [
            themeButton,
            settingsThemeButton
        ].forEach(button => {

            if (!button) return;

            const icon =
                button.querySelector("i");

            if (icon) {

                icon.className = dark
                    ? "fa-solid fa-sun"
                    : "fa-solid fa-moon";

            }

        });

    }

    function toggleTheme() {

        const dark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            THEME_KEY,
            dark ? "light" : "dark"
        );

        applyTheme();

    }

    themeButton?.addEventListener(
        "click",
        toggleTheme
    );

    settingsThemeButton?.addEventListener(
        "click",
        toggleTheme
    );

    applyTheme();

    const totalDemandas =
        document.getElementById("totalDemandas");

    const demandasProcessadas =
        document.getElementById("demandasProcessadas");

    const demandasCriticas =
        document.getElementById("demandasCriticas");

    const confiancaMedia =
        document.getElementById("confiancaMedia");


    function normalize(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toUpperCase();

    }

    function findColumn(row, names) {

        const keys =
            Object.keys(row);

        for (const name of names) {

            const normalizedName =
                normalize(name);

            const found =
                keys.find(key =>
                    normalize(key) === normalizedName
                );

            if (found) {
                return found;
            }

        }

        return null;

    }

    function getValue(row, names) {

        const column =
            findColumn(row, names);

        return column
            ? row[column]
            : "";

    }

    function classifyDemand(row) {

        const classification =
            getValue(row, [
                "CLASSIFICACAO",
                "CLASSIFICAÇÃO",
                "OFENSOR",
                "CATEGORIA",
                "TIPO"
            ]);

        if (classification) {

            const value =
                normalize(classification);

            if (value.includes("MATERIAL")) {

                return {
                    classification: "MATERIAL",
                    confidence: 95,
                    source: "coluna"
                };

            }

            if (value.includes("MEDICAMENTO")) {

                return {
                    classification: "MEDICAMENTO",
                    confidence: 95,
                    source: "coluna"
                };

            }

            if (
                value.includes("LOGISTICA") ||
                value.includes("LOGÍSTICA")
            ) {

                return {
                    classification: "LOGISTICA",
                    confidence: 95,
                    source: "coluna"
                };

            }

            if (value.includes("COMPRA")) {

                return {
                    classification: "COMPRA",
                    confidence: 95,
                    source: "coluna"
                };

            }

            if (value.includes("OPME")) {

                return {
                    classification: "OPME",
                    confidence: 95,
                    source: "coluna"
                };

            }

        }

        const texto =
            normalize(
                Object.values(row).join(" ")
            );

        const regras = [

            {
                nome: "MEDICAMENTO",
                palavras: [
                    "MEDICAMENTO",
                    "REMEDIO",
                    "REMÉDIO",
                    "FARMACO",
                    "FÁRMACO",
                    "DOSE",
                    "PRESCRICAO",
                    "PRESCRIÇÃO"
                ]
            },

            {
                nome: "MATERIAL",
                palavras: [
                    "MATERIAL",
                    "INSUMO",
                    "DESCARTAVEL",
                    "DESCARTÁVEL",
                    "EQUIPAMENTO"
                ]
            },

            {
                nome: "LOGISTICA",
                palavras: [
                    "LOGISTICA",
                    "LOGÍSTICA",
                    "ENTREGA",
                    "TRANSPORTE",
                    "PRAZO",
                    "ATRASO"
                ]
            },

            {
                nome: "COMPRA",
                palavras: [
                    "COMPRA",
                    "COMPRAS",
                    "AQUISICAO",
                    "AQUISIÇÃO",
                    "FORNECEDOR",
                    "PEDIDO"
                ]
            },

            {
                nome: "OPME",
                palavras: [
                    "OPME",
                    "PROTESE",
                    "PRÓTESE",
                    "ORTESE",
                    "ÓRTESE",
                    "IMPLANTE"
                ]
            }

        ];

        for (const regra of regras) {

            for (const palavra of regra.palavras) {

                if (
                    texto.includes(
                        normalize(palavra)
                    )
                ) {

                    return {
                        classification: regra.nome,
                        confidence: 80,
                        source: "analise"
                    };

                }

            }

        }

        return {
            classification: "OUTROS",
            confidence: 35,
            source: "nao identificado"
        };

    }

    function classifyPriority(row) {

        const priority =
            getValue(row, [
                "PRIORIDADE",
                "PRIORITY",
                "NIVEL",
                "NÍVEL"
            ]);

        if (priority) {

            const value =
                normalize(priority);

            if (
                value.includes("ALTA") ||
                value.includes("URGENTE") ||
                value.includes("CRITICA") ||
                value.includes("CRÍTICA")
            ) {

                return "ALTA";

            }

            if (value.includes("BAIXA")) {
                return "BAIXA";
            }

            if (
                value.includes("MEDIA") ||
                value.includes("MÉDIA")
            ) {

                return "MEDIA";

            }

        }

        const texto =
            normalize(
                Object.values(row).join(" ")
            );

        if (
            texto.includes("URGENTE") ||
            texto.includes("CRITICO") ||
            texto.includes("CRÍTICO") ||
            texto.includes("EMERGENCIA") ||
            texto.includes("EMERGÊNCIA")
        ) {

            return "ALTA";

        }

        return "MEDIA";

    }

    function processRow(row, index) {

        const classification =
            classifyDemand(row);

        return {

            id: index + 1,

            protocolo:
                getValue(row, [
                    "PROTOCOLO",
                    "Nº PROTOCOLO",
                    "NUMERO PROTOCOLO",
                    "NÚMERO PROTOCOLO"
                ]) ||
                `DEMANDA-${index + 1}`,

            registro:
                getValue(row, [
                    "N° REGISTRO",
                    "Nº REGISTRO",
                    "NUMERO REGISTRO",
                    "REGISTRO"
                ]),

            beneficiario:
                getValue(row, [
                    "BENEFICIARIO",
                    "BENEFICIÁRIO"
                ]),

            operador:
                getValue(row, [
                    "OPERADORA",
                    "OPERADOR"
                ]),

            prestador:
                getValue(row, [
                    "NM_PESSOA_PRESTADOR",
                    "NOME PRESTADOR",
                    "PRESTADOR"
                ]),

            texto:
                getValue(row, [
                    "TEXTO RECLAMAÇÃO",
                    "TEXTO RECLAMACAO",
                    "RECLAMACAO",
                    "RECLAMAÇÃO",
                    "DESCRICAO",
                    "DESCRIÇÃO"
                ]),

            classification:
                classification.classification,

            priority:
                classifyPriority(row),

            confidence:
                classification.confidence,

            confidenceSource:
                classification.source,

            importedAt:
                new Date().toLocaleDateString("pt-BR")

        };

    }

    function processWorkbook(workbook) {

        const firstSheet =
            workbook.SheetNames[0];

        if (!firstSheet) {

            throw new Error(
                "Nenhuma planilha encontrada."
            );

        }

        const worksheet =
            workbook.Sheets[firstSheet];

        const rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {
                    defval: ""
                }
            );

        if (!rows.length) {

            throw new Error(
                "A planilha está vazia."
            );

        }

        return rows.map(processRow);

    }

    const excelFile =
        document.getElementById("excelFile");

    const excelFilePage =
        document.getElementById("excelFilePage");

    const uploadArea =
        document.getElementById("uploadArea");

    const uploadAreaPage =
        document.getElementById("uploadAreaPage");

    const selectedFile =
        document.getElementById("selectedFile");

    const selectedFilePage =
        document.getElementById("selectedFilePage");

    function handleFile(file) {

        if (!file) return;

        const validExtensions = [
            ".xlsx",
            ".xls",
            ".csv"
        ];

        const valid =
            validExtensions.some(
                extension =>
                    file.name
                        .toLowerCase()
                        .endsWith(extension)
            );

        if (!valid) {

            alert(
                "Selecione um arquivo Excel válido."
            );

            return;

        }

        if (selectedFile) {
            selectedFile.textContent =
                file.name;
        }

        if (selectedFilePage) {
            selectedFilePage.textContent =
                file.name;
        }

        const reader =
            new FileReader();

        reader.onload = event => {

            try {

                const data =
                    new Uint8Array(
                        event.target.result
                    );

                const workbook =
                    XLSX.read(
                        data,
                        {
                            type: "array"
                        }
                    );

                const novasDemandas =
                    processWorkbook(workbook);

                demandas =
                    novasDemandas;

                localStorage.setItem(
                    DEMANDAS_KEY,
                    JSON.stringify(demandas)
                );

                saveHistory(
                    file.name,
                    demandas.length
                );

                updateDashboard();

                alert(
                    `Excel importado com sucesso!\n\n` +
                    `${demandas.length} demandas analisadas.`
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Não foi possível processar a planilha.\n\n" +
                    error.message
                );

            }

        };

        reader.readAsArrayBuffer(file);

    }

    excelFile?.addEventListener(
        "change",
        event => {
            handleFile(event.target.files[0]);
        }
    );

    excelFilePage?.addEventListener(
        "change",
        event => {
            handleFile(event.target.files[0]);
        }
    );

    
    function setupDropZone(area, input) {

        if (!area || !input) return;

        area.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                area.classList.add(
                    "dragging"
                );

            }
        );

        area.addEventListener(
            "dragleave",
            () => {

                area.classList.remove(
                    "dragging"
                );

            }
        );

        area.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                area.classList.remove(
                    "dragging"
                );

                const file =
                    event.dataTransfer.files[0];

                handleFile(file);

            }
        );

        area.addEventListener(
            "click",
            () => {
                input.click();
            }
        );

    }

    setupDropZone(
        uploadArea,
        excelFile
    );

    setupDropZone(
        uploadAreaPage,
        excelFilePage
    );

    function saveHistory(fileName, total) {

        const history =
            JSON.parse(
                localStorage.getItem(
                    HISTORY_KEY
                ) || "[]"
            );

        history.unshift({

            file: fileName,

            total: total,

            date:
                new Date().toLocaleString(
                    "pt-BR"
                )

        });

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );

        renderHistory();

    }

    function renderHistory() {

        const table =
            document.getElementById(
                "historyTable"
            );

        if (!table) return;

        const history =
            JSON.parse(
                localStorage.getItem(
                    HISTORY_KEY
                ) || "[]"
            );

        if (!history.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="3">
                        Nenhuma importação realizada.
                    </td>
                </tr>
            `;

            return;

        }

        table.innerHTML =
            history.map(item => `
                <tr>
                    <td>
                        ${escapeHTML(item.file)}
                    </td>

                    <td>
                        ${item.total}
                    </td>

                    <td>
                        ${item.date}
                    </td>
                </tr>
            `).join("");

    }

    function updateDashboard() {

        const total =
            demandas.length;

        const processadas =
            demandas.length;

        const criticas =
            demandas.filter(
                item =>
                    item.priority === "ALTA"
            ).length;

        const confidence =
            total
                ? Math.round(
                    demandas.reduce(
                        (sum, item) =>
                            sum +
                            item.confidence,
                        0
                    ) / total
                )
                : 0;

        if (totalDemandas) {
            totalDemandas.textContent =
                total;
        }

        if (demandasProcessadas) {
            demandasProcessadas.textContent =
                processadas;
        }

        if (demandasCriticas) {
            demandasCriticas.textContent =
                criticas;
        }

        if (confiancaMedia) {
            confiancaMedia.textContent =
                `${confidence}%`;
        }

        updateSummary();

        renderDashboardTable();

        renderDemandasTable();

        updateIndicators();

        createCharts();

        renderHistory();

    }

    function updateSummary() {

        const classifications = [
            "MATERIAL",
            "MEDICAMENTO",
            "LOGISTICA",
            "COMPRA",
            "OPME"
        ];

        classifications.forEach(
            classification => {

                const total =
                    demandas.filter(
                        item =>
                            item.classification ===
                            classification
                    ).length;

                const key =
                    classification.toLowerCase();

                const countElement =
                    document.getElementById(
                        `${key}Count`
                    );

                const barElement =
                    document.getElementById(
                        `${key}Bar`
                    );

                if (countElement) {

                    countElement.textContent =
                        total;

                }

                if (barElement) {

                    const percentage =
                        demandas.length
                            ? (
                                total /
                                demandas.length
                            ) * 100
                            : 0;

                    barElement.style.width =
                        `${percentage}%`;

                }

            }
        );

    }

    function renderDashboardTable() {

        const table =
            document.getElementById(
                "dashboardTable"
            );

        if (!table) return;

        if (!demandas.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-table">

                        <i class="fa-solid fa-file-excel"></i>

                        <strong>
                            Nenhuma demanda encontrada
                        </strong>

                        <span>
                            Importe uma planilha Excel para começar.
                        </span>

                    </td>
                </tr>
            `;

            return;

        }

        table.innerHTML =
            demandas
                .slice(0, 10)
                .map(item => `
                    <tr>

                        <td>
                            ${escapeHTML(
                                item.protocolo
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.beneficiario ||
                                "-"
                            )}
                        </td>

                        <td>
                            <span class="badge">
                                ${item.classification}
                            </span>
                        </td>

                        <td>
                            <span class="priority ${item.priority.toLowerCase()}">
                                ${item.priority}
                            </span>
                        </td>

                        <td>
                            ${item.confidence}%
                        </td>

                        <td>
                            ${escapeHTML(
                                item.operador ||
                                "-"
                            )}
                        </td>

                    </tr>
                `)
                .join("");

    }

    const filterSearch =
        document.getElementById(
            "filterSearch"
        );

    const filterClassification =
        document.getElementById(
            "filterClassification"
        );

    const filterPriority =
        document.getElementById(
            "filterPriority"
        );

    const filterOperator =
        document.getElementById(
            "filterOperator"
        );

    const clearFiltersButton =
        document.getElementById(
            "clearFiltersButton"
        );

    function getFilteredDemandas() {

        const search =
            normalize(
                filterSearch?.value || ""
            );

        const classification =
            normalize(
                filterClassification?.value || ""
            );

        const priority =
            normalize(
                filterPriority?.value || ""
            );

        const operator =
            normalize(
                filterOperator?.value || ""
            );

        return demandas.filter(item => {

            const matchesSearch =
                !search ||
                normalize(
                    item.protocolo
                ).includes(search) ||
                normalize(
                    item.beneficiario
                ).includes(search) ||
                normalize(
                    item.registro
                ).includes(search);

            const matchesClassification =
                !classification ||
                normalize(
                    item.classification
                ) === classification;

            const matchesPriority =
                !priority ||
                normalize(
                    item.priority
                ) === priority;

            const matchesOperator =
                !operator ||
                normalize(
                    item.operador
                ) === operator;

            return (
                matchesSearch &&
                matchesClassification &&
                matchesPriority &&
                matchesOperator
            );

        });

    }

    function renderDemandasTable() {

        const table =
            document.getElementById(
                "demandasTable"
            );

        if (!table) return;

        const filtered =
            getFilteredDemandas();

        const filteredCount =
            document.getElementById(
                "filteredCount"
            );

        if (filteredCount) {

            filteredCount.textContent =
                `${filtered.length} demanda(s)`;

        }

        if (!filtered.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-table">

                        <i class="fa-solid fa-magnifying-glass"></i>

                        <strong>
                            Nenhuma demanda encontrada
                        </strong>

                        <span>
                            Importe uma planilha ou altere os filtros.
                        </span>

                    </td>
                </tr>
            `;

            return;

        }

        table.innerHTML =
            filtered
                .map(item => `
                    <tr>

                        <td>
                            ${escapeHTML(
                                item.protocolo
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.beneficiario ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                item.operador ||
                                "-"
                            )}
                        </td>

                        <td>
                            <span class="badge">
                                ${item.classification}
                            </span>
                        </td>

                        <td>
                            <span class="priority ${item.priority.toLowerCase()}">
                                ${item.priority}
                            </span>
                        </td>

                        <td>
                            ${item.confidence}%
                        </td>

                        <td>
                            ${escapeHTML(
                                item.texto ||
                                "-"
                            )}
                        </td>

                    </tr>
                `)
                .join("");

        updateOperatorFilter();

    }

    function updateOperatorFilter() {

        if (!filterOperator) return;

        const current =
            filterOperator.value;

        const operators =
            [
                ...new Set(
                    demandas
                        .map(
                            item =>
                                item.operador
                        )
                        .filter(Boolean)
                )
            ].sort();

        filterOperator.innerHTML =
            `<option value="">
                Todas as operadoras
            </option>`;

        operators.forEach(operator => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                operator;

            option.textContent =
                operator;

            filterOperator.appendChild(
                option
            );

        });

        filterOperator.value =
            current;

    }

    [
        filterSearch,
        filterClassification,
        filterPriority,
        filterOperator
    ].forEach(input => {

        input?.addEventListener(
            "input",
            renderDemandasTable
        );

        input?.addEventListener(
            "change",
            renderDemandasTable
        );

    });

    clearFiltersButton?.addEventListener(
        "click",
        () => {

            if (filterSearch)
                filterSearch.value = "";

            if (filterClassification)
                filterClassification.value = "";

            if (filterPriority)
                filterPriority.value = "";

            if (filterOperator)
                filterOperator.value = "";

            renderDemandasTable();

        }
    );

    function updateIndicators() {

        const indicatorTotal =
            document.getElementById(
                "indicatorTotal"
            );

        const indicatorAlta =
            document.getElementById(
                "indicatorAlta"
            );

        const indicatorPrincipal =
            document.getElementById(
                "indicatorPrincipal"
            );

        if (indicatorTotal) {

            indicatorTotal.textContent =
                demandas.length;

        }

        if (indicatorAlta) {

            indicatorAlta.textContent =
                demandas.filter(
                    item =>
                        item.priority === "ALTA"
                ).length;

        }

        if (indicatorPrincipal) {

            const count = {};

            demandas.forEach(item => {

                count[item.classification] =
                    (
                        count[item.classification] ||
                        0
                    ) + 1;

            });

            let principal = "-";
            let maior = 0;

            Object.entries(count)
                .forEach(
                    ([classification, total]) => {

                        if (total > maior) {

                            maior = total;

                            principal =
                                classification;

                        }

                    }
                );

            indicatorPrincipal.textContent =
                principal;

        }

    }

    function destroyChart(name) {

        if (charts[name]) {

            charts[name].destroy();

            charts[name] = null;

        }

    }

    function createCharts() {

        createClassificationChart();

        createPriorityChart();

        createEvolutionChart();

        createIndicatorChart();

        createRankingChart();

    }

    function createClassificationChart() {

        const canvas =
            document.getElementById(
                "classificationChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        destroyChart("classification");

        const labels = [
            "MATERIAL",
            "MEDICAMENTO",
            "LOGISTICA",
            "COMPRA",
            "OPME"
        ];

        const values =
            labels.map(label =>
                demandas.filter(
                    item =>
                        item.classification ===
                        label
                ).length
            );

        charts.classification =
            new Chart(
                canvas,
                {
                    type: "doughnut",

                    data: {
                        labels,

                        datasets: [{
                            data: values
                        }]
                    },

                    options: {
                        responsive: true,

                        plugins: {
                            legend: {
                                position: "bottom"
                            }
                        }
                    }
                }
            );

    }

    function createPriorityChart() {

        const canvas =
            document.getElementById(
                "priorityChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        destroyChart("priority");

        const labels = [
            "ALTA",
            "MEDIA",
            "BAIXA"
        ];

        const values =
            labels.map(label =>
                demandas.filter(
                    item =>
                        item.priority ===
                        label
                ).length
            );

        charts.priority =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {
                        labels,

                        datasets: [{
                            label: "Demandas",
                            data: values
                        }]
                    },

                    options: {
                        responsive: true,

                        scales: {
                            y: {
                                beginAtZero: true,

                                ticks: {
                                    precision: 0
                                }
                            }
                        }
                    }
                }
            );

    }

    function createEvolutionChart() {

        const canvas =
            document.getElementById(
                "evolutionChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        destroyChart("evolution");

        const dates = {};

        demandas.forEach(item => {

            dates[item.importedAt] =
                (
                    dates[item.importedAt] ||
                    0
                ) + 1;

        });

        const labels =
            Object.keys(dates);

        const values =
            Object.values(dates);

        charts.evolution =
            new Chart(
                canvas,
                {
                    type: "line",

                    data: {
                        labels,

                        datasets: [{

                            label: "Demandas",

                            data: values,

                            tension: 0.3,

                            fill: true

                        }]
                    },

                    options: {
                        responsive: true
                    }
                }
            );

    }

    function createIndicatorChart() {

        const canvas =
            document.getElementById(
                "indicatorChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        destroyChart("indicator");

        const labels = [
            "MATERIAL",
            "MEDICAMENTO",
            "LOGISTICA",
            "COMPRA",
            "OPME"
        ];

        const values =
            labels.map(label =>
                demandas.filter(
                    item =>
                        item.classification ===
                        label
                ).length
            );

        charts.indicator =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels,

                        datasets: [{

                            label: "Quantidade",

                            data: values

                        }]

                    },

                    options: {

                        responsive: true,

                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {
                                    precision: 0
                                }

                            }

                        }

                    }

                }
            );

    }

    function createRankingChart() {

        const canvas =
            document.getElementById(
                "rankingChart"
            );

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }

        destroyChart("ranking");

        const ranking = {};

        demandas.forEach(item => {

            const operador =
                item.operador ||
                "Não informado";

            ranking[operador] =
                (
                    ranking[operador] ||
                    0
                ) + 1;

        });

        const sorted =
            Object.entries(ranking)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 10);

        charts.ranking =
            new Chart(
                canvas,
                {
                    type: "bar",

                    data: {

                        labels:
                            sorted.map(
                                item => item[0]
                            ),

                        datasets: [{

                            label: "Demandas",

                            data:
                                sorted.map(
                                    item => item[1]
                                )

                        }]

                    },

                    options: {

                        indexAxis: "y",

                        responsive: true

                    }

                }
            );

    }

    const exportExcelButton =
        document.getElementById(
            "exportExcelButton"
        );

    exportExcelButton?.addEventListener(
        "click",
        () => {

            if (!demandas.length) {

                alert(
                    "Não existem demandas para exportar."
                );

                return;

            }

            const data =
                demandas.map(item => ({

                    Protocolo:
                        item.protocolo,

                    Registro:
                        item.registro,

                    Beneficiário:
                        item.beneficiario,

                    Operadora:
                        item.operador,

                    Prestador:
                        item.prestador,

                    "Texto da Reclamação":
                        item.texto,

                    Classificação:
                        item.classification,

                    Prioridade:
                        item.priority,

                    Confiança:
                        `${item.confidence}%`

                }));

            const worksheet =
                XLSX.utils.json_to_sheet(
                    data
                );

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Demandas"
            );

            XLSX.writeFile(
                workbook,
                "SIGDH_demandas.xlsx"
            );

        }
    );

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

    updateDashboard();

    showSection("dashboard");

    console.log(
        "SIGDH carregado com sucesso."
    );

});
