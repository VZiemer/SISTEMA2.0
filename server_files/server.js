


// bibliotecas necessárias para o node
var http = require('http');


const secret = 'abcdefg';
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	password = 'd6F3Efeq';

function encrypt(text) {
	var cipher = crypto.createCipher(algorithm, password)
	var crypted = cipher.update(text, 'utf8', 'hex')
	crypted += cipher.final('hex');
	return crypted;
}

function decrypt(text) {
	var decipher = crypto.createDecipher(algorithm, password)
	var dec = decipher.update(text, 'hex', 'utf8')
	dec += decipher.final('utf8');
	return dec;
}
var fs = require('fs');
//biblioteca de envio de email
var nodemailer = require('nodemailer');
//geração de pdf
var pdf = require('html-pdf');
var path = require('path');
var express = require('express');
// var session = require('express-session');
var request = require('request');
var iconv = require("iconv-lite");
var url = require('url');
var cookieParser = require('cookie-parser');
var urlencode = require('urlencode');
var options = {};
var app = express();
var formidable = require('express-formidable');

var server = http.createServer(app);
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
var bodyParser = require('body-parser');
var Firebird = require('node-firebird');
var config = require('./models/config'); // get our config file

// alteração de emergência

var estoque = Firebird.pool(15, config.FBestoque);

// Get a free pool


// Destroy pool
// pool.destroy();


xml2js = require('xml2js');
var builder = require('xmlbuilder');
var parser = new xml2js.Parser({
	ignoreAttrs: false,
	mergeAttrs: true,
	attrkey: null
});
//conexão mongoose
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// var User   = require('./models/user'); // get our mongoose model
// =======================
// configuration =========
// =======================

app.set('superSecret', config.secret); // secret variable
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());


// use morgan to log requests to the console
// app.use(morgan('dev'));
app.use(cookieParser());
// app.use(session({secret: "Shh, its a secret!"}));
// var sess; //variável de sessão
// =======================
// routes ================
// =======================

// estático, acesso ás bibliotecas do sistema.
// __parentDir = path.dirname(module.parent.filename);
app.use('/', express.static(__dirname + '/dist'));

// roteamento de páginas (vinculado ao index).
app.get('/app/reservas', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/reserva/Reserva.html');
});
app.get('/app/historicovendas', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/HistoricoVendas.html');
});
app.get('/app/inicio', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/inicio.html');
});
app.get('/app/Produto', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/produto/produto.html');
});
app.get('/app/CalculoComissao', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/comissao/comissao.html');
});
app.get('/app/configAcesso', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/configAcesso.html');
});
app.get('/app/entrega', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/entrega/Entrega.html');
});
app.get('/app/gersite', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/GerSite.html');
});
app.get('/app/prodreserva', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/produtoReserva/ProdutoReserva.html');
});
app.get('/app/ordem', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/Ordem.html');
});
app.get('/app/produtos', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/Produto.html');
});
app.get('/app/pedidolocal', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/PedidosLocal.html');
});
// app.get('/app/carrinho', function (req, res) {
// 	res.sendFile(__dirname + '/dist/templates/Carinho.html');
// });
app.get('/app/cliente', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/parceiro/Parceiro.html');
});
app.get('/app/dash', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/Dashboard.html');
});
app.get('/app/entrada', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/entrada/Entrada.html');
});
app.get('/app/entradanota', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/entranota/entranota.html');
});
app.get('/app/compra', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/compra/compra.html');
});
app.get('/app/margem', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/margem/margem.html');
});
app.get('/app/inv', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/inventario.html');
});
app.get('/app/CadastroFinanceiro', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/CadastroFinanceiro.html');
});
app.get('/app/metas', function (req, res) {
	res.sendFile(__dirname + '/dist/templates/metas/metas.html');
});


// cadastro de novo computador
app.post('/app/cadastracomputador', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from computadores where nome=?", req.body.busca, function (err, result) {
			if (result.length) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json({
						cadastro: '',
						mensagem: 'já existe o nome escolhido'
					})
				});
			} else {
				db.query("insert into computadores (nome,local) values (?,?) returning ID", [req.body.busca, req.body.local], function (err, result) {
					if (err) throw err;
					var resposta = encrypt(req.body.busca);
					db.detach(function () {
						res.json({
							cadastro: resposta,
							mensagem: 'dispositivo cadastrado com sucesso'
						})
					});
				})
			}
		});
	});

})




//leitor de inventário
app.post('/inventario', function (req, res) {
	var auth = req.headers['authorization'];
	if (auth) {
		auth = decrypt(auth);
	}
	// res.send(auth)

	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select c.nome,c.id ,c.liberado, e.codbar from computadores c left join endereco e on e.computador = c.id	where c.nome=?", auth, function (err, result1) {
			if (err)
				throw err;
			// res.send(result1[0])
			if (result1.length) {
				if (result1[0].LIBERADO == 1) {
					let retorno = {};
					retorno.data = new Date().toLocaleDateString();
					retorno.hora = new Date().toLocaleTimeString('en-US', {
						hour12: false
					})
					if (!req.body.qr) {
						retorno.err = 'SEM LEITURA';
					}
					else if (req.body.qr.slice(0, 1) == 'A' && !req.body.endereco) {
						retorno.err = 'LEIA O ENDEREÇO';
					}
					else if (req.body.qr.slice(0, 1) == 'A' && req.body.endereco == result1[0].CODBAR) {
						// db = DATABASE
						db.query("select * from pacote where codbar = ?", [req.body.qr], function (err, result) {
							if (result.length && (result[0].SITUACAO != '16' && result[0].SITUACAO != '17' && result[0].SITUACAO != '99' && result[0].SITUACAO != '1')) {
								retorno.codbar = result[0].CODBAR;
								retorno.endereco = result1[0].CODBAR;
								retorno.qtd = result[0].QTD;
								retorno.descricao = result[0].DESCRICAO;
								retorno.un = result[0].UNIDADE;
								retorno.err = 'Pacote incorreto, chame o suporte';
								retorno.info = '';
								db.detach(function () {
									res.send(retorno);
								});
							} else if (result.length && result[0].ID_ENDERECO == req.body.endereco && result[0].SITUACAO != '99') {
								retorno.codbar = result[0].CODBAR;
								retorno.lista = [];
								retorno.qtd = result[0].QTD;
								retorno.endereco = result1[0].CODBAR;
								retorno.descricao = result[0].DESCRICAO;
								retorno.un = result[0].UNIDADE;
								retorno.err = '';
								retorno.info = '';
								db.query("update pacote set situacao = 17 where codbar = ? and situacao=16", [req.body.qr], function (err, result) {
									db.detach(function () {
										res.send(retorno);
									});
								});
							} else if (result.length && result[0].ID_ENDERECO != result1[0].CODBAR) {
								retorno.codbar = result[0].CODBAR;
								retorno.lista = [];
								retorno.qtd = result[0].QTD;
								retorno.endereco = result1[0].CODBAR;
								retorno.descricao = result[0].DESCRICAO;
								retorno.un = result[0].UNIDADE;
								retorno.err = '';
								retorno.info = '';
								db.query("update pacote set situacao = 17,id_endereco=? where codbar = ?", [result1[0].CODBAR, req.body.qr], function (err, result1) {
									db.query("insert into inventario (data,hora,id_pacote,id_endereco,codbar,qtd,descricao,erro) values (current_date,current_time,?,?,?,?,?,'ENDEREÇO ERRADO')", [result[0].ID_PACOTE, result[0].ID_ENDERECO, req.body.qr, result[0].QTD, result[0].DESCRICAO], function (err, result) {
										db.detach(function () {
											res.send(retorno);
										});
									});
								});
							} else if (result.length && result[0].SITUACAO == 99) {
								retorno.codbar = result[0].CODBAR;
								retorno.lista = [];
								retorno.qtd = result[0].QTD;
								retorno.descricao = result[0].DESCRICAO;
								retorno.endereco = req.body.endereco;
								retorno.un = result[0].UNIDADE;
								retorno.err = '';
								retorno.info = 'pacote encontrado';
								db.query("update pacote set situacao = 17,id_endereco=? where codbar = ?", [result1[0].CODBAR, req.body.qr], function (err, result1) {
									db.query("delete * from inventario where codbar=?", [req.body.qr], function (err, result) {
										db.detach(function () {
											res.send(retorno);
										});
									});
								});
							} else {
								retorno.err = 'pacote inexistente';
								// IMPORTANT: close the connection
								db.detach(function () {
									res.send(retorno);
								});
							}
						});

					}
					else if (req.body.qr.slice(0, 1) == 'E') {
						if (result1[0].CODBAR && req.body.qr !== result1[0].CODBAR) {
							retorno.err = 'termine ' + result1[0].CODBAR;
							db.detach(function () {
								res.send(retorno);
							})
						}
						else if (req.body.endereco && req.body.endereco === req.body.qr) {
							retorno.endereco = '';
							retorno.lista = [];
							retorno.codbar = '';
							retorno.qtd = '';
							retorno.descricao = '';
							retorno.un = '';
							retorno.info = '';
							retorno.err = '';
							db.query("update endereco set status_inventario = 2,computador=null where codbar = ? returning status_inventario", [req.body.qr], function (err, result2) {
								if (result2.STATUS_INVENTARIO == 2) {
									retorno.endereco = req.body.qr;
									retorno.info = 'finalizado';
									db.detach(function () {
										res.send(retorno);
									});
								}
								else if (result2.STATUS_INVENTARIO == 1) {
									db.query("select ID_PRODUTO,QTD,UNIDADE,DESCRICAO,CODBAR frOm pacote where SITUACAO=16 AND id_endereco=?", [req.body.qr], function (err, result3) {
										retorno.endereco = req.body.qr;
										retorno.err = 'PACOTES FALTANTES';
										retorno.lista = result3;
										db.detach(function () {
											res.send(retorno);
										});
									})
								}



							});
						} else if (req.body.endereco && req.body.endereco !== req.body.qr) {
							retorno.err = 'termine o endereço atual';
							retorno.codbar = '';
							retorno.lista = [];
							retorno.endereco = '';
							retorno.qtd = '';
							retorno.descricao = '';
							retorno.un = '';
							retorno.info = '';
							res.send(retorno);
						} else {
							estoque.get(function (err, db) {
								if (err)
									throw err;
								// db = DATABASE
								db.query("select * from endereco where codbar = ?", [req.body.qr], function (err, result) {
									if (result.length && result[0].STATUS_INVENTARIO == 0) {
										retorno.endereco = result[0].CODBAR;
										retorno.err = '';
										retorno.codbar = '';
										retorno.lista = [];
										retorno.qtd = '';
										retorno.descricao = '';
										retorno.un = '';
										retorno.info = '';
										db.query("update endereco set status_inventario = 1,computador=? where codbar = ?", [result1[0].ID, req.body.qr], function (err, result1) {
											db.detach(function () {
												res.send(retorno);
											});
										});
									} else if (result.length && result[0].STATUS_INVENTARIO == 1 && result[0].COMPUTADOR != result1[0].ID) {
										retorno.endereco = result[0].CODBAR;
										retorno.err = "endereço de outro computador";
										retorno.info = '';
										res.send(retorno);
									} else if (result.length && result[0].STATUS_INVENTARIO == 1 && result[0].COMPUTADOR == result1[0].ID) {
										retorno.endereco = result[0].CODBAR;
										retorno.info = "continue o endereço";
										retorno.err = '';
										res.send(retorno);
									} else if (result.length && result[0].STATUS_INVENTARIO == 2) {
										retorno.err = "endereço já conferido";
										retorno.codbar = '';
										retorno.qtd = '';
										retorno.descricao = '';
										retorno.lista = [];
										retorno.un = '';
										retorno.info = '';
										res.send(retorno);
									} else {
										retorno.err = 'endereço inexistente';
										retorno.endereco = '';
										retorno.codbar = '';
										retorno.lista = [];
										retorno.qtd = '';
										retorno.descricao = '';
										retorno.un = '';
										retorno.info = '';
										// IMPORTANT: close the connection
										db.detach(function () {
											res.send(retorno);
										});
									}

								});
							});
						}

					} else {
						retorno.err = 'CODIGO INCORRETO';
						res.send(retorno);
					};

				} else {
					db.detach(function () {
						res.send({
							err: 'Dispositivo Bloqueado'
						});
					});
				}
			} else {
				db.detach(function () {
					res.send({
						success: false,
						message: 'Dispositivo Não Encontrado'
					});
				});
			}
		})
	});


});


// API ROUTES -------------------
// get an instance of the router for api routes
var apiRoutes = express.Router();
// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)
// TODO: route middleware to verify a token
apiRoutes.post('/authenticate', function (req, res) {
	var auth = req.headers['authorization'];
	if (auth) {
		auth = decrypt(auth);
	}
	// else { decrypted = 'deu errado'}
	// find the user
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from computadores where nome=?", auth, function (err, result) {
			if (err)
				throw err;
			if (result.length) {
				if (result[0].LIBERADO == 1) {
					db.detach(function () {
						validausuario('dispositivo liberado')
					});
				} else {
					db.detach(function () {
						res.json({
							success: false,
							message: 'Dispositivo Bloqueado'
						});
					});
				}
			} else {
				db.detach(function () {
					res.json({
						success: false,
						message: 'Dispositivo Não Encontrado'
					});
				});
			}
		});
	});

	function validausuario(computador) {

		estoque.get(function (err, db) {
			if (err)
				throw err;
			// db = DATABASE
			db.query("select * from usuario where usuario=?", req.body.name, function (err, result) {

				user = result[0];
				if (err)
					throw err;
				if (user && user.SENHA == req.body.password) {

					// se o usuário existe e a senha estiver correta,
					// cria o token
					var token = jwt.sign("vanius", app.get('superSecret'), {
						expiresInMinutes: 1440 // expires in 24 hours
					});
					// Retorna os parametros do usuário e o token de acesso
					// IMPORTANT: fecha a conexão com o Firebird
					db.detach(function () {
						res.json({
							success: true,
							dispositivo: computador,
							message: 'Acesso Liberado',
							token: token,
							admin: user.ADMIN,
							name: user.NOME,
							cod: user.CODFUNC,
							menu: {
								Reserva: user.RESERVA_VER,
								Ordem: user.ORDEM_VER,
								Produto: true,
								Prod_Reserva: user.PRODRESERVA_VER,
								Cliente: user.CLIENTE_VER,
								Localdecor: user.LOCALDECOR_VER,
								Entrada: user.ENTRADA_VER,
								Entrega: user.ENTREGA_VER,
								Notas: user.NOTAS_VER
							},
							Reserva: {
								Atualiza: true,
								Imprime: user.RESERVA_IMPRIME,
								Cancela: user.RESERVA_CANCELA,
								Registra: user.RESERVA_REGISTRA,
								EntraEstoque: user.RESERVA_ENTRAESTOQUE,
								EntraReserva: user.RESERVA_ENTRARESERVA,
								EntraTransporte: user.RESERVA_ENTRATRANSPORTE,
								EntregaPedido: user.RESERVA_ENTREGAPEDIDO,
								LiberaSeparacao: user.RESERVA_LIBERASEPARACAO,
								ImprimeEstoque: user.RESERVA_IMPRIMEESTOQUE,
								FiltraVendedor: user.RESERVA_FILTRAVENDEDOR
							},
							Notas: {
								Entradas: user.NOTAS_ENTRADA,
								Saida: user.NOTAS_SAIDA,
								Cte: user.NOTAS_CTE,
								EntraNota: user.NOTAS_ENTRANOTA
							},
							Cliente: {
								Pesquisa: user.CLIENTE_PESQUISA,
								Cadastra: user.CLIENTE_CADASTRA,
								Edita: user.CLIENTE_EDITA,
								Pesquisa_vendas: user.CLIENTE_PESQUISAVENDAS,
								Pesquisa_Historico: user.CLIENTE_PESQUISAHISTORICO
							},
							Entrada: {
								Checar: user.ENTRADA_CHECAR,
								Entra_Generico: user.ENTRADA_GENERICO
							}
						})
					});
				}
				else if (user && !user.SENHA) {

					// se o usuário existe e a senha estiver correta,
					// cria o token
					var token = jwt.sign("vanius", app.get('superSecret'), {
						expiresInMinutes: 1440 // expires in 24 hours
					});
					// Retorna os parametros do usuário e o token de acesso
					// IMPORTANT: fecha a conexão com o Firebird
					db.detach(function () {
						res.json({
							success: true,
							dispositivo: computador,
							message: 'Nova Senha',
							token: token,
							admin: user.ADMIN,
							name: user.NOME,
							cod: user.CODFUNC,
							menu: {
								Reserva: user.RESERVA_VER,
								Ordem: user.ORDEM_VER,
								Produto: true,
								Prod_Reserva: user.PRODRESERVA_VER,
								Cliente: user.CLIENTE_VER,
								Localdecor: user.LOCALDECOR_VER,
								Entrada: user.ENTRADA_VER,
								Entrega: user.ENTREGA_VER
							},
							Reserva: {
								Atualiza: true,
								Imprime: user.RESERVA_IMPRIME,
								Cancela: user.RESERVA_CANCELA,
								Registra: user.RESERVA_REGISTRA,
								EntraEstoque: user.RESERVA_ENTRAESTOQUE,
								EntraReserva: user.RESERVA_ENTRARESERVA,
								EntraTransporte: user.RESERVA_ENTRATRANSPORTE,
								EntregaPedido: user.RESERVA_ENTREGAPEDIDO,
								LiberaSeparacao: user.RESERVA_LIBERASEPARACAO,
								ImprimeEstoque: user.RESERVA_IMPRIMEESTOQUE,
								FiltraVendedor: user.RESERVA_FILTRAVENDEDOR
							},
							Cliente: {
								Pesquisa: user.CLIENTE_PESQUISA,
								Cadastra: user.CLIENTE_CADASTRA,
								Edita: user.CLIENTE_EDITA,
								Pesquisa_vendas: user.CLIENTE_PESQUISAVENDAS,
								Pesquisa_Historico: user.CLIENTE_PESQUISAHISTORICO
							},
							Entrada: {
								Checar: user.ENTRADA_CHECAR
							}
						})
					});

				}
				else if (user && user.SENHA != req.body.password) {
					db.detach(function () {
						res.json({
							success: false,
							message: 'Senha inválida'
						});
					});
				} else {
					db.detach(function () {
						res.json({
							success: false,
							message: 'Falha na autenticação. Usuário não encontrado.'
						});
					});
				}
			});
		});




	}

});
// route middleware to verify a token
apiRoutes.use(function (req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	// var token =1;
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function (err, decoded) {
			if (err) {
				return res.json({
					success: false,
					message: 'Failed to authenticate token.'
				});
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}
});



//novo
const routes = require('./routes/routes');


app.use('/rotas', routes)

app.get('/pacote', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select descricao from pacote where codbar=?", [req.body.codbar], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result[0].DESCRICAO);
			});
		});
	});
});




//conexão FC
app.get('/carrinho', function (req, res) {
	var link = '';
	if (req.body.dados.origem) {
		link = 'https://www.localdecor.com.br/AddMult.asp?IDLoja=11058&origem=' + req.body.dados.origem;
	} else {
		link = 'https://www.localdecor.com.br/AddMult.asp?IDLoja=11058';
	}

	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select pv.codpro,pv.qtd,idsite,idsite_pai from prodvenda pv join produto on pv.codpro = produto.codigo where codvenda = ?", [req.body.dados.p], function (err, result) {
			var texto = '<input type="hidden" name="IDLoja" value="11058"><input type="hidden" name="PostMult" value="True">'
			for (i = 0; i < result.length; i++) {
				if (!result[i].IDSITE) {
					result[i].IDSITE = result[i].IDSITE_PAI
				}
				texto += '<input type="hidden" name="QTIncMult_' + (i + 1) + '_' + result[i].IDSITE + '" value="' + result[i].QTD + '">'
			}
			body = '<body onload="document.FormMult.submit();">';
			body += '<form name="FormMult" method="POST" action="' + link + '" id="form">' + texto + '</form>';
			body += '<center><span id="idRecoverOrderFC" class="RecoverOrder">'
			body += '<a href="#na" onclick="document.FormMult.submit();"><br><br>...Aguarde, Carregando carrinho</a><br><br><br>'
			body += '</span></center></body>'
			db.detach(function () {
				res.end(body);
			});
		});
	});

});
app.get('/aventos', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'text/plain');
	var centro = [];
	var lista = [{
		'min': 480,
		'max': 1500,
		'modelo': '20K2300.05'
	},
	{
		'min': 3200,
		'max': 9000,
		'modelo': '20K2900.05'
	},
	{
		'min': 750,
		'max': 2500,
		'modelo': '20K2500.05'
	}
	];
	var fator = req.query.p * req.query.h;
	for (i = 0; i < lista.length; i++) {
		if (lista[i].min < fator && fator < lista[i].max) {
			centro.push({
				'centro': Math.abs((lista[i].max + lista[i].min) / 2 - fator),
				'modelo': lista[i].modelo
			});
		};
	};
	if (centro.length) {
		res.send(centro.sort(function (a, b) {
			return a.centro - b.centro
		}));
	} else {
		res.send("nenhum modelo atende as especificações");
	}	// res.send (centro.sort(function(a, b){return a.centro-b.centro})[0].modelo);
});

// tela de login

apiRoutes.post('/cadastranovasenha', function (req, res) {
	var busca = req.body.busca;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("update usuario set senha=? where nome=? returning nome", [busca.novasenha, busca.nome], function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

//tela de pesquisa
apiRoutes.post('/pesquisavendedor', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codigo,nome from func where codigo=?";
	} else if (busca.NOME) {
		sql = "select codigo,nome from func where ";
		var termos = busca.NOME.toUpperCase().split("?");
		if (busca.NOME.charAt(0) == "?") {
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
	} else {
		return []
	};
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, termos, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});


apiRoutes.post('/pesquisagrupo', function (req, res) {
	var busca = req.body.busca;

	if (busca.CODFAIXA) {
		var termos = busca.CODFAIXA;
		sql = "select * from grupoprod  where grupoprod.codfaixa=? order by grupoprod.descricao";
	}

	else if (busca.DESCRICAO) {
		sql = "select * from grupoprod  where ";
		var termos = busca.DESCRICAO.toUpperCase().split("?");
		if (busca.DESCRICAO.charAt(0) == "?") {
			sql += "grupoprod.descricao containing ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and grupoprod.descricao containing ? ";
			}
		} else {
			sql += "grupoprod.descricao starting with ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and grupoprod.descricao containing ? ";
			}
		}

		sql += " order by grupoprod.descricao"
	}

	else {
		return []
	};
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, termos, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});


apiRoutes.post('/pesquisaproduto', function (req, res) {
	var busca = req.body.busca;
	var sqlForn = '';
	var sqlVend = '';
	var sqlProdfiscal = '';
	if (busca.CODFORN) {
		sqlForn = 'and CODFORN = ' + busca.CODFORN;
	}
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select meta.descricao as descricaometa,  produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' " + sqlForn + " and produto.codigo=? order by produto.descricao";
	}
	else if (busca.CODINTERNO) {
		sql = "select meta.descricao as descricaometa, produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' " + sqlForn + " " + sqlVend + "  and ";
		var termos = busca.CODINTERNO.toUpperCase().split("?");
		if (busca.CODINTERNO.charAt(0) == "?") {
			sql += "produto.codinterno containing ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.codinterno containing ? ";
			}
		} else {
			sql += "produto.codinterno starting with ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.codinterno containing ? ";
			}
		}

		sql += " order by produto.descricao"
	}
	else if (busca.DESCRICAO) {
		sql = "select meta.descricao as descricaometa, produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' " + sqlForn + " " + sqlVend + "  and ";
		var termos = busca.DESCRICAO.toUpperCase().split("?");
		if (busca.DESCRICAO.charAt(0) == "?") {
			sql += "produto.descricao containing ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.descricao containing ? ";
			}
		} else {
			sql += "produto.descricao starting with ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.descricao containing ? ";
			}
		}

		sql += " order by produto.descricao"
	}
	else if (busca.PRODFISCAL) {
		var termos = busca.PRODFISCAL;
		sql = "select meta.descricao as descricaometa, produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' " + sqlForn + " and produto.codigo_fiscal=? order by produto.descricao";
	}
	else {
		return []
	};
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, termos, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

