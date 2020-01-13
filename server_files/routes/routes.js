function converteData(texto) {
  if (texto instanceof Date) {
    return texto;
  }
  var data = texto
    .match(/(\d{2,4})(\/|-|\.)(\d{2})\2(\d{2,4})/)
    .filter(function(elem, index, array) {
      return Number(elem);
    });
  if (data[2].length === 4) {
    data.reverse();
  }
  console.log(data);
  return new Date(data);
}

function dataFirebird(data) {
  console.log(data);
  if (!data) return null;
  var data = converteData(data);
  return (
    "'" +
    data.getDate() +
    "." +
    (data.getMonth() + 1) +
    "." +
    data.getFullYear() +
    "'"
  );
}

//roteador do express
const routes = require("express").Router();
//biblioteca de comunicação com Firebird
const Firebird = require("node-firebird");
const options = {
  host: "sistema.florestalferragens.com.br",
  port: 3050,
  database: "c:\\bessani softwares\\florestal\\base\\estoque.fdb",
  user: "SYSDBA",
  password: "masterkey"
};
//cria a conexão com o banco
const estoque = Firebird.pool(15, options);

//consulta de produtos
routes.route("/produto").get((req, res) => {
  console.log("chamou produto");
  //campos buscados (caso não seja especificado traz todos)
  let campos = req.query.campos ? req.query.campos : `*`;
  //qtd do produto (caso não seja especificado traz todos)
  let qtd = req.query.qtd ? ` where qtd = ${req.query.qtd} ` : ` `;
  //preço de venda máximo buscado (caso não seja especificado traz todos)
  let prvenda = req.query.prvenda
    ? ` where prvenda < ${req.query.prvenda} `
    : ` `;
  //monta a query baseada nos parametros
  let queryString = `select ${campos}
        from produto
        where ativo = 'S'
        ${qtd}
        ${prvenda}
        `;

  //Consulta ao firebird
  estoque.get(function(err, db) {
    if (err) throw err;
    // db = DATABASE
    db.query(queryString, function(err, result) {
      // IMPORTANT: close the connection
      db.detach(function() {
        console.log("retornou produtos");
        res.status(200).json(result);
      });
    });
  });
});

routes
  .route("/produto/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select CODIGO,DESCRICAO,QTD,UNIDADE,PRVENDA AS VALOR from produto where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result[0]);
          });
        }
      );
    });
  });

routes
  .route("/produto/edit/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `update produto set DESCRICAO=${req.body.descricao}  where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          if (err) res.status(500).send(err);
          db.detach(function() {
            res.status(200).json(result);
          });
        }
      );
    });
  });

routes.route("/confirmavenda").post((req, res) => {
  let venda = req.body.venda;
  let pagamentos = req.body.pagamentos;
  let cartao = req.body.cartao;
  let boleto = req.body.boleto;
  let empresa = req.body.empresa;
  let ultimoDoc = "";
  let acumulador = 0;
  const sql = `execute block as begin
      update venda set status = 'F', empresa= ${empresa} where VENDA.LCTO = ${
    venda.LCTO
  };
      ${cartao
        .map((item, i) => {
          console.log("cartao", item);
          const string = `INSERT INTO CARTAO
        (ID, LCTO, ESTABELECIMENTO, ADQUIRENTE, BANDEIRA, PARCELAS, TID, AUTORIZACAO)
        VALUES
        (${item.ID},${item.LCTO},${item.ESTABELECIMENTO},${item.ADQUIRENTE},'${item.BANDEIRA}',${item.PARCELAS},${item.TID},${item.AUTORIZACAO});
        `;
          return string;
        })
        .join("")}
        ${boleto
          .map((item, i) => {
            console.log("cartao", item);
            const string = `INSERT INTO BOLETO
          (CODIGO, STATUS, DOCUMENTO, LCTO, VALOR, VENCIMENTO)
          VALUES
          (${item.CODIGO},'${item.STATUS}','${item.DOCUMENTO}',${item.LCTO},'${item.VALOR.valor}',${dataFirebird(item.VENCIMENTO)});
          `;
            return string;
          })
          .join("")}
      ${pagamentos
        .map((item, i) => {
          const string = `INSERT INTO DEUS
        (CODIGO, CODDEC, EMPRESA, CODPARC, LCTO, TIPOLCTO, DOCUMENTO, DATAEMISSAO, DATAVCTO, DATALIQUID, DEBITO, CREDITO, VALOR, PROJECAO, OBS,PERMITEAPAGA,TIPOOPERACAO,TRAVACREDITO)
        VALUES
        (${item.CODIGO},${
            ultimoDoc === item.DOCUMENTO
              ? `(select gen_id(gen_codigo_deus,0) from rdb$database)-${acumulador}`
              : item.CODDEC
          },${item.EMPRESA},${item.CODPARC},${item.LCTO},'${item.TIPOLCTO}','${
            item.DOCUMENTO
          }',${dataFirebird(item.DATAEMISSAO)},${dataFirebird(
            item.DATAVCTO
          )},${dataFirebird(item.DATALIQUID)},${item.DEBITO},${item.CREDITO},${
            item.VALOR.valor
          },${item.PROJECAO},'${item.OBS}',${item.PERMITEAPAGA},${
            item.TIPOOPERACAO
          },${item.TRAVACREDITO});
        `;
          item.DOCUMENTO === ultimoDoc ? acumulador++ : (acumulador = 0);
          ultimoDoc = item.DOCUMENTO;
          return string;
        })
        .join("")}
      end;`;
  console.log(sql);
  estoque.get(function(err, db) {
    if (err) throw err;
    // db = DATABASE
    db.execute(sql, function(err, result) {
      // IMPORTANT: close the connection
      db.detach(function() {
        res.status(200).send({ sql: sql });
      });
    });
  });
});

