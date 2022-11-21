const tarefas = require("../models/tarefasModel");
const SECRET = process.env.SECRET
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const getAll = (req, res) => {
    const authHeader = req.get(`authorization`);
    const token = authHeader.split(' ')[1];

    if(!token){
      return res.status(401)
    }
  
    const err = jwt.verify(token,SECRET,function(error){
      if(error) return error 
    })
    
    if (err) return res.status(401).send("Não autorizado")
  
    console.log(req.url);
    tarefas.find(function (err, tarefas) {
      res.status(200).send(tarefas);
    });
  };
  
  const postTarefa = (req, res) => {
    const senhaComHash = bcrypt.hashSync(req.body.senha, 10);
    req.body.senha = senhaComHash;
  
    console.log(req.body);
    const tarefa = new tarefas(req.body);
  
    tarefa.save(function (err) {
      if (err) {
        return res.status(500)
      }
      res.status(201).send(tarefa.toJSON());
    });
  };

  const login = (req,res) => {
    tarefas.findOne({ nomeColaboradora: req.body.nomeColaboradora }, function(error, tarefa) {
      if(!tarefa) {
        return res.status(404).send(`Não localizamos a/o ${req.body.nomeColaboradora}`);
      }
  
      const senhaValida = bcrypt.compareSync(req.body.senha, tarefa.senha);
  
      if(!senhaValida) {
        return res.status(403).send(`Esta senha está incorreta`)
      }
  
      const token = jwt.sign({ nomeColaboradora: req.body.nomeColaboradora }, SECRET);
        return res.status(200).send(token)
    })
  }
  
  module.exports = {
      getAll,
      postTarefa,
      login
  }
  