apiRoutes.post('/pesquisaprodutofiscal', function (req, res) {
	var busca = req.body.busca;
	var sqlForn = '';
	var sqlVend = '';
	var sqlProdfiscal = '';
	if (busca.CODFORN) {
		sqlForn = 'and CODFORN = ' + busca.CODFORN;
	}
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select meta.descricao as descricaometa,  produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' " + sqlForn + " and produto.codigo=? order by produto.descricao";
	}
	else if (busca.CODINTERNO) {
		sql = "select meta.descricao as descricaometa, produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' and produto.codigo=produto.codigo_fiscal " + sqlForn + " " + sqlVend + "  and ";
		var termos = busca.CODINTERNO.toUpperCase().split("?");
		if (busca.CODINTERNO.charAt(0) == "?") {
			sql += "produto.codinterno containing ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.codinterno containing ? ";
			}
		} else {
			sql += "produto.codinterno starting with ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.codinterno containing ? ";
			}
		}

		sql += " order by produto.descricao"
	}
	else if (busca.DESCRICAO) {
		sql = "select meta.descricao as descricaometa, produto.codigo as codpro, produto.*, cliente.razao, cliente.razao as fornecedor from produto full outer join meta on meta.codigo=produto.meta join cliente on cliente.codigo=produto.codparc where produto.ativo='S' and produto.codigo=produto.codigo_fiscal " + sqlForn + " " + sqlVend + "  and ";
		var termos = busca.DESCRICAO.toUpperCase().split("?");
		if (busca.DESCRICAO.charAt(0) == "?") {
			sql += "produto.descricao containing ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.descricao containing ? ";
			}
		} else {
			sql += "produto.descricao starting with ? ";
			for (i = 1; i < termos.length; i++) {
				sql += " and produto.descricao containing ? ";
			}
		}

		sql += " order by produto.descricao"
	}
	else {
		return []
	};
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, termos, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});



apiRoutes.post('/pesquisacgc', function (req, res) {
	var busca = req.body.busca;
	var termos = busca.CGC;
	sql = "select codigo,razao from cliente where cgc=?";
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, termos, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

apiRoutes.post('/pesquisacliente', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codigo,razao,liberafat from cliente where codigo=?";
	} else {
		sql = "select codigo,razao,liberafat from cliente where ativo = 'S' and ";
		var termos = busca.RAZAO.toUpperCase().split("?");
		if (busca.RAZAO.charAt(0) == "?") {
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





apiRoutes.post('/pesquisaparceiro', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codgrupo,codigo,razao,estado from cliente where  codigo=?";
	} else {
		sql = "select codgrupo,codigo,razao,estado from cliente where ";
		var termos = busca.RAZAO.toUpperCase().split("?");
		if (busca.RAZAO.charAt(0) == "?") {
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
				res.send(result);
			});
		});
	});
});

apiRoutes.post('/pesquisafornecedor', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codgrupo,codigo,razao,estado from cliente where fornec='S' and codigo=?";

	} else {
		sql = "select codgrupo,codigo,razao,estado from cliente where fornec='S' and ";
		var termos = busca.RAZAO.toUpperCase().split("?");
		if (busca.RAZAO.charAt(0) == "?") {
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
				res.send(result);
			});
		});
	});
});

apiRoutes.post('/pesquisatransportadora', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codgrupo,codigo,razao,estado from cliente where transp='S' and codigo=?";
	} else {
		sql = "select codgrupo,codigo,razao,estado from cliente where transp='S' and ";
		var termos = busca.RAZAO.toUpperCase().split("?");
		if (busca.RAZAO.charAt(0) == "?") {
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
				res.send(result);
			});
		});
	});
});

apiRoutes.post('/pesquisaempresa', function (req, res) {
	var busca = req.body.busca;
	if (busca.CODIGO) {
		var termos = busca.CODIGO;
		sql = "select codigo,razao,nomesys from param where codigo=?";
	} else {
		sql = "select codigo,razao,nomesys from param where  ";
		var termos = busca.RAZAO.toUpperCase().split("?");
		if (busca.RAZAO.charAt(0) == "?") {
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
				res.send(result);
			});
		});
	});
});





//Lista Campanhas em andamento

apiRoutes.post('/ListaCampanhas', function (req, res) {
	// descrição de variávies;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select meta.codigo, meta.descricao, meta.datainicio, meta.datafim, meta.tipo, sum(0) from meta join metaparc on metaparc.codmeta=meta.codigo where metaparc.posicao is null group by  meta.codigo, meta.descricao, meta.datainicio, meta.datafim, meta.tipo order by  meta.codigo", function (err, result) {
			if (err)
				throw err;
			db.detach(function () { res.send(result) });
		});
	});
})


//Aplica Campanhas nos produtos

apiRoutes.post('/AplicaCampanha', function (req, res) {
	meta = req.body.meta;
	ListaCodPro = req.body.ListaCodPro;

	var sql = "update produto set meta = " + meta + " where produto.codigo in (" + ListaCodPro + ")"
	estoque.get(function (err, db) {
		if (err) throw err;
		db.execute(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () { res.send(result) });
		});
	});
})

//Altera conversor das notas de entrada

apiRoutes.post('/AlteraConversorNota', function (req, res) {
	// descrição de variávies;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("update produto set conversornota = ? where codigo = ?", [req.body.valor, req.body.id], function (err, result) {
			if (err)
				throw err;
			db.detach(function () { res.send(result) });
		});
	});

})

//Altera Codigo interno na entrada da nota

apiRoutes.post('/AlteraCodinterno', function (req, res) {
	estoque.get(function (err, db) {
		if (err) throw err;
		db.query("update produto set codinterno = ? where codigo = ?", [req.body.valor, req.body.id], function (err, result) {
			if (err)
				throw err;
			db.detach(function () { res.send(result) });
		});
	});

})





//tela consulta nota de entrada

apiRoutes.post('/ConsultaNota', function (req, res) {
	if (req.body.codforn) {
		var sql1 = "select * from notasfiscais where codgrupo=" + req.body.codforn + " and  notasfiscais.data > currentdate-30 ORDER BY DATA DESC"
	}

	if (!req.body.codforn) {
		var sql1 = "select * from notasfiscais where notasfiscais.data > current_date-30"
	}


	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql1, function (err, result) {
			db.detach(function () {
				res.send(result)
			});
		});
	});


})

//tela consulta CTE transporte

apiRoutes.post('/ConsultaCte', function (req, res) {
	estoque.get(function (err, db) {
		if (req.body.codgrupo) {
			var sql1 = "select cte.*,(select fantasia from cliente where codigo= cte.emitente)as razaoemitente,(select fantasia from cliente where codigo= cte.remetente)as razaoremetente, (select fantasia from cliente where codigo= cte.destinatario)as razaodestinatario from cte join cliente on cliente.codigo=cte.emitente where cliente.codgrupo=" + req.body.codgrupo + "order by cte.emissao desc"
		}
		if (req.body.LCTO) {
			var sql1 = "select cte.*, (select fantasia from cliente where codigo=cte.emitente) as razaoemitente,(select fantasia from cliente where codigo=cte.remetente) as razaoremetente,(select fantasia from cliente where codigo=cte.destinatario) as razaodestinatario,(select fantasia from cliente where codigo=cte.tomador) as razaotomador from cte where lcto=" + req.body.LCTO;
			var sql2 = "SELECT chave as chavenota FROM chavecte where chavecte.lctocte=" + req.body.LCTO;
		}
		if (err) throw err;
		db.query(sql1, function (err, result1) {
			if (req.body.LCTO) {
				db.query(sql2, function (err, result2) {
					db.detach(function () { res.send([result1[0], result2]) });
				});
			}
			else {
				db.detach(function () { res.send(result1) });
			};
		});
	});
})

apiRoutes.post('/carregaProdutosNota', function (req, res) {
	// descrição de variávies;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		var sql = "SELECT prodent.produto,  produto.codinterno,  produto.descricao, prodent.qtd,  prodent.valor  FROM prodent join produto on produto.codigo = prodent.produto WHERE EMPRESA = ? AND LCTOENTRADA = ?"
		db.query(sql, [req.body.empresa, req.body.lctoNota], function (err, result) {
			db.detach(function () { res.send(result) });
		});
	});

})

apiRoutes.post('/CarregaPedidoEntrada', function (req, res) {

	var tipoDevolucao = req.body.tipoDevolucao

	if (req.body.parametro == 1) {
		sql = `

        select uniao.codpro, produto.codinterno, produto.descricao, sum(uniao.qtd) as qtd, produto.unidade,  produto.prcompra as valor,  uniao.tipo, null as codprodvenda, null as codvend, null as defeito from (
		select prodcompra.codpro, sum( prodcompra.tipo) as tipo, sum(qtd)as qtd from prodcompra
		where prodcompra.empresa=${req.body.empresa} and prodcompra.codparc=${req.body.codparc} and prodcompra.tipo=0
		group by prodcompra.codpro, prodcompra.tipo
		union
		select produto.codigo as codpro,0 as tipo, 0 as qtd from produto
		where produto.codparc=${req.body.codparc} and produto.ativo='S' and produto.tipo=1) as uniao
		join produto on produto.codigo=uniao.codpro
		group by uniao.codpro, produto.codinterno, produto.descricao,  produto.unidade,  produto.prcompra, uniao.tipo

		`
	}

	if (req.body.parametro == 2) {
		sql = `

		select uniao.codpro, produto.codinterno, produto.descricao, sum(uniao.qtd) as qtd, produto.unidade,  produto.prcompra as valor, 0 as tipo, null as codprodvenda, null as codvend, null as defeito from (select prodcompra.codpro,  sum(prodcompra.qtd) as qtd from prodcompra
		where prodcompra.empresa= ${req.body.empresa} and  prodcompra.tipo=0  and prodcompra.codpro in (${req.body.ProdSelecionado})
		group by prodcompra.codpro
		union
		select produto.codigo, 0 as qtd from produto
		where produto.ativo='S' and produto.tipo=1 and produto.codigo in (${req.body.ProdSelecionado}) ) as uniao
		join produto on produto.codigo=uniao.codpro
		group by uniao.codpro, produto.codinterno, produto.descricao,  produto.unidade,  produto.prcompra,  produto.tipo


		`
	}

	if (req.body.parametro == 3) {

		sql = `

        select prodcompra.codigo,  prodcompra.codpro, prodcompra.qtd, produto.codinterno, produto.descricao, produto.unidade,  prodcompra.valor ,  prodcompra.tipo, prodcompra.codprodvenda, prodcompra.codvend, prodcompra.defeito from prodcompra

        join produto on produto.codigo=prodcompra.codpro
        where prodcompra.empresa=${req.body.empresa} and prodcompra.codparc=${req.body.codparc} and prodcompra.tipo=${tipoDevolucao}
		`
	}









	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, [req.body.codparc], function (err, result) {
			db.detach(function () { res.send(result) });
		});
	});

})

// Carrega Lista de Vendas
apiRoutes.post('/CarregaListaVendasIni', function (req, res) {
	DataFim = dataFirebird(req.body.DataFim);
	DataInicio = dataFirebird(req.body.DataInicio);


	var sql = "select * from lista_vendas_realizadas('" + DataFim + "','" + DataInicio + "') ";



	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});

});

// Carrega Lista de produtos
apiRoutes.post('/CarregaListaProdutosIni', function (req, res) {
	listaCodpro = req.body.listaCodpro;
	DataFim = dataFirebird(req.body.DataFim);
	DataInicio = dataFirebird(req.body.DataInicio);

	if (!listaCodpro) {
		var sql = "select * from lista_produtos_vendidos('" + DataFim + "','" + DataInicio + "') ";
	}

	if (listaCodpro) {
		var sql = "select * from lista_produtos_vendidos('" + DataFim + "','" + DataInicio + "') where codpro in (" + listaCodpro + ") ";
	}


	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});

});