routes
  .route("/venda/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select v.lcto,v.data,v.codcli,v.nomecli,v.empresa,v.codvend,v.frete,v.total,
        tr.id_transito,tr.status, tr.peso,tr.volumes,tr.outra_desp,tr.desconto,tr.total_nota,
        tr.tipofrete,tr.nfe,tr.cupom,tr.tipo as tipo_transito,tr.vnf as vtransito,
        c.liberafat,c.liberanp,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,
        c.complemento,c.cidade,c.cep,c.fone,c.email,
        ci.codibge,c.codcidade,ci.estado,ci.cod_estado,
        f.nome as nomevend,prazocompra.descricao as faturamento
        from venda v
        join transito tr on v.lcto = tr.documento
        join cliente c on c.codigo=v.codcli
        join func f on f.codigo = v.codvend
        left join cidade ci on c.codcidade = ci.cod_cidade
        left join transp on tr.codtransp = transp.codigo
        left join prazocompra on v.cdcondpagto = prazocompra.codigo
        where lcto = ${req.params.id} order by tr.documento`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result);
          });
        }
      );
    });
  });
routes
  .route("/prodvenda")
  //buscas
  .post((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      console.log("insere prodvenda");
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select produto.codigo,produto.unidade,produto.descricao,produto.prvenda as valor, sum(pacote.qtd) from produto
        left join pacote on pacote.id_produto = produto.codigo and pacote.ativo = 1 and pacote.estoque=3
        where produto.codbar=${req.body.id}
        group by codigo,unidade,valor,descricao`,
        function(err, result) {
          console.log(result);
          if (result[0].SUM && result[0].SUM >= req.body.qtd) {
            console.log("sum maior");
            db.query(
              `execute block as begin

              insert into prodvenda (codpro,codvenda,qtd,valor,id_transito)
              values (
                ${req.body.id},${req.body.venda},${req.body.qtd},${result[0].VALOR},(select id_transito from transito where documento = ${req.body.venda} and tipo=5));
                UPDATE PACOTE SET SITUACAO=3,
                id_transito_s=(select id_transito from transito where documento = ${req.body.venda} and tipo=5)
                WHERE pacote.situacao =1 and pacote.estoque=3 AND pacote.ID_PRODUTO = ${req.body.id} ROWS ${req.body.qtd};
                end;`,
              function(err, result1) {
                console.log("inseriu na venda");
                db.query(
                  `select PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.IPI as aliqipi,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,
                PRODUTO.UNIDADE,PRODUTO.CEST,produto.orig,PRODUTO.classfis as ncm,produto.grupo,
                PRODVENDA.CODIGO as codprodvenda,PRODVENDA.QTD as qtdpedido,PRODVENDA.qtdreserva,PRODVENDA.valor,
                prodvenda.valorfrete as freteprod,prodvenda.valorini,prodvenda.prpromo,produto.codigo_fiscal as codfiscal,produto.mult_qtd as multqtd,
                prodvenda.valorfrete + (prodvenda.qtd*prodvenda.valor) as basecalc, prodvenda.qtd as qtdfiscal,prodvenda.valor as valorunitfiscal
                FROM PRODVENDA
                JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO
                WHERE PRODVENDA.codigo = (select gen_id(gen_codigo_prodvenda,0) from rdb$database)`,
                  function(err, result2) {
                    if (err) throw err;
                    console.log("res2", result2);
                    db.detach(function() {
                      res.status(200).json(result2[0]);
                    });
                  }
                );
              }
            );
          } else {
            console.log("sum menor");
            db.detach(function() {
              console.log("retornou", result);
              res.status(404).send("quantidade não disponivel");
            });
          }
          // IMPORTANT: close the connection
        }
      );
    });
  });
