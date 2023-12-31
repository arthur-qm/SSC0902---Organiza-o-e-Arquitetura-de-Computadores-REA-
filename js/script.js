const comandos_validos = {
    // lw tem dois argumentos. o primeiro e um registrador (1) que sera escrito (2)
    // e o segundo da forma imediato(reg) (2) que sera lido
    'lw': [[1, 2], [2, 3, [1, 1]]],
    // sw tem dois argumentos. o primeiro e um registrador (1) que sera lido (1)
    // e o segundo e da forma imediato(reg) (2) em que esse registrador sera lido (1) e o imediato e
    // representado pelo 3
    'sw': [[1, 1], [2, 3, [1, 1]]],
    // add tem tres argumentos. o primeiro e um registrador (1) no qual sera escrito (2)
    // o segundo e o terceiro sao registradores que serao lidos
    'add': [[1, 2], [1, 1], [1, 1]],
    // addi tem tres argumentos. o primeiro e um registrador (1) no qual sera escrito (2)
    // o segundo e um registrador que sera lido (1) e o terceiro e um imediato (3)
    'addi': [[1, 2], [1, 1], [3]],
    // reg escrita, reg leitura, reg leitura
    'mul': [[1, 2], [1, 1], [1, 1]],
    'sub': [[1, 2], [1, 1], [1, 1]],
    'mv': [[1, 2], [1, 1]],
    'show': [[1, 1]]
}

function checa_inteiro(string_suposto_inteiro) {
    if (string_suposto_inteiro === null || string_suposto_inteiro.length === 0) return null;
    let flag_neg = 0;
    if (string_suposto_inteiro[0] === '-') {
        string_suposto_inteiro = string_suposto_inteiro.slice(1);
        flag_neg = 1;
    }
    if (string_suposto_inteiro.length === 0) {
        return null;
    }

    for (let i = 0; i < string_suposto_inteiro.length; i++) {
        if (string_suposto_inteiro[i] > '9' || string_suposto_inteiro[i] < '0') {
            return null;
        }
    }
    return parseInt(string_suposto_inteiro) * (flag_neg == 1 ? -1 : 1);
}

function checa_reg(string_suposto_reg) {
    if (string_suposto_reg === null) return null;
    if (string_suposto_reg.length <= 1) return null;

    if (!string_suposto_reg.startsWith('x')) return null;

    let numero_reg_str = checa_inteiro(string_suposto_reg.slice(1));
    if (numero_reg_str == null || numero_reg_str < 0 || numero_reg_str > 31) return null;

    return [1, numero_reg_str];
}

function determina_tipo_argumento(argumento) {
    if (argumento === null) return null;
    if (argumento.length === 0) return null;

    let checagem_reg = checa_reg(argumento);

    if (checagem_reg !== null) {
        return checagem_reg;
    } else if (argumento.includes('(')) {
        if (!argumento.includes(')')) return null;
        let parte_numero = '';
        let i = 0;
        for (; argumento[i] != '('; i++) {
            parte_numero = parte_numero + argumento[i];
        }
        parte_numero = checa_inteiro(parte_numero);
        if (parte_numero == null) return null;

        let parte_reg = '';
        for (i++; argumento[i] != ')'; i++) {
            parte_reg = parte_reg + argumento[i];
        }
        if (i + 1 != argumento.length) return null;
        checagem_reg = checa_reg(parte_reg);

        if (checagem_reg == null) return null;

        return [2, parte_numero, checagem_reg]
    } else {
        argumento = checa_inteiro(argumento);
        if (argumento == null) return null;
        return [3, argumento];
    }
}