// Carrega Venda
apiRoutes.post('/SrvCarregaVenda', function (req, res) {
	var lcto = req.body.lcto;
	sql = " select uniao.*, uniao.prpromo as descontoloja, (uniao.desctotal-uniao.prpromo) as descontoextra  from( select produto.codinterno,produto.descricao, produto.unidade, prodvenda.codpro, (prodvenda.valorini-prodvenda.valor) as desctotal, (case when (case when prodvenda.prpromo is null then 0 else prodvenda.prpromo end) = 0 then 0 else case when (prodvenda.valorini-prodvenda.valor)>(prodvenda.valorini-prodvenda.prpromo)then (prodvenda.valorini-prodvenda.prpromo) else (prodvenda.valorini-prodvenda.valor) end end) as prpromo,prodvenda.qtd,prodvenda.valor,prodvenda.valorini,prodvenda.prcusto from prodvenda join produto on produto.codigo=prodvenda.codpro where codvenda=" + lcto + ") as uniao";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});

});
// Carrega tela inicial de gerencia de produtos
apiRoutes.post('/CarregaTelaProdutosGerencia', function (req, res) {
	var listaCodpro = req.body.listaCodpro;
	sql = " select meta.descricao as descricaometa, produto.codigo as codpro, produto.* from produto full outer join meta on meta.codigo = produto.meta where produto.codigo in(" + listaCodpro + ")";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// Carrega tela inicial de gerencia de produtos
apiRoutes.post('/ListaProdCodfiscal', function (req, res) {
	var codfiscal = req.body.codFiscal;
	sql = "select PRODUTO.* from produto where ativo='S' and codigo_fiscal=" + codfiscal;
	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// Altera Lista de produtos
apiRoutes.post('/SrvAlteraListaProd', function (req, res) {
	var ListaProdutos = req.body.ListaProdutos;

	var sql = "execute block as begin ";

	for (i = 0; i < ListaProdutos.length; i++) {
		sql += " update produto set prcompra=" + ListaProdutos[i].PRCOMPRA + ",prvenda=" + ListaProdutos[i].PRVENDA + ",prpromo=" + ListaProdutos[i].PRPROMO + ",margem=" + ListaProdutos[i].MARGEM + " where codigo=" + ListaProdutos[i].CODPRO + " ;";
	};

	sql += " end ";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.execute(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});


// Cadastra novo fornecedor
apiRoutes.post('/CadastraParc', function (req, res) {
	var DadosParc = req.body.DadosParc;
	var parametro = req.body.parametro;
	if (parametro == 1) { var sql = " insert into cliente (prazo,esperafat,fantasia,razao,cgc,insc,endereco,bairro,cidade,estado,cep,fone,fornec,codcidade,numero) values (7,1,'" + DadosParc.RAZAO + "','" + DadosParc.RAZAO + "','" + DadosParc.CNPJ + "','" + DadosParc.IE + "','" + DadosParc.LOGRADOURO + "','" + DadosParc.BAIRRO + "','" + DadosParc.MUNICIPIO + "','" + DadosParc.UF + "','" + DadosParc.CEP + "','" + DadosParc.FONE + "','S', (select cod_cidade from cidade where codibge= '" + DadosParc.CODMUN + "' ),'" + DadosParc.NRO + "' ) returning CODIGO" };
	if (parametro == 2) { var sql = " insert into cliente (fantasia,razao,cgc,insc,endereco,bairro,cidade,estado,cep,transp,codcidade,numero) values ('" + DadosParc.RAZAO + "','" + DadosParc.RAZAO + "','" + DadosParc.CNPJ + "','" + DadosParc.IE + "','" + DadosParc.LOGRADOURO + "','" + DadosParc.BAIRRO + "','" + DadosParc.MUNICIPIO + "','" + DadosParc.UF + "','" + DadosParc.CEP + "','S', (select cod_cidade from cidade where codibge= '" + DadosParc.CODMUN + "' ),'" + DadosParc.NRO + "' ) returning CODIGO" };

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});

});




// XXXXXXXXXX INICIO: PROGRAMAÇÃO LEITURA XML NOTA DE ENTRADA XXXXXXXXXXXXXXXXXX
app.post('/app/leituraxml', function (req, res) {
	var parametro = req.body.parametro;
	var xml = '';
	var contador = 0;
	var listaProdNota = [];
	var listaPedido = '';
	var listaDadosNota = [];
	var listaFaturasNota = [];
	var listaTipoPagNota = [];
	var cnpjforn = '';
	var cnpjempresa = '';
	var codforn = '';
	var codfornrazao = '';
	var empresa = '';
	var codparcdestinatario = '';

	var leituraArquivo = function () {
		var parseString = xml2js.parseString;
		fs.readFile(__dirname + '/dist/nf.xml', function (err, data) {
			parseString(data, { explicitArray: false, ignoreAttrs: true }, function (err, result) {
				xml = result;
				chave = xml.nfeProc.protNFe.infProt.chNFe;
				estoque.get(function (err, db) {
					if (err) throw err;
					db.query("select LCTO FROM entrada where chave ='" + chave + "'", function (err, result) {
						if (err) throw err;
						if (result[0] != null) { lcto = result[0].LCTO }
						if (result[0] == null) { lcto = null }

						db.detach(function () {
						});
					});
				});

				listaPendentes();
				prodXML();
			});
		});
	};

	var listaPendentes = function () {
		cnpjforn = xml.nfeProc.NFe.infNFe.emit.CNPJ;
		cnpjempresa = xml.nfeProc.NFe.infNFe.dest.CNPJ;

		estoque.get(function (err, db) {
			if (err) throw err;
			if (parametro == 1) {

				sql = `

				select comprado.codpro,comprado.tipo, comprado.codinterno,comprado.descricao,sum(comprado.qtdabertototal) as qtd, comprado.unidade, sum(comprado.conversornota) as conversornota from

				(select produto.codigo as codpro,produto.tipo, produto.codinterno, produto.descricao, 0 as qtdabertototal, produto.unidade, produto.conversornota from produto
				where codparc= (select codgrupo from cliente where cgc= '${cnpjforn}') and produto.ativo='S'

				union

				select lista_prodcompra.codpro,lista_prodcompra.tipo, lista_prodcompra.codinterno,lista_prodcompra.descricao, lista_prodcompra.qtdabertototal, lista_prodcompra.unidade, 0 as conversornota from lista_prodcompra
				where codparc=(select codgrupo from cliente where cgc= '${cnpjforn}') and lista_prodcompra.empresa=(select codigo from param where cnpj= '${cnpjempresa}') ) as comprado

				group by comprado.codpro,comprado.tipo, comprado.codinterno,comprado.descricao ,comprado.unidade

				`
			}
			if (parametro == 2 || parametro == 3) {
				sql = "select  produto.codigo as codpro,999999 as qtd,produto.prcompra as valor,999999 as qtd_ent, produto.codforn, produto.codinterno, produto.descricao,produto.conversornota,produto.unidade from produto join cliente on  cliente.codgrupo = produto.codparc where  cliente.cgc ='" + cnpjforn + "'"
			}
			db.query(sql, function (err, result) {

				listaPedido = result;
				sql1 = " select codigo,codgrupo from cliente where cgc='" + cnpjforn + "'"
				sql2 = "select cliente.codigo as CODPARCDESTINATARIO, param.codigo as empresa from cliente join param on param.codparc=cliente.codigo where cgc='" + cnpjempresa + "'"
				db.query(sql1, function (err, result1) {
					if (err) throw err;
					if (result1[0]) {
						codforn = result1[0].CODGRUPO;
						codfornrazao = result1[0].CODIGO;

					}

					db.query(sql2, function (err, result2) {
						if (err) throw err;
						empresa = result2[0].EMPRESA
						codparcdestinatario = result2[0].CODPARCDESTINATARIO

						db.detach(achaProdutoNota());
					});
				});
			});
		});
	};
	var prodXML = function () {

		var emitNota = xml.nfeProc.NFe.infNFe.emit;
		var ideNota = xml.nfeProc.NFe.infNFe.ide;
		if (xml.nfeProc.NFe.infNFe.pag) {
			var tipoPag = xml.nfeProc.NFe.infNFe.pag.detPag;
		}
		else if (!xml.nfeProc.NFe.infNFe.pag) { var tipoPag = '' }

		var destNota = xml.nfeProc.NFe.infNFe.dest;
		var totalNota = xml.nfeProc.NFe.infNFe.total.ICMSTot;
		var prodNota = xml.nfeProc.NFe.infNFe.det;
		var transporte = xml.nfeProc.NFe.infNFe.transp;
		var tipoPagNfe = [];
		if (!tipoPag) { tipoPagNfe = 'null' };
		if (!ideNota.indPag) { ideNota.indPag = 'null' }


		if (xml.nfeProc.NFe.infNFe.cobr) {
			if (xml.nfeProc.NFe.infNFe.cobr.dup) {
				var duplicataNota = xml.nfeProc.NFe.infNFe.cobr.dup;
			}
			if (xml.nfeProc.NFe.infNFe.cobr.fat) {
				var faturaNota = xml.nfeProc.NFe.infNFe.cobr.fat;
			}
		};

		listaDadosNota = {
			'EMPRESA': 0,
			'CODPARC': 0,
			'CODPARCRAZAO': 0,
			'CODPARCDESTINATARIO': 0,
			'ESPECIE': 1,
			'CHAVE': chave,
			'CNPJ': emitNota.CNPJ,
			'IE': emitNota.IE,
			'FONE': emitNota.enderEmit.fone,
			'RAZAO': emitNota.xNome,
			'LOGRADOURO': emitNota.enderEmit.xLgr,
			'NRO': emitNota.enderEmit.nro,
			'BAIRRO': emitNota.enderEmit.xBairro,
			'CODMUN': emitNota.enderEmit.cMun,
			'MUNICIPIO': emitNota.enderEmit.xMun,
			'UF': emitNota.enderEmit.UF,
			'CEP': emitNota.enderEmit.CEP,
			'CODPAIS': emitNota.enderEmit.cPais,
			'PAIS': emitNota.enderEmit.xPais,
			'CNPJDEST': cnpjempresa,
			'NRONF': ideNota.nNF,
			'EMISSAO': converteData(ideNota.dhEmi),
			'SAIDA': ideNota.dhSaiEnt,
			'INDPAG': ideNota.indPag,
			'MODELO': ideNota.mod,
			'SERIE': ideNota.serie,
			'LANCAFINANCEIRO': 0,

			'VBC': parseFloat(totalNota.vBC),
			'VICMS': parseFloat(totalNota.vICMS),
			'VICMSDESON': parseFloat(totalNota.vICMSDeson),
			'VBCST': parseFloat(totalNota.vBCST),
			'VST': parseFloat(totalNota.vST),
			'VPROD': parseFloat(totalNota.vProd),
			'VFRETE': parseFloat(totalNota.vFrete),
			'VFRETEFOB': 0,
			'VSEG': parseFloat(totalNota.vSeg),
			'VDESC': parseFloat(totalNota.vDesc),

			'VIPI': parseFloat(totalNota.vIPI),
			'VPIS': parseFloat(totalNota.vPIS),
			'VCOFINS': parseFloat(totalNota.vCOFINS),
			'VOUTRO': parseFloat(totalNota.vOutro),
			'VNF': parseFloat(totalNota.vNF),
			'FRETEFOB': 0,
			'LCTOCTE': 0,

			'TOMADORFRETE': transporte.modFrete,
		};

		if (listaDadosNota.TOMADORFRETE == 1) {

			estoque.get(function (err, db) {
				if (err) throw err;
				db.query("select * FROM cte where LCTO=(select LCTOCTE from CHAVECTE WHERE CHAVE='" + listaDadosNota.CHAVE + "')", function (err, result) {
					if (err) throw err;
					if (result.length) {
						listaDadosNota.LCTOCTE = result[0].LCTO;
						listaDadosNota.VFRETEFOB = result[0].VALORRECEBER * (listaDadosNota.VNF / result[0].VALORCARGA);
					}
					db.detach(function () {
					});
				});
			});
		}

		var txfrete = (listaDadosNota.VFRETE + listaDadosNota.VFRETEFOB) / listaDadosNota.VPROD;

		if (!Array.isArray(prodNota)) {
			var matriz = [];
			matriz.push(prodNota);
			prodNota = matriz;
		}
		prodNota.forEach(function (item) {
			if (item.imposto.IPI) {

				if (item.imposto.IPI.IPITrib) {
					if (!item.imposto.IPI.IPITrib.vBC) { item.imposto.IPI.IPITrib.vBC = 0 };
					if (!item.imposto.IPI.IPITrib.pIPI) { item.imposto.IPI.IPITrib.pIPI = 0 };
					if (!item.imposto.IPI.IPITrib.vIPI) { item.imposto.IPI.IPITrib.vIPI = 0 };
					var VBCIPI = parseFloat(item.imposto.IPI.IPITrib.vBC);
					var PIPI = parseFloat(item.imposto.IPI.IPITrib.pIPI);
					var VIPI = parseFloat(item.imposto.IPI.IPITrib.vIPI);
				}
				else {
					var VBCIPI = 0;
					var PIPI = 0;
					var VIPI = 0;
				}
			}
			else {
				var VBCIPI = 0;
				var PIPI = 0;
				var VIPI = 0;
			};
			var TagICMS = Object.keys(item.imposto.ICMS)[0];
			var origem = 0;
			if (parseFloat(item.imposto.ICMS[TagICMS].orig) == 1) {
				origem = 2
			};
			if (parseFloat(item.imposto.ICMS[TagICMS].orig) == 6) {
				origem = 7
			};
			if (parseFloat(item.imposto.ICMS[TagICMS].orig) != 1 && parseFloat(item.imposto.ICMS[TagICMS].orig) != 6) {
				origem = parseFloat(item.imposto.ICMS[TagICMS].orig)
			};

			if (!item.imposto.ICMS[TagICMS].vCredICMSSN) { item.imposto.ICMS[TagICMS].vCredICMSSN = 0 };
			if (!item.imposto.ICMS[TagICMS].vBC) { item.imposto.ICMS[TagICMS].vBC = 0 };
			if (!item.imposto.ICMS[TagICMS].vICMS) { item.imposto.ICMS[TagICMS].vICMS = 0 };
			if (!item.imposto.ICMS[TagICMS].pMVAST) { item.imposto.ICMS[TagICMS].pMVAST = 0 };
			if (!item.imposto.ICMS[TagICMS].pICMSST) { item.imposto.ICMS[TagICMS].pICMSST = 0 };
			if (!item.imposto.ICMS[TagICMS].vBCST) { item.imposto.ICMS[TagICMS].vBCST = 0 };
			if (!item.imposto.ICMS[TagICMS].vICMSST) { item.imposto.ICMS[TagICMS].vICMSST = 0 };
			if (!item.imposto.ICMS[TagICMS].pICMS) { item.imposto.ICMS[TagICMS].pICMS = 0 };
			var SITTRIB = '';
			SITTRIB += item.imposto.ICMS[TagICMS].CST | item.imposto.ICMS[TagICMS].CSOSN;

			listaProdNota.push({
				'DESCRICAO': item.prod.xProd,
				'CODIGO': item.prod.cProd,
				'UNIDADE': item.prod.uCom,
				'NCM': item.prod.NCM,
				'CEST': item.prod.CEST,
				'QTD': parseFloat(item.prod.qCom),
				'VUNIT': parseFloat(item.prod.vUnCom),
				'VTOT': parseFloat(item.prod.vProd),
				'PICMS': parseFloat(item.imposto.ICMS[TagICMS].pICMS),
				'SITTRIB': SITTRIB,
				'VBCICMS': parseFloat(item.imposto.ICMS[TagICMS].vBC),
				'VICMS': parseFloat(item.imposto.ICMS[TagICMS].vICMS),
				'IVA': parseFloat(item.imposto.ICMS[TagICMS].pMVAST),
				'VBCICMSST': parseFloat(item.imposto.ICMS[TagICMS].vBCST),
				'PICMSST': parseFloat(item.imposto.ICMS[TagICMS].pICMSST),
				'VICMSST': parseFloat(item.imposto.ICMS[TagICMS].vICMSST),
				'ORIG': origem,
				'VCREDSN': parseFloat(item.imposto.ICMS[TagICMS].vCredICMSSN),
				'FRETENOTA': txfrete * parseFloat(item.prod.vProd),
				'CFOP': item.prod.CFOP,

				'VBCIPI': VBCIPI,
				'PIPI': PIPI,
				'VIPI': VIPI,

				'CODVEND': 0,
				'CODPRODVENDA': 0,


				'CONVERSORNOTAINI': 1,
				'CONVERSORNOTA': 1,
				'UNIDSISTEMA': '',
				'DESCRSISTEMA': '',
				'CODINTERNO': '',
				'ATUALIZACODIGO': 0,
				'CODPRO': '',
				'VALOR': 0,
				'ERRO': ''

			}
			);


		});

		if (xml.nfeProc.NFe.infNFe.cobr) {
			if (duplicataNota) { faturaNota = duplicataNota }
			if (!Array.isArray(faturaNota)) {
				var matriz = [];
				matriz.push(faturaNota);
				faturaNota = matriz;
			}
			faturaNota.forEach(function (item) {
				listaFaturasNota.push({
					'DUPLICATA': item.nDup || item.nFat,
					'DATA': item.dVenc || listaDadosNota.EMISSAO,
					'VALOR': item.vDup || item.vOrig,
					'PROJECAO': 0
				}
				);
			});

		};

		if (tipoPag) {
			tipoPagNfe = tipoPag;
			if (!Array.isArray(tipoPag)) {
				var matriz = [];
				matriz.push(tipoPag);
				tipoPagNfe = matriz;
			}
			tipoPagNfe.forEach(function (item) {
				listaTipoPagNota.push({
					'TIPOPAG': parseFloat(item.tPag),
					'VALOR': parseFloat(item.vPag),
				}
				);
			});

		};

		achaProdutoNota();
	}
	var achaProdutoNota = function () {
		contador++;
		if (contador == 2) {
			for (var i = 0; i < listaProdNota.length; i++) {
				var codigo = listaProdNota[i].CODIGO;
				var qtdacumulado = 0;
				for (var k = 0; k < i; k++) {
					if (listaProdNota[k].CODIGO == listaProdNota[i].CODIGO) {
						qtdacumulado += listaProdNota[k].QTD * listaProdNota[k].CONVERSORNOTA
					}
				}

				for (var j = 0; j < listaPedido.length; j++) {

					if (listaPedido[j].CODINTERNO == codigo) {

						listaProdNota[i].CODINTERNO = listaPedido[j].CODINTERNO;
						listaProdNota[i].TIPO = listaPedido[j].TIPO;
						listaProdNota[i].DESCRSISTEMA = listaPedido[j].DESCRICAO;
						listaProdNota[i].CODPRO = listaPedido[j].CODPRO;
						listaProdNota[i].VALOR = listaPedido[j].VALOR;
						listaProdNota[i].CONVERSORNOTA = listaPedido[j].CONVERSORNOTA;
						listaProdNota[i].CONVERSORNOTAINI = listaPedido[j].CONVERSORNOTA;
						listaProdNota[i].UNIDSISTEMA = listaPedido[j].UNIDADE;
						listaProdNota[i].QTDENTRA = listaProdNota[i].QTD * listaProdNota[i].CONVERSORNOTA;
						listaProdNota[i].QTDPEDIDO = 0;
						listaProdNota[i].QTDNAOPEDIDO = 0;

						if (listaPedido[j].QTD - qtdacumulado >= 0) {
							if ((listaPedido[j].QTD - qtdacumulado) - (listaProdNota[i].QTD * listaProdNota[i].CONVERSORNOTA) <= 0) { listaProdNota[i].QTDPEDIDO = listaPedido[j].QTD - qtdacumulado; listaProdNota[i].QTDNAOPEDIDO = (listaProdNota[i].QTD * listaProdNota[i].CONVERSORNOTA) - (listaPedido[j].QTD - qtdacumulado) }
							if ((listaPedido[j].QTD - qtdacumulado) - (listaProdNota[i].QTD * listaProdNota[i].CONVERSORNOTA) > 0) { listaProdNota[i].QTDPEDIDO = listaPedido[j].QTD - qtdacumulado; listaProdNota[i].QTDNAOPEDIDO = 0 }
						}

						if (listaPedido[j].QTD - qtdacumulado < 0) { listaProdNota[i].QTDPEDIDO = 0; listaProdNota[i].QTDNAOPEDIDO = (listaProdNota[i].QTD * listaProdNota[i].CONVERSORNOTA) }

						break;
					}
				}
			}
			listaDadosNota.CODPARC = codforn;
			listaDadosNota.CODPARCRAZAO = codfornrazao;
			listaDadosNota.CODPARCDESTINATARIO = codparcdestinatario;
			listaDadosNota.EMPRESA = empresa;

			res.send([listaProdNota, listaPedido, listaDadosNota, listaFaturasNota, lcto, listaTipoPagNota]);
		}
	}
	leituraArquivo();
})

// XXXXXXXXXX FIM: PROGRAMAÇÃO LEITURA XML NOTA DE ENTRADA XXXXXXXXXXXXXXXXXX


// XXXXXXXXXX INICIO: PROGRAMAÇÃO LEITURA XML CTE TRANSPORTE XXXXXXXXXXXXXXXXXX
app.post('/app/leituraxmlcte', function (req, res) {
	var parametro = req.body.parametro;
	var xml = '';
	var listainfoCte = [];
	var listaemitenteCte = [];
	var listaremetenteCte = [];
	var listadestinatarioCte = [];
	var listavalorCte = [];
	var listaCargaCte = [];
	var listanotasCte = [];
	var listatipocarga = [];
	var versao = '';
	var tagtomador = '';

	var leituraArquivo = function () {
		var parseString = xml2js.parseString;
		fs.readFile(__dirname + '/dist/cte.xml', function (err, data) {
			parseString(data, { explicitArray: false, ignoreAttrs: false }, function (err, result) {
				xml = result;
				versao = xml.cteProc.$.versao;
				if (versao == '3.00') { tagtomador = 'toma3' }
				if (versao == '2.00') { tagtomador = 'toma03' }
				xmlCte();
			});
		});
	};

	var xmlCte = function () {

		var infoCte = xml.cteProc.CTe.infCte.ide;
		var emitenteCte = xml.cteProc.CTe.infCte.emit;
		var remetenteCte = xml.cteProc.CTe.infCte.rem;
		var destinatarioCte = xml.cteProc.CTe.infCte.dest;
		var valorCte = xml.cteProc.CTe.infCte.vPrest;
		var ipontoCte = xml.cteProc.CTe.infCte.imp.ICMS;
		var infCargaCte = xml.cteProc.CTe.infCte.infCTeNorm.infCarga;
		var notasCte = xml.cteProc.CTe.infCte.infCTeNorm.infDoc.infNFe;
		var chave = xml.cteProc.protCTe.infProt.chCTe;
		var DATA = new Date();

		listainfoCte = {
			'LCTO': '',
			'CFOP': infoCte.CFOP,
			'MODELO': infoCte.mod,
			'SERIE': infoCte.serie,
			'NROCTE': infoCte.nCT,
			'EMISSAO': dataFirebird(infoCte.dhEmi),
			'DATA': dataFirebird(DATA),
			'TOMADOR': infoCte[tagtomador].toma,
			'VERSAO': versao,
			'TAGTOMADOR': tagtomador,
			'CHAVE': chave
		};

		listaemitenteCte = {
			'CNPJ': emitenteCte.CNPJ,
			'CPF': emitenteCte.CPF,
			'IE': emitenteCte.IE,
			'RAZAO': emitenteCte.xNome,
			'LOGRADOURO': emitenteCte.enderEmit.xLgr,
			'NRO': emitenteCte.enderEmit.nro,
			'BAIRRO': emitenteCte.enderEmit.xBairro,
			'CODMUN': emitenteCte.enderEmit.cMun,
			'MUNICIPIO': emitenteCte.enderEmit.xMun,
			'CEP': emitenteCte.enderEmit.CEP,
			'UF': emitenteCte.enderEmit.UF,
			'FONE': emitenteCte.enderEmit.fone
		};

		listaremetenteCte = {
			'CNPJ': remetenteCte.CNPJ,
			'CPF': remetenteCte.CPF,
			'IE': remetenteCte.IE,
			'RAZAO': remetenteCte.xNome,
			'LOGRADOURO': remetenteCte.enderReme.xLgr,
			'NRO': remetenteCte.enderReme.nro,
			'BAIRRO': remetenteCte.enderReme.xBairro,
			'CODMUN': remetenteCte.enderReme.cMun,
			'MUNICIPIO': remetenteCte.enderReme.xMun,
			'CEP': remetenteCte.enderReme.CEP,
			'UF': remetenteCte.enderReme.UF,
			'FONE': remetenteCte.enderReme.fone
		};

		listadestinatarioCte = {
			'CNPJ': destinatarioCte.CNPJ,
			'CPF': destinatarioCte.CPF,
			'IE': destinatarioCte.IE,
			'RAZAO': destinatarioCte.xNome,
			'LOGRADOURO': destinatarioCte.enderDest.xLgr,
			'NRO': destinatarioCte.enderDest.nro,
			'BAIRRO': destinatarioCte.enderDest.xBairro,
			'CODMUN': destinatarioCte.enderDest.cMun,
			'MUNICIPIO': destinatarioCte.enderDest.xMun,
			'CEP': destinatarioCte.enderDest.CEP,
			'UF': destinatarioCte.enderDest.UF,
			'FONE': destinatarioCte.enderDest.fone
		};

		var tagicms = Object.keys(ipontoCte)[0];
		if (!ipontoCte[tagicms].vBC) { ipontoCte[tagicms].vBC = '0'; ipontoCte[tagicms].vICMS = '0'; ipontoCte[tagicms].pICMS = '0' }

		listavalorCte = {
			'VALORTOTAL': valorCte.vTPrest,
			'VALORRECEBER': valorCte.vRec,
			'SITTRIB': "" + (ipontoCte[tagicms].CST | ipontoCte[tagicms].CSOSN),
			'VBCICMS': ipontoCte[tagicms].vBC,
			'PICMS': ipontoCte[tagicms].pICMS,
			'VICMS': ipontoCte[tagicms].vICMS
		};
		listaCargaCte = {
			'VALORCARGA': infCargaCte.vCarga,
			'TIPOCARGA': infCargaCte.infQ
		};

		if (!Array.isArray(infCargaCte.infQ)) {
			var matriz = [];
			matriz.push(infCargaCte.infQ);
			infCargaCte.infQ = matriz;
		}

		for (i = 0; i < infCargaCte.infQ.length; i++) {

			listatipocarga.push({
				'UNID': infCargaCte.infQ[i].cUnid,
				'QTDUNID': infCargaCte.infQ[i].qCarga
			}
			);
		}

		if (!Array.isArray(notasCte)) {
			var matriz = [];
			matriz.push(notasCte);
			notasCte = matriz;
		}

		for (i = 0; i < notasCte.length; i++) {

			listanotasCte.push({
				'CHAVENOTA': notasCte[i].chave,
			}
			);
		}

		res.send([listainfoCte, listaemitenteCte, listaremetenteCte, listadestinatarioCte, listavalorCte, listaCargaCte, listanotasCte, listatipocarga]);
	}
	leituraArquivo();
})

// XXXXXXXXXX FIM: PROGRAMAÇÃO LEITURA XML CTE TRANSPORTE XXXXXXXXXXXXXXXXXX

// XXXXXXXXXX INICIO: PROGRAMAÇÃO ENCONTRA PARCEIROS CTE TRANSPORTE E VERIFICA SE CTE JÁ ESTÁ CADASTRADA XXXXXXXXXXXXXXXXXX

app.post('/app/ProcuraParceirosCte', function (req, res) {
	var parceiro = req.body.parceiro;


	var sql = " select codigo from cliente where replace (replace(replace(cgc,'/',''),'.',''),'-','')='" + parceiro + "' ";

	estoque.get(function (err, db) {
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result[0]);
			});
		});
	});
});