routes
  .route("/prodvenda/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(`select * from LISTAPRODVENDAS(${req.params.id})`, function(
        err,
        result
      ) {
        // IMPORTANT: close the connection
        db.detach(function() {
          console.log("retornou", result);
          res.status(200).json(result);
        });
      });
    });
  });


routes
  .route("/parceiro")
  //buscas
  .get((req, res) => {
    console.log(req.query)
    var CODIGO = req.query.CODIGO;
    var FANTASIA = req.query.NOME;
    var tipoParc = req.query.TIPOPARC;
    var nomeCampo = ` cliente.cli = 'S'`;

    if (tipoParc == "F") {
      nomeCampo = ` cliente.fornec = 'S'`;
    }
    if (tipoParc == "T") {
      nomeCampo = ` cliente.transp = 'S'`;
    }
    if (tipoParc == "V") {
      nomeCampo = ` cliente.func = 'S'`;
    }

    if (CODIGO) {
      var termos = CODIGO;
      sql = `select CODIGO,FANTASIA from cliente where codigo=? and ${nomeCampo}`;
    } else {
      sql = `select CODIGO,FANTASIA from cliente where ativo = 'S' and ${nomeCampo} and `;
      var termos = FANTASIA.toUpperCase().split("?");
      if (FANTASIA.charAt(0) == "?") {
        sql += "fantasia containing ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and fantasia containing ?";
        }
      } else {
        sql += "fantasia starting with ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and fantasia containing ?";
        }
      }
    }

    console.log('sql',sql)
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, termos, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {

          res.json(result);
        });
      });
    });
  });


routes
  .route("/parceiro/:id")

  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`select CODIGO,RAZAO,CGC,INSC,LIBERAFAT,LIBERANP from CLIENTE where codigo = ${req.params.id}`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result[0]);
        });
      });
    });
  });
routes
  .route("/vendedor")
  //buscas
  .get((req, res) => {
    console.log(req.query);
    var CODIGO = req.query.CODIGO;
    var NOME = req.query.NOME;
    if (CODIGO) {
      var termos = CODIGO;
      sql = "select CODIGO,NOME AS RAZAO from FUNC where codigo=?";
    } else {
      sql = "select CODIGO,NOME AS RAZAO from FUNC WHERE ";
      var termos = NOME.toUpperCase().split("?");
      if (NOME.charAt(0) == "?") {
        sql += "nome containing ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and nome containing ?";
        }
      } else {
        sql += "nome starting with ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and nome containing ?";
        }
      }
    }
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, termos, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          res.json(result);
        });
      });
    });
  });

routes
  .route("/vendedor/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select CODIGO,NOME from FUNC where codparc = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result[0]);
          });
        }
      );
    });
  });

routes
  .route("/cartao")
  //buscas
  .get((req, res) => {
    var sql = `select * from PARAM_CARTAO WHERE ESTABELECIMENTO = ${req.query.estabelecimento}`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          console.log("buscou cartao");
          res.send(result);
        });
      });
    });
  });

routes
  .route("/boleto")
  //buscas
  .get((req, res) => {
    var sql = `select * from PARAM_BOLETO WHERE ESTABELECIMENTO = ${req.query.estabelecimento}`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          console.log("buscou boletos");
          res.send(result);
        });
      });
    });
  });

routes
  .route("/emitente")
  //buscas
  .get((req, res) => {
    var sql = `select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade as cidade,ci.codibge,ci.estado,p.icms_simples from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=${req.query.empresa}`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          res.send(result[0]);
        });
      });
    });
  });

routes
  .route("/destinatario")
  //buscas
  .get((req, res) => {
    var sql = `select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade as cidade,ci.codibge,ci.estado,p.icms_simples from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=${req.query.empresa}`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(function(err, result) {
        if (err) throw err;
        db.detach(function() {
          res.send(result[0]);
        });
      });
    });
  });
