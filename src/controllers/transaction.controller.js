const mongoose=require('mongoose')
const transactionModel=require('../models/transaction.model')

const emailService=require('../services/email.service')
const accountModel=require("../models/account.model")

const ledgerModel = require('../models/ledger.model')
/**
 * create a new transaction 
 * the 10 step transfer flow:
 * 1. validate reqest
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balance from ledger
 * 5. create transaction (pending)
 * 6. create debit ledger entry
 * 7. create credit ledger entry
 * 8. mark transaction completed
 * 9. commit mongodb session
 * 10.send email notification
 * @param {*} req 
 * @param {*} res 
 */

async function createTransaction(req,res){
  const {fromAccount,toAccount,amount,idempotencyKey}=req.body 
  if(!fromAccount||!toAccount|| !amount || !idempotencyKey){
    return res.status(400).json({
      message:"fromAccount,toAccount,amount,idempotencyKey all are required field"
    })
  }
  const fromUserAccount=await accountModel.findOne({
    _id:fromAccount
  })
  const toUserAccount=await accountModel.findOne({
    _id:toAccount
  })
  
  if(!fromUserAccount|| !toUserAccount){
    return res.json({
      message:"Invalid fromAccount or toAccount"
    })
  }

  const isTransactionAlreadyExists=await transactionModel.findOne({
    idempotencyKey:idempotencyKey
  })
  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status==="COMPLETED"){
      return res.status(201).json({
        message:"Transaction is completed"
      })
    }
    if(isTransactionAlreadyExists.status==="PENDING"){
      return res.status(201).json({
        message:"Transaction is pending"
    })
  }
    if(isTransactionAlreadyExists.status==="FAILED"){
      return res.status(201).json({
        message:"Transaction is Failed"
    })
  }
    if(isTransactionAlreadyExists.status==="REVERSED"){
      return res.status(201).json({
        message:"Transaction is Reversed"
    })
  }
}
if(fromUserAccount.status!=="ACTIVE"|| toUserAccount.status!=="ACTIVE" ){
  return res.status(400).json({
    message:"Both account must be active for transaction " 
  })
}
const balance=await fromUserAccount.getBalance()
if(balance<amount){
  return res.status(400).json({
    message: "Insufficient balance"
  })
}
const session=await mongoose.startSession()
try{
session.startTransaction()
const transaction=new transactionModel({
  fromAccount:fromUserAccount._id,
  toAccount,
  amount,
  idempotencyKey,
  status:"PENDING"
})
const debitLedgerEntry=await ledgerModel.create([{
  account:fromUserAccount._id,
  amount,
  transaction:transaction._id,
  type:"DEBIT",

}],{session})
const creditLedgerEntry=await ledgerModel.create([{
  account:toUserAccount._id,
  amount,
  transaction:transaction._id,
  type:"CREDIT",

}],{session})
transaction.status="COMPLETED"
await transaction.save({session})
await session.commitTransaction()
}catch(err){
  await session.abortTransaction()

    return res.status(500).json({
        message: "Transaction failed",
        error: error.message
    })
} finally{

session.endSession()
}
 await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount)
return res.status(201).json({
  message:"Transaction completed successfully",
  transaction:transaction
})
}

async function createInitialFundsTransaction(req,res){
  const {toAccount,amount,idempotencyKey}=req.body 
  if(!toAccount||!amount||!idempotencyKey){
    return res.status(401).json({
      message:"toAccount,amount,idempotencyKey are required"
    })
  }
  const toUserAccount=await accountModel.findOne({
    _id:toAccount
  })
  if(!toUserAccount){
    return res.status(400).json({
      message:"Invalid Account"
    })
  }
  const fromUserAccount=await accountModel.findOne({
    user:req.user._id
  })
  if(!fromUserAccount){
    return res.status(400).json({
      message:"System user Account not found"
    })
  }
  const session =await mongoose.startSession()
  session.startTransaction()
  const transaction=new transactionModel({
    fromAccount:fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
  })
  const debitLedgerEntry=await ledgerModel.create([{
    account:fromUserAccount._id,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"
  }],{session})

 const creditLedgerEntry=await ledgerModel.create([{
     account:toAccount,
    amount:amount,
    transaction:transaction._id,
    type:"CREDIT"
  }],{session})
  transaction.status="COMPLETED"
  await transaction.save({session})

  await session.commitTransaction()
  session.endSession()
  return res.status(201).json({
      message:"Inital funds transaction completed succesflly",
      transaction:transaction
    })
}
module.exports={
  createTransaction,
  createInitialFundsTransaction
}