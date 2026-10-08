const bcrypt= require('bcrypt')
const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
  email:{
    type:String,
    lowercase:true,
    trim:true,
    required:true,
    unique:[true,"Email already exists"]
  },
  name:{
     type:String,
     required:[true,'Name is required for creating account']
  },
  password:{
     type:String,
     required:[true,'password is required to open account '],
     minlength:[6,"password should contain more than 6 character"],
     select:false
  },
  systemUser:{
    type:Boolean,
    default:false,
    immutable:true,
    select:false

  }
},{
  timestamps:true
})

userSchema.pre('save', async function(){
  if(!this.isModified("password")){
    return 
  }
  const hash=await bcrypt.hash(this.password,10)
  this.password=hash
  return 
})
userSchema.methods.comparePassword=async function(password){
  return await bcrypt.compare(password, this.password)
}

module.exports=mongoose.model('user',userSchema)