routes.route("/numnfe/:id").get((req, res) => {
  estoque.get(function(err, db) {
    if (err) throw err;
    db.query(
      `SELECT FIRST 1 NOTA FROM SAIDA WHERE EMPRESA = ${req.params.id} ORDER BY NOTA DESC`,
      function(err, result) {
        db.detach(function() {
          res.json(Number(result[0].NOTA) + 1);
        });
        // IMPORTANT: close the connection
      }
    );
  });
});
routes
  .route("/nfe")
  // funçao da nota fiscal
  .post((req, res) => {
    let dados = req.body.dados;
    let itens = req.body.itens;
    let tributos = req.body.tributos;
    console.log(dados);
    let sql = `execute block as begin
    update or insert into SAIDA
    (EMPRESA,NOTA,DATA,CODCLI,DT_EMISSAO,DT_FISCAL,ESPECIE,DESPACES,DESCONTO,CODIGOBARRAS,
      FRETENOTA,FRETEFOB,VPROD,BCICMS,VICMS,VICMSST,BCICMSST,VNF,UF,CHAVE,TOMADORFRETE,
      MODELO,SERIE,CODPARC,PROTOCOLO,PROTOCOLOCANCELA)
    VALUES (${dados.EMPRESA},${dados.NOTA},${dados.DATA},${dados.CODCLI},${
      dados.DT_EMISSAO
    },
      ${dados.DT_FISCAL},${dados.ESPECIE},${dados.DESPACES},${
      dados.DESCONTO
    },'',
      ${dados.FRETENOTA},${dados.FRETEFOB},${dados.VPROD},${dados.BCICMS},
      ${dados.VICMS},${dados.VICMSST},${dados.BCICMSST},${dados.VNF},
      '${dados.UF}','${dados.CHAVE}',${dados.TOMADORFRETE},
      ${dados.MODELO},${dados.SERIE},${dados.CODPARC},'${dados.PROTOCOLO}','${
      dados.PROTOCOLOCANCELA
    }')
    MATCHING (EMPRESA,NOTA);
    UPDATE TRANSITO SET NFE = ${dados.NOTA} WHERE ID_TRANSITO = ${
      req.body.transito
    };
    ${itens
      .map(
        (item, i) => `
    update prodvenda set
    VBCICMS=${item.VBCICMS},
    PICMSST=${item.PICMSST},
    VBCICMSST=${item.VBCICMSST},
    VICMS=${item.VICMS},
    VICMSST=${item.VICMSST},
    PICMS=${item.PICMS},
    CFOP='${item.CFOP}',
    NCM='${item.NCM}',
    ORIG=${item.ORIG},
    CEST='${item.CEST}',
    SITTRIB='${item.SITTRIB}'
    where CODIGO=${item.CODPRODVENDA};
  `
      )
      .join("")}
  end`;
    console.log(sql);
    estoque.get(function(err, db) {
      if (err) throw err;

      db.query(sql, function(err, result) {
        console.log("executou", result);
        if (err) throw err;
        db.detach(function() {
          res.json({ resposta: "OK" });
        });
      });
      // IMPORTANT: close the connection
    });
  });
routes
  .route("/protocolonfe")
  // funçao da nota fiscal
  .post((req, res) => {
    let dados = req.body.dados;
    console.log(dados);
    let sql = `
    update or insert into SAIDA
    (EMPRESA,NOTA,CHAVE,PROTOCOLO,PROTOCOLOCANCELA)
    VALUES (${dados.EMPRESA},${dados.NOTA},'${dados.CHAVE}',
    '${dados.PROTOCOLO}','${dados.PROTOCOLOCANCELA}')
    MATCHING (EMPRESA,NOTA)`;
    console.log(sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        console.log("gravou");
        if (err) throw err;
        db.detach(function() {
          res.json("ok");
        });
      });
      // IMPORTANT: close the connection
    });
  });
  routes
  .route("/numerocupom")
  // funçao da do cupom fiscal
  .post((req, res) => {
    let dados = req.body.dados;
    console.log(dados);
    let sql = `
    update TRANSITO
    SET CUPOM = ${Number(dados.cupom)}
    where ID_TRANSITO = ${dados.transito}`;
    console.log(sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        console.log("gravou");
        if (err) throw err;
        db.detach(function() {
          res.json("ok");
        });
      });
      // IMPORTANT: close the connection
    });
  });
routes
  .route("/tipooperacao")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select codigo,sigla from tipooperacao where sigla <> ''`,
        function(err, result) {
          // IMPORTANT: close the connection
          if (err) res.status(500).send(err);
          db.detach(function() {
            res.status(200).json(result);
          });
        }
      );
    });
  });
routes
  .route("/pagtosvenda")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select deus.*, dd.tipooperacao,tipooperacao.* from (
          select sum(valor) as valor,coddec, datavcto from deus where lcto=${req.query.lcto} and tipooperacao <> 5 group by deus.coddec ,deus.datavcto ) as deus
          join deus as dd on deus.coddec = dd.codigo
          join tipooperacao on dd.tipooperacao=tipooperacao.codigo`,
        function(err, result) {
          // IMPORTANT: close the connection
          if (err) res.status(500).send(err);
          db.detach(function() {
            res.status(200).json(result);
          });
        }
      );
    });
  });