app.post('/app/ProcuraCteCadastrada', function (req, res) {
	var parceiro = req.body.parceiro;
	var NROCTE = req.body.NROCTE;
	var MODELO = req.body.MODELO;
	var SERIE = req.body.SERIE;



	var sql = " select lcto from cte where emitente=" + parceiro + " and nrocte=" + NROCTE + "and modelo=" + MODELO + "and serie=" + SERIE + ";"

	estoque.get(function (err, db) {
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// XXXXXXXXXX FIM: PROGRAMAÇÃO ENCONTRA PARCEIROS CTE TRANSPORTE XXXXXXXXXXXXXXXXXX

// XXXXXXXXXX INICIO: PROGRAMAÇÃO LANÇA CTE TRANSPORTE XXXXXXXXXXXXXXXXXX

apiRoutes.post('/LancaCte', function (req, res) {

	var parametro = req.body.parametro;

	if (parametro == 1) {
		var Volume = req.body.Volume;
		var Peso = req.body.Peso;
		var ValorCarga = req.body.ValorCarga;
		var ValorCte = req.body.ValorCte;
		var InfoCte = req.body.InfoCte;
		var ValorCte = req.body.ValorCte;
		var Emitente = req.body.Emitente;
		var Remetente = req.body.Remetente;
		var Destinatario = req.body.Destinatario;
		var Tomador = req.body.Tomador;
		var ChavesCte = req.body.ChavesCte
		var codban = 0;

		var sql = 'execute block as begin ';
		sql += " insert into cte (ESPECIE,EMITENTE,REMETENTE,DESTINATARIO,TOMADOR,EMISSAO,DATA,CFOP,NROCTE,MODELO,SERIE,VALORRECEBER,VALORTOTAL,VALORCARGA,VBCICMS,VICMS,PICMS,SITTRIB,PESO,VOLUME,CHAVE) values (1," + Emitente + "," + Remetente + "," + Destinatario + "," + Tomador + ",'" + InfoCte.EMISSAO + "',current_date," + InfoCte.CFOP + "," + InfoCte.NROCTE + "," + InfoCte.MODELO + "," + InfoCte.SERIE + "," + ValorCte.VALORRECEBER + "," + ValorCte.VALORTOTAL + "," + ValorCarga.VALORCARGA + "," + ValorCte.VBCICMS + "," + ValorCte.VICMS + "," + ValorCte.PICMS + ",'" + ValorCte.SITTRIB + "'," + Peso + "," + Volume + ",'" + InfoCte.CHAVE + "');";

		for (i = 0; i < ChavesCte.length; i++) {
			sql += " insert into chavecte (lctocte,chave) values ((select gen_id(gen_cte_id,0) from rdb$database),'" + ChavesCte[i].CHAVENOTA + "');";
		};
		if (Tomador == 71) { codban = 101 }
		if (Tomador == 12872) { codban = 201 }
		if (codban > 0) {
			sql += " insert into movban (LCTOCTE,CODBAN,DESPESA,CODCLI,DOCUMENTO,VLBRUTO,ENT_SAI,PROJECAO,VCTO,DATA,HORA) values ((select gen_id(gen_cte_id,0) from rdb$database)," + codban + "," + 202 + "," + Emitente + ",'" + InfoCte.NROCTE + "'," + ValorCte.VALORRECEBER + ",'S','N','" + InfoCte.EMISSAO + "',current_date,current_time);";
		}

		sql += " end ";
	}

	if (parametro == 2) {

		var Emitente = req.body.Emitente;
		var Remetente = req.body.Remetente;
		var Destinatario = req.body.Destinatario;
		var Tomador = req.body.Tomador;
		var CHAVENOTA = req.body.ChavesCte;
		var valorcarga = req.body.valorcarga;


		var sql = 'execute block as begin ';
		sql += " insert into cte (ESPECIE,VALORRECEBER,VALORTOTAL,VALORCARGA,EMITENTE,REMETENTE,DESTINATARIO,TOMADOR,DATA) values (2,0,0," + valorcarga + "," + Emitente + "," + Remetente + "," + Destinatario + "," + Tomador + ",current_date);";

		sql += " insert into chavecte (lctocte,chave) values ((select gen_id(gen_cte_id,0) from rdb$database),'" + CHAVENOTA + "');";

		sql += " end ";
	}


	estoque.get(function (err, db) {
		db.execute(sql, function (err, result) {
			if (err) res.send(sql);
			db.query('select first 1 lcto from cte order by lcto desc', function (err, result1) {
				if (err) throw err;
				db.detach(function () {
					res.send([result1[0].LCTO, sql]);
				});
			})

		});
	});


})

// XXXXXXXXXX FIM: PROGRAMAÇÃO LANÇA CTE TRANSPORTE XXXXXXXXXXXXXXXXXX

// XXXXXXXXXX INICIO: PROGRAMAÇÃO DESPESAS XXXXXXXXXXXXXXXXXX
apiRoutes.post('/carregaDespesasEntrada', function (req, res) {
	estoque.get(function (err, db) {
		db.query('select codigo,descricao from contas where contas.entradaxml=1', function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		})
	});

})

// XXXXXXXXXX FIM: PROGRAMAÇÃO DESPESAS XXXXXXXXXXXXXXXXXX


// XXXXXXXXXX INICIO: PROGRAMAÇÃO CFOPCONVERSAO XXXXXXXXXXXXXXXXXX
apiRoutes.post('/cfopConversao', function (req, res) {
	estoque.get(function (err, db) {
		db.query('select * from cfopconversao', function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		})
	});

})

// XXXXXXXXXX FIM: PROGRAMAÇÃO CFOPCONVERSAO XXXXXXXXXXXXXXXXXX



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
	var data = converteData(data);
	return data.getDate() + '.' + (data.getMonth() + 1) + '.' + data.getFullYear();
}


apiRoutes.post('/lancanota', function (req, res) {
	var parametro = req.body.parametro;
	var nota = req.body.nota;
	var prodent = req.body.prodent;
	var faturas = req.body.faturas;
	var TipoPagNota = req.body.TipoPagNota;
	var TipoEntrada = req.body.TipoEntrada;

	var sql = 'execute block as begin ';
	sql += " insert into entrada (ESPECIE,CHAVE,EMPRESA,CODPARC,VNF,VPROD,DT_EMISSAO,DATA,DT_FISCAL,NOTA,FRETENOTA,FRETEFOB,VIPI,BCICMS,VICMS,DESPACES,VICMSST,BCICMSST,DESCONTO,CANCELA,VPROJ,UF,TOMADORFRETE,INDPAG,MODELO,SERIE,LANCAFINANCEIRO,TIPO) values ('" + nota.ESPECIE + "','" + nota.CHAVE + "'" + ',' + nota.EMPRESA + ',' + nota.CODPARCRAZAO + ',' + nota.VNF + ',' + nota.VPROD + ",'" + dataFirebird(nota.EMISSAO) + "'," + "current_date" + "," + "current_date" + ",'" + nota.NRONF + "'," + nota.VFRETE + ',' + nota.VFRETEFOB + ',' + nota.VIPI + ',' + nota.VBC + ',' + nota.VICMS + ',' + nota.VOUTRO + ', ' + nota.VST + ',' + nota.VBCST + ',' + nota.VDESC + ',' + "'S'" + ',' + nota.VPROJ + ",'" + nota.UF + "'," + nota.TOMADORFRETE + "," + nota.INDPAG + "," + nota.MODELO + ',' + nota.SERIE + ',' + nota.LANCAFINANCEIRO + "," + TipoEntrada + ");";



	for (i = 0; i < prodent.length; i++) {
		sql += ' insert into prodent (EMPRESA,lctoentrada,produto,qtd,valor,pipi,sittrib,picms,vcredsn,vbcicms,vicms,vbcipi,vipi,iva,picmsst,vbcicmsst, vicmsst,fretenota,cfop,ncm,codvend,codprodvenda,orig,cest,defeito) values (' + nota.EMPRESA + ',(select gen_id(gen_lcto_entrada,0) from rdb$database),' + prodent[i].CODPRO + ',' + (prodent[i].CONVERSORNOTA * prodent[i].QTD) + ',' + (prodent[i].VUNIT / prodent[i].CONVERSORNOTA) + ',' + prodent[i].PIPI + ',' + prodent[i].SITTRIB + ',' + prodent[i].PICMS + ',' + prodent[i].VCREDSN + ',' + prodent[i].VBCICMS + ',' + prodent[i].VICMS + ',' + prodent[i].VBCIPI + ',' + prodent[i].VIPI + ',' + prodent[i].IVA + ' ,' + prodent[i].PICMSST + ',' + prodent[i].VBCICMSST + ',' + prodent[i].VICMSST + ',' + prodent[i].FRETENOTA + ',' + prodent[i].CFOPENTRADA + ',' + prodent[i].NCM + ',' + prodent[i].CODVEND + ',' + prodent[i].CODPRODVENDA + ',' + prodent[i].ORIG + ",'" + prodent[i].CEST + "','" + prodent[i].DEFEITO + "');";
	};

	if (parametro != 2) {
		for (i = 0; i < TipoPagNota.length; i++) {
			sql += " insert into pagnfe (lctonfe,tipo,valor) values ((select gen_id(gen_lcto_entrada,0) from rdb$database)," + TipoPagNota[i].TIPOPAG + "," + TipoPagNota[i].VALOR + ");";
		};

	};

	sql += ' end';

	estoque.get(function (err, db) {
		if (err) res.send(sql);
		db.execute(sql, function (err, result) {
			if (err) res.send(sql);
			db.query('select first 1 lcto from entrada order by lcto desc', function (err, result1) {
				if (err) res.send(sql);
				db.detach(function () {
					res.json([result1, sql]);
				});
			})
		});
	});
})



//XXXXXXXX INICIO:  FINALIZA LANCANOTA XXXXXXXXXXX


apiRoutes.post('/Finalizalancanota', function (req, res) {
	var parametro = req.body.parametro;
	var nota = req.body.nota;
	var lcto = req.body.lcto;
	var faturas = req.body.faturas;
	var prodent = req.body.prodent;
	var projecao = null;
	var acumulador = -1;
	var TipoEntrada = req.body.TipoEntrada;
	var TipoEntradaProdcompra = null;

	if (TipoEntrada == 1) { TipoEntradaProdcompra = 0 };
	if (TipoEntrada == 2) { TipoEntradaProdcompra = 2 };
	if (TipoEntrada == 4) { TipoEntradaProdcompra = 1 };


	if (nota.ESPECIE == 1) { projecao = 0 };
	if (nota.ESPECIE == 2) { projecao = 1 };


	let sqlNovo = `execute block as begin
		update entrada set cancela = 'N', vproj= ${nota.VPROJ} where lcto = ${lcto} and empresa = ${nota.EMPRESA} ;
		`
	if (nota.LANCAFINANCEIRO != 1) {

		sqlNovo += `insert into deus
		(empresa,codparc,dataemissao,datavcto,dataliquid,lcto,tipolcto,documento,debito,credito,valor,projecao)
		values (${nota.EMPRESA},${nota.CODPARCRAZAO},current_date,current_date,current_date,${lcto},'E',${nota.NRONF},3,241,${nota.VNF},${projecao});
		`;
		acumulador = acumulador + 1;

		for (i = 0; i < faturas.length; i++) {
			if (faturas[i].PROJECAO == 0 || nota.ESPECIE == 2) {


				sqlNovo += `
				insert into deus
				(lcto,tipolcto,coddec,empresa,dataemissao,datavcto,codparc,documento,debito,valor,projecao)
				values (${lcto},'E', (select gen_id(gen_codigo_deus,0) from rdb$database)-${acumulador}, ${nota.EMPRESA}, current_date,'${dataFirebird(faturas[i].DATA)}',${nota.CODPARCRAZAO},'${nota.NRONF}-${(i + 1)}',241,${faturas[i].VALOR}, ${faturas[i].PROJECAO});
			`
				acumulador = acumulador + 1;
			}
		};
		acumulador = -1;
		if (nota.VPROJ) {
			sqlNovo +=
				`
			insert into deus
			(empresa,codparc,dataemissao,datavcto,dataliquid,lcto,tipolcto,documento,debito,credito,valor,projecao)

			values (${nota.EMPRESA},${nota.CODPARCRAZAO},current_date,current_date,current_date,${lcto},'E',${nota.NRONF},3,241,${nota.VPROJ},1);

			`
			acumulador = acumulador + 1;
		}


		for (i = 0; i < faturas.length; i++) {
			if (faturas[i].PROJECAO == '1' && nota.ESPECIE == 1) {
				sqlNovo += `
				insert into deus
				(lcto,tipolcto,coddec,empresa,dataemissao,datavcto,codparc,documento,debito,valor,projecao)
				values (${lcto},'E',(select gen_id(gen_codigo_deus,0) from rdb$database)-${acumulador}, ${nota.EMPRESA}, current_date,'${dataFirebird(faturas[i].DATA)}',${nota.CODPARCRAZAO},'${nota.NRONF}-${(i + 1)}',241,${faturas[i].VALOR}, ${faturas[i].PROJECAO});
			`;
				acumulador = acumulador + 1;
			}

		};

	}


	sqlNovo += ` end`

	var sql2 = 'execute block as begin ';

	if (TipoEntrada == 1) {
		for (i = 0; i < prodent.length; i++) {
			sql2 += ' insert into prodcompra (data,lctoentrada,empresa,codparc,codpro,qtd,valor,tipo) values (current_date,' + lcto + ',' + nota.EMPRESA + ',' + nota.CODPARC + ',' + prodent[i].CODPRO + ',' + (prodent[i].QTDENTRA * -1) + ',' + (prodent[i].VUNIT / prodent[i].CONVERSORNOTA) + "," + TipoEntradaProdcompra + ");";
		};

		for (i = 0; i < prodent.length; i++) {
			if (prodent[i].QTDNAOPEDIDO > 0) {
				sql2 += ' insert into prodcompra (data,lctoentrada,empresa,codparc,codpro,qtd,valor,tipo) values (current_date,' + lcto + ',' + nota.EMPRESA + ',' + nota.CODPARC + ',' + prodent[i].CODPRO + ',' + (prodent[i].QTDNAOPEDIDO) + ',' + (prodent[i].VUNIT / prodent[i].CONVERSORNOTA) + "," + TipoEntradaProdcompra + ");";
			}
		};
	}

	if (TipoEntrada != 1) {
		for (i = 0; i < prodent.length; i++) {
			if(prodent[i].QTDENTRA>0){
				sql2 += ' update prodcompra set prodcompra.lctoentrada=0 where prodcompra.codigo=' + prodent[i].CODIGO + ';';

				sql2 += ' delete from prodcompra where prodcompra.codigo=' + prodent[i].CODIGO + ';';

			}
		};
	}


	if (nota.ATUALIZA == '1') {
		if (parametro == 1) {
			for (i = 0; i < prodent.length; i++) {
				sql2 += " update produto set prcompra=" + ((prodent[i].VUNIT / prodent[i].CONVERSORNOTA) + (((prodent[i].VUNIT / prodent[i].CONVERSORNOTA) / nota.VPROD) * nota.VPROJ)) + ", orig='" + prodent[i].ORIG + "',CLASSFIS='" + prodent[i].NCM + "',ENTRADA= current_date where produto.codigo=" + prodent[i].CODPRO + ";";
			};
		}

		if (parametro == 2) {
			for (i = 0; i < prodent.length; i++) {
				sql2 += " update produto set prcompra=" + prodent[i].VUNIT + ",ENTRADA= current_date where produto.codigo=" + prodent[i].CODPRO + ";";
			};
		}
	};

	sql2 += ' end';

	estoque.get(function (err, db) {
		if (err) res.send('banco nao abriu', err);
		db.execute(sqlNovo, function (err, result) {
			if (err) res.send('erro sql', sqlNovo);
			var sql1 = 'execute block as begin ';
			sql1 += ' execute procedure atualiza_custoprod(' + lcto + ');';
			sql1 += ' end';
			db.execute(sql1, function (err, result) {
				if (err) res.send(sql);
				db.execute(sql2, function (err, result) {
					db.detach(function () {
						res.send(['deu certo', sqlNovo]);
					});
				});
			});
		});
	});

})

//XXXXXXXX FIM:  FINALIZA LANCANOTA XXXXXXXXXXX



apiRoutes.post('/CarregaPrejuizo', function (req, res) {


	estoque.get(function (err, db) {
		if (err) throw err;

		db.query("select totais.id_produto,totais.qtd,totais.descricao,calculo_quantprod.qtdreserva, (totais.qtd-calculo_quantprod.qtdreserva) as qtddisp, produto.prcusto, ((totais.qtd-calculo_quantprod.qtdreserva)*produto.prcusto) as total    from (select pacote.id_produto,sum(pacote.qtd) as qtd,produto.descricao from pacote join produto on pacote.id_produto = produto.codigo where origem in ( select distinct id_pacote from transitodet where data>'01.01.2018' and situacao_atual=8 ) and situacao in (8,1,12,7,13,2,3,6) and produto.encomenda = 'S' group by pacote.id_produto,produto.descricao ) as totais cross join calculo_quantprod(totais.id_produto,4,null,null) join produto on produto.codigo = totais.id_produto where (totais.qtd-calculo_quantprod.qtdreserva)>0 order by produto.descricao", function (err, result1) {
			db.query("select usuario.nome, venda.data, venda.nomecli,  prejuizo.* from prejuizo join venda on venda.lcto=prejuizo.lctovenda join usuario on usuario.codfunc=venda.codvend order by data desc ", function (err, result2) {

				if (err) throw err;
				db.detach(function () {
					res.send([result1, result2]);
				});

			});
		});
	});
})



//XXXXXXXX INICIO:  FUNÇÃO QUE CADASTRO UM NOVO PRODUTO NA BANCO ESTOQUE E NO BANCO LOCAL XXXXXXXXXXX

apiRoutes.post('/CadastraNovoProduto', function (req, res) {

	var p = req.body.busca;

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query("insert into produto (DESCRICAO,ALIQ,ATIVO,CEST,CLASSFIS,CODBAR,CTRL_PACOTE,CODPARC,CODINTERNO,CONVERSORNOTA,CURVA,DEMANDA,DESC_COMPRA,EMBALAGEM,ENCOMENDA,EST_MINIMO,FORADELINHA,GRAVA_SITE,GRUPO,ICMS_COMPRA,IDSITE,IDSITE2,IDSITE_NOVO,IDSITE_PAI,ID_PRODUTOPAI,IMAGEM,LOCAL,MARGEM,MODELO1,MODELO2,OBS,ORDEM,ORIG,PERIODOGIRO,PESO,PRCOMPRA,PRCUSTO,PRCUSTOMEDIO,PRTABELA,PRVENDA,SITTRIB,TIPO,TXCUSTOSN,UNIDADE,GRUPOSOMA) values('" + p.DESCRICAO + "','" + p.ALIQ + "','" + p.ATIVO + "','" + p.CEST + "','" + p.CLASSFIS + "','" + p.CODBAR + "','" + p.CTRL_PACOTE + "'," + p.CODPARC + ",'" + p.CODINTERNO + "'," + p.CONVERSORNOTA + ",'" + p.CURVA + "'," + p.DEMANDA + "," + p.DESC_COMPRA + "," + p.EMBALAGEM + ",'" + p.ENCOMENDA + "'," + p.EST_MINIMO + ",'" + p.FORADELINHA + "'," + p.GRAVA_SITE + "," + p.GRUPO + "," + p.ICMS_COMPRA + "," + p.IDSITE + "," + p.IDSITE2 + "," + p.IDSITE_NOVO + "," + p.IDSITE_PAI + "," + p.ID_PRODUTOPAI + ",'" + p.IMAGEM + "','" + p.LOCAL + "'," + p.MARGEM + ",'" + p.MODELO1 + "','" + p.MODELO2 + "','" + p.OBS + "'," + p.ORDEM + ",'" + p.ORIG + "'," + p.PERIODOGIRO + "," + p.PESO + "," + p.PRCOMPRA + "," + p.PRCUSTO + "," + p.PRCUSTOMEDIO + "," + p.PRTABELA + "," + p.PRVENDA + ",'" + p.SITTRIB + "','" + p.TIPO + "'," + p.TXCUSTOSN + ",'" + p.UNIDADE + "'," + p.GRUPOSOMA + ") returning CODIGO", function (err, result) {

			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
})

apiRoutes.post('/AlteraProduto', function (req, res) {

	var p = req.body.busca;
	estoque.get(function (err, db) {
		if (err) throw err;

		db.query("update produto set CODINTERNO=?, DESCRICAO=?,ATIVO=?,ENCOMENDA=?,FORADELINHA=?,OBS=?,TIPO=?,CTRL_PACOTE=?,CONVERSORNOTA=?,EMBALAGEM=?,UNIDADE=?,LOCAL=?,PESO=?,CODBAR=?,CODPARC=?,DEMANDA=?,PERIODOGIRO=?,EST_MINIMO=?,CURVA=?,PRCOMPRA=?,PRPROMO=?,PRVENDA=?,PRTABELA=?,DESC_COMPRA=?,ALIQ=?,CLASSFIS=?,ORIG=?,IDSITE=?,IDSITE2=?,IDSITE_NOVO=?,IDSITE_PAI=?,ID_PRODUTOPAI=?,IMAGEM=?,MODELO1=?,MODELO2=?,ORDEM=?,GRAVA_SITE=?,GRUPO=?,GRUPOSOMA=? where CODIGO=? returning CODIGO", [p.CODINTERNO, p.DESCRICAO, p.ATIVO, p.ENCOMENDA, p.FORADELINHA, p.OBS, p.TIPO, p.CTRL_PACOTE, p.CONVERSORNOTA, p.EMBALAGEM, p.UNIDADE, p.LOCAL, p.PESO, p.CODBAR, p.CODPARC, p.DEMANDA, p.PERIODOGIRO, p.EST_MINIMO, p.CURVA, p.PRCOMPRA, p.PRPROMO, p.PRVENDA, p.PRTABELA, p.DESC_COMPRA, p.ALIQ, p.CLASSFIS, p.ORIG, p.IDSITE, p.IDSITE2, p.IDSITE_NOVO, p.IDSITE_PAI, p.ID_PRODUTOPAI, p.IMAGEM, p.MODELO1, p.MODELO2, p.ORDEM, p.GRAVA_SITE, p.GRUPO, p.GRUPOSOMA, p.CODIGO], function (err, result) {

			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});

})




// Carrega quantidades do produto
apiRoutes.post('/QuantidadesProd', function (req, res) {

	var sql = 'select * from calculo_quantprod (' + req.body.busca + ',0,null,null)';

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.json(result[0]);
			});
		});
	});

});


// Carrega reservas do produto
apiRoutes.post('/ReservasProd', function (req, res) {

	var sql = "select func.usuario, venda.status,  venda.data, venda.lcto,venda.codcli,venda.nomecli, prodvenda.qtdreserva, prodvenda.valor, transito.status as expedicao from prodvenda join venda on venda.lcto = prodvenda.codvenda join transito on transito.documento=prodvenda.codvenda join func on func.codigo=venda.codvend where prodvenda.qtdreserva>0 and transito.tipo=3 and transito.status in (0,1,2,3)  and venda.codcli not in (15850,14825) and prodvenda.codpro =  " + req.body.busca + " order by venda.data desc";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.json(result);
			});
		});
	});

});



// Carrega ultimas vendas do produto
apiRoutes.post('/SaidasProd', function (req, res) {

	var sql = "select first 100 param.nomesys, func.usuario,  venda.lcto,  venda.data, venda.codcli, venda.nomecli,  prodvenda.qtd,  prodvenda.valor, prodvenda.prcusto, case when prodvenda.valor<=0 then 0 else (1-(prodvenda.prcusto/prodvenda.valor))*100 end as margem  from prodvenda join venda on venda.lcto = prodvenda.codvenda join param on param.codigo = venda.empresa join func on func.codigo=venda.codvend where venda.status='F' and venda.codcli not in(15850,14825) and venda.data>current_date-730 and prodvenda.codpro= " + req.body.busca + " order by venda.data desc";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.json(result);
			});
		});
	});

});

// Carrega ultimas faturas do produto
apiRoutes.post('/FaturasProd', function (req, res) {

	var sql = "select fornec.razao, entrada.empresa, entrada.data, entrada.dt_emissao, entrada.nota, entrada.codcli, entrada.especie, prodent.* from prodent join entrada on entrada.lcto = prodent.lctoentrada and entrada.empresa = prodent.empresa join fornec on fornec.codigo = entrada.codcli where entrada.dt_emissao> current_date-730 and prodent.produto = " + req.body.busca + "order by entrada.dt_emissao desc";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.json(result);
			});
		});
	});

});

// Carrega pedidos em aberto do produto
apiRoutes.post('/EntradasProd', function (req, res) {

	var sql = "select lista_prodcompra.data,  lista_prodcompra.lctocompra, lista_prodcompra.empresa ,lista_prodcompra.qtdabertopedido, lista_prodcompra.valor from lista_prodcompra where  lista_prodcompra.codpro=" + req.body.busca;
	var sql1 = "select param.nomesys, cliente.razao, entrada.empresa, entrada.data, entrada.dt_emissao, entrada.dt_fiscal, entrada.nota, entrada.codparc, entrada.especie, prodent.* from prodent join entrada on entrada.lcto = prodent.lctoentrada and entrada.empresa = prodent.empresa join cliente on cliente.codigo = entrada.codparc join param on param.codigo = entrada.empresa where entrada.cancela='N' and entrada.dt_emissao> current_date-730 and prodent.produto = " + req.body.busca + " order by entrada.dt_emissao desc";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.query(sql1, function (err, result1) {
				if (err) throw err;
				db.detach(function () {
					res.json([result, result1]);
				});
			});
		});
	});

});

// Carrega Ultimo produto

apiRoutes.post('/UltimoProduto', function (req, res) {
	if (!req.body.busca && !req.body.direcao) {
		var sql = 'select first 1 produto.*, grupoprod.codfaixa as grupocod ,grupoprod.descricao as grupodescricao, grupoprod.unidade as grupounid , cliente.razao as fornecedor from produto join grupoprod on grupoprod.codigo=produto.grupo join cliente on cliente.codigo = produto.codparc order by produto.codigo desc';
	}
	else if (req.body.busca && req.body.direcao == 0) {
		var sql = 'select first 1 produto.*, grupoprod.codfaixa as grupocod ,grupoprod.descricao as grupodescricao, grupoprod.unidade as grupounid, cliente.razao as fornecedor from produto join grupoprod on grupoprod.codigo=produto.grupo join cliente on cliente.codigo = produto.codparc where produto.codigo< ' + req.body.busca + ' order by produto.codigo desc';
	}
	else if (req.body.busca && req.body.direcao == 1) {
		var sql = 'select first 1 produto.*, grupoprod.codfaixa as grupocod ,grupoprod.descricao as grupodescricao, grupoprod.unidade as grupounid, cliente.razao as fornecedor from produto join grupoprod on grupoprod.codigo=produto.grupo join cliente on cliente.codigo = produto.codparc where produto.codigo> ' + req.body.busca + ' order by produto.codigo';
	}
	else if (req.body.busca && !req.body.direcao) {
		var sql = 'select produto.*, grupoprod.codfaixa as grupocod ,grupoprod.descricao as grupodescricao, grupoprod.unidade as grupounid, cliente.razao as fornecedor from produto join grupoprod on grupoprod.codigo=produto.grupo join cliente on cliente.codigo = produto.codparc where produto.codigo= ' + req.body.busca + ' ';
	}
	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result[0]);
			});
		});
	});

});



apiRoutes.post('/UltimaNota', function (req, res) {
	estoque.get(function (err, db) {
		var sqlnotaanterior = 'order by entrada.lcto desc';
		var tipo = req.body.tipo;

		// if (req.body.busca && !req.body.direcao) {
		// 	sqlnotaanterior = 'and lcto <' + req.body.busca + 'order by entrada.lcto desc';
		// }
		// else if (req.body.busca && req.body.direcao == 1) {
		// 	sqlnotaanterior = 'and lcto >' + req.body.busca + 'order by entrada.lcto';
		// }

		// else if (req.body.busca && req.body.direcao == 2) {
		// 	sqlnotaanterior = 'and lcto =' + req.body.busca + 'order by entrada.lcto';
		// }
		var sql1 = "select first 1 entrada.*, cliente.razao from entrada join cliente on cliente.codigo = entrada.codparc where empresa=? and entrada.cancela = 'N' and lcto =" + req.body.busca + "order by entrada.lcto ";
		var sql2 = "select produto.descricao, produto.codinterno, produto.unidade, prodent.* from prodent join produto on produto.codigo = prodent.produto where prodent.lctoentrada=? and prodent.empresa=?";
		if (req.body.tipo === 'S') {
			sql1 = "select first 1 saida.*, cliente.razao from saida join cliente on cliente.codigo = saida.codparc where empresa=? and lcto =" + req.body.busca + "order by saida.lcto ";
			sql2 = "select produto.descricao, produto.codinterno, produto.unidade, prodsaida.* from prodsaida join produto on produto.codigo = prodsaida.produto where prodsaida.lctosaida=? and prodsaida.empresa=?";
		}
		if (err)
			throw err;
		db.query(sql1, [req.body.empresa], function (err, result) {
			db.query(sql2, [result[0].LCTO, result[0].EMPRESA], function (err, result1) {
				db.detach(function () {
					res.send([result, result1]);
				});
			})
		});
	});
});



// Carrega Ultima nota de entrada
apiRoutes.post('/carregaNota', function (req, res) {
	// definição das variáveis
	let tipo = req.body.tipo,
		nota = req.body.nota,
		empresa = req.body.empresa;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		if (tipo === "E") { // buscando uma nota de entrada
			db.query("select first 1 entrada.*, cliente.razao from entrada join cliente on cliente.codigo = entrada.codparc where empresa=? and entrada.cancela = 'N' and lcto =? order by entrada.lcto ", [empresa, nota], function (err, resultNF) {
				if (err) throw err;
				db.query("select produto.descricao, produto.codinterno, produto.unidade, prodent.* from prodent join produto on produto.codigo = prodent.produto where prodent.lctoentrada=? and prodent.empresa=?", [nota, empresa], function (err, resultPROD) {
					if (err) throw err;
					let sqlmovban;
					if (empresa === 1) {
						sqlmovban = "select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban<200 and movban.lctoent = ?  order by vcto "
					}
					else if (empresa === 2) {
						sqlmovban = "select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban>200 and movban.lctoent = ?  order by vcto "
					}
					db.query(sqlmovban, [nota], function (err, resultFINAN) {
						if (err) throw err;
						db.query("select cte.emitente as codemitente, (select cliente.razao from cliente where codigo= cte.emitente)as razaoemitente,cte.remetente as codremetente,(select cliente.razao from cliente where codigo= cte.remetente)as razaoremetente,cte.destinatario as coddestinatario,(select cliente.razao from cliente where codigo= cte.destinatario)as razaodestinatario,cte.tomador as codtomador,(select cliente.razao from cliente where codigo= cte.tomador)as razaotomador, cte.lcto,cte.data,cte.emissao, cte.nrocte, cte.valorreceber, cte.valorcarga, cte.vbcicms, cte.vicms, cte.peso, cte.volume,movban.vcto,  movban.pagto, movban.codban, banco.banco from cte join chavecte on chavecte.lctocte=cte.lcto join movban on movban.lctocte=cte.lcto join banco on banco.codigo=movban.codban where chavecte.chave=?", [resultNF[0].CHAVE], function (err, resultCTE) {
							db.detach(function () {
								res.send([resultNF[0], resultPROD, resultFINAN, resultCTE[0] || []]);
							});
						})
					})
				})
			});
		}
		else if (tipo === "S") { // buscando por uma nota de saida
			db.query("select first 1 saida.*, cliente.razao from saida join cliente on cliente.codigo = saida.codparc where empresa=?  and lcto =? order by saida.lcto ", [empresa, nota], function (err, resultNF) {
				if (err) throw err;
				db.query("select produto.descricao, produto.codinterno, produto.unidade, prodsaida.* from prodsaida join produto on produto.codigo = prodsaida.produto where prodsaida.lctosaida=? and prodsaida.empresa=?", [nota, empresa], function (err, resultPROD) {
					if (err) throw err;
					let sqlmovban;
					if (empresa === 1) {
						sqlmovban = "select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban<200 and movban.lctoent = ?  order by vcto "
					}
					else if (empresa === 2) {
						sqlmovban = "select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban>200 and movban.lctoent = ?  order by vcto "
					}
					db.query(sqlmovban, [nota], function (err, resultFINAN) {
						if (err) throw err;
						db.query("select cte.emitente as codemitente, (select cliente.razao from cliente where codigo= cte.emitente)as razaoemitente,cte.remetente as codremetente,(select cliente.razao from cliente where codigo= cte.remetente)as razaoremetente,cte.destinatario as coddestinatario,(select cliente.razao from cliente where codigo= cte.destinatario)as razaodestinatario,cte.tomador as codtomador,(select cliente.razao from cliente where codigo= cte.tomador)as razaotomador, cte.lcto,cte.data,cte.emissao, cte.nrocte, cte.valorreceber, cte.valorcarga, cte.vbcicms, cte.vicms, cte.peso, cte.volume,movban.vcto,  movban.pagto, movban.codban, banco.banco from cte join chavecte on chavecte.lctocte=cte.lcto join movban on movban.lctocte=cte.lcto join banco on banco.codigo=movban.codban where chavecte.chave=?", [resultNF[0].CHAVE], function (err, resultCTE) {
							db.detach(function () {
								res.send([resultNF[0], resultPROD, resultFINAN || [], resultCTE[0] || []]);
							});
						})
					})
				})
			});
		}
		else { // se o tipo não for nem entrada nem saida
			throw "tipo de nota inexistente";
		}

	})



})
apiRoutes.post('/UltimaNota', function (req, res) {
	estoque.get(function (err, db) {
		// var sqlnotaanterior = 'order by entrada.lcto desc';
		// if (req.body.busca && !req.body.direcao) {
		// 	sqlnotaanterior = 'and lcto <' + req.body.busca + 'order by entrada.lcto desc';
		// }
		// else if (req.body.busca && req.body.direcao == 1) {
		// 	sqlnotaanterior = 'and lcto >' + req.body.busca + 'order by entrada.lcto';
		// }
		//else
		// if (req.body.busca && req.body.direcao == 2) {
		// sqlnotaanterior = 'and lcto =' + req.body.busca + 'order by entrada.lcto';
		// }
		if (err)
			throw err;

		if (req.body.tipo === 'E') {
			db.query("select first 1 entrada.*, cliente.razao from entrada join cliente on cliente.codigo = entrada.codparc where empresa=? and entrada.cancela = 'N' and lcto =? order by entrada.lcto ", [req.body.empresa, req.body.busca], function (err, result) {
				db.query("select produto.descricao, produto.codinterno, produto.unidade, prodent.* from prodent join produto on produto.codigo = prodent.produto where prodent.lctoentrada=? and prodent.empresa=?", [result[0].LCTO, result[0].EMPRESA], function (err, result1) {
					db.detach(function () {
						res.send([result, result1]);
					});
				})
			});
		}
		else if (req.body.tipo === 'S') {
			db.query("select first 1 nfe.nota,nfe.data as dt_emissao cliente.razao from nfe join cliente on cliente.codigo = nfe.codcli where empresa = ? and nota =? order by nfe.nota", [req.body.empresa, req.body.busca], function (err, result) {
				if (err) throw 'erro na nota';
				db.query("select produto.descricao, produto.codinterno, produto.unidade, prodnfe.* from prodnfe join produto on produto.codigo = prodnfe.codpro where prodnfe.codnota=? and prodnfe.empresa=?", [result[0].LCTO, result[0].EMPRESA], function (err, result1) {
					db.detach(function () {
						if (err) throw 'erro na prodnfe';
						res.send([result, result1]);
					});
				})
			});
		}
		else {
			throw 'tipo não definido';
		}

	});
});

