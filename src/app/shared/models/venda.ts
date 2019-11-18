import * as dinheiro from './dinheiro';
export class Venda {
  public LCTO: number;
  public DATA: Date;
  public CODCLI: number;
  public CODVEND: number;
  public STATUS: number;
  public CDCONDPAGTO: number;
  public NOMECLI: string;
  public EMPRESA: number;
  public NOMEVEND: string;
  public TRANSITO: number[];
  public CGC: string;
  public CPFCupom: string;
  public INSC: string;
  public NFE: number;
  public EMAIL: string;
  public FONE: string;
  public RAZAO: string;
  public ENDERECO: string;
  public NUMERO: string;
  public BAIRRO: string;
  public CEP: string;
  public CODIBGE: string;
  public CODCIDADE: number;
  public CIDADE: string;
  public ESTADO: string;
  public COMPLEMENTO: string;
  // valores que vem da tabela
  public DESCONTO: dinheiro;
  public FRETE: dinheiro;
  public SEGURO: dinheiro;
  // valores calculados ao inserir itens na venda
  public TOTALPRODUTOS: dinheiro; // inicia zerado
  public TOTAL: dinheiro; // inicia zerado
  public TOTALDESC: dinheiro; // inicia zerado
  public DESCONTOITEM: dinheiro; // inicia zerado
  public PAGAR: dinheiro; // inicia zerado
  // produtos
  public PRODUTOS: any[];
  // pagamentos
  public PAGAMENTO: any[];
  // dados do transportador
  public TRANSPORTE: {
    VOLUMES: string;
    PESO: string;
    TIPOFRETE: string;
    TRANSPORTADOR: string;
  };
  // documentos fiscais
  public NUCUPOM: number;
  public FATURAMENTO: string;
  public LIBERAFAT: number;
  public LIBERANP: number;