//--------------------------------------------------------------------------------------------

function converteData(texto) {
  if (texto instanceof Date) {
    return texto;
  }
  var data = texto
    .match(/(\d{2,4})(\/|-|\.)(\d{2})\2(\d{2,4})/)
    .filter(function(elem, index, array) {
      return Number(elem);
    });
  if (data[2].length === 4) {
    data.reverse();
  }
  console.log(data);
  return new Date(data);
}

function dataFirebird(data) {
  console.log(data);
  if (!data) return null;
  var data = converteData(data);
  return (
    "'" +
    data.getDate() +
    "." +
    (data.getMonth() + 1) +
    "." +
    data.getFullYear() +
    "'"
  );
}

//consulta de produtos
routes.route("/produto").get((req, res) => {
  console.log("chamou produto");
  //campos buscados (caso não seja especificado traz todos)
  let campos = req.query.campos ? req.query.campos : `*`;
  //qtd do produto (caso não seja especificado traz todos)
  let qtd = req.query.qtd ? ` where qtd = ${req.query.qtd} ` : ` `;
  //preço de venda máximo buscado (caso não seja especificado traz todos)
  let prvenda = req.query.prvenda
    ? ` where prvenda < ${req.query.prvenda} `
    : ` `;
  //monta a query baseada nos parametros
  let queryString = `select ${campos}
        from produto
        where ativo = 'S'
        ${qtd}
        ${prvenda}
        `;

  //Consulta ao firebird
  estoque.get(function(err, db) {
    if (err) throw err;
    // db = DATABASE
    db.query(queryString, function(err, result) {
      // IMPORTANT: close the connection
      db.detach(function() {
        console.log("retornou produtos");
        res.status(200).json(result);
      });
    });
  });
});

routes
  .route("/produto/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select CODIGO,DESCRICAO,QTD,UNIDADE,PRVENDA AS VALOR from produto where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result[0]);
          });
        }
      );
    });
  });

routes
  .route("/produto/edit/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `update produto set DESCRICAO=${req.body.descricao}  where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          if (err) res.status(500).send(err);
          db.detach(function() {
            res.status(200).json(result);
          });
        }
      );
    });
  });

//venda

routes
  .route("/venda")
  //buscas
  .get((req, res) => {
    let status = req.query.status ? `STATUS= '${req.query.status}'` : ` `;
    let cliente = req.query.codcli ? `CODCLI= ${req.query.codcli}` : ` `;
    let where = status != ` ` || cliente != ` ` ? `where` : ` `;
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select LCTO,CODCLI,NOMECLI,DATA,CODVEND,TOTAL,FRETE from VENDA ${where} ${status} ${cliente}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result);
          });
        }
      );
    });
  })
  //insere
  .post((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `insert into venda (codcli,codvend,data,status) values (${req.body.CODCLI},${req.body.CODVEND},current_date,'U') returning LCTO`,
        function(err, result) {
          console.log(result);
          db.query(
            `select v.lcto,v.data,v.codcli,v.nomecli,v.empresa,v.codvend,v.frete,v.total,
            tr.id_transito,tr.status,tr.peso,tr.vnf as vtransito,tr.volumes,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,
            c.liberafat,c.liberanp,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,c.codcidade,
            ci.codibge,ci.estado,ci.cod_estado,f.fantasia as nomevend,
            prazocompra.descricao as faturamento
            from venda v
            join transito tr on v.lcto = tr.documento
            join cliente c on c.codigo=v.codcli
            join cliente f on f.codigo = v.codvend
            left join cidade ci on c.codcidade = ci.cod_cidade
            left join transp on tr.codtransp = transp.codigo
            left join prazocompra on v.cdcondpagto = prazocompra.codigo
            where lcto =${result.LCTO} order by tr.id_transito`,
            function(err, result1) {
              console.log("result1", result1);
              // IMPORTANT: close the connection
              db.detach(function() {
                console.log("retornou", result1);
                res.status(200).json(result1);
              });
            }
          );
        }
      );
    });
  });