// Carrega Vencimentos de uma nota de entrada

apiRoutes.post('/VencNota', function (req, res) {
	if (req.body.empresa == 1) {
		estoque.get(function (err, db) {
			if (err)
				throw err;
			db.query("select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban<200 and movban.lctoent = ?  order by vcto ", [req.body.busca], function (err, result) {
				db.detach(function () {
					res.send(result);

				});
			})
		});
	}

	else if (req.body.empresa == 2) {
		estoque.get(function (err, db) {

			if (err)
				throw err;
			db.query("select movban.*, banco.banco as contapagto from movban  join banco on movban.codban = banco.codigo where movban.codban>200 and movban.lctoent = ?  order by vcto ", [req.body.busca], function (err, result) {
				db.detach(function () {
					res.send(result);

				});
			})


		});

	}


});

// Carrega Cte Nota

apiRoutes.post('/CarregaCteNota', function (req, res) {
	sql = "select cte.emitente as codemitente, (select cliente.razao from cliente where codigo= cte.emitente)as razaoemitente,cte.remetente as codremetente,(select cliente.razao from cliente where codigo= cte.remetente)as razaoremetente,cte.destinatario as coddestinatario,(select cliente.razao from cliente where codigo= cte.destinatario)as razaodestinatario,cte.tomador as codtomador,(select cliente.razao from cliente where codigo= cte.tomador)as razaotomador, cte.lcto,cte.data,cte.emissao, cte.nrocte, cte.valorreceber, cte.valorcarga, cte.vbcicms, cte.vicms, cte.peso, cte.volume,movban.vcto,  movban.pagto, movban.codban, banco.banco from cte join chavecte on chavecte.lctocte=cte.lcto join movban on movban.lctocte=cte.lcto join banco on banco.codigo=movban.codban where chavecte.chave='" + req.body.busca + "'";
	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			db.detach(function () {
				res.send(result);

			});
		})
	});
});


// tela de produtos

apiRoutes.post('/buscaproduto', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select produto.codigo,produto.CODINTERNO,produto.DESCRICAO,(select sum (ddt.QTD) AS QTD FROM ( SELECT CODPRO,sum (qtd *-1) as qtd,status  from prodvenda p join transito tr on p.codvenda=tr.documento and tr.tipo=3 and (tr.status in (0,1,2)) where p.qtd=p.qtdreserva  and codpro = produto.codigo group by codpro,status union select id_produto as codpro, sum (qtd) as qtd,situacao as status from pacote where situacao in (1,2,3,8,12,13) and ID_produto = produto.codigo  group by codpro,situacao) ddt) as qtd from produto WHERE DESCRICAO CONTAINING ? and ativo='S'", [req.body.busca], function (err, result) {

			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/buscadisponivel', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;

		db.query("select saldo from busca_disponivel(?)", [req.body.busca], function (err, result) {

			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela de listaclientes
apiRoutes.post('/buscaranalisacli', function (req, res) {
	if (!req.body.busca) {
		sql = "select * from analisecli"
	} else {
		sql = "select * from analisecli where carteira=? or carteira=0 "
	};
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, [req.body.busca], function (err, result) {
			if (err)
				throw err;

			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela de historicovendas separadas por vendedores
apiRoutes.post('/buscarvendascodvend', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select * from historico_vendas_codvend(?)", [req.body.busca], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});


// tela de controle das margens dos produtos
apiRoutes.post('/BuscaMargemProd', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		if (req.body.codforn) {
			db.query("select geral.codpro, produto.descricao, sum(geral.prcusto) as  prcusto, (case when sum(geral.valor)>0 then sum(geral.valor) else produto.prvenda end) as prvenda,100*(1-sum( (case when prvenda>0 THEN GERAL.prcusto/prvenda ELSE 0 END))) AS margem, sum(geral.p1) as p1, sum(geral.q2) as q2, sum(geral.radar) as radar from ( SELECT custoprod.codpro, custoprod.prcusto, 0 as valor, 0 as p1, 0 as q2, 0 as radar from custoprod union SELECT vendasperiodos.codpro, 0 as prcusto, vendasperiodos.valor, vendasperiodos.p1, vendasperiodos.q2, vendasperiodos.radar  from vendasperiodos) as geral join produto on produto.codigo = geral.codpro where produto.codforn=? group by geral.codpro , produto.prvenda, produto.descricao", [req.body.codforn], function (err, result) {

				db.detach(function () {
					res.json(result);
				});
			});
		} else {

			db.query("select geral.codpro, produto.descricao, sum(geral.prcusto) as  prcusto, (case when sum(geral.valor)>0 then sum(geral.valor) else produto.prvenda end) as prvenda,100*(1-sum( (case when prvenda>0 THEN GERAL.prcusto/prvenda ELSE 0 END))) AS margem, sum(geral.p1) as p1, sum(geral.q2) as q2, sum(geral.radar) as radar from ( SELECT custoprod.codpro, custoprod.prcusto, 0 as valor, 0 as p1, 0 as q2, 0 as radar from custoprod union SELECT vendasperiodos.codpro, 0 as prcusto, vendasperiodos.valor, vendasperiodos.p1, vendasperiodos.q2, vendasperiodos.radar  from vendasperiodos ) as geral join produto on produto.codigo = geral.codpro group by geral.codpro , produto.prvenda, produto.descricao", function (err, result) {

				db.detach(function () {
					res.json(result);
				});
			});
		}



	});
});

// tela que mostra analise de um produto isolado

apiRoutes.post('/buscaanalisaprod', function (req, res) {

	var sql1 = " select venda.codcli, cliente.razao, sum(prodvenda.qtd) as qtdtot, sum (case when VENDA.data >= current_date-30 then PRODVENDA.qtd else 0 end) as P1,       sum (case when VENDA.data < current_date-30 and VENDA.data >= current_date-60 then PRODVENDA.qtd else 0 end) as P2,       sum (case when VENDA.data < current_date-60 and VENDA.data >= current_date-90 then PRODVENDA.qtd else 0 end) as P3,       sum (case when VENDA.data < current_date-90 and VENDA.data >= current_date-120 then PRODVENDA.qtd else 0 end) as P4,       sum (case when VENDA.data < current_date-120 and VENDA.data >= current_date-150 then PRODVENDA.qtd else 0 end) as P5,       sum (case when VENDA.data < current_date-150 and VENDA.data >= current_date-180 then PRODVENDA.qtd else 0 end) as P6 from prodvenda join venda on venda.lcto = prodvenda.codvenda join cliente on cliente.codigo=venda.codcli where venda.data>current_date-180 and venda.status='F' and VENDA.codcli  not in (14825, 15850) and prodvenda.codpro=  " + req.body.codpro + " group by venda.codcli, cliente.razao order by qtdtot desc ";


	estoque.get(function (err, db) {
		if (err) throw err;

		db.query("SELECT calculo_ordena.radar, calculo_ordena.q2, calculo_vendas.*  FROM calculo_vendas(?) CROSS join calculo_ordena(calculo_vendas.P1,calculo_vendas.P2,calculo_vendas.P3,calculo_vendas.P4,calculo_vendas.P5,calculo_vendas.P6)", [req.body.codpro], function (err, result) {
			if (err) throw err;
			db.query(sql1, function (err, result1) {
				if (err) throw err;
				db.detach(function () { res.json([result, result1]) })
			})

		});



	});
});




// tela de historicovendas
apiRoutes.post('/buscarhistoricovendas', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select * from historico_vendas(?)", [req.body.busca], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela de CalculoComissao
apiRoutes.post('/buscarCalculoComissao', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select * from Calculo_Comissao(?,?,?)", [req.body.busca.codvend, req.body.busca.datainicio, req.body.busca.datafim], function (err, result) {

			db.detach(function () {
				res.json(result);
			});
		});
	});
});


// tela que mostra vendas do vendedor
apiRoutes.post('/buscarMinhasVendas', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select * from MinhasVendas(?,?,?)", [req.body.busca.codvend, req.body.busca.datainicio, req.body.busca.datafim], function (err, result) {

			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela que mostra produtos da venda do vendedor
apiRoutes.post('/buscarMinhasProdVendas', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select * from MinhasProdVendas(?)", [req.body.busca], function (err, result) {

			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela que mostra as campanhas em andamento do vendedor
apiRoutes.post('/CarregaMinhasCampanhas', function (req, res) {
	codparc = req.body.CODPARC;
	parametro = req.body.parametro;
	admin = req.body.ADMIN;
	if (!admin) { var sql = "select func.nome as nomeparc, metaandamentopremio.*, (case when metaandamentopremio.datainicio> current_date then 'p/ iniciar' else (case when metaandamentopremio.datainicio<= current_date and metaandamentopremio.datafim>= current_date then 'andamento' else 'encerrado'  end)end) as status from metaandamentopremio (" + parametro + ") join func on func.codigo=metaandamentopremio.codparc where metaandamentopremio.codparc=" + codparc };
	if (admin) { var sql = "select func.nome as nomeparc, metaandamentopremio.*, (case when metaandamentopremio.datainicio> current_date then 'p/ iniciar' else (case when metaandamentopremio.datainicio<= current_date and metaandamentopremio.datafim>= current_date then 'andamento' else 'encerrado'  end)end) as status from metaandamentopremio (" + parametro + ") left join func on func.codigo=metaandamentopremio.codparc" };


	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, function (err, result) {

			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// incluir e excluir participante em uma campanha
apiRoutes.post('/IncluirExcluirParcCampanha', function (req, res) {
	codparc = req.body.codparc;
	codmeta = req.body.codmeta;
	parametro = req.body.parametro;

	if (parametro == 1) { var sql = "insert into metaparc (codparc,codmeta) values(" + codparc + "," + codmeta + ")" }
	if (parametro == 2) { var sql = "delete from metaparc where codparc=" + codparc + " and codmeta=" + codmeta }

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// Editar incluir excluir campanha
apiRoutes.post('/EditarCampanha', function (req, res) {
	codmeta = req.body.codmeta;
	campanha = req.body.campanha;
	parametro = req.body.parametro;
	premios = req.body.premios;

	if (parametro == 0) {
		var sql0 = "delete from meta where  codigo=" + codmeta + ";"

		estoque.get(function (err, db) {
			if (err) throw err;
			db.execute(sql0, function (err, result) {
				db.detach(function () {
					res.send(result);
				});
			});
		});
	}

	if (parametro == 1) {
		var sql1 = "select metapremio.codmeta,metapremio.posicao,metapremio.barreira,metapremio.premiovalor, meta.descricao, meta.datainicio, meta.datafim, meta.tipo from metapremio join meta on meta.codigo=metapremio.codmeta where codmeta=" + codmeta + " order by metapremio.posicao"

		estoque.get(function (err, db) {
			if (err) throw err;
			db.query(sql1, function (err, result) {
				db.detach(function () {
					res.send(result);
				});
			});
		});
	}
	if (parametro == 2) {

		if (premios[0].TIPO != 1) {
			var sql2 = "execute block as begin ";
			sql2 += " update meta set descricao='" + campanha.DESCRICAO + "' , datafim='" + dataFirebird(campanha.datafim) + "', datainicio='" + dataFirebird(campanha.datainicio) + "' where codigo=" + codmeta + ";"
			for (i = 0; i < premios.length; i++) {
				sql2 += " update metapremio set barreira=" + premios[i].BARREIRA + ", premiovalor=" + premios[i].PREMIOVALOR + " where codmeta=" + premios[i].CODMETA + " and posicao=" + premios[i].POSICAO + ";"
			}
			sql2 += " end";
		}

		if (premios[0].TIPO == 1) {
			var sql2 = "execute block as begin ";
			sql2 += " update meta set descricao='" + campanha.DESCRICAO + "' , datafim='" + dataFirebird(campanha.datafim) + "', datainicio='" + dataFirebird(campanha.datainicio) + "' where codigo=" + codmeta + ";"
			sql2 += "delete from metapremio where  codmeta=" + premios[0].CODMETA + ";"
			for (i = 0; i < premios.length; i++) {
				sql2 += " insert into metapremio (posicao,codmeta,barreira,premiovalor) values (" + premios[i].POSICAO + "," + premios[i].CODMETA + "," + premios[i].BARREIRA + "," + premios[i].PREMIOVALOR + ");"
			}
			sql2 += " end";
		}

		estoque.get(function (err, db) {
			if (err) throw err;
			db.execute(sql2, function (err, result) {
				db.detach(function () {
					res.send(result);
				});
			});
		});
	}

	if (parametro == 3) {

		var sql3 = "execute block as begin ";
		sql3 += " insert into meta (descricao,datafim,datainicio,tipo) values('" + campanha.DESCRICAO + "','" + dataFirebird(campanha.datafim) + "','" + dataFirebird(campanha.datainicio) + "'," + campanha.TIPO + "); "

		for (i = 0; i < premios.length; i++) {
			sql3 += " insert into metapremio (codmeta,barreira,premiovalor,posicao) values ((select gen_id(gen_codigo_meta,0) from rdb$database)," + premios[i].BARREIRA + "," + premios[i].PREMIOVALOR + "," + premios[i].POSICAO + "); "
		}
		sql3 += " end";

		estoque.get(function (err, db) {
			if (err) throw err;
			db.execute(sql3, function (err, result) {
				db.detach(function () {
					res.send(result);
				});
			});
		});
	}

	if (parametro == 4) {

		var sql4 = "execute block as begin ";
		sql4 += " update produto set meta=null where meta=" + codmeta + "; "
		for (i = 0; i < premios.length; i++) {
			sql4 += " update metaparc set posicao=" + premios[i].POSICAO + ", realizado=" + premios[i].VALOR + ", premio=" + premios[i].PREMIOMETA + " where codmeta=" + premios[i].CODMETA + " and codparc=" + premios[i].CODPARC + ";"
		}
		sql4 += " end";

		estoque.get(function (err, db) {
			if (err) throw err;
			db.execute(sql4, function (err, result) {
				db.detach(function () {
					res.send(result);
				});
			});
		});
	}


});


// tela que mostra os produtos da campanhas em andamento
apiRoutes.post('/CarregaProdutosCampanha', function (req, res) {
	campanha = req.body.campanha;
	grupo = req.body.grupo;
	if (campanha) {
		var sql = "select codigo, codinterno, descricao, unidade, gruposoma from produto where produto.ativo='S' and produto.meta=" + campanha.CODMETA + " order by produto.descricao"
	}

	if (grupo) {
		var sql = "select codigo, codinterno, descricao, unidade, gruposoma from produto where produto.ativo='S' and produto.grupo=" + grupo.CODIGO + " order by produto.descricao"
	}


	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, function (err, result) {

			db.detach(function () {
				res.send(result);
			});
		});
	});
});




// tela que mostra o historico dos produtos da campanhas em andamento do vendedor
apiRoutes.post('/CarregaHistoricoCampanha', function (req, res) {
	campanha = req.body.campanha;
	var sql = "select first 13  func.nome, ((extract(year from venda.data)|| (case when char_length (extract(month from venda.data))=1 then '0'||extract(month from venda.data) else extract(month from venda.data) end )))as  mes, sum(case when meta.tipo=1 then (prodvenda.valor * prodvenda.qtd) else  (produto.gruposoma* prodvenda.qtd)end)  as realizado from prodvenda join venda on venda.lcto=prodvenda.codvenda join func on func.codigo=venda.codvend join produto on produto.codigo=prodvenda.codpro join meta on meta.codigo=produto.meta where produto.meta=" + campanha.CODMETA + " and venda.codvend=" + campanha.CODPARC + " and venda.status='F' and venda.data>= current_date-425 and venda.codcli not in (15850,14825) group by mes,nome order by  mes desc"


	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query(sql, function (err, result) {

			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// tela inicial que mostra os grupos de produtos
apiRoutes.post('/CarregaTabelaGrupos', function (req, res) {
	var GRUPOS = req.body.GRUPOS;

	var sql = "select * from grupoprod order by codfaixa"

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {

			db.detach(function () {


				res.send(result);
			});
		});
	});
});

// tela que mostra grupos de produtos
apiRoutes.post('/CarregaGrupoProd', function (req, res) {
	var GRUPOS = req.body.GRUPOS;

	var sql = "select first 13 ((extract(year from venda.data)|| (case when char_length (extract(month from venda.data))=1 then '0'||extract(month from venda.data) else extract(month from venda.data) end )))as  mes,  sum(produto.gruposoma* prodvenda.qtd)as realizado, sum(prodvenda.qtd*(prodvenda.valor-prodvenda.prcusto))as valormargem from prodvenda join venda on venda.lcto=prodvenda.codvenda join produto on produto.codigo=prodvenda.codpro join grupoprod on grupoprod.codigo=produto.grupo where  grupoprod.codigo in(" + GRUPOS + ") and venda.data>= current_date-425 and venda.status='F' and  venda.codcli not in (15850,14825) group by mes order by mes desc"

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {

			db.detach(function () {


				res.send(result);
			});
		});
	});
});



apiRoutes.post('/buscarNome', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("select codigo,nome from func where nome containing ?", req.body.teste, function (err, result) {

			db.detach(
				function () {
					res.json(result);
				});
		});
	});
});

// TELA QUE CARREGA PRODUTOS COMPRADOS EM ABERTO