  constructor(
    lcto: any,
    data: any,
    transito: any,
    cgc: any,
    insc: any,
    codcli: any,
    nomecli: any,
    codvend: any,
    nomevend: any,
    email: any,
    fone: any,
    razao: any,
    endereco: any,
    numero: any,
    bairro: any,
    cep: any,
    codibge: any,
    codcidade: any,
    cidade: any,
    estado: any,
    complemento: any,
    desconto: any,
    frete: any,
    seguro: any,
    total: any,
    fatura: any,
    liberafat: any,
    liberanp: any
  ) {
    this.LCTO = lcto;
    this.DATA = new Date(data);
    this.CODVEND = codvend || null;
    this.NOMEVEND = nomevend || null;
    // dados do transito
    this.TRANSITO = [];
    this.TRANSITO.push(transito);
    // cliente
    this.CGC = cgc || null;
    this.CPFCupom = null;
    this.INSC = insc || null;
    this.NFE = null;
    this.CODCLI = codcli || null;
    this.NOMECLI = nomecli || null;
    this.EMAIL = email || null;
    this.FONE = fone || null;
    this.RAZAO = razao || null;
    // endereço
    this.ENDERECO = endereco || null;
    this.NUMERO = numero || null;
    this.BAIRRO = bairro || null;
    this.CEP = cep || null;
    this.CODIBGE = codibge || null;
    this.CODCIDADE = codcidade || null;
    this.CIDADE = cidade || null;
    this.ESTADO = estado || null;
    this.COMPLEMENTO = complemento || null;
    // valores que vem da tabela
    this.DESCONTO = new dinheiro(desconto) || 0;
    this.FRETE = new dinheiro(frete) || 0;
    this.SEGURO = new dinheiro(seguro) || 0;
    // valores calculados ao inserir itens na venda
    this.TOTALPRODUTOS = new dinheiro(0); // inicia zerado
    this.TOTAL = new dinheiro(0); // inicia zerado
    this.TOTALDESC = new dinheiro(0); // inicia zerado
    this.DESCONTOITEM = new dinheiro(0); // inicia zerado
    this.PAGAR = new dinheiro(0); // inicia zerado
    // produtos
    this.PRODUTOS = [];
    // pagamentos
    this.PAGAMENTO = [];
    // dados do transportador
    this.TRANSPORTE = {
      VOLUMES: '',
      PESO: '',
      TIPOFRETE: '',
      TRANSPORTADOR: ''
    };
    // documentos fiscais
    this.NUCUPOM = null;
    this.NFE = null;
    this.FATURAMENTO = fatura || null;
    this.LIBERAFAT = liberafat || 0;
    this.LIBERANP = liberanp || 0;
  }
  insereCPFCupom(valor) {
    this.CPFCupom = valor;
  }
  insereTransporte(volumes, peso, tipofrete, transportador) {
    /* TIPOS DE FRETE
         0– Por conta do emitente;
         1– Por conta do destinatário/remetente;
         2– Por conta de terceiros;
         9– Sem frete. (V2.0) */
    this.TRANSPORTE = {
      VOLUMES: volumes || '',
      PESO: peso || '',
      TIPOFRETE: tipofrete || '',
      TRANSPORTADOR: transportador || ''
    };
  }
  insereNucupom(cupom) {
    this.NUCUPOM = cupom;
  }
  insereNfe(nfe) {
    this.NFE = nfe;
  }
  insereLcto(transito) {
    // lcto
    console.log('inserelcto' + transito);

    // transito
    this.TRANSITO.push(transito);
  }
  calculaTotal() {
    this.TOTAL = new dinheiro(
      this.PRODUTOS.reduce(function(
        valorAnterior,
        valorAtual: any,
        indice,
        array
      ) {
        return valorAnterior + valorAtual.TOTALSD;
      },
      0)
    ).soma(this.FRETE);
    this.TOTALDESC = new dinheiro(
      this.PRODUTOS.reduce(function(
        valorAnterior,
        valorAtual: any,
        indice,
        array
      ) {
        return valorAnterior + valorAtual.TOTAL;
      },
      0)
    ).soma(this.FRETE);
    this.PAGAR = new dinheiro(
      this.PRODUTOS.reduce(function(
        valorAnterior,
        valorAtual: any,
        indice,
        array
      ) {
        return valorAnterior + valorAtual.TOTAL;
      },
      0)
    ).soma(this.FRETE);
    this.TOTALPRODUTOS = new dinheiro(
      this.PRODUTOS.reduce(function(
        valorAnterior,
        valorAtual: any,
        indice,
        array
      ) {
        return valorAnterior + valorAtual.TOTAL;
      },
      0)
    );
  }
  aplicaDesconto(percent) {
    for (const prod of this.PRODUTOS) {
      console.log(prod.VALOR.valor);
      if (prod.VALOR.valor === prod.VALORINI.valor) {
        prod.VALORDESCPREV = new dinheiro(prod.VALOR.desconto(4) * prod.QTD);
        console.log(prod.VALORDESCPREV.valor);
      } else {
        prod.VALORDESCPREV = prod.TOTAL;
      }
    }
  }
  descontoPrev() {
    return new dinheiro(
      this.PRODUTOS.reduce(function(valorAnterior, valorAtual, indice, array) {
        return valorAnterior + valorAtual.VALORDESCPREV;
      }, 0)
    );
  }
  VLDESC() {
    return new dinheiro(this.TOTAL - this.TOTALDESC);
  }
  PERCENTDESC() {
    return (100 - (this.TOTALDESC * 100) / this.TOTAL).toFixed(0);
  }
  insereProduto(produto: any) {
    this.PRODUTOS.push(
      new Produto(
        produto.CODIGO,
        produto.VALOR,
        produto.QTDPEDIDO,
        produto.QTDRESERVA,
        produto.UNIDADE,
        produto.CODPRODVENDA,
        produto.VALORINI,
        produto.PRPROMO,
        produto.DESCRICAO,
        produto.CODINTERNO,
        produto.SITTRIB,
        produto.NCM,
        produto.ORIG,
        produto.GRUPO,
        produto.ALIQ,
        produto.CEST,
        produto.BASECALC,
        produto.FRETEPROD,
        produto.ALIQIPI,
        produto.CODFISCAL,
        produto.MULTQTD,
        produto.QTDFISCAL,
        produto.VALORUNITFISCAL
      )
    );
    this.calculaTotal();
  }
  inserePagamento(pagamento) {
    this.PAGAMENTO.push(pagamento);
  }
  insereDescontos(produto) {
    this.DESCONTOITEM.soma(produto.VALOR * produto.QTDPEDIDO);
  }
  alteraValorProduto(codprodvenda, valor) {
    console.log(codprodvenda);
    const index = this.PRODUTOS.findIndex(
      obj => obj.CODPRODVENDA === codprodvenda
    );
    console.log(this.PRODUTOS);
    console.log(index);
    this.PRODUTOS[index].VALOR = new dinheiro(valor);
    this.PRODUTOS[index].TOTAL = new dinheiro(valor * this.PRODUTOS[index].QTD);
    this.calculaTotal();
  }
}
class Produto {
  public CODPRO: number;
  public CODPROFISCAL: number;
  public CODPRODVENDA: number;
  public CODINTERNO: string;
  public DESCRICAO: string;
  public VALOR: dinheiro;
  public VALORINI: dinheiro;
  public VALORPROMO: dinheiro;
  public QTD: number;
  public MULTQTD: number;
  public QTDRESERVA: number;
  public TOTAL: dinheiro;
  public TOTALSD: dinheiro;
  public UNIDADE: string;
  public SITTRIB: string;
  public NCM: string;
  public CEST: string;
  public ORIG: string;
  public GRUPO: string;
  public ALIQ: number;
  public BASECALC: dinheiro;
  public FRETEPROD: dinheiro;
  public ALIQIPI: number;
  public QTDFISCAL: number;
  public VALORUNITFISCAL: dinheiro;
  CODFISCAL: any;