routes
  .route("/cliente")
  //buscas
  .get((req, res) => {
    console.log(req.query);
    var CODIGO = req.query.CODIGO;
    var RAZAO = req.query.RAZAO;
    if (CODIGO) {
      var termos = CODIGO;
      sql =
        "select codigo,razao,CGC,INSC,liberafat,LIBERANP from cliente where codigo=?";
    } else {
      sql =
        "select codigo,razao,CGC,INSC,liberafat,LIBERANP from cliente where ativo = 'S' and ";
      var termos = RAZAO.toUpperCase().split("?");
      if (RAZAO.charAt(0) == "?") {
        sql += "razao containing ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and razao containing ?";
        }
      } else {
        sql += "razao starting with ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and razao containing ?";
        }
      }
    }
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, termos, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          res.json(result);
        });
      });
    });
  });

routes
  .route("/cliente/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select CODIGO,RAZAO,CGC,INSC,LIBERAFAT,LIBERANP from CLIENTE where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result[0]);
          });
        }
      );
    });
  });
routes
  .route("/vendedor")
  //buscas
  .get((req, res) => {
    console.log(req.query);
    var CODIGO = req.query.CODIGO;
    var NOME = req.query.NOME;
    if (CODIGO) {
      var termos = CODIGO;
      sql = "select CODIGO,NOME from FUNC where codigo=?";
    } else {
      sql = "select CODIGO,NOME from FUNC ";
      var termos = NOME.toUpperCase().split("?");
      if (NOME.charAt(0) == "?") {
        sql += "nome containing ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and nome containing ?";
        }
      } else {
        sql += "nome starting with ?";
        for (i = 1; i < termos.length; i++) {
          sql += " and nome containing ?";
        }
      }
    }
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, termos, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          res.json(result);
        });
      });
    });
  });