apiRoutes.post('/ListaProdComprado', function (req, res) {

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query("select * from lista_prodcompra", function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// TELA QUE CARREGA COMPROMISSOS DE PAGAMENTO FORNECEDORES

apiRoutes.post('/SrvCompromissoLancado', function (req, res) {

	var sql = "select UNIAO.codparc,cliente.fantasia as fornec,uniao.p1,uniao.p2a,uniao.p2b,uniao.p3a,uniao.p3b,uniao.p4a from( select cliente.codgrupo as codparc, sum (case when movban.vcto <= current_date+30 then movban.valor else 0 end) as P1, sum (case when movban.vcto > current_date+30 and movban.vcto <= current_date+45 then movban.valor else 0 end) as P2A, sum (case when movban.vcto > current_date+45 and movban.vcto <= current_date+60 then movban.valor else 0 end) as P2B, sum (case when movban.vcto > current_date+60 and movban.vcto <= current_date+75 then movban.valor else 0 end) as P3A, sum (case when movban.vcto > current_date+75 and movban.vcto <= current_date+90 then movban.valor else 0 end) as P3B, sum (case when movban.vcto > current_date+90 and movban.vcto <= current_date+105 then movban.valor else 0 end) as P4A from movban join cliente on cliente.codigo=movban.codcli where despesa=2 and pagto is null group by  cliente.codgrupo)as UNIAO join cliente on cliente.codigo=uniao.codparc";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});





// ELIMINA PRODUTO COMPRADO NÃO ATENDIDO

apiRoutes.post('/SrvEliminaProdutoCompra', function (req, res) {

	var DATA = dataFirebird(req.body.DATA);
	var CODPRO = req.body.CODPRO;
	var QTD = -req.body.QTDABERTOPEDIDO;
	var VALOR = req.body.VALOR;
	var LCTOCOMPRA = req.body.LCTOCOMPRA;
	var EMPRESA = req.body.EMPRESA;
	var CODPARC = req.body.CODPARC;
	var TipoCompra = req.body.TIPOCOMPRA;


	var sql = " execute block as begin ";
	sql += " insert into prodcompra (DATA,LCTOCOMPRA,CODPRO,QTD,VALOR,EMPRESA,CODPARC,TIPO) values ('" + DATA + "'," + LCTOCOMPRA + "," + CODPRO + "," + QTD + "," + VALOR + "," + EMPRESA + "," + CODPARC + "," + TipoCompra + ");";
	sql += " end ";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.execute(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});


// CARREGA GERA COMPRA

apiRoutes.post('/SrvGeraCompra', function (req, res) {

	if (!req.body.codparc) {
		var sql = "select 0 as empresa, prazocompra.codigo as codprazo, prazocompra.nroparcelas, prazocompra.passo, prazocompra.inicio, cliente.esperafat, cliente.fantasia, geracompra.*, geracompra.comprar*geracompra.prcompra as total, case when geracompra.Q3>0 then (((geracompra.FATURADO+geracompra.COMPRADO+geracompra.QTDCD+geracompra.QTDSAILOJATRANSF+geracompra.QTDSAILOJADEV-geracompra.QTDTOTALRESERVA)/geracompra.Q3)*100) else 0 end as PORCENTAGEM from geracompra join cliente on cliente.codigo=geracompra.codparc join prazocompra on prazocompra.codigo=cliente.prazo where geracompra.comprar>0"
	}
	if (req.body.codparc) {
		var sql = "select 0 as empresa, prazocompra.codigo as codprazo, prazocompra.nroparcelas, prazocompra.passo, prazocompra.inicio, cliente.esperafat, cliente.fantasia, geracompra.*, geracompra.comprar*geracompra.prcompra as total, case when geracompra.Q3>0 then (((geracompra.FATURADO+geracompra.COMPRADO+geracompra.QTDCD+geracompra.QTDSAILOJATRANSF+geracompra.QTDSAILOJADEV-geracompra.QTDTOTALRESERVA)/geracompra.Q3)*100) else 0 end as PORCENTAGEM from geracompra join cliente on cliente.codigo=geracompra.codparc join prazocompra on prazocompra.codigo=cliente.prazo where  geracompra.codparc=" + req.body.codparc;
	}

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// CARREGA PRAZOS COMPRA
apiRoutes.post('/SrvCarregaPrazoCompra', function (req, res) {

	codprazo = req.body.CodPrazo;

	if (!codprazo) {
		var sql = "select prazocompra.* from prazocompra order by  prazocompra.nroparcelas, prazocompra.inicio"
	}
	if (codprazo) {
		var sql = "select prazocompra.* from prazocompra where codigo=" + codprazo
	}


	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
// CARREGA EMPRESAS
apiRoutes.post('/SrvCarregaEmpresas', function (req, res) {

	codempresa = req.body.CodEmpresa;

	if (!codempresa) {
		var sql = "select param.codigo, cliente.codigo as codparc,cliente.razao from param join  cliente on cliente.codigo=param.codparc";
	}
	if (codempresa) {
		var sql = "select param.codigo, cliente.codigo as codparc,cliente.razao from param join  cliente on cliente.codigo=param.codparc where codigo=" + codempresa;
	}
	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

// CARREGA DADOS CABEÇALHO PEDIDO DE COMPRA
apiRoutes.post('/DadosCabecaPedido', function (req, res) {

	var codparc = req.body.CodParc;
	var codempresa = req.body.CodEmpresa;
	var codprazo = req.body.CodPrazo;


	var sql = "select * FROM monta_pedido_compra(" + codparc + "," + codprazo + "," + codempresa + ")";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.query(sql, function (err, result) {
			if (err) throw err;
			db.detach(function () {
				res.send(result);
			});
		});
	});
});


// funcão que envia o pedido de compra para o fornecedor
apiRoutes.post('/EnviarPedidoCompra', function (req, res) {
	var DataFaturamento = dataFirebird(req.body.DataFaturamento);
	var TextoDataFaturamento = req.body.TextoDataFaturamento;
	var CodParc = req.body.CodParc;
	var CabecaPedido = req.body.CabecaPedido;
	var PedidoParc = req.body.PedidoParc;
	var TotalPedido = req.body.TotalPedido;
	var envio = req.body.envio;
	var Hoje = new Date();
	var TipoPedido = req.body.TipoPedido;

	function dataPedidoCompra(data) {
		var data = converteData(data);
		return data.getDate() + '/' + (data.getMonth() + 1) + '/' + data.getFullYear();
	}

	if (TextoDataFaturamento != 'Imediato' && TipoPedido == 0) { TextoDataFaturamento = dataPedidoCompra(TextoDataFaturamento) }

	var sql = "execute block as begin ";
	sql += "insert into compra (tipo,empresa,codparc,data,datafaturamento,valor,prazo) values ";
	sql += "(" + TipoPedido + "," + PedidoParc[0].EMPRESA + "," + CodParc + ",current_date,'" + DataFaturamento + "',0," + PedidoParc[0].CODPRAZO + ");";
	for (i = 0; i < PedidoParc.length; i++) {
		sql += "insert into prodcompra (tipo,data,lctocompra,empresa,codparc,codpro,qtd,valor,defeito,codvend,codprodvenda) values ";
		sql += "(" + TipoPedido + ",current_date,(select gen_id(gen_lcto_compra,0) from rdb$database)," + PedidoParc[0].EMPRESA + "," + CodParc + "," + PedidoParc[i].CODPRO + "," + PedidoParc[i].COMPRAR + "," + PedidoParc[i].PRCOMPRA + ",'" + PedidoParc[i].DEFEITO + "'," + PedidoParc[i].CODVEND + "," + PedidoParc[i].CODPRODVENDA + ");";
	}
	if (TipoPedido != 0) {
		for (i = 0; i < PedidoParc.length; i++) {

			sql += "update prodvenda set qtddevolvido=" + (PedidoParc[i].COMPRAR + PedidoParc[i].DEVOLVIDO) + " where codigo=" + PedidoParc[i].CODPRODVENDA + ";";

		}

	}

	sql += " end";

	estoque.get(function (err, db) {
		if (err) throw err;
		db.execute(sql, function (err, result) {
			if (err) throw err;
			db.query("select first 1 lcto from compra order by lcto desc", function (err, result) {
				if (err) throw err;
				db.detach(function () {
					if (TipoPedido == 0) {
						var html = "<html><head><style>body {background: white;display: block;margin: 1cm}table{width: 100%;border-collapse: collapse;}table, th, td {border: 1px solid black;}table,td,tr,span{font-size:8pt;font-family:Arial;}td {min-width:4mm;padding:4px;}hr{border-top:1pt dashed #000;}.valor{text-align:right;}.qtd{text-align:center;} </style></head><body>"
						html += "<h3>Pedido: " + result[0].LCTO + " - " + CabecaPedido.RAZAOEMPRESA + " - " + dataPedidoCompra(Hoje) + "</h3>";
						html += "<span>Fornecedor: " + CabecaPedido.RAZAOFORNEC + "</span></br>";
						html += "<span>Prazo de Pagto: " + CabecaPedido.DESCRICAOPRAZO + " dias</span></br>"
						html += "<span>Faturamento Programada P/: " + TextoDataFaturamento + "</span></br>"
						html += "<span>Total do Pedido: R$ " + new String(TotalPedido.toFixed(2)).replace(".", ",") + "</span></br>"
						html += "<br>"
						html += "<table>"
						html += "<thead><tr><td>Codigo</td><td>Descricao</td><td class='qtd'>Qtd</td><td class='qtd'>Unid</td><td class='valor'>R$ Unit.</td><td class='valor'>R$ Total.</td></tr></thead>"
						html += "<tbody>"
						for (i = 0; i < PedidoParc.length; i++) {
							html += "<tr><td>" + PedidoParc[i].CODINTERNO + "</td><td>" + PedidoParc[i].DESCRICAO + "</td><td class='qtd'>" + PedidoParc[i].COMPRAR + "</td><td class='qtd'>" + PedidoParc[i].UNIDADE + "</td><td class='valor'>" + new String(PedidoParc[i].PRCOMPRA.toFixed(2)).replace(".", ",") + "</td><td class='valor'>" + new String(PedidoParc[i].TOTAL.toFixed(2)).replace(".", ",") + "</td></tr>"
						}
						html += "</tbody></table>"
						html += "</body></html>"

						pdf.create(html, { format: 'A4' }).toFile('c:/temp/pedidocompra.pdf', function (err, retorno) {
							if (err) throw err;
							nodemailer.createTestAccount((err, account) => {
								// create reusable transporter object using the default SMTP transport
								let transporter = nodemailer.createTransport({
									host: 'email-ssl.com.br',
									port: 465,
									secure: true, // true for 465, false for other ports
									auth: {
										user: "compras@florestalferragens.com.br", // generated ethereal user
										pass: "F@rofino11" // generated ethereal password
									}
								});
								// setup email data with unicode symbols
								let mailOptions = {
									from: '"Compras Florestal/Local" <compras@florestalferragens.com.br>', // sender address
									to: envio.email, // list of receivers
									cc: 'compras@florestalferragens.com.br',
									subject: envio.assunto, // Subject line
									text: envio.texto, // plain text body
									attachments: [{   // file on disk as an attachment
										path: 'c:/temp/pedidocompra.pdf' // stream this file
									}]
								};
								// send mail with defined transport object
								transporter.sendMail(mailOptions, (error, info) => {
									if (error) {
										res.send('envio com erro')
									}
									res.send('email enviado')
								});
							});

						});
					}
					else { res.send('ok') }

				});
			})
		});
	});

})





// tela da localdecor
app.get('/puxadados', function (req, res) {
	options = {
		method: 'POST',
		url: "https://www.rumo.com.br/sistema/adm/APILogon.asp",
		encoding: 'utf8',
		headers: {
			'User-Agent': 'FastCommerce API Interface',
			'Content-type': 'application/x-www-form-urlencoded',
			'Charset': 'UTF-8'
		},
		form: {
			StoreName: 'Localdecor',
			StoreID: 11058,
			Username: 'API',
			Password: '5hj08*V3z',
			method: 'ReportView',
			ObjectName: "Lista de pedidos alterados para consultas via API",
			Par1: 3,
			OutputFormat: 6
		}
	};
	request.get(options).pipe(res);



});

apiRoutes.post('/vendalocal', function (req, res) {
	function atualizasite(pedido, pedidosite) {
		options = {
			method: 'POST',
			url: "https://www.rumo.com.br/sistema/adm/APILogon.asp",
			encoding: 'utf8',
			headers: {
				'User-Agent': 'FastCommerce API Interface',
				'Content-type': 'application/x-www-form-urlencoded',
				'Charset': 'UTF-8'
			},
			form: {
				StoreName: 'Localdecor',
				StoreID: 11058,
				Username: 'API',
				Password: '5hj08*V3z',
				method: 'OrderUpdate',
				XMLRecords: '<Records><Record><Field Name="NumPedido" Value="' + pedidosite + '" /><Field Name="ObsCurta" Value="' + pedido + '"/><Field Name="Status" Value="3"/></Record></Records>'
			}
		};
		request.get(options);
	};

	function organiza(pedido, pedidosite, callback) {
		sql = 'execute block as begin ';
		// sql += 'insert into prodvenda (codvenda,codpro,qtd,qtdreserva,valor) values (' + pedido + ',20031,1,1,' + req.body.frete + ');';
		for (i = 0; i < req.body.produtos.length; i++) {
			sql += 'insert into prodvenda (codvenda,codpro,qtd,qtdreserva,valor) values (' + pedido + ',' + req.body.produtos[i].ID + ',' + req.body.produtos[i].QTD + ',' + req.body.produtos[i].QTD + ',' + req.body.produtos[i].VALOR + ');';
		}
		sql += "UPDATE VENDA SET STATUS='R' WHERE LCTO=" + pedido + ";";
		sql += 'execute procedure insere_frete(' + req.body.frete + ',' + pedido + ');';
		sql += 'end';
		Firebird.attach(config.FBestoque, function (err, db) {
			if (err)
				throw err;
			// db = DATABASE
			db.execute(sql, function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					atualizasite(pedido, pedidosite);
					res.json(sql);
				});
			});
		});
	};

	function firebird(sql, pedido, pedidosite, callback) {
		Firebird.attach(config.FBestoque, function (err, db) {
			if (err)
				throw err;
			// db = DATABASE
			db.execute(sql, function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					atualizasite(pedido, pedidosite);
					res.json(sql);
				});
			});
		});
		// res.json(sql);
	}
	Firebird.attach(config.FBestoque, function (err, db) {
		if (err)
			throw err;
		db.query("INSERT INTO venda (DATA,NOMECLI,CODCLI,CLIENTEDE,CODVEND,STATUS,ENDERECO,NUMERO,COMPLEMENTO,BAIRRO,CIDADE,ESTADO,CEP) values (current_date,?,?,12872,290,'A',?,?,?,?,?,?,?) returning lcto", [req.body.nome, req.body.cliente, req.body.endereco[0], req.body.endereco[1], req.body.endereco[2], req.body.endereco[3], req.body.endereco[4], req.body.endereco[5], req.body.endereco[6]], function (err, result) {
			if (err)
				throw err;
			organiza(result.LCTO, req.body.pedido, firebird);
		});
	});
});
apiRoutes.post('/confirmapagto', function (req, res) {
	var venda = req.body.venda;
	var conta = '';
	var obs = '';
	var tipo = '';
	var vencimento = '';

	function atualizasite(pedidosite, pedido) {
		options = {
			method: 'POST',
			url: "https://www.rumo.com.br/sistema/adm/APILogon.asp",
			encoding: 'utf8',
			headers: {
				'User-Agent': 'FastCommerce API Interface',
				'Content-type': 'application/x-www-form-urlencoded',
				'Charset': 'UTF-8'
			},
			form: {
				StoreName: 'Localdecor',
				StoreID: 11058,
				Username: 'API',
				Password: '5hj08*V3z',
				method: 'OrderUpdate',
				XMLRecords: '<Records><Record><Field Name="NumPedido" Value="' + pedidosite + '" /><Field Name="ObsCurta" Value="' + pedido + '"/><Field Name="Status" Value="5"/></Record></Records>'
			}
		};
		request.get(options);
	};
	// var parcela=(venda.valor/venda.parc).toFixed(2);
	// var resto = (venda.valor-(parcela*venda.parc)).toFixed(2);
	sql = 'execute block as begin ';
	if (venda.tipopag == 'Cartão de crédito' && venda.bandeira == 'Mastercard') {
		conta = 33;
		obs = 'Venda A Prazo';
		tipo = 'CM';
		vencimento = 'current_date+30';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela1 + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		for (i = 1; i < venda.parc; i++) {
			vencimento = 'current_date+' + (30 * (i + 1));
			sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
			sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		}
	} else if (venda.tipopag == 'Cartão de crédito' && venda.bandeira == 'VISA') {
		conta = 32;
		obs = 'Venda A Prazo';
		tipo = 'CC';
		vencimento = 'current_date+30';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela1 + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		for (i = 1; i < venda.parc; i++) {
			vencimento = 'current_date+' + (30 * (i + 1));
			sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
			sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		};
	} else if (venda.tipopag == 'Cartão de crédito' && venda.bandeira == 'Elo') {
		conta = 32;
		obs = 'Venda A Prazo';
		tipo = 'CC';
		vencimento = 'current_date+30';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela1 + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		for (i = 1; i < venda.parc; i++) {
			vencimento = 'current_date+' + (30 * (i + 1));
			sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
			sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.parcela + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
		};
	} else if (venda.tipopag == 'Boleto bancário') {
		conta = 35;
		obs = 'Venda A Vista';
		tipo = 'DI';
		vencimento = 'current_date';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	} else if (venda.tipopag == 'Depósito bancário') {
		conta = 35;
		obs = 'Venda A Vista';
		tipo = 'DI';
		vencimento = 'current_date';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	} else if (venda.tipopag == 'Marcar em carteira') {
		conta = 7;
		obs = 'Venda A Prazo';
		tipo = 'NP';
		vencimento = '15/11/2016';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	} else if (venda.tipopag == 'Itaú Shopline') {
		conta = 35;
		obs = 'Venda A Vista';
		tipo = 'DI';
		vencimento = 'current_date';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	} else if (venda.tipopag == 'VISA Electron') {
		conta = 32;
		obs = 'Venda A Prazo';
		tipo = 'DA';
		vencimento = 'current_date';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	} else if (venda.tipopag == 'MercadoPago') {
		conta = 34;
		obs = 'Venda A Prazo';
		tipo = 'NP';
		vencimento = 'current_date+30';
		sql += "insert into movban (codban,data,ent_sai,hora,historico,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + conta + ",current_date, 'E',current_time,'" + obs + "'," + venda.valor + "," + venda.numero + ",1,'VANIUS'," + vencimento + "," + venda.numero + "," + venda.cliente + ",'" + tipo + "','N');";
	};
	sql += "update venda set status='F',data=current_date where lcto=" + venda.numero + ";";
	sql += 'end';
	if (conta) {
		Firebird.attach(config.FBlocal, function (err, db) {
			if (err)
				throw err;
			// db = DATABASE
			db.execute(sql, function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					atualizasite(venda.numpedido, venda.numero);
					res.json(sql);
				});
			});
		});
	} else {
		res.send('pagamento desconhecido')
	};
});

apiRoutes.post('/checacliente', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,codigo,fantasia,email,fone,endereco,bairro,numero,cidade,estado,cep,complemento from cliente where replace (replace(replace(cgc,'/',''),'.',''),'-','') = ?", [req.body.cliente], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/cadastracliente', function (req, res) {
	var cliente = req.body.cliente;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("insert into cliente (ativo,fantasia,razao,cgc,insc,tipo,endereco,numero,bairro,complemento,cidade,estado,cep,fone,celular,contato,email,fisjur) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", ['S', cliente.fantasia, cliente.razao, cliente.cgc, cliente.insc, 0, cliente.endereco, cliente.numero, cliente.bairro, cliente.complemento, cliente.cidade, cliente.estado, cliente.cep, cliente.fone, cliente.celular, cliente.contato, cliente.email, cliente.tipo], function (err, result) {
			if (err) {
				throw err;
			};
			db.query("select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc, codigo,fantasia from cliente where cgc = ?", [cliente.cgc], function (err, result1) {
				// IMPORTANT: close the connection
				if (err) {
					throw err;
				}
				db.detach(function () {
					res.json(result1);
				});
			});
		});
	});
});
// tela de vendas e caixa
apiRoutes.post('/pagamentos', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from pagamentos where ativo = 1 and empresa =?", req.body.empresa, function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	})
})
apiRoutes.post('/confirmapagamento', function (req, res) {
	var base = estoque;
	let venda = req.body.venda;
	let pagamento = req.body.pagamento;
	sql = "execute block as begin ";
	for (i = 0; i < pagamento.length; i++) {
		sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + pagamento[i].codban + ",current_date,'E',current_time," + pagamento[i].valor + "," + venda.LCTO + ",1,'VANIUS','" + dataFirebird(pagamento[i].vencimento) + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + pagamento[i].tipo + "','N');";
	}
	sql += "update venda set status='F',data=current_date,empresa=" + req.body.empresa + " where lcto=" + venda.LCTO + ";";
	sql += 'end';
	base.get(function (err, db) {
		if (err)
			throw err;
		db.execute(sql, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () { res.json(sql) });
		});
	});
})

apiRoutes.post('/confirmapagamentoteste', function (req, res) {
	if (req.body.empresa == 1) var base = estoque;
	if (req.body.empresa == 2) var base = local;
	if (!req.body.empresa) var base = estoque;
	let venda = req.body.venda;
	let pagamento = req.body.pagamento;
	sql = "execute block as begin ";
	for (i = 0; i < pagamento.length; i++) {
		sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome)";
		sql += "values (" + pagamento[i].codban + ",current_date,'E',current_time," + pagamento[i].valor + "," + venda.LCTO + ",1,'VANIUS','" + dataFirebird(pagamento[i].vencimento) + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + pagamento[i].tipo + "','N'," + pagamento[i].banco + ",'" + pagamento[i].agencia + "','" + pagamento[i].conta + "','" + pagamento[i].nrcheque + "','" + pagamento[i].emnome + "');";
	}
	sql += "update venda set status='F',data=current_date,empresa=" + req.body.empresa + " where lcto=" + venda.LCTO + ";";
	sql += 'end';
	base.get(function (err, db) {
		if (err)
			throw err;
		db.execute(sql, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () { res.json(sql) });
		});
	});
})
apiRoutes.post('/confirmapagamento2', function (req, res) {
	if (req.body.empresa == 1) var base = estoque;
	if (req.body.empresa == 2) var base = local;
	if (!req.body.empresa) var base = estoque;
	let venda = req.body.venda;
	let pagamento = req.body.pagamento;
	sql = "execute block as begin ";
	for (i = 0; i < pagamento.length; i++) {
		sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao)";
		sql += "values (" + pagamento[i].codban + ",current_date,'E',current_time," + pagamento[i].valor + "," + venda.LCTO + ",1,'VANIUS','" + dataFirebird(pagamento[i].vencimento) + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + pagamento[i].tipo + "','N');";
	}
	sql += "update venda set status='F',data=current_date where lcto=" + venda.LCTO + ";";
	sql += 'end';
	base.get(function (err, db) {
		if (err)
			throw err;
		db.execute(sql, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () { res.json(sql) });
		});
	});
})


apiRoutes.post('/valecliente', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select sum (vlbruto) as total  from movban where codcli=? and codban=107 and pagto is null", req.body.busca, function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	})
})
apiRoutes.post('/confirmapagamentoteste', function (req, res) {
	if (req.body.empresa == 1) var base = estoque;
	if (req.body.empresa == 2) var base = local;
	if (!req.body.empresa) var base = estoque;
	let venda = req.body.venda;
	let pagamento = req.body.pagamento;
	sql = "execute block as begin ";
	for (i = 0; i < pagamento.length; i++) {
		sql += "insert into movban (codban,data,ent_sai,hora,vlbruto,documento,despesa,usuario,vcto,lctosaida,codcli,tipopag,projecao,banco,agencia,conta,nrcheque,emnome)";
		sql += "values (" + pagamento[i].codban + ",current_date,'E',current_time," + pagamento[i].valor + "," + venda.LCTO + ",1,'VANIUS','" + dataFirebird(pagamento[i].vencimento) + "'," + venda.LCTO + "," + venda.CODCLI + ",'" + pagamento[i].tipo + "','N'," + pagamento[i].banco + ",'" + pagamento[i].agencia + "','" + pagamento[i].conta + "','" + pagamento[i].nrcheque + "','" + pagamento[i].emnome + "');";
	}
	sql += "update venda set status='F',data=current_date where lcto=" + venda.LCTO + ";";
	sql += 'end';
	base.get(function (err, db) {
		if (err)
			throw err;
		db.execute(sql, function (err, result) {
			if (err)
				throw err;
			// IMPORTANT: close the connection
			db.detach(function () { res.json(sql) });
		});
	});
})
apiRoutes.post('/listavendasemuso', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select lcto,codcli,nomecli,codvend,venda.data,status,obs,venda.total,func.nome as nomevend from venda join func on func.codigo = venda.codvend WHERE venda.STATUS=? and codvend=? order by nomecli", [req.body.busca, req.body.codvend], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	})
})
apiRoutes.post('/inserepacote', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select pacote.codbar, pacote.id_produto as codigo, produto.prvenda as valor,produto.descricao,pacote.qtd as qtdpedido,produto.unidade from pacote join produto on produto.codigo = pacote.id_produto where pacote.codbar=? ", [req.body.pacote], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result[0]);
			});
		});
	})
})

apiRoutes.post('/listavendas', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		if (req.body.vendaaberta) {
			db.query("update venda set status = 'C' where lcto = ?", req.body.vendaaberta, function (err, result) {
				consulta();
			})
			// IMPORTANT: close the connection
		}
		else consulta();
		// db = DATABASE
		function consulta() {
			db.query("select lcto,codcli,nomecli,codvend,venda.data,status,venda.obs,venda.total,func.usuario as nomevend,cliente.CGC  from venda join func on func.codigo = venda.codvend join cliente on cliente.codigo = venda.codcli WHERE venda.STATUS=? order by nomecli", req.body.busca, function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json(result);
				});
			});
		}
	})
})

apiRoutes.post('/listaprodvenda', function (req, res) {
	var base = estoque;
	// var sql = "SELECT PRODUTO.CODIGO,PRODUTO.CODINTERNO,PRODUTO.ALIQ,PRODUTO.SITTRIB,PRODUTO.LOCAL,PRODUTO.DESCRICAO,PRODUTO.UNIDADE,PRODVENDA.CODIGO AS CODPRODVENDA,PRODVENDA.QTD AS QTDPEDIDO,PRODVENDA.qtdreserva,PRODVENDA.valor,(prodvenda.VALOR*prodvenda.QTD) as total,prodvenda.valorini FROM PRODVENDA JOIN PRODUTO ON PRODVENDA.CODPRO = PRODUTO.CODIGO WHERE PRODVENDA.CODVENDA = ?";
	var sql = "select * from listaprodvendas(?)"
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query(sql, req.body.busca, function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	})
})
apiRoutes.post('/defineFaturamentoVenda', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query("UPDATE VENDA SET VENDA.CDCONDPAGTO = ? WHERE LCTO = ? ", [req.body.codPrazo, req.body.venda], function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	})
})
apiRoutes.post('/vendaNF', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select v.lcto,v.codcli,v.empresa,v.total,tr.peso,tr.volumes,tr.frete,tr.outra_desp,tr.desconto,tr.total_nota,tr.tipofrete,c.cgc,c.razao,c.insc,c.endereco,c.numero,c.bairro,c.complemento,c.cidade,c.cep,c.fone,c.email,ci.codibge,c.codcidade,ci.estado,ci.cod_estado,mb.valor,  mb.vcto as vencimento,mb.codban from venda v join transito tr on v.lcto = tr.documento join cliente c on c.codigo=v.codcli join cidade ci on c.codcidade = ci.cod_cidade join movban mb on mb.lctosaida = v.lcto left join transp on tr.codtransp = transp.codigo where lcto = ? order by mb.codigo", req.body.busca, function (err, venda) {
			db.query("select pv.codpro,pv.valor,pv.qtd,pr.codinterno, pr.descricao, pr.unidade, pr.sittrib, pr.classfis as ncm, pr.orig, pr.grupo, pr.aliq FROM prodvenda pv join produto pr on pr.codigo = pv.codpro where pv.codvenda = ?", req.body.busca, function (err, prodvenda) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json([venda, prodvenda]);
				});
			});
		});
	})
})
apiRoutes.post('/descontototalvenda', function (req, res) {

	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from  desconto(?,?)", req.body.dados, function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	})
})

apiRoutes.post('/atualizavenda', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("update or insert into venda (codcli,nomecli,codvend,obs,status,data,lcto) values (?,?,?,?,?,current_date,?) returning lcto,codcli,codvend,nomecli,status,data,frete,obs,(select nome as nomevend from func where codigo = codvend),(select liberafat from cliente where codigo=codcli)", req.body.dados, function (err, result) {
			if (err)
				throw err;
			db.detach(function () {
				res.json(result);
			});
			// IMPORTANT: close the connection
		});
	});
});

apiRoutes.post('/puxalocal', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("EXECUTE PROCEDURE COPIA_VENDA_ESTOQUE ?", req.body.pedido, function (err, result) {
			if (err)
				throw err;
			db.detach(function () {
				res.json(result);
			});
			// IMPORTANT: close the connection
		});
	});
});

apiRoutes.post('/atualizaprodvenda', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("update prodvenda set valor=? where codigo =?", [req.body.dados.VALOR, req.body.dados.CODPRODVENDA], function (err, result) {
			if (err)
				throw err;
			db.detach(function () {
				res.json(result);
			});
			// IMPORTANT: close the connection
		});
	});
});

apiRoutes.post('/insereprodvenda', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("insert into prodvenda (CODVENDA,CODPRO,CODPRO_FISCAL,QTD,QTDRESERVA,VALOR,VALORINI) values (?,?,?,?,?,?,?) RETURNING codvenda", req.body.dados, function (err, result) {
			db.query("select * from listaprodvendas(?)", result.CODVENDA, function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json(result);
				});
			});
		});
	});
});
apiRoutes.post('/removeprodvenda', function (req, res) {
	var base = estoque;
	base.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("delete from prodvenda where codigo=?", req.body.dados[0], function (err, result) {
			if (err)
				throw err;
			db.query("select * from listaprodvendas(?)", req.body.dados[1], function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json(result);
				});
			});
		});
	});
});