  constructor(
    codpro: number,
    valor: any,
    qtd: any,
    qtdreserva: any,
    unidade: any,
    codprodvenda: any,
    valorini: any,
    valorpromo: any,
    descricao: any,
    codinterno: any,
    sittrib: any,
    ncm: any,
    orig: any,
    grupo: any,
    aliq: any,
    cest: any,
    basecalc: any,
    freteprod: any,
    aliqipi: any,
    codprofiscal: any,
    multqtd: any,
    qtdfiscal: any,
    valorunitfiscal: any
  ) {
    this.CODPRO = codpro || null;
    this.CODPROFISCAL = codprofiscal || null;
    this.CODPRODVENDA = codprodvenda || null;
    this.CODINTERNO = codinterno || null;
    this.DESCRICAO = descricao || null;
    this.VALOR = new dinheiro(valor) || 0;
    this.VALORINI = new dinheiro(valorini) || 0;
    this.VALORPROMO = new dinheiro(valorpromo) || 0;
    this.QTD = qtd || 0;
    this.MULTQTD = multqtd;
    this.QTDRESERVA = qtdreserva || 0;
    this.TOTAL = new dinheiro(valor * qtd);
    this.TOTALSD = new dinheiro(valorini * qtd);
    this.UNIDADE = unidade || null;
    this.SITTRIB = sittrib || null;
    this.NCM = ncm || null;
    this.CEST = cest || null;
    this.ORIG = orig;
    this.GRUPO = grupo || null;
    this.ALIQ = aliq || 0;
    this.BASECALC = new dinheiro(basecalc);
    this.FRETEPROD = new dinheiro(freteprod);
    this.ALIQIPI = aliqipi || null;
    this.QTDFISCAL = qtdfiscal;
    this.VALORUNITFISCAL = new dinheiro(valorunitfiscal);
  }
}
