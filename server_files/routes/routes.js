//roteador do express
const routes = require('express').Router();
//biblioteca de comunicação com Firebird
const Firebird = require('node-firebird');
const options = {
  'host': 'sistema.florestalferragens.com.br',
  'port': 3050,
  'database': 'c:\\bessani softwares\\florestal\\base\\estoque.fdb',
  'user': 'SYSDBA',
  'password': 'masterkey'
}
//cria a conexão com o banco
const estoque = Firebird.pool(15, options);


function converteData(texto) {
  if (texto instanceof Date) {
    return texto;
  }
  var data = texto.match(/(\d{2,4})(\/|-|\.)(\d{2})\2(\d{2,4})/).filter(function (elem, index, array) {
    return Number(elem);
  })
  if (data[2].length === 4) { data.reverse() }
  console.log(data)
  return new Date(data);
}

function dataFirebird(data) {
  console.log(data);
  if (!data) return null;
  var data = converteData(data);
  return "'" + data.getDate() + "." + (data.getMonth() + 1) + "." + data.getFullYear() + "'";
}



//consulta de produtos
routes.route('/produto')
  .get((req, res) => {
    console.log('chamou produto')
    //campos buscados (caso não seja especificado traz todos)
    let campos = req.query.campos ? req.query.campos : `*`
    //qtd do produto (caso não seja especificado traz todos)
    let qtd = req.query.qtd ? ` where qtd = ${req.query.qtd} ` : ` `;
    //preço de venda máximo buscado (caso não seja especificado traz todos)
    let prvenda = req.query.prvenda ? ` where prvenda < ${req.query.prvenda} ` : ` `;
    //monta a query baseada nos parametros
    let queryString =
      `select ${campos}
        from produto
        where ativo = 'S'
        ${qtd}
        ${prvenda}
        `;

    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(queryString, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou produtos')
          res.status(200).json(result);
        });
      });
    });
  });

routes.route('/produto/:id')
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`select CODIGO,DESCRICAO,QTD,UNIDADE,PRVENDA AS VALOR from produto where codigo = ${req.params.id}`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result[0]);
        });
      });
    });
  });

routes.route('/produto/edit/:id')
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`update produto set DESCRICAO=${req.body.descricao}  where codigo = ${req.params.id}`, function (err, result) {
        // IMPORTANT: close the connection
        if (err)
          res.status(500).send(err);
        db.detach(function () {
          res.status(200).json(result);
        });
      });
    });
  });



//venda

routes.route('/venda')
  //buscas
  .get((req, res) => {
    let status = req.query.params.STATUS ? `STATUS= ${req.query.params.status}` : ` `;
    let cliente = req.query.params.CODCLI ? `CODCLI= ${req.query.params.codcli}` : ` `;
    let where = (status != ` ` || cliente != ` `) ? `where` : ` `;
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`select LCTO,CODCLI,DATA,CODVEND,TOTAL,FRETE from VENDA ${where} ${status} ${cliente}`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result);
        });
      });
    });
  })
  //insere
  .post((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`insert into venda (codcli,data,status) values (${req.body.cliente},current_date,'U') returning lcto,codcli,codvend,nomecli,status,nomecli,cdcondpagto,empresa,data`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result);
        });
      });
    });
  });