// tela de gerenciamento de produtos
apiRoutes.post('/atualizasite', function (req, res) {
	estoque.get(function (err, db) {
		function ProcessaLista(item) {

			var root = builder.create('Records');
			if (err)
				throw err;
			db.sequentially("SELECT  P.CODIGO,P.DESCRICAO,P.ATIVO,P.CODINTERNO,M.MODELO1,M.URLAPOIO,M.CODVIDEO,M.MODELO2,m.ordem,P.PRPROMO,P.PRVENDA,PAI.IDSITE as IDSITEPAI,P.IDSITE,(select count(*) from produto where idsite2=pai.codigo) as ordena FROM PRODUTO P JOIN ESTOQUE M ON M.ID=P.CODIGO JOIN PRODUTOPAI PAI ON PAI.CODIGO=P.IDSITE2 WHERE P.codforn =? order by idsite2,ordem desc", [item], function (row, index) {
				if (!row.CODVIDEO) row.CODVIDEO = '';
				if (!row.URLAPOIO) row.URLAPOIO = '';
				if (!row.MODELO2) row.MODELO2 = '';
				if (row.PRPROMO) {
					datainicio = '20/10/2016';
					datafim = '30/11/2016'
				} else {
					datainicio = '20/10/2016';
					datafim = '20/11/2016'
				};
				if (!row.PRPROMO) row.PRPROMO = '';
				if (!row.IDSITE) {
					// root.ele('Record')
					// .ele('Field', {'Name': 'Comando','Value': 'I'}).up()
					// .ele('Field', {'Name': 'IDProdutoPai','Value': row.IDSITEPAI}).up()
					// .ele('Field', {'Name': 'NomeCat','Value': 'Novos'}).up()
					// .ele('Field', {'Name': 'CodProd','Value': row.CODINTERNO}).up()
					// .ele('Field', {'Name': 'Descricao','Value': titleCase(row.DESCRICAO)}).up()
					// .ele('Field', {'Name': 'Disponivel','Value': true}).up()
					// .ele('Field', {'Name': 'Preco','Value': row.PRVENDA}).up()
					// .ele('Field', {'Name': 'OrdemProd','Value': (row.ORDENA - row.ORDEM)}).up()
					// .ele('Field', {'Name': 'MaxParcelasProd','Value': '10'}).up()
					// .ele('Field', {'Name': 'ImagemProd','Value': row.CODIGO+'p1.jpg'}).up()
					// .ele('Field', {'Name': 'ImagemDet','Value': row.CODIGO+'m1.jpg'}).up()
					// .ele('Field', {'Name': 'ImagemAmp','Value': row.CODIGO+'m1.jpg'}).up()
					// .ele('Field', {'Name': 'AdicionalD1','Value': row.MODELO1}).up()
					// .ele('Field', {'Name': 'AdicionalD2','Value': row.MODELO2}).up()
					// .ele('Field', {'Name': 'AdicionalD3','Value': row.CODIGO}).up()
					// .ele('Field', {'Name': 'CodVideo','Value': row.CODVIDEO}).up()
					// .ele('Field', {'Name': 'DescrURL','Value': row.URLAPOIO}).up()
					// .ele('Field', {'Name': 'Estoque','Value': 999});
				} else if (row.IDSITE && row.ATIVO == 'N') {
					root.ele('Record')
						.ele('Field', {
							'Name': 'Comando',
							'Value': 'A'
						}).up()
						.ele('Field', {
							'Name': 'IDProduto',
							'Value': row.IDSITE
						}).up()
						.ele('Field', {
							'Name': 'Disponivel',
							'Value': false
						});
				} else {
					root.ele('Record')
						.ele('Field', {
							'Name': 'Comando',
							'Value': 'A'
						}).up()
						.ele('Field', {
							'Name': 'IDProduto',
							'Value': row.IDSITE
						}).up()
						// .ele('Field', {'Name': 'Preco','Value': row.PRVENDA}).up()
						// .ele('Field', {'Name': 'DataPromInicio','Value': datainicio}).up()
						// .ele('Field', {'Name': 'DataPromFim','Value': datafim}).up()
						// .ele('Field', {'Name': 'PrecoProm','Value': row.PRPROMO}).up()
						// .ele('Field', {'Name': 'Descricao','Value': titleCase(row.DESCRICAO)}).up()
						// .ele('Field', {'Name': 'Descricao','Value': titleCase(row.DESCRICAO)}).up()
						.ele('Field', {
							'Name': 'AdicionalD1',
							'Value': row.MODELO1
						}).up()
						.ele('Field', {
							'Name': 'AdicionalD2',
							'Value': row.MODELO2
						}).up();
					// .ele('Field', {'Name': 'OrdemProd','Value': (row.ORDENA - row.ORDEM)}).up()
					// .ele('Field', {'Name': 'CodVideo','Value': row.CODVIDEO}).up()
					// .ele('Field', {'Name': 'DescrURL','Value': row.URLAPOIO}).up()
					// .ele('Field', {'Name': 'Peso','Value': '30'}).up()
					// .ele('Field', {'Name': 'IsProdutoGrande','Value': 'true'}).up() ;

					// .ele('Field', {'Name': 'ImagemProd','Value': row.CODIGO+'p1.jpg'}).up()
					// .ele('Field', {'Name': 'ImagemDet','Value': row.CODIGO+'m1.jpg'}).up()
					// .ele('Field', {'Name': 'ImagemAmp','Value': row.CODIGO+'m1.jpg'}).up();
				}


			}, function (err) {

				// console.log("foi");
				console.log(root.toString({
					pretty: true
				}));
				envia(root.toString({
					pretty: true
				}));

			});
		};

		function envia(data) {
			options = {
				method: 'POST',
				url: "https://www.rumo.com.br/sistema/adm/APILogon.asp",
				headers: {
					'User-Agent': 'FastCommerce API Interface',
					'Content-type': 'application/x-www-form-urlencoded',
					'Charset': 'UTF-8'
				},
				form: {
					StoreName: 'Localdecor',
					StoreID: 11058,
					Username: 'API',
					Password: '5hj08*V3z',
					method: 'ProductManagement',
					OutputFormat: 3,
					XMLRecords: data
				}
			};

			var parser = new xml2js.Parser();
			request(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					parser.parseString(body, function (err, result) {
						if (!error && response.statusCode == 200) {
							res.send(body);
						} else {
							res.send(body);
						};
					});

				} else {
					res.send(body);
				};
			});
		};
		var rest = req.body.cod.split(",");
		rest.forEach(function (item, index) {
			ProcessaLista(item);
			process++;
			// console.log(process);
			if (process === rest.length) {
				console.log(rest.length)
			};

		});




	});
});

// tela de ordem de serviço
apiRoutes.post('/carregaos', function (req, res) {
	//
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from OS_STATUS_3", function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/geraos', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("SELECT * FROM CRIA_OS (?,?)", [req.body.tipo, req.body.pedidos], function (err, result1) {
			if (err)
				throw err;
			db.detach(function () {
				res.json(result);
			});
		});


	});
	// estoque.get(function(err, db) {
	// 	if (err)
	// 		throw err;
	// 	// db = DATABASE
	// 	db.query("INSERT INTO OS (STATUS,DATA_INICIO,TIPO) values (1,current_date,?)  returning ID_OS", [req.body.tipo], function(err, result) {
	// 		db.query("UPDATE TRANSITO SET STATUS = 1,ESTOQUE = 1,OS = ? WHERE DOCUMENTO IN (SELECT * FROM P_SPLIT (?, ','))", [result.ID_OS, req.body.pedidos], function(err, result1) {
	// 			if (err)
	// 				throw err;
	// 			db.detach(function() {
	// 				res.json(result);
	// 			});
	// 		});
	// 	});
	// });
});
apiRoutes.post('/preos', function (req, res) {
	//
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from CRIA_PREOS(?)", [req.body.DOCUMENTO], function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/detalheos', function (req, res) {
	//
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from OS_DETALHADA(?)", [req.body.OS], function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/retornoos', function (req, res) {
	//
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select OS,CODPRO,QTD2,DESCRICAO from os_status where status=4 and qtd2 >0", function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/detalhepedido', function (req, res) {
	//
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select prodvenda.qtd as qtdped,prodvenda.codpro as codprod,produto.descricao,produto.unidade from prodvenda join produto on prodvenda.codpro=produto.codigo where prodvenda.codvenda=? and prodvenda.qtd=prodvenda.qtdreserva", [req.body.LCTO], function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
//teste
apiRoutes.post('/pedidosaseparar', function (req, res) {
	console.log('abriu reservas');
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from TRANSITO_BUSCA_STATUS where status_reserva = 'LIBERADO' order by TRANSITO", function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

//tela de entregas
apiRoutes.post('/atualizadtentrega', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query('update venda set dtentrega = ? WHERE LCTO=?', [req.body.DADOS.DATAENTREGA, req.body.DADOS.LCTO], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send('ok');
			});
		});
	});
});

apiRoutes.post('/entregas', function (req, res) {
	console.log('abriu entregas');
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from TRANSITO_BUSCA_STATUS where tipo ='ENTREGA' order by cidade,nomecli", function (err, result) {
			for (i = 0; i < result.length; i++) {
				result[i].DATAENTREGA = new Date(result[i].DATAENTREGA);

			}
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result);
			});
		});
	});

});



apiRoutes.post('/edita_prod', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select pv.codigo as CODPRODVENDA,p.codigo,p.descricao,p.codinterno,pv.valor,pv.qtd from prodvenda pv join produto p on p.codigo = pv.codpro where pv.codvenda= ?", [req.body.LCTO], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

// tela de reserva por produtos
apiRoutes.post('/buscaprodreserva', (req, res) => {
	console.log('abriu prodreserva');
	var param = req.body.param;
	var data = new Date(param.data)
	mes = data.getMonth() + 1
	ano = data.getFullYear()
	let status = param.status == '1' ? "where t.ATIVO=1" : " where t.STATUS=4 AND T.tipo IN (3,5,7)";
	let lcto = param.venda ? " and t.DOCUMENTO=" + param.venda : "";
	let codcli = (param.codcli && param.status != '1') ? " and v.CODCLI=" + param.codcli : "";
	let codvend = param.codvend ? " and v.CODVEND=" + param.codvend : "";
	let datafiltro = (param.venda) ? '' : (param.data && param.status != '1') ? ` and EXTRACT (month from v.data) = ${mes}
	and EXTRACT (year from v.data) = ${ano}` : (!param.data && param.status != '1') ? " and v.data > CURRENT_DATE -1" : "";

	let query = `select
	pv.codigo,
	t.documento,
	t.id_transito,
	v.data,
	v.status,
	v.empresa as LOJA,
	pa.razao,
	pa.nomesys,
	f.usuario as VENDEDOR,
		case (t.status)
		when 0 then cast('ESPERA' as varchar(6)character set iso8859_1)
		when 1 then cast('SERVICO' as varchar(7)character set iso8859_1)
		when 2 then cast('SEPARADO' as varchar(8)character set iso8859_1)
		when 3 then cast('TRANSITO' as varchar(8)character set iso8859_1)
		when 5 then cast('EMBALAGEM' as varchar(9)character set iso8859_1)
		when 6 then cast('FATURAMENTO' as varchar(11)character set iso8859_1)
		when 7 then cast('PREPARACAO' as varchar(10)character set iso8859_1)
		when 8 then cast('EXPEDICAO' as varchar(9)character set iso8859_1)
		when 4 then cast('ENTREGUE' as varchar(8)character set iso8859_1)
		end as STATUS_RESERVA,
	v.nomecli,
	v.codcli,
	v.codvend,
	pv.codpro,
	p.codinterno,
	p.descricao,
	p.unidade AS UN,
	cast (pv.qtd as integer) as qtd,
	p.mult_qtd,
	p.codigo_fiscal,
	pv.valor,
	pv.qtddevolvido,
	'' as coddevolucao,
	'' as devolver
	from prodvenda pv
	join produto p on pv.codpro=p.codigo
	join cliente c on p.codparc=c.codigo
	join transito t on pv.id_transito=t.id_transito
	left join venda v on v.lcto=t.documento
	join param pa on pa.codigo=v.empresa
	join func f on v.codvend = f.codigo
	${lcto}${status}${codvend}${codcli}${datafiltro}
	order by t.id_transito,p.codigo`
	estoque.get(function (err, db) {
		db.query(query, function (err, result) {
			db.detach(function () {
				res.json(result);
			});

		});
	});
});
apiRoutes.post('/limpaDevolucao', (req, res) => {
	let user = req.body.usuario;
	let queryString = `DELETE FROM DEVOLUCAO_TEMPORARIA WHERE USUARIO = ${user}`
	estoque.get((err, db) => {
		if (err) throw err;
		db.query(queryString, (err, result) => {
			if (err) throw err;
			db.detach(() => {
				res.send('devolução limpa')
			})
		})
	})
})
apiRoutes.post('/CarregaTabelaDevTemp', (req, res) => {
	let user = req.body.usuario;
	let queryString = `SELECT * FROM DEVOLUCAO_TEMPORARIA WHERE USUARIO= (${user})`
	estoque.get((err, db) => {
		if (err) throw err;
		db.query(queryString, (err, result) => {
			if (err) throw err;
			db.detach(() => {
				res.json(result)
			})
		})
	})
})
apiRoutes.post('/devolucao', (req, res) => {
	let devolver = req.body.item;
	// res.send(devolver)
	let queryString = `INSERT INTO DEVOLUCAO_TEMPORARIA (CODPRODVENDA,QTDDEVOLVER,QTDDEVOLVIDO,USUARIO,EMPRESA,RAZAOEMPRESA,NOMESYSEMPRESA,CODCLI,VALOR,CODPRO,UNIDADE,CODINTERNO,NOMECLI,DESCRICAO,CODVEND,TIPODEVOLUCAO,DEFEITO)
					VALUES (${devolver.CODIGO},${devolver.DEVOLVER},${devolver.DEVOLVIDO},${devolver.USUARIO},${devolver.EMPRESA},'${devolver.RAZAOEMPRESA}','${devolver.NOMESYSEMPRESA}',${devolver.CLIENTE},${devolver.VALOR},${devolver.CODPRO}
						  ,'${devolver.UNIDADE}','${devolver.CODINTERNO}','${devolver.NOMECLI}','${devolver.DESCRICAO}',${devolver.CODVEND},${devolver.TIPODEVOLUCAO},'${devolver.DEFEITO}' ) returning (ID)`;
	estoque.get(function (err, db) {
		if (err)
			throw queryString;
		db.query(queryString, function (err, result) {
			if (err) res.send(queryString)
			db.detach(function () {
				res.json(result);
			});
		});
	})
})


// tela de reservas
apiRoutes.post('/reserva', function (req, res) {
	console.log('abriu reservas');
	var param = req.body.param;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		var data = new Date(param.data)
		mes = data.getMonth() + 1
		ano = data.getFullYear()
		let status = param.status == '1' ? " where t.ATIVO=1" : " where t.STATUS=4 AND T.tipo IN (3,5,7)";
		let lcto = param.venda ? " and t.DOCUMENTO=" + param.venda : "";
		let codcli = (param.codcli && param.status != '1') ? " and v.CODCLI=" + param.codcli : "";
		let codvend = param.codvend ? " and v.CODVEND=" + param.codvend : "";
		let datafiltro = (param.venda) ? '' : (param.data && param.status != '1') ? ` and EXTRACT (month from v.data) = ${mes}
		and EXTRACT (year from v.data) = ${ano}` : (!param.data && param.status != '1') ? " and v.data > CURRENT_DATE - 30" : "";
		let query = ` SELECT
			V.LCTO,
			v.empresa as LOJA,
			V.codcli,
			V.DATA,
			CASE
			WHEN V.STATUS='F' THEN cast('PAGO'as varchar(4)character set iso8859_1)
			WHEN V.STATUS='R' and V.cdcondpagto is not null THEN cast('A FATURAR'as varchar(9)character set iso8859_1)
			WHEN V.STATUS='C' THEN cast('CAIXA'as varchar(6)character set iso8859_1)
			WHEN V.STATUS='R' THEN cast('ABERTO'as varchar(6)character set iso8859_1) ELSE '' END AS STATUS,
			CASE
			WHEN (T.STATUS=4) then cast('ENTREGUE' as varchar(8)character set iso8859_1)
			when (T.DATA_LIBERADO IS NOT NULL AND T.STATUS=0)then cast('LIBERADO' as varchar(8)character set iso8859_1)
			WHEN T.STATUS=1 THEN cast('SERVICO' as varchar(7)character set iso8859_1)
			WHEN T.STATUS=2 THEN cast('SEPARADO' as varchar(8)character set iso8859_1)
			WHEN T.STATUS=3 THEN cast('TRANSITO' as varchar(8)character set iso8859_1)
			WHEN T.STATUS=5 THEN cast('EMBALAGEM' as varchar(9)character set iso8859_1)
			WHEN T.STATUS=6 THEN cast('FATURAMENTO' as varchar(11)character set iso8859_1)
			WHEN T.STATUS=7 THEN cast('PREPARACAO' as varchar(10)character set iso8859_1)
			WHEN T.STATUS=8 THEN cast('EXPEDICAO' as varchar(9)character set iso8859_1)
			ELSE cast('ESPERA' as varchar(6)character set iso8859_1) END AS STATUS_RESERVA,
			CASE
			WHEN CODCLI=15850 THEN cast('REPOSICAO' as varchar(9)character set iso8859_1)
			WHEN V.CEP <>  '' THEN cast('ENTREGA' as varchar(7)character set iso8859_1)
			WHEN DATA_AVISO IS NOT NULL THEN cast('RETIRA' as varchar(6)character set iso8859_1)
			WHEN CLIENTEDE='12872' THEN cast('INTERNET' as varchar(8)character set iso8859_1)
			WHEN T.TIPO=7 THEN cast('DEVOLUCAO' as varchar(9)character set iso8859_1)
			WHEN t.tipo =5 then cast ('BALCAO' as varchar(6) character set iso8859_1)
			ELSE cast('RESERVA' as varchar(7)character set iso8859_1) END AS TIPO ,
			V.NOMECLI,
			V.codvend,
			FUNC.usuario as NOMEVEND,
			T.ID_TRANSITO as TRANSITO,
			T.STATUS AS STATUSTRANSITO,
			T.data AS DATATRANSITO,
			MOVDATA,
			t.DATA_IMPRESSO AS dataimpresso,
			CASE (ESTOQUE)
			WHEN 2  THEN cast('LOJA' as varchar(9)character set iso8859_1)
			ELSE cast('C.D.' as varchar(4)character set iso8859_1)  END AS ESTOQUE
			from transito t
			JOIN venda V on t.documento = v.lcto
			JOIN FUNC ON FUNC.CODIGO=V.CODVEND
			${status}${lcto}${codvend}${codcli}${datafiltro} order by LCTO`
		db.query(query, function (err, result) {
			// IMPORTANT: close the connection
			if (err) res.send(query)
			db.detach(function () {
				res.send(result);
			});
		});
	});

});




apiRoutes.post('/reserva_det', function (req, res) {
	var queryStringTransito = `
	SELECT V.LCTO,
    T.id_empresa as LOJA,
    V.codcli,
    V.DTENTREGA AS DATAENTREGA,
    V.cidade,
    v.ESTADO,
    V.DATA,
    case
        WHEN V.STATUS='F' THEN cast('PAGO'as varchar(4)character set iso8859_1)
        WHEN V.STATUS='R' and V.cdcondpagto is not null THEN cast('A FATURAR'as varchar(9)character set iso8859_1)
        WHEN V.STATUS='C' THEN cast('CAIXA'as varchar(6)character set iso8859_1)
        WHEN V.STATUS='R' THEN cast('ABERTO'as varchar(6)character set iso8859_1) ELSE ''
    END AS STATUS,
	CASE
	WHEN (T.STATUS=4) then cast('ENTREGUE' as varchar(8)character set iso8859_1)
	when (T.DATA_LIBERADO IS NOT NULL AND T.STATUS=0)then cast('LIBERADO' as varchar(8)character set iso8859_1)
	WHEN T.STATUS=1 THEN cast('SERVICO' as varchar(7)character set iso8859_1)
	WHEN T.STATUS=2 THEN cast('SEPARADO' as varchar(8)character set iso8859_1)
	WHEN T.STATUS=3 THEN cast('TRANSITO' as varchar(8)character set iso8859_1)
	WHEN T.STATUS=5 THEN cast('EMBALAGEM' as varchar(9)character set iso8859_1)
	WHEN T.STATUS=6 THEN cast('FATURAMENTO' as varchar(11)character set iso8859_1)
	WHEN T.STATUS=7 THEN cast('PREPARACAO' as varchar(10)character set iso8859_1)
	WHEN T.STATUS=8 THEN cast('EXPEDICAO' as varchar(9)character set iso8859_1)
	ELSE cast('ESPERA' as varchar(6)character set iso8859_1) END AS STATUS_RESERVA,
    CASE
        WHEN CODCLI=15850 THEN cast('REPOSICAO' as varchar(9)character set iso8859_1)
        WHEN V.CEP <>  '' THEN cast('ENTREGA' as varchar(7)character set iso8859_1)
        WHEN DATA_AVISO IS NOT NULL THEN cast('RETIRA' as varchar(6)character set iso8859_1)
        when CLIENTEDE='12872' THEN cast('INTERNET' as varchar(8)character set iso8859_1)
        when T.TIPO=7 THEN cast('DEVOLUÇÃO' as varchar(9)character set iso8859_1)
        ELSE cast('RESERVA' as varchar(7)character set iso8859_1)
    END AS TIPO ,
    V.NOMECLI,
    T.VPROD AS VALOR,
    V.codvend,
    FUNC.usuario AS NOMEVEND,
    V.FONE,
    T.ID_TRANSITO AS TRANSITO,
    T.STATUS AS STATUSTRANSITO,
    T.data_aviso AS AVISO,
    T.data AS DATATRANSITO,
    T.data_liberado as dataliberado,
    (current_date-T.data_liberado) AS diasliberado,
    T.data_impresso AS DATAIMPRESSO,
    T.libera_separacao ,
    MOVDATA,
    POSICAO AS PS,
    T.TIPOFRETE,
    T.CODTRANSP ,
    CASE (ESTOQUE)
        WHEN 1  THEN cast('C.D.' as varchar(4)character set iso8859_1)
        ELSE cast('LOJA' as varchar(4)character set iso8859_1)
    END AS ESTOQUE,
    T.PESO,
    T.VOLUMES,
    T.VFRETE AS FRETE,
    T.VNF AS TOTAL,
    T.TIPO AS TIPOTRANSITO
    from transito t
    JOIN PRODVENDA PV on T.ID_TRANSITO= PV.ID_TRANSITO
    JOIN PRODUTO P ON P.CODIGO = PV.CODPRO
    JOIN venda V on t.documento = v.lcto
    JOIN FUNC ON FUNC.CODIGO=V.CODVEND
	where t.id_transito=${req.body.TRANSITO}`;

	var queryStringProd = `select
		PRODVENDA.CODIGO as CODPRODVENDA,
 		cast(
		case (transito.status)
			when 0 then
				CASE (prodvenda.liberado)
				when 0 then cast('ESPERA' as varchar(6)character set iso8859_1)
				when 1 then cast('LIBERADO' as varchar(8)character set iso8859_1)
			end
			when 1 then cast('SERVICO' as varchar(7)character set iso8859_1)
			when 2 then cast('SEPARADO' as varchar(8)character set iso8859_1)
			when 3 then cast('TRANSITO' as varchar(8)character set iso8859_1)
			when 4 then cast('ENTREGUE' as varchar(8)character set iso8859_1)
			when 5 then cast('EMBALAGEM' as varchar(9)character set iso8859_1)
			when 6 then cast('FATURAMENTO' as varchar(11)character set iso8859_1)
			when 7 then cast('PREPARACAO' as varchar(10)character set iso8859_1)
			when 8 then cast('EXPEDICAO' as varchar(9)character set iso8859_1)
		end as varchar(15) character set win1252)  as situacao,
		0 AS RETIRADAVENDA,
		transito.status AS TSTATUS, produto.codigo,produto.descricao,produto.local AS ENDERECO,produto.unidade AS UN,
		cast (prodvenda.qtd as integer) as qtd, PRODUTO.mult_qtd,PRODUTO.codigo_fiscal,prodvenda.valor,prodvenda.status_reserva,
		prodvenda.liberado from prodvenda
		join produto on prodvenda.codpro=produto.codigo
		join transito on prodvenda.id_transito=transito.id_transito
		where transito.id_transito=${req.body.TRANSITO} ORDER BY prodvenda.codigo;`

	estoque.get(function (err, db) {
		if (err)
			throw err;

		db.query(queryStringTransito, function (err, resultTransito) {
			db.query(queryStringProd, function (err, resultProdvenda) {
				db.detach(function () {
					res.json({ 'TRANSITO': resultTransito[0], "PRODVENDA": resultProdvenda });
				});
			});
		});


	});
});

apiRoutes.post('/gravapedido', function (req, res) {
	let comando = req.body.comando;
	let queryString;
	if (comando == 'D') {
		queryString = "execute procedure DESMEMBRA_PEDIDO(?)";
	}
	else if (comando == 'R') {
		queryString = "execute procedure RETIRA_ITEM_PEDIDO(?)"
	}
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query(queryString, [req.body.listaProdvenda.join()], function (err, result) {  //saldo  .... cross join busca_disponivel(codigo) where....
			db.detach(function () {
				res.json('foi');
			});
		});
	});
});