routes
  .route("/vendedor/:id")
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select CODIGO,NOME from FUNC where codigo = ${req.params.id}`,
        function(err, result) {
          // IMPORTANT: close the connection
          db.detach(function() {
            console.log("retornou", result);
            res.status(200).json(result[0]);
          });
        }
      );
    });
  });

routes
  .route("/SaldoContaDataIni")

  .get((req, res) => {
    console.log("estou no /SaldoContaDataIni");
    var conta = req.query.conta;
    var dataInicio = req.query.dataInicio;

    // BUSCA CONTAS PARA PAGMENTO DE TÍTULOS E DESPESAS SEPARADAS POR EMPRESA E TIPO PROJEÇÃO

    var sql = `
      select  sum(uniao.valordebito) - sum(uniao.valorcredito) as saldo from (
      select  contas.saldo as valorcredito, 0 as valordebito from contas
      where contas.codigo=${conta}

      union all

      select sum(deus.valor) as valorcredito, 0 as valordebito from deus
      where credito=${conta} and deus.dataliquid<${dataFirebird(
      dataInicio
    )} and deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      union all
      select 0 as valorcredito, sum(deus.valor) as valordebito from deus
      where debito=${conta}  and deus.dataliquid<${dataFirebird(
      dataInicio
    )} and deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      ) as uniao
     `;
    console.log("sqlsaldo", sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;

        db.detach(function() {
          res.send(result);
        });
      });
    });
  });

routes
  .route("/SaldoConta")

  .get((req, res) => {
    console.log("estou no /SaldoConta");
    var conta = req.query.conta;

    // BUSCA CONTAS PARA PAGMENTO DE TÍTULOS E DESPESAS SEPARADAS POR EMPRESA E TIPO PROJEÇÃO

    var sql = `
    select sum(uniao.valorcredito) - sum(uniao.valordebito)  as saldo from (
      select  contas.saldo as valorcredito, 0 as valordebito from contas
      where contas.codigo=${conta}

      union all

      select sum(deus.valor) as valorcredito, 0 as valordebito from deus
      where credito=${conta} and  deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      union all
      select 0 as valorcredito, sum(deus.valor) as valordebito from deus
      where debito=${conta} and deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      ) as uniao
     `;
    console.log("sqlsaldo", sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;

        db.detach(function() {
          res.send(result);
        });
      });
    });
  });

routes
  .route("/contas")

  .get((req, res) => {
    var parametroBusca = req.query.paramBusca;
    var projecao = req.query.projecao;
    var empresa = req.query.empresa;
    var codigoConta = req.query.codigoConta;

    if (parametroBusca == 1) {
      if (projecao == 1) {
        tipoSelect = ",C,";
      } else {
        tipoSelect = ",B,";
      }
    }
    if (parametroBusca == 5) {
      tipoSelect = ",E,";
    } //contas bancárias
    if (parametroBusca == 6) {
      tipoSelect = ",F,";
    } //contas de transição
    if (parametroBusca == 7) {
      tipoSelect = ",G,";
    } //contas de sócios

    if (parametroBusca == 2) {
      tipoSelect = ",D,";
    } //contas Desp. FINANCEIRAS
    if (parametroBusca == 8) {
      tipoSelect = ",I,";
    } //contas Desp. MERC. P/ VENDA
    if (parametroBusca == 9) {
      tipoSelect = ",J,";
    } //contas Desp. C/ PESSOAL
    if (parametroBusca == 10) {
      tipoSelect = ",K,";
    } //contas Desp. GERAIS
    if (parametroBusca == 11) {
      tipoSelect = ",L,";
    } //contas Desp. TRIBUTÁRIA
    if (parametroBusca == 12) {
      tipoSelect = ",M,";
    } //contas Desp. INDEDUTIVEL
    if (parametroBusca == 13) {
      tipoSelect = ",N,";
    } //contas RES. NEGATIVO NA ALIEN. IMOBILIZ

    if (parametroBusca == 1000) {
      tipoSelect = "," + codigoConta + ",";
    }

    if (parametroBusca == 5) { tipoSelect = ',E,' } //contas bancárias
    if (parametroBusca == 6) { tipoSelect = ',F,' } //contas de transição
    if (parametroBusca == 7) { tipoSelect = ',G,' } //contas de sócios

    if (parametroBusca == 2) { tipoSelect = ',D,' } //contas Desp. FINANCEIRAS
    if (parametroBusca == 8) { tipoSelect = ',I,' } //contas Desp. MERC. P/ VENDA
    if (parametroBusca == 9) { tipoSelect = ',J,' } //contas Desp. C/ PESSOAL
    if (parametroBusca == 10) { tipoSelect = ',K,' } //contas Desp. GERAIS
    if (parametroBusca == 11) { tipoSelect = ',L,' } //contas Desp. TRIBUTÁRIA
    if (parametroBusca == 12) { tipoSelect = ',M,' } //contas Desp. INDEDUTIVEL
    if (parametroBusca == 13) { tipoSelect = ',N,' } //contas RES. NEGATIVO NA ALIEN. IMOBILIZ
    if (parametroBusca == 14) { tipoSelect = ',O,' } //contas PARCEIROS





    if (parametroBusca == 1000) { tipoSelect= ","+codigoConta+","}




    // BUSCA CONTAS PARA PAGMENTO DE TÍTULOS E DESPESAS SEPARADAS POR EMPRESA E TIPO PROJEÇÃO

    var sql = `
      select * from contas
      where (contas.ativo=1 and contas.tiposelect like ('%${tipoSelect}%') and contas.empresa=${empresa}) or (contas.ativo=1 and contas.tiposelect like ('%${tipoSelect}%') and  empresa is null)
      order by contas.descricao
     `;
    console.log("sql", sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;

        db.detach(function() {
          res.send(result);
        });
      });
    });
  });

routes
  .route("/pram")
  //buscas
  .get((req, res) => {
    var sql = `select * from param`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          console.log("buscou param");
          res.send(result);
        });
      });
    });
  });

routes
  .route("/deus")

  .get((req, res) => {
    console.log("estou na rota /deus");
    var paremetro = req.query.param;
    var dataInicio = req.query.dataInicio;
    var dataFim = req.query.dataFim;
    var empresa = req.query.empresa;
    var conta = req.query.conta;
    var whereDeus = ``;

    if (paremetro == 1) { whereDeus = ` where uniao.tipolcto in ('E','D','F') and uniao.empresa=${empresa} and uniao.dataliquid is null and uniao.datavcto<=${dataFirebird(dataFim)} ` }

    if (paremetro == 2) { whereDeus = ` where ( uniao.empresa=${empresa} and uniao.credito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) or (uniao.empresa=${empresa} and uniao.debito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) ` }
    if (paremetro == 3) { whereDeus = ` where ( uniao.empresa=${empresa} and uniao.credito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) or (uniao.empresa=${empresa} and uniao.debito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) ` }
    if (paremetro == 5) { whereDeus = ` where uniao.tipolcto in ('V') and uniao.empresa=${empresa} and uniao.dataliquid is null and uniao.datavcto<=${dataFirebird(dataFim)} ` }




    var sql = `
  select uniao.*, contas.descricao as cdebito from (
  select deus.*, param.nomesys as nomeempresa, contas.descricao as ccredito, cliente.fantasia from deus
  left join cliente on cliente.codigo=deus.codparc
  left join contas on deus.credito=contas.codigo
  join param on deus.empresa=param.codigo
  ) as uniao
  left join contas on uniao.debito=contas.codigo

  ${whereDeus}
  order by uniao.dataliquid, uniao.datavcto, uniao.codigo

  `
    console.log('sql', sql)

    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {
          console.log('buscou deus')

          res.send(result);
        });
      });
    });
  });

routes
  .route("/deuslcto")

  .get((req, res) => {
    var coddec = req.query.coddec;

    var sql = `
    select uniao.*, contas.descricao as cdebito from (
      select deus.*, param.nomesys as nomeempresa, contas.descricao as ccredito, cliente.fantasia from deus
      left join cliente on cliente.codigo=deus.codparc
      left join contas on deus.credito=contas.codigo
      join param on deus.empresa=param.codigo
      ) as uniao
      left join contas on uniao.debito=contas.codigo
      where uniao.coddec=${coddec}

      order by uniao.codigo

  `;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          console.log("buscou lctodeus");
          res.send(result);
        });
      });
    });
  });

routes.route("/Atualizadeuslcto").post((req, res) => {
  console.log("estou aqui");

  var dados = req.body.dados;
  var sql = `execute block as begin `;
  for (i = 0; i < dados.length; i++) {
    sql += ` update deus set deus.credito=${dados[i].CREDITO},
                                 deus.valor='${dados[i].VALOR}',
                                 deus.documento='${dados[i].DOCUMENTO}',
                                 deus.obs='${dados[i].OBS}',

                                 deus.dataliquid=${dataFirebird(dados[i].DATALIQUID)},
                                 deus.datavcto=${dataFirebird(dados[i].DATAVCTO)}
         where deus.codigo=${dados[i].CODIGO} ; `
    }
    sql += `end`

    console.log('sql', sql)

    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {
          console.log('buscou lctodeus')
          res.send(result);
        });

      });
    });
  });


routes.route("/Deletedeus").post((req, res) => {
  console.log("estou aqui");

  var codigo = req.body.codigo;
  var sql = ` delete from deus where deus.codigo=${codigo} `;

  console.log("sql", sql);

  estoque.get(function(err, db) {
    if (err) throw err;
    db.query(sql, function(err, result) {
      if (err) throw err;
      db.detach(function() {
        res.send(result);
      });
    });
  });
});

routes.route("/Insertdeus").post((req, res) => {
  console.log("estou no postInsertDeus");

  var dados = req.body.dados;

  var sql = `execute block as begin `;
  for (i = 0; i < dados.length; i++) {
    sql += ` insert into deus
        (CODDEC, CODPARC, CREDITO, DATAEMISSAO,DATALIQUID, DATAVCTO, DEBITO, DOCUMENTO,
          EMPRESA,LCTO,OBS,PROJECAO,TIPOLCTO,VALOR,PERMITEAPAGA,TIPOOPERACAO) values
        (${dados[i].CODDEC},${dados[i].CODPARC},${dados[i].CREDITO},
          ${dataFirebird(dados[i].DATAEMISSAO)},${dataFirebird(
      dados[i].DATALIQUID
    )},${dataFirebird(dados[i].DATAVCTO)},${dados[i].DEBITO},
          '${dados[i].DOCUMENTO}',${dados[i].EMPRESA},${dados[i].LCTO},'${
      dados[i].OBS
    }',
          ${dados[i].PROJECAO},'${dados[i].TIPOLCTO}',${dados[i].VALOR},${
      dados[i].PERMITEAPAGA
    },${dados[i].TIPOOPERACAO});
          `;
  }
  sql += `end`;

  console.log("sql", sql);

  estoque.get(function(err, db) {
    if (err) throw err;
    db.query(sql, function(err, result) {
      if (err) throw err;
      db.detach(function() {
        console.log("buscou lctodeus");
        res.send(result);
      });
    });
  });
});

routes
  .route("/deusGenerator")

  .get((req, res) => {
    console.log("estou na rota /deusGenerator");

    var sql = `
    select gen_id(gen_codigo_deus,0) from rdb$database
    `;

    console.log("sql", sql);
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(sql, function(err, result) {
        if (err) throw err;
        db.detach(function() {
          console.log("buscou deusGenerator");
          res.send(result);
        });
      });
    });
  });

routes.route("/deuslcto").get((req, res) => {
  var sql = `
    select * from deus where codparc=19662 and documento=   '167007-3'
    `;
  //Consulta ao firebird
  estoque.get(function(err, db) {
    if (err) throw err;
    // db = DATABASE
    db.query(sql, function(err, result) {
      // IMPORTANT: close the connection
      db.detach(function() {
        console.log("retornou", result);
        res.status(200).json(result[0]);
      });
    });
  });
});

module.exports = routes;
