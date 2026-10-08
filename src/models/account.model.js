const mongoose=require('mongoose')
const ledgerModel=require('../models/ledger.model')
const accountSchema= new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:"Account must be associated with a user",
    index:true
  },
  status:{
    type:String,
    enum:{
      values:["ACTIVE","FROZEN","CLOSED"],
      messages:"status can be either of given",
     
    },
     default:"ACTIVE"
  },
  currency:{
    type:String,
    required:[true,"Currency is required for creating an account"],
    default:"INR"
  }
},{
  timestamps:true
})
accountSchema.index({user:1,status:1})
accountSchema.methods.getBalance=async function(){
    console.log("ACCOUNT ID:", this._id)
      const ledgerData = await ledgerModel.find({
    account: this._id
  })

  console.log("LEDGER DATA:", ledgerData)
  const balanceData=await ledgerModel.aggregate([
    {$match:{account:this._id}},
    {
      $group:{
        _id:null,
        totalDebit:{
          $sum:{
            $cond:[
              {$eq:["$type","DEBIT"]},
              "$amount",
              0
            ]
          }
        },
        totalCredit:{
          $sum:{
            $cond:[
              {$eq:["$type","CREDIT"]},
              "$amount",
              0
            ]
          }
        }
      }
    },
    {
      $project:{
        _id:0,
        balance:{$subtract:["$totalCredit","$totalDebit"]}
      }
    }
  ])
    console.log("BALANCE DATA:", balanceData)
  if(balanceData.length===0){
    return 0
  }
  return balanceData[0].balance

}

module.exports=mongoose.model('account',accountSchema)