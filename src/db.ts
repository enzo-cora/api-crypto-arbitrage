import {connect} from 'mongoose'

export function dbConnexion(){
  const {
    MONGO_PORT,
    MONGO_DB,
    MONGO_HOSTNAME,
    MONGO_DB_DEV
  } = process.env

  const options = {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true ,
    useFindAndModify: false
  }
  let url : string
  if(process.env.NODE_ENV === 'development')
      url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB_DEV}`
  else
      url = `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`

  connect(url,options).then(()=>{
    console.log('BDD MONGO EST CONNECTE SUR : ',url)
  })
    .catch((err)=>{
      console.log('IL Y A UNE UNE ERREUR DE BASE DE DONNE !! : ',err)
    })
}
