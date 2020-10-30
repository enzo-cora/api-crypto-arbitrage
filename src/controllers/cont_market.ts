import modelMarket from "../models/mongoose/model.market";
import {MongoPaginate} from "../models/interphace/pagination";
import {RequesterMongo} from "../script/mongo_requester/requesterMongo";


export const get_markets = async  (req, res)=>{
  try{
    const query : MongoPaginate = req.query.filters ? JSON.parse(req.query.filters) : null
    const aggregate = new RequesterMongo().v1(query)
    const [data]  = await modelMarket.aggregate(aggregate)
    res.status(200).json({data})
  }
  catch (err){
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}

export const get_market = async (req,res)=> {
    modelMarket.findOne({name : req.params.name})
      .then(result=>{
          res.status(200).json(result)
      })
      .catch(err=>{
          res.status(404).json({title : "Une erreur est survenue", message : err.message})
      })
}

export const group_market_unreport = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const bulkMarket = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : false,
              reasons : [],
              severity : null,
              excludeBy : null,
              note : null
            }},
        },
        option : {upsert: false}
      }}));

    const resp = await modelMarket.collection.bulkWrite(bulkMarket)
    res.status(200).json({title : 'Les markets ont été blanchis',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

export const group_market_report = async  (req, res)=>{
  try{
    const names : string[] = req.body.list
    const data = req.body.data
    const bulkMarket = names.map(name => ({
      updateOne: {
        filter: { name : name },
        update: { $set: {
            exclusion : {
              isExclude : data.severity === 4,
              reasons : data.reasons,
              severity : data.severity,
              excludeBy : 'unknow',
              note : data.note || ''
            }},
        },
        option : {upsert: false}
      }}));

    const resp = await modelMarket.collection.bulkWrite(bulkMarket)
    res.status(200).json({title : 'Les markets ont bien étés signalés',data : resp})
  }
  catch (erreur){
    res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
  }
}

/*
export const get_marketsv2 = async  (req, res)=>{
  try{
    const filters = req.query.filters
    const {limit = Infinity ,skip = 0,...query} : MongoPaginatev2 = filters ?
      JSON.parse(req.query.filters) : {};

    let aggregate : Array<any> = []
    const dataFacet : Array<any> = [{ $skip: skip}, { $limit: limit }]

    if(query.aggregate)
      aggregate = query.aggregate
    if(query.facet){
      dataFacet.push(...query.facet)
    }
    aggregate.push({$facet : {
        metadata: [ { $count: "total" }],
        data: dataFacet
      }})

    const [data]  = await modelExchange.aggregate(aggregate)

    res.status(200).json(data)
  }
  catch (err){
    console.log(err)
    res.status(404).json({title : "Une erreur est survenue", message : err.message})
  }
}
*/

