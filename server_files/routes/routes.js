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



  routes.route('/deus')
  //buscas
  .get((req, res) => {
var sql = `select * from deus`
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

  routes.route('/deus/:id')
  //buscas
  .get((req, res) => {
    //Consulta ao firebird
    estoque.get(function (err, db) {
      if (err)
        throw err;
      // db = DATABASE
      db.query(`select * from deus where codigo = ${req.params.id}`, function (err, result) {
        // IMPORTANT: close the connection
        db.detach(function () {
          console.log('retornou', result)
          res.status(200).json(result[0]);
        });
      });
    });
  });


module.exports = routes;