function ComandoAsm(linha_codigo) {
    this.nome_comando = "";
    this.args = [];

    linha_codigo = linha_codigo.trim();
    let linha_separada_por_espaco = linha_codigo.split(' ');

    if (linha_separada_por_espaco.length <= 1 ||
        !Object.keys(comandos_validos).includes(linha_separada_por_espaco[0])) {
        return;
    }

    let flag_termina_nome_comando = 0;
    let arg_atual = '';

    for (let i = 0; i < linha_codigo.length; i++) {
        if (flag_termina_nome_comando === 0 && linha_codigo[i] === ' ') {
            flag_termina_nome_comando = 1;
        }
        if (flag_termina_nome_comando == 1) {
            if (linha_codigo[i].match(/^[0-9a-z()-]+$/)) {
                arg_atual = arg_atual + linha_codigo[i];
            } else if (arg_atual.length > 0) {
                this.args.push(arg_atual);
                arg_atual = '';
            }
        }
    }

    if (arg_atual.length > 0) {
        this.args.push(arg_atual);
    }

    for (let i = 0; i < this.args.length; i++) {
        this.args[i] = determina_tipo_argumento(this.args[i]);
        if (this.args[i] == null) {
            this.args = [];
            return;
        }
    }

    let argumentos_aceitos = comandos_validos[linha_separada_por_espaco[0]];
    if (argumentos_aceitos.length !== this.args.length) {
        this.args = []; return;
    }

    for (let i = 0; i < argumentos_aceitos.length; i++) {
        let argumento_atual = argumentos_aceitos[i];
        if (argumento_atual[0] !== this.args[i][0]) {
            this.args = []; return;
        }
    }

    this.nome_comando = linha_separada_por_espaco[0];

}

function pega_texto() {
    return document.getElementById('box_text').value;
}

function atualiza_texto(novo_texto) {
    document.getElementById('box_text').value = novo_texto;
}

function processa_codigo(codigo_cru) {
    let linhas = codigo_cru.split('\n');
    let linhas_processadas = [];

    for (let i = 0; i < linhas.length; i++) {
        let linha_processada = new ComandoAsm(linhas[i]);
        if (linha_processada.nome_comando === '') continue;
        linhas_processadas.push(linha_processada);
    }

    return linhas_processadas;
}

function arg_para_string(arg_parseado) {
    if (arg_parseado[0] == 1) {
        // registrador
        return `x${arg_parseado[1]}`
    } else if (arg_parseado[0] == 2) {
        // imm(reg)
        return `${arg_parseado[1]}(x${arg_parseado[2][1]})`
    } else {
        // imm
        return `${arg_parseado[1]}`
    }
}

function inst_para_string(inst_parseada) {
    let retorno = inst_parseada.nome_comando + " ";
    for (let i = 0; i < inst_parseada.args.length; i++) {
        retorno += arg_para_string(inst_parseada.args[i]) + (i + 1 === inst_parseada.args.length ? "" : ", ");
    }
    return retorno;
}

// escreve na caixa de texto o codigo parseado dado codigo_processado
function sobrescreve_codigo(codigo_processado) {
    let insts_processadas = []
    for (let i = 0; i < codigo_processado.length; i++) {
        insts_processadas.push(inst_para_string(codigo_processado[i]));
    }
    let texto_final = '';
    for (let i = 0; i < insts_processadas.length; i++) {
        texto_final += insts_processadas[i];

        if (i + 1 !== insts_processadas.length) texto_final += '\n';
    }

    atualiza_texto(texto_final);
}

var texto_saida = '';

function atualiza_texto_saida() {
    document.getElementById('saida').innerHTML = texto_saida.replace('\n', '<br>');
}

var registradores = [];
let num_regs = 32;

function reseta_registradores() {
    registradores = [];
    for (let i = 0; i < num_regs; i++) {
        registradores.push(0);
    }
}

var memoria = [];
let tam_memo = 1024;

function reseta_memoria() {
    memoria = [];
    for (let i = 0; i < tam_memo; i++) {
        memoria.push(i);
    }
}

