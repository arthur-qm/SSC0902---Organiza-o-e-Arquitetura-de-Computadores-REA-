const comandos_validos = {
    // lw tem dois argumentos. o primeiro e um registrador (1) que sera escrito (2)
    // e o segundo e um registrador (1) que sera lido (2)
    'lw': [[1, 2], [1, 1]],
    // sw tem dois argumentos. o primeiro e um registrador (1) que sera lido (1)
    // e o segundo e da forma imediato(reg) (2) em que esse registrador sera lido (1) e o imediato e
    // representado pelo 3
    'sw': [[1, 1], [2, 3, [1, 1]]],
    // add tem tres argumentos. o primeiro e um registrador (1) no qual sera escrito (2)
    // o segundo e o terceiro sao registradores que serao lidos
    'add': [[1, 2], [1, 1], [1, 1]]
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

function atualiza_texto(novo_texto) {
    document.getElementById('box_text').value = novo_texto;
}

function processa_codigo(codigo_cru) {

}

function escreve_arg(arg_parseado) {
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

function escreve_inst(inst_parseada) {
    let nome_comando = inst_parseada.nome_comando;

}

// escreve na caixa de texto o codigo parseado dado codigo_processado
function sobrescreve_codigo(codigo_processado) {

}

function acha_dependencias() {
    let texto = document.getElementById('box_text').value;
    let linhas = texto.split('\n');
    console.log(texto);
}