routes.route('/cliente')
  //buscas
  .get((req, res) => {
    console.log(req.query)
    var CODIGO = req.query.CODIGO;
    var RAZAO = req.query.RAZAO;
    if (CODIGO) {
      var termos = CODIGO;
      sql = "select codigo,razao,CGC,INSC,liberafat,LIBERANP from cliente where codigo=?";
    } else {
      sql = "select codigo,razao,CGC,INSC,liberafat,LIBERANP from cliente where ativo = 'S' and ";
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

routes.route('/cliente/:id')
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
routes.route('/vendedor')
  //buscas
  .get((req, res) => {
    console.log(req.query)
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

routes.route('/vendedor/:id')
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`select CODIGO,NOME from FUNC where codigo = ${req.params.id}`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result[0]);
        });
      });
    });
  });

  routes.route('/SaldoContaDataIni')


  .get((req, res) => {
    console.log('estou no /SaldoContaDataIni')
    var conta = req.query.conta;
    var dataInicio = req.query.dataInicio;


    // BUSCA CONTAS PARA PAGMENTO DE TÍTULOS E DESPESAS SEPARADAS POR EMPRESA E TIPO PROJEÇÃO


    var sql = `
      select  sum(uniao.valordebito) - sum(uniao.valorcredito) as saldo from (

      select  contas.saldo as valorcredito, 0 as valordebito from contas
      where contas.codigo=${conta}
      
      union all
      
      select sum(deus.valor) as valorcredito, 0 as valordebito from deus
      where credito=${conta} and deus.dataliquid<${dataFirebird(dataInicio)} and deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      union all
      select 0 as valorcredito, sum(deus.valor) as valordebito from deus
      where debito=${conta}  and deus.dataliquid<${dataFirebird(dataInicio)} and deus.dataliquid>=(select contas.datasaldo from contas where contas.codigo=${conta})
      ) as uniao
     `
    console.log('sqlsaldo', sql);
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;


        db.detach(function () {
          res.send(result);
        });
      });
    });
  });


  routes.route('/SaldoConta')


  .get((req, res) => {
    console.log('estou no /SaldoConta')
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
     `
    console.log('sqlsaldo', sql);
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;


        db.detach(function () {
          res.send(result);
        });
      });
    });
  });


routes.route('/contas')


  .get((req, res) => {

    var parametroBusca = req.query.paramBusca;
    var projecao = req.query.projecao;
    var empresa = req.query.empresa;
    var codigoConta = req.query.codigoConta;


    if (parametroBusca == 1) {
      if (projecao == 1) {
        tipoSelect = ',C,'
      } else { tipoSelect = ',B,' }
      
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




    if (parametroBusca == 1000) { tipoSelect= ","+codigoConta+","}



    // BUSCA CONTAS PARA PAGMENTO DE TÍTULOS E DESPESAS SEPARADAS POR EMPRESA E TIPO PROJEÇÃO


    var sql = `
      select * from contas
      where (contas.ativo=1 and contas.tiposelect like ('%${tipoSelect}%') and contas.empresa=${empresa}) or (contas.ativo=1 and contas.tiposelect like ('%${tipoSelect}%') and  empresa is null)
      order by contas.descricao
     `
    console.log('sql', sql);
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;


        db.detach(function () {
          res.send(result);
        });
      });
    });
  });

routes.route('/pram')
  //buscas
  .get((req, res) => {
    var sql = `select * from param`
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {
          console.log('buscou param')
          res.send(result);
        });
      });
    });
  });

routes.route('/deus')


  .get((req, res) => {

    console.log('estou na rota /deus');
    var paremetro = req.query.param;
    var dataInicio = req.query.dataInicio;
    var dataFim = req.query.dataFim;
    var empresa = req.query.empresa;
    var conta = req.query.conta;
    var whereDeus = ``;

    if (paremetro == 1) { whereDeus = ` where uniao.tipolcto in ('E','D') and uniao.empresa=${empresa} and uniao.dataliquid is null and uniao.datavcto<=${dataFirebird(dataFim)} ` }
    if (paremetro == 2) { whereDeus = ` where ( uniao.empresa=${empresa} and uniao.credito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) or (uniao.empresa=${empresa} and uniao.debito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) ` }
    if (paremetro == 3) { whereDeus = ` where ( uniao.empresa=${empresa} and uniao.credito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) or (uniao.empresa=${empresa} and uniao.debito=${conta} and uniao.dataliquid >=${dataFirebird(dataInicio)}) ` }


    
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



routes.route('/deuslcto')

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
  
  `
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


routes.route('/Atualizadeuslcto')
  .post((req, res) => {
    console.log('estou aqui')


    var dados = req.body.dados;
    var sql = `execute block as begin `
    for (i = 0; i < dados.length; i++) {
      sql += ` update deus set deus.credito=${dados[i].CREDITO},
                                 deus.valor='${dados[i].VALOR}',
                                 deus.documento='${dados[i].DOCUMENTO}',
                                 deus.obs='${dados[i].OBS}',
                                 deus.dataliquid=${dataFirebird(dados[i].DATALIQUID)}

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

routes.route('/Deletedeus')
  .post((req, res) => {
    console.log('estou aqui')

    var codigo = req.body.codigo;
    var sql =
      ` delete from deus where deus.codigo=${codigo} `

    console.log('sql', sql)

    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {

          res.send(result);
        });
      });
    });
  });


routes.route('/Insertdeus')
  .post((req, res) => {
    console.log('estou no postInsertDeus')


    var dados = req.body.dados;

    var sql = `execute block as begin `
    for (i = 0; i < dados.length; i++) {

      sql += ` insert into deus  
        (CODDEC, CODPARC, CREDITO, DATAEMISSAO,DATALIQUID, DATAVCTO, DEBITO, DOCUMENTO, 
          EMPRESA,LCTO,OBS,PROJECAO,TIPOLCTO,VALOR,PERMITEAPAGA,TIPOOPERACAO) values
        (${dados[i].CODDEC},${dados[i].CODPARC},${dados[i].CREDITO},
          ${dataFirebird(dados[i].DATAEMISSAO)},${dataFirebird(dados[i].DATALIQUID)},${dataFirebird(dados[i].DATAVCTO)},${dados[i].DEBITO},
          '${dados[i].DOCUMENTO}',${dados[i].EMPRESA},${dados[i].LCTO},'${dados[i].OBS}',
          ${dados[i].PROJECAO},'${dados[i].TIPOLCTO}',${dados[i].VALOR},${dados[i].PERMITEAPAGA},${dados[i].TIPOOPERACAO});
          `
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


  routes.route('/deusGenerator')


  .get((req, res) => {

    console.log('estou na rota /deusGenerator');

    var sql = `
    select gen_id(gen_codigo_deus,0) from rdb$database
    `

    console.log('sql', sql)
    estoque.get(function (err, db) {
      if (err)
        throw err;
      db.query(sql, function (err, result) {
        if (err)
          throw err;
        db.detach(function () {
          console.log('buscou deusGenerator')
          res.send(result);
        });
      });
    });
  });







routes.route('/deuslcto')
  .get((req, res) => {
    var sql = `
    select * from deus where codparc=19662 and documento=   '167007-3'
    `
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(sql, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result[0]);
        });
      });
    });
  });


module.exports = routes;

