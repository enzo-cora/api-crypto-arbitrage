import {MongoPaginate} from "../models/interphace/pagination";
import modelPair from "../models/mongoose/model.pair";
import modelSymbol from "../models/mongoose/model.symbol";
import modelMarket from "../models/mongoose/model.market";

export const get_symbols = async  (req, res)=>{
    try{
        const query : MongoPaginate =  JSON.parse(req.query.filters)
        const obj : MongoPaginate = {
            limit : Infinity,
            match : {},
            sort : {_id: 1},
            skip : 0,
            ...query
        }
        const __makedata : Array<any> = [{ $skip: obj.skip }, { $limit: obj.limit }]
        if (obj.project)
            __makedata.push({$project : obj.project})
        const aggregate : Array<any> = [
            { $match : obj.match  },
            { $sort : obj.sort },
            { $facet : {
                    metadata: [ { $count: "total" }],
                    data: __makedata
                }}
        ]
        if (obj.addFields)
            aggregate.splice(1, 0, {$addFields : obj.addFields})
        if (obj.lookups){
            obj.lookups.forEach((lookup,i)=>{
                aggregate.splice(i + 1, 0, {$lookup : lookup})
            })
        }
        const [data]  = await modelSymbol.aggregate(aggregate)

        res.status(200).json({data})
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }
}



export const get_symbol = async (req,res)=> {
    try {
        const data = await modelSymbol.findOne({name : req.params.name})
        res.status(200).json({data})
    }
    catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})

    }
}

export const reset_moyennes_symbols = async  (req, res)=>{
    try {
       /* const data = await modelPair.updateMany(
          {'exclusion.pairIsExclude' : false},
          {$set : { ifPositiveSpread : {
                      latestSpreads : [],
                      volumeMoyen : -1,
                      volumeMoyen_usd : -1,
                      spreadMoyen : -1,
                      spreadMoyen_1usd : -1,
                      spreadMoyen_15kusd : -1,
                      profitMaxiMoyen_usd : -1,
                      ecartType : -1,
                      variance : -1,
                      esperance : -1,
                      medianne : -1,
                      hightestSpread_15kusd : -1
                  }}},
          {}
        )*/
        res.status(200).json({data : 'Hey'})
    }catch (err){
        res.status(404).json({title : "Une erreur est survenue", message : err.message})
    }

}


export const group_symbol_unreport = async  (req, res)=>{
    try{
        const names : string[] = req.body.list
        const bulkSymbol = names.map(name => ({
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

        const resp = await modelSymbol.collection.bulkWrite(bulkSymbol)
        res.status(200).json({title : 'Les symbols ont été blanchis',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}

export const group_symbol_report = async  (req, res)=>{
    try{
        const names : string[] = req.body.list
        const data = req.body.data
        const bulkSymbol = names.map(name => ({
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

        const resp = await modelSymbol.collection.bulkWrite(bulkSymbol)
        res.status(200).json({title : 'Les symbols ont bien été signalés',data : resp})
    }
    catch (erreur){
        res.status(500).json({title : "Une erreur s'est produite", message : erreur.message})
    }
}
