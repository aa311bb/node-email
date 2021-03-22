const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const nodemailer=require('nodemailer');
require('dotenv').config();

const User=require('./models/User');

const app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//链接数据库
 mongoose.connect('mongodb+srv://aa311bb:441426@cluster0.u71t6.mongodb.net/EMAIL?retryWrites=true&w=majority',{useNewUrlParser:true}).then(()=>{
     console.log("succees")
 }).catch(err=>{
     console.log(err)
 })


app.get('/',(req,res)=>{
    res.json({state:'suc',msg:'it works'})
});
app.post('/addUser',(req,res)=>{
   User.findOne({username:req.body.username}).then(user=>{
       if(user){
           res.status(400).json({
               state:'failed',
               msg:'改用户已存在'
           })
       }else{
           const newUser=new User({
               username:req.body.username,
               pwd:req.body.pwd,
               email:req.body.email
           });
           newUser.save().then(()=>{
               res.status(200).json({
                   state:"suc",
                   msg:"添加成功",
                   data:user
               });
           }).catch(err=>console.log(err))
       }
   })
});

//找回密码
app.post('/retrievePwd',(req,res)=>{
    User.findOne({username:req.body.username}).then(user=>{
        if(!user){
            res.status(400).json({
                state:'failed',
                msg:'该用户不存在'
            });
        }else{
            //step 1
            let transporter=nodemailer.createTransport({
                service:"qq",
                secure:true,
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.PASSWORD
                } 
            });
            //step 2
            let mailOptions={
                from:"810226736@qq.com",
                to:req.body.email,
                // cc:"抄送",
                // bcc:"私密发送"
                subject:"找回密码",
                text:`您的用户名:${user.username},密码:${user.pwd}`
            };
            //step 3
            transporter.sendMail(mailOptions,(err,data)=>{
                if(err){
                    res.status(400).json({
                        state:"failed",
                        msg:err
                    })
                }else{
                    res.status(200).json({
                        state:"suc",
                        mag:`密码已经发送至你的邮箱${req.body.email}`
                    })
                }
            })
        }
    })
})

const port =process.env.PORT || 5000;

app.listen(port,()=>{
    // console.log(`${port}`);
})