function roda_linha(comando) {
    if (comando.nome_comando === 'add') {
        registradores[comando.args[0][1]] = registradores[comando.args[1][1]] + registradores[comando.args[2][1]];
        return registradores[comando.args[0][1]];
    } else if (comando.nome_comando === 'lw') {
        let pos_acessada = comando.args[1][1] + registradores[comando.args[1][2][1]];
        if (pos_acessada < 0 || pos_acessada >= tam_memo) return null;
        registradores[comando.args[0][1]] = memoria[pos_acessada];
        return registradores[comando.args[0][1]];
    } else if (comando.nome_comando === 'sw') {
        let pos_acessada = comando.args[1][1] + registradores[comando.args[1][2][1]];
        if (pos_acessada < 0 || pos_acessada >= tam_memo) return null;
        memoria[pos_acessada] = registradores[comando.args[0][1]];
        return memoria[pos_acessada];
    } else if (comando.nome_comando === 'addi') {
        registradores[comando.args[0][1]] = registradores[comando.args[1][1]] + comando.args[2][1];
    } else if (comando.nome_comando === 'sub') {
        registradores[comando.args[0][1]] = registradores[comando.args[1][1]] + registradores[comando.args[2][1]];
        return registradores[comando.args[0][1]];
    } else if (comando.nome_comando === 'mul') {
        registradores[comando.args[0][1]] = registradores[comando.args[1][1]] * registradores[comando.args[2][1]];
        return registradores[comando.args[0][1]];
    } else if (comando.nome_comando === 'mv') {
        registradores[comando.args[0][1]] = registradores[comando.args[1][1]];
        return registradores[comando.args[0][1]];
    } else if (comando.nome_comando === 'show') {
        texto_saida += `${registradores[comando.args[0][1]]} <br>`;
        return registradores[comando.args[0][1]];
    }
}

function roda_codigo(comandos) {
    for (let i = 0; i < comandos.length; i++) {
        roda_linha(comandos[i]);
    }
}

function pega_regs_escritos(comando) {
    let tipos_args = comandos_validos[comando.nome_comando];
    let resposta = [];
    for (let i = 0; i < tipos_args.length; i++) {
        if (tipos_args[i][0] === 1 && tipos_args[i][1] === 2) {
            resposta.push(comando.args[i][1]);
        }
    }
    return resposta;
}

function pega_regs_lidos(comando) {
    let tipos_args = comandos_validos[comando.nome_comando];
    let resposta = [];
    for (let i = 0; i < tipos_args.length; i++) {
        if (tipos_args[i][0] === 1 && tipos_args[i][1] === 1) {
            resposta.push(comando.args[i][1]);
        } else if (tipos_args[i][0] === 2) {
            resposta.push(comando.args[i][2][1]);
        }
    }
    return resposta;
}

function pega_dependencias(comandos) {
    for (let i = 2; i < comandos.length; i++) {
        let escrita_antes = pega_regs_escritos(comandos[i - 2]);
        if (escrita_antes.length === 0) continue;
        escrita_antes = escrita_antes[0];
        let leitura_atual = pega_regs_lidos(comandos[i]);

        if (leitura_atual.includes(escrita_antes)) {
            texto_saida += `Dependencia verdadeira na linha ${i + 1}\n`
        }
    }

    for (let i = 1; i < comandos.length; i++) {
        let leitura_antes = pega_regs_lidos(comandos[i - 1]);
        let escrita_atual = pega_regs_escritos(comandos[i]);
        if (escrita_atual.length === 0) continue;
        escrita_atual = escrita_atual[0];
        if (leitura_antes.includes(escrita_atual)) {
            texto_saida += `Dependência WAR na linha ${i + 1}\n`;
        }
    }

    for (let i = 1; i < comandos.length; i++) {
        let escrita_antes = pega_regs_escritos(comandos[i - 1]);
        if (escrita_antes.length === 0) continue;
        escrita_antes = escrita_antes[0];
        let escrita_atual = pega_regs_escritos(comandos[i]);
        if (escrita_atual.length === 0) continue;
        escrita_atual = escrita_atual[0];
        if (escrita_antes == escrita_atual) {
            console.log(comandos[i]);
            console.log(comandos[i - 1]);
            texto_saida += `Dependência WAW na linha ${i + 1}\n`;
        }
    }
}

function rodar_codigo() {
    reseta_registradores();
    reseta_memoria();
    texto_saida = '';
    atualiza_texto_saida();
    texto_saida = 'Saída do assembly: \n';
    let linhas_codigo = processa_codigo(pega_texto());
    roda_codigo(linhas_codigo);
    sobrescreve_codigo(linhas_codigo);
    texto_saida += 'Informações sobre dependências:\n';
    pega_dependencias(linhas_codigo);
    atualiza_texto_saida();
}