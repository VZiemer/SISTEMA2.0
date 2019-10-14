var Firebird = require('node-firebird');
var config = require('../models/config'); // get our config file
var estoque = Firebird.pool(15, config.FBestoque);

var express = require('express');
var router = express.Router();

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


router.route('/api/endereco').put(function (req, res) {
  let endereco = req.body.endereco;
  let query = `update LOCALIDADE set 
  ${endereco.TIPO ? ` TIPO='${endereco.TIPO}'` : ` `}
  ${endereco.APELIDO ? ',' : ''}
  ${endereco.APELIDO ? ` APELIDO='${endereco.APELIDO}'` : ` `}
  ${endereco.CODPARC ? ',' : ''}
  ${endereco.CODPARC ? ` CODPARC=${endereco.CODPARC}` : ` `}
  ${endereco.RESTRITO ? ',' : ''}
  ${endereco.RESTRITO ? ` RESTRITO=${endereco.RESTRITO}` : ` `}
  ${endereco.CODCIDADE ? ',' : ''}
  ${endereco.CODCIDADE ? ` CODCIDADE=${endereco.CODCIDADE}` : ` `}
  ${endereco.RUA ? ',' : ''}
  ${endereco.RUA ? ` LOGRADOURO='${endereco.RUA}'` : ` `}
  ${endereco.NUM ? ',' : ''}
  ${endereco.NUM ? ` NUMERO='${endereco.NUM}'` : ` `}
  ${endereco.BAIRRO ? ',' : ''}
  ${endereco.BAIRRO ? ` BAIRRO='${endereco.BAIRRO}'` : ` `}
  ${endereco.COMPLEMENTO ? ',' : ''}
  ${endereco.COMPLEMENTO ? ` COMPLEMENTO='${endereco.COMPLEMENTO}'` : ` `}
  ${endereco.REFERENCIA ? ',' : ''}
  ${endereco.REFERENCIA ? `  REFERENCIA='${endereco.REFERENCIA}'` : ` `}
  ${endereco.CONTATO ? ',' : ''}
  ${endereco.CONTATO ? ` CONTATO='${endereco.CONTATO}'` : ` `}
  ${endereco.FONE ? ',' : ''}
  ${endereco.FONE ? ` FONE='${endereco.FONE}'` : ` `}
  ${endereco.ATIVO ? ',' : ''}
  ${endereco.ATIVO ? ` ATIVO=${endereco.ATIVO}` : ` `}
   WHERE ID =${endereco.ID} `

  estoque.get(function (err, db) {
    if (err)
      throw (query);
    // db = DATABASE
    db.query(query, function (err, result) {
      if (err) throw (query);
      db.detach(function () {
        res.send(result);
      });
    });
  });
});
  
    module.exports.router = router;