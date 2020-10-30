import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import schedule from "node-schedule"
import dotenv from 'dotenv'
import routerCrypto from './routes/route_crypto'
import axios from 'axios'
import {dbConnexion} from "./db";
import routerMarket from "./routes/route_market";
import routerBest from "./routes/route_best";
import modelGlobal from "./models/mongoose/model.global";
import routerPair from "./routes/route_pair";
import routerSymbol from "./routes/route_symbol";
import routerTest from "./routes/route_test";
import routerAsset from "./routes/route_asset";


dotenv.config()
//---------------------------Initialisation de l'App----------------------------

const app = express()
app.use(helmet())
app.use(compression())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())

//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

//---------------------------Definition des headers de réponses ------------------

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origian, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Accept', 'application/json');
  next();
});

//---------------------------Definition des headers de requête ------------------

axios.defaults.headers.common['X-CoinAPI-Key'] = process.env.API_KEY;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.interceptors.response.use( async (resp) => {
  if (resp.headers['x-ratelimit-used'])
    await modelGlobal.updateOne(
      {name : 'coinapi'},
      {
        name : 'coinapi',
        limit : resp.headers['x-ratelimit-limit'],
        remaining : resp.headers['x-ratelimit-remaining'],
        dateReflow : resp.headers['x-ratelimit-reset']
      },
      { upsert : true})
  return resp;
});

const defUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'production' :
      return 'http://rest.coinapi.io'
    case 'development' :
      return 'http://rest-sandbox.coinapi.io'
    case 'test' :
      return 'http://rest.coinapi.io'
    default :
      return 'http://rest-sandbox.coinapi.io'
  }
}
export let COINAPI = defUrl()
console.log("L'url de CoinAPI est : ",COINAPI)

const updateAssets = schedule.scheduleJob('0 0,6,12,16,20 * * *', () =>{

});

//-------------------Les Routes ------------------------------------------
let router = express.Router()
app.use('/api1',router)
router.use('/assets',express.static('public'))


router.use('/test',routerTest)
router.use('/crypto',routerCrypto)
router.use('/pairs',routerPair)
router.use('/symbols',routerSymbol)
router.use('/markets',routerMarket)
router.use('/bests',routerBest)
router.use('/assets',routerAsset)


const port = process.env.API_PORT || 3000
app.listen(port,()=>{
  console.log('mon node js ecoute sur le port : ',port);
})

const updateAs = schedule.scheduleJob('*/5 * * * * *', () =>{
  axios.get(`http://127.0.0.1:${port}/api1/test`)
});

