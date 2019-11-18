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

//venda

routes
  .route("/venda")
  //buscas
  .get((req, res) => {
    let status = req.query.status ? `status='${req.query.status}'` : ` `;
    let cliente = req.query.codcli ? `codcli= ${req.query.codcli}` : ` `;
    let where = status != ` ` || cliente != ` ` ? `where ` : ` `;
    //Consulta ao firebird
    estoque.get(function(err, db) {
      if (err) throw err;
      // db = DATABASE
      db.query(
        `select LCTO,CODCLI,DATA,CODVEND,NOMECLI,TOTAL from VENDA ${where} ${status} ${cliente}`,
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
        `insert into venda (codcli,codvend,data,status) values (${req.body.cliente},current_date,'U') returning lcto,codcli,codvend,nomecli,status,nomecli,cdcondpagto,empresa,data`,
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

routes.route("/confirmavenda").post((req, res) => {
  let venda = req.body.venda;
  let pagamentos = req.body.pagamentos;
  let cartao = req.body.cartao;
  let ultimoDoc = "";
  let acumulador = 0;
  const sql = `execute block as begin
      update venda set status = 'F' where VENDA.LCTO = ${venda.LCTO};
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
      ${pagamentos
        .map((item, i) => {
          const string = `INSERT INTO DEUS
        (CODIGO, CODDEC, EMPRESA, CODPARC, LCTO, TIPOLCTO, DOCUMENTO, DATAEMISSAO, DATAVCTO, DATALIQUID, DEBITO, CREDITO, VALOR, PROJECAO, OBS)
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
            item.VALOR
          },${item.PROJECAO},'${item.OBS}');
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
        `select v.lcto,v.data,v.codcli,v.nomecli,v.empresa,v.codvend,v.frete,v.total,f.nome,tr.id_transito,tr.status, tr.peso,tr.volumes,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.liberafat,c.liberanp,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,f.nome as nomevend,prazocompra.descricao as faturamento from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join func f on f.codigo = v.codvend left join cidade ci on c.codcidade = ci.cod_cidade left join transp on tr.codtransp = transp.codigo left join prazocompra on v.cdcondpagto = prazocompra.codigo where lcto =${req.params.id} order by tr.id_transito`,
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
        where produto.codigo=${req.body.id}
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
                if (err) throw err;
                db.detach(function() {
                  console.log("retornou", {
                    CODIGO: result[0].CODIGO,
                    DESCRICAO: result[0].DESCRICAO,
                    QTD: req.body.qtd,
                    VALOR: result[0].VALOR,
                    UNIDADE: result[0].UNIDADE
                  });
                  res.status(200).json({
                    CODIGO: result[0].CODIGO,
                    DESCRICAO: result[0].DESCRICAO,
                    QTD: req.body.qtd,
                    VALOR: result[0].VALOR,
                    UNIDADE: result[0].UNIDADE
                  });
                });
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
      db.query(
        `select * from LISTAPRODVENDAS(${req.params.id})`,
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
  .route("/cliente")
  //buscas
  .get((req, res) => {
    console.log(req.query);
    var CODIGO = req.query.CODIGO;
    var RAZAO = req.query.NOME;
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
      db.query(sql,
        function(err, result) {
          if (err) throw err;
          db.detach(function() {
            res.send(result[0]);
          });
        }
      );
    });
  });

  routes
  .route("/destinatario")
  //buscas
  .get((req, res) => {
    var sql = `select p.crt,c.razao,c.cgc,c.insc,c.endereco,c.bairro,c.cep,c.fone,c.email,ci.nom_cidade as cidade,ci.codibge,ci.estado,p.icms_simples from param p  join cliente c on p.codparc = c.codigo  join cidade ci on c.codcidade = ci.cod_cidade where p.codigo=${req.query.empresa}`;
    estoque.get(function(err, db) {
      if (err) throw err;
      db.query(
        function(err, result) {
          if (err) throw err;
          db.detach(function() {
            res.send(result[0]);
          });
        }
      );
    });
  });

module.exports = routes;