app.get('/buscacep', function (req, res) {
	console.log('abriu pedido' + req.query.q);
	options = {
		protocol: "http:",
		host: "api.postmon.com.br",
		pathname: '/v1/cep/' + req.query.q

	};
	var searchURL = url.format(options);
	request(searchURL).pipe(res);

});
apiRoutes.get('/entraestoque', function (req, res) {
	console.log('abriu pedido' + req.query.q);
	options = {
		protocol: "http:",
		host: "localhost:82",
		pathname: 'Reserva_Entra_Estoque_Florestal.asp',
		query: {
			q: req.query.q
		}
	};
	var searchURL = url.format(options);

	request(searchURL).pipe(res);

	// estoque.get(function(err, db) {
	// 	if (err)
	// 		throw err;
	// 	// db = DATABASE
	// 		db.query("SELECT * FROM ENTRAESTOQUE_FLORESTAL(?)",[req.body.TRANSITO],function(err, result) {
	// 			// IMPORTANT: close the connection
	// 			res.json(result);
	// 			db.detach();
	// 		});
	// });

});
apiRoutes.post('/entrareserva', function (req, res) {
	console.log('ENTROU RESERVA ' + req.body.TRANSITO);
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE TRANSITO SET STATUS='8',ESTOQUE=2,POSICAO=? WHERE ID_TRANSITO = ? returning id_transito", [req.body.PS, req.body.TRANSITO], function (err, result) {
			// db.query("UPDATE PACOTE SET SITUACAO='6' WHERE ID_TRANSITO_S = ? and situacao = 3", req.body.q, function (err, result) {
			db.detach(function () { res.send(result); });
			// });
		});
	});
});
// apiRoutes.post('/entrareserva', function (req, res) {
// 	console.log('abriu pedido' + req.body.LCTO);
// 	options = {
// 		protocol: "http:",
// 		host: "localhost:82",
// 		pathname: 'Reserva_Setor3Florestal.asp',
// 		query: {
// 			q: req.body.q,
// 			ps: req.body.ps
// 		}
// 	};
// 	var searchURL = url.format(options);

// 	request(searchURL).pipe(res);


// 	// estoque.get(function(err, db) {
// 	// 	if (err)
// 	// 		throw err;
// 	// 	// db = DATABASE
// 	// 		db.query("select * from TRANSITO_BUSCA_STATUS_NODE",function(err, result) {
// 	// 			// IMPORTANT: close the connection
// 	// 			db.detach(function(){res.json(result);});
// 	// 		});
// 	// });

// });
apiRoutes.post('/entregapedido', function (req, res) {
	console.log('colocou em transporte ' + req.body.TRANSITO);
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE TRANSITO SET STATUS='4' WHERE ID_TRANSITO = ? returning id_transito", req.body.TRANSITO, function (err, result) {
			// db.query("UPDATE PACOTE SET SITUACAO='6' WHERE ID_TRANSITO_S = ? and situacao = 3", req.body.q, function (err, result) {
			db.detach(function () { res.send(result); });
			// });
		});
	});
});
// apiRoutes.post('/entregapedido', function (req, res) {
// 	console.log('entregou pedido ' + req.body.LCTO);
// 	options = {
// 		protocol: "http:",
// 		host: "localhost:82",
// 		pathname: 'Reserva_EntregaPedido.asp',
// 		query: {
// 			q: req.body.q
// 		}
// 	};
// 	var searchURL = url.format(options);
// 	request(searchURL).pipe(res);
// 	estoque.get(function(err, db) {
// 		if (err)
// 			throw err;
// 		// db = DATABASE
// 			db.query("select * from TRANSITO_BUSCA_STATUS_NODE",function(err, result) {
// 				// IMPORTANT: close the connection
// 				db.detach(function(){res.json(result);});
// 			});
// 	});
// });
apiRoutes.post('/entratransito', function (req, res) {
	console.log('colocou em transporte ' + req.body.TRANSITO);
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE TRANSITO SET STATUS='3' WHERE ID_TRANSITO = ? returning id_transito", req.body.TRANSITO, function (err, result) {
			// db.query("UPDATE PACOTE SET SITUACAO='6' WHERE ID_TRANSITO_S = ? and situacao = 3", req.body.q, function (err, result) {
			db.detach(function () { res.send(result); });
			// });
		});
	});
});
apiRoutes.post('/cancelareserva', function (req, res) {
	console.log('cancela reserva' + req.body.TRANSITO);
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE VENDA SET STATUS='X' WHERE LCTO = ? returning LCTO,STATUS", req.body.TRANSITO, function (err, result) {
			db.detach(function () { res.send(result); });
		});
	});
});
apiRoutes.post('/insereproduto', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select produto.codigo,produto.prvenda as VALOR,produto.prpromo,produto.CODINTERNO,produto.DESCRICAO,(select sum (ddt.QTD) AS QTDPROD FROM ( SELECT CODPRO,sum (qtd *-1) as qtd,status  from prodvenda p join transito tr on p.codvenda=tr.documento and tr.tipo=3 and (tr.status in (0,1,2)) where p.qtd=p.qtdreserva  and codpro = produto.codigo group by codpro,status union select id_produto as codpro, sum (qtd) as qtd,situacao as status from pacote where situacao in (1,2,3,8,12,13) and ID_produto = produto.codigo  group by codpro,situacao) ddt) as qtd from produto WHERE DESCRICAO CONTAINING ? and ativo='S'", [req.body.busca], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});
apiRoutes.post('/enderecoentrega', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query('select endereco,bairro,numero,cidade,estado,cep,complemento,celular,dtentrega,obscli as obs from venda WHERE LCTO=?', [req.body.lcto], function (err, result) {
			db.detach(function () {
				res.json(result[0]);
			});
		});
	});
});
apiRoutes.post('/enderecoentregacli', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		db.query('select logradouro_entrega,numero_entrega,bairro_entrega,cep_entrega,complemento_entrega,cidade_entrega,estado_entrega,fone_entrega,contato_entrega from cliente WHERE codigo=? ', [req.body.codcli], function (err, result) {
			db.detach(function () {
				res.json(result[0]);
			});
		});
	});
});
apiRoutes.post('/atualizaentrega', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query('update venda set endereco=?,bairro=?,numero=?,cidade=?,estado=?,cep=?,complemento=?,celular=?,obscli=? WHERE LCTO=?', [req.body.DADOS.logradouro, req.body.DADOS.bairro, req.body.DADOS.numero, req.body.DADOS.localidade, req.body.DADOS.uf, req.body.DADOS.cep, req.body.DADOS.complemento, req.body.DADOS.celular, req.body.DADOS.obs, req.body.DADOS.lcto], function (err, result) {
			db.query('update transito set data_aviso=current_timestamp,libera_separacao=1 where documento=?', [req.body.DADOS.lcto], function (err, result) {
				db.detach(function () {
					res.send('ok');
				});
			});
		});
	});
});
apiRoutes.post('/atualizafrete', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query('execute procedure insere_frete(?,?)', [req.body.frete, req.body.venda], function (err, result) {
			if (err)
				throw err;
			db.detach(function (result) {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/definetransportador', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query('update transito set tipofrete=?,codtransp=? where id_transito=?', [req.body.tipo, req.body.transportador, req.body.transito], function (err, result) {
			if (err)
				throw err;
			db.detach(function (result) {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/dataimpresso', function (req, res) {

	estoque.get(function (err, db) {

		if (err)
			throw err;

		// db = DATABASE

		db.query("update transito set data_impresso=current_timestamp WHERE ID_TRANSITO=?", [req.body.TRANSITO], function (err, result) {
			db.detach(function () {
				res.send('ok');
			});
		});


	});
});
apiRoutes.post('/registraaviso', function (req, res) {

	estoque.get(function (err, db) {

		if (err)
			throw err;

		// db = DATABASE

		db.query("update transito set data_aviso=current_timestamp,libera_separacao=1 WHERE ID_TRANSITO=?", [req.body.TRANSITO], function (err, result) {
			db.detach(function () {
				res.send('ok');
			});
		});


	});
});
apiRoutes.post('/forcaseparacao', function (req, res) {

	estoque.get(function (err, db) {

		if (err)
			throw err;

		// db = DATABASE

		db.query("update prodvenda set Liberado=1 WHERE codvenda=?", [req.body.DOCUMENTO], function (err, result) {
			db.detach(function () {
				res.send('ok');
			});
		});


	});
});

//tela de clientes
apiRoutes.post('/salvadadosgerais', function (req, res) {
	var arr = Object.keys(req.body.cliente).map(function (key) {
		return req.body.cliente[key];
	});
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query('update CLIENTE set CGC=?,ATIVO=?,FANTASIA=?,RAZAO=?,RAMOATIV=?,INSC=?,TIPO=?,FONE=?,CELULAR=?,CONTATO=?,EMAIL=?,OBS=?,CODFUNC=?,LIBERAFAT=? where CODIGO=' + req.body.codigo + ' returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/salvadadosendcadastro', function (req, res) {
	var arr = Object.keys(req.body.cliente).map(function (key) {
		return req.body.cliente[key];
	});
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query('update CLIENTE set ENDERECO=?,NUMERO=?,BAIRRO=?,CIDADE=?,ESTADO=?,CEP=?,COMPLEMENTO=? where CODIGO=' + req.body.codigo + ' returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/salvadadosendcorresp', function (req, res) {
	var arr = Object.keys(req.body.cliente).map(function (key) {
		return req.body.cliente[key];
	});
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query('update CLIENTE set LOGRADOURO_CORRESP=?,NUMERO_CORRESP=?,BAIRRO_CORRESP=?,CIDADE_CORRESP=?,ESTADO_CORRESP=?,CEP_CORRESP=?,COMPLEMENTO_CORRESP=?,FONE_CORRESP=?,CONTATO_CORRESP=?,EMAIL_CORRESP=? where CODIGO=' + req.body.codigo + ' returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/salvadadosendentrega', function (req, res) {
	var arr = Object.keys(req.body.cliente).map(function (key) {
		return req.body.cliente[key];
	});
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query('update CLIENTE set LOGRADOURO_ENTREGA=?,NUMERO_ENTREGA=?,BAIRRO_ENTREGA=?,CIDADE_ENTREGA=?,ESTADO_ENTREGA=?,CEP_ENTREGA=?,COMPLEMENTO_ENTREGA=?,FONE_ENTREGA=?,CONTATO_ENTREGA=? where CODIGO=' + req.body.codigo + ' returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/salvarnovo', function (req, res) {
	var geral = Object.keys(req.body.geral).map(function (key) {
		return req.body.geral[key];
	});
	var endcadastro = Object.keys(req.body.endcadastro).map(function (key) {
		return req.body.endcadastro[key];
	});
	var endcorresp = Object.keys(req.body.corresp).map(function (key) {
		return req.body.corresp[key];
	});
	var endentrega = Object.keys(req.body.entrega).map(function (key) {
		return req.body.entrega[key];
	});
	var arr = geral.concat(endcadastro, endcorresp, endentrega);
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query(' insert into  CLIENTE (CGC,ATIVO,FANTASIA,RAZAO,RAMOATIV,INSC,TIPO,FONE,CELULAR,CONTATO,EMAIL,OBS,CODFUNC,LIBERAFAT,ENDERECO,NUMERO,BAIRRO,CIDADE,ESTADO,CEP,COMPLEMENTO,LOGRADOURO_CORRESP,NUMERO_CORRESP,BAIRRO_CORRESP,CIDADE_CORRESP,ESTADO_CORRESP,CEP_CORRESP,COMPLEMENTO_CORRESP,FONE_CORRESP,CONTATO_CORRESP,EMAIL_CORRESP,LOGRADOURO_ENTREGA,NUMERO_ENTREGA,BAIRRO_ENTREGA,CIDADE_ENTREGA,ESTADO_ENTREGA,CEP_ENTREGA,COMPLEMENTO_ENTREGA,FONE_ENTREGA,CONTATO_ENTREGA) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/salvacliente', function (req, res) {
	var cliente = req.body.cliente;
	cad = cliente.CADASTRO;
	cor = cliente.CORRESP;
	ent = cliente.ENTREGA;
	fisjur = '1';
	if (cad.CGC.length > 11) {
		fisjur = '2'
	};

	if (cad.REPRESENTANTE == '') {
		cad.REPRESENTANTE = null
	} else {
		cad.REPRESENTANTE = parseInt(cad.REPRESENTANTE)
	};
	parametros = [cad.FANTASIA, cad.RAZAO, cad.CGC, fisjur, cad.INSC, cad.TIPO, cad.ENDERECO, cad.NUMERO, cad.BAIRRO, cad.CIDADE, cad.ESTADO, cad.CEP, cad.RAMOATIV, cad.COMPLEMENTO, cad.FONE, cad.CELULAR, cad.CONTATO, cad.EMAIL, cad.REPRESENTANTE, cad.OBS, cor.ENDERECO, cor.NUMERO, cor.BAIRRO, cor.CIDADE, cor.ESTADO, cor.CEP, cor.COMPLEMENTO, cor.FONE, cor.CONTATO];
	parametros2 = [ent.ENDERECO, ent.NUMERO, ent.BAIRRO, ent.CIDADE, ent.ESTADO, ent.CEP, ent.COMPLEMENTO, ent.FONE, ent.CONTATO];
	if (cliente.CADASTRO.CODIGO) {
		sql = 'UPDATE CLIENTE SET FANTASIA=?,RAZAO=?,CGC=?,FISJUR=?,INSC=?,TIPO=?,ENDERECO=?,NUMERO=?,BAIRRO=?,CIDADE=?,ESTADO=?,CEP=?,RAMOATIV=?,COMPLEMENTO=?,FONE=?,CELULAR=?,CONTATO=?,EMAIL=?,CODFUNC=?,OBS=?,LOGRADOURO_CORRESP=?,NUMERO_CORRESP=?,BAIRRO_CORRESP=?,CIDADE_CORRESP=?,ESTADO_CORRESP=?,CEP_CORRESP=?,COMPLEMENTO_CORRESP=?,FONE_CORRESP=?,CONTATO_CORRESP=? WHERE CODIGO=' + cliente.CADASTRO.CODIGO + ' RETURNING CODIGO';
		sql2 = 'UPDATE OR INSERT INTO ENDERECO_ENTREGA (CODCLI,LOGRADOURO,NUMERO,BAIRRO,CIDADE,ESTADO,CEP,COMPLEMENTO,FONE,CONTATO) VALUES (' + cliente.CADASTRO.CODIGO + ',?,?,?,?,?,?,?,?,?) MATCHING (CODCLI)';

	} else {
		sql = 'INSERT INTO CLIENTE (FANTASIA,RAZAO,CGC,FISJUR,INSC,TIPO,ENDERECO,NUMERO,BAIRRO,CIDADE,ESTADO,CEP,RAMOATIV,COMPLEMENTO,FONE,CELULAR,CONTATO,EMAIL,CODFUNC,OBS,LOGRADOURO_CORRESP,NUMERO_CORRESP,BAIRRO_CORRESP,CIDADE_CORRESP,ESTADO_CORRESP,CEP_CORRESP,COMPLEMENTO_CORRESP,FONE_CORRESP,CONTATO_CORRESP) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) returning CODIGO';
		sql2 = 'UPDATE OR INSERT INTO ENDERECO_ENTREGA (CODCLI,LOGRADOURO,NUMERO,BAIRRO,CIDADE,ESTADO,CEP,COMPLEMENTO,FONE,CONTATO) VALUES ((SELECT GEN_ID( gen_codigo_cliente, 0 )-1 FROM RDB$DATABASE),?,?,?,?,?,?,?,?,?) MATCHING (CODCLI)';
	}
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query(sql, parametros, function (err, result) {

			res.send(result);
			db.query(sql2, parametros2, function (err, result) {
				// IMPORTANT: close the connection
				db.detach();
			});
		});
	});
});
apiRoutes.post('/buscacliente', function (req, res) {
	var sql = '',
		consulta = '';
	switch (req.body.dados.TIPO) {
		case 'CNPJ/CPF':
			sql = "select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,codigo,fantasia,razao from cliente where replace (replace(replace(cgc,'/',''),'.',''),'-','') = ?";
			consulta = [req.body.dados.CGC];
			break;
		case 'NOME':
			if (req.body.dados.CGC.slice(0, 1) == ' ') {
				sql = "select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,codigo,fantasia,razao from cliente where ativo = 'S' and razao containing";
				consulta = [req.body.dados.CGC];
			} else {
				sql = "select cgc,codigo,fantasia,razao from cliente where ativo = 'S' and razao containing ? or ativo = 'S' and razao containing ? ";
				consulta = [req.body.dados.CGC.split(' ')[0].toUpperCase(), req.body.dados.CGC.slice(req.body.dados.CGC.split(' ')[0].length).toUpperCase()];
			};
			break;
		case 'FONE':
			sql = "select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,codigo,fantasia,razao from cliente where fone = ?";
			consulta = [req.body.dados.CGC];
			break;
		case 'E-MAIL':
			sql = "select replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,codigo,fantasia,razao from cliente where email = ?";
			consulta = [req.body.dados.CGC.toUpperCase()];
			break;
	}

	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query(sql, consulta, function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});



apiRoutes.post('/abrecliente', function (req, res) {
	if (req.body.tipo == 'CODCLI') {
		sql = `select c.codigo,fantasia,ramoativ,razao,
		replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,c.insc,c.tipo,
		c.fone,c.celular,c.contato,c.email,c.codfunc,c.liberafat,c.obs
		from cliente c where c.codigo = ?`;
	} else if (req.body.tipo = 'CGC') {
		sql = `select c.codigo,fantasia,
		ramoativ,razao,replace (replace(replace(cgc,'/',''),'.',''),'-','') as cgc,
		c.insc,c.tipo,
		c.fone,c.celular,c.contato,c.email,c.codfunc,c.liberafat,c.obs
		from cliente c where replace (replace(replace(cgc,'/',''),'.',''),'-','') = ?`
	}
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query(sql, [req.body.cliente], function (err, result) {
			let queryEndereco = `select LOCALIDADE.*,cidade.NOM_CIDADE,cidade.ESTADO from localidade left join cidade on cidade.cod_cidade=localidade.codcidade where codparc =${result[0].CODIGO} and ativo=1`
			db.query(queryEndereco, function (err, result1) {
				db.detach(function () {
					res.json([result, result1]);
				});
			});
		});
	});
});


app.put('/api/endereco', function (req, res) {
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
})
apiRoutes.get('/endereco', function (req, res) {
	let endereco = req.query.endereco;
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		let queryEndereco = `select LOCALIDADE.*,cidade.NOM_CIDADE,cidade.ESTADO from localidade left join cidade on cidade.cod_cidade=localidade.codcidade where codparc =${result[0].CODIGO} and ativo=1`
		db.query(queryEndereco, function (err, result) {
			db.detach(function () {
				res.json(result);
			});
		});
	});
})




// tela de cadastro de frete
apiRoutes.post('/salvarnovoFrete', function (req, res) {
	var arr = Object.keys(req.body.cadastro).map(function (key) {
		return req.body.cadastro[key];
	});
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query(' insert into  FRETE (TIPO_LCTO,LCTO,EMPRESA,TIPO_REMETENTE,COD_REMETENTE,TIPO_DESTINATARIO,COD_DESTINATARIO,TIPO_TOMADOR,COD_TOMADOR,COD_TRANSPORTADOR,VALOR_FRETE,PESO_AFERIDO,PESO_CUBADO,VOLUMES,DATA_EMISSAO,DATA_COLETA) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) returning codigo', arr, function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});


// tela de cadastro financeiro
apiRoutes.post('/financeiro', function (req, res) {
	// var arr = Object.keys(req.body.cadastro).map(function(key) {
	// 	return req.body.cadastro[key];
	// });
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query('select first 1 movban.*,banco.banco,fornec.fantasia,despesa.descricao from  movban join fornec on fornec.codigo = movban.codfor join despesa on despesa.codigo = movban.despesa join banco on banco.codigo = movban.codban join cadbanco on cadbanco.codban =movban.banco', function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result);
			});
		});
	});
});

apiRoutes.post('/criaPacote', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw (err);
		// db = DATABASE
		db.query("select * from CRIA_PACOTE(?,?,?,null,null,'E',null,?)", [req.body.ID_PRODUTO, req.body.QTD, req.body.ID_TRANSITO, req.body.LOCAL], function (err, result) {
			if (err) throw (err);
			db.detach(function () {
				res.send(result[0]);
			});
		});
	});
});

//tela de entrada
apiRoutes.post('/entrada_det', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		if (req.body.TIPO != 6) {
			db.query(`select
            grupo.produto,
            sum(grupo.qtd_entrada) as qtd_entrada,
            sum(grupo.qtd_pct) as qtd_pct,
            grupo.descricao,
            grupo.ctrl_pacote,
            grupo.defeito
            from (
                select prodent.produto as produto,cast(sign(prodent.qtd)*prodent.qtd as integer) as qtd_entrada,
                0 as qtd_pct,p.descricao,p.ctrl_pacote ,prodent.defeito
                from transito t
                join prodent on t.documento=prodent.lctoentrada
                and t.id_empresa=prodent.empresa join produto p on prodent.produto=p.codigo
                where t.id_transito =?
                union all
                select pacote.id_produto as codpro,
                0 as qtd_entrada, sum (pacote.qtd) as qtd_pct,
                produto.descricao, produto.ctrl_pacote,'' from pacote
                join transito on transito.id_transito=pacote.id_transito_e
                join produto on id_produto = produto.codigo where transito.id_transito=?
                and pacote.situacao=5 group by codpro,produto.descricao,ctrl_pacote) as grupo
                group by produto,descricao,ctrl_pacote,defeito`, [req.body.LCTO, req.body.LCTO], function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json(result);
				});
			});
		} else {
			db.query("select produto,sum(qtd_entrada) as qtd_entrada,sum(qtd_pct) as qtd_pct, descricao ,ctrl_pacote  from (select pv.codpro as produto,cast(sign(pv.qtd)*pv.qtd as integer) as qtd_entrada,0 as qtd_pct,p.descricao,p.ctrl_pacote from transito t join  prodvenda pv on t.documento=pv.codvenda join produto p on pv.codpro=p.codigo where t.id_transito = ?  union all select id_produto as codpro,0 as qtd_entrada, sum (pacote.qtd) as qtd_pct,produto.descricao as qtd,produto.ctrl_pacote from pacote join transito on id_transito=id_transito_e join produto on id_produto = produto.codigo where id_transito=? and pacote.situacao=5 group by codpro,produto.descricao,ctrl_pacote) group by produto,descricao,ctrl_pacote", [req.body.LCTO, req.body.LCTO], function (err, result) {
				// IMPORTANT: close the connection
				db.detach(function () {
					res.json(result);
				});
			});
		};
	});
});

apiRoutes.post('/pacotesEntrada_det', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select codpro,sum(qtd_entrada) as qtd_entrada,sum(qtd_pct) as qtd_pct, descricao, ctrl_pacote from (select id_produto as codpro,0 as qtd_entrada, sum (pacote.qtd) as qtd_pct, produto.descricao,produto.ctrl_pacote from pacote join transito on id_transito=id_transito_e join produto on id_produto = produto.codigo where id_transito=? and pacote.situacao=5 group by codpro,produto.descricao,ctrl_pacote) group by codpro,descricao,ctrl_pacote", [req.body.LCTO], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.json(result);
			});
		});
	});
});

apiRoutes.post('/entrada_atualizaFornec', (req, res) => {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE ENTRADA SET CODPARC=? WHERE LCTO =?", [req.body.CODCLI, req.body.LCTO], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send('OK');
			});
		});
	});
})
apiRoutes.post('/entrada_editaobs', (req, res) => {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE ENTRADA SET OBS=? WHERE LCTO =?", [req.body.OBS, req.body.LCTO], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send('OK');
			});
		});
	});
})
apiRoutes.post('/entrada', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select * from ENTRADA_PENDENTE", function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/checaentrada', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("UPDATE TRANSITO SET STATUS=2 WHERE ID_TRANSITO =?", [req.body.transito], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result);
			});
		});
	});
});


// tela de configuração de acesso
apiRoutes.post('/buscacomputadores', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("select id,nome,liberado from computadores", function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send(result);
			});
		});
	});
});
apiRoutes.post('/gravaliberacao', function (req, res) {
	estoque.get(function (err, db) {
		if (err)
			throw err;
		// db = DATABASE
		db.query("update computadores set LIBERADO = ? where id=?", [req.body.registro.LIBERADO, req.body.registro.ID], function (err, result) {
			// IMPORTANT: close the connection
			db.detach(function () {
				res.send('ok');
			});
		});
	});
});
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('server iniciado na porta ' + port);
