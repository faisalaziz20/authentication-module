import express from 'express'
import path from 'path'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import ejs from 'ejs'
import mongoose from 'mongoose'
import User from './model/user.model.js'
const app =express()


//Middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.set('view engine','ejs')
app.use(session({
    secret:'secret123',
    resave:false,
    saveUninitialized:false
}))
let checklogin= (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('login')
    }
}


//Database connection
mongoose.connect('mongodb://localhost:27017/',
    {
        dbName:'authorization'
    }
).then(()=>console.log('Database connected')).catch((err)=>console.log((err)))



//Routes
app.get('/',checklogin, (req,res)=>{
    res.send(`<h1>Welcome to the Home Page</h1> 
        <p>Hello, ${req.session.user || 'Guest'}!</p> 
        <a href="/logout">logout</a>
        `)
});
app.get('/profile',checklogin,(req,res)=>{
    res.send(`<h1>Profile page</h1> <p> Hello, ${req.session.user}</p> <a href="/logout">Logout</a>`)
})
app.get('/login',(req,res)=>{
    if(req.session.user){
        res.redirect('/')
    }else{
        res.render('login',{error:null});
    }
});
app.get('/register',(req,res)=>{
  res.render('register',{error:null})
})





app.post('/login',async(req,res)=>{
   const {username,userpassword}=req.body
   const user= await User.findOne({username})
   if(!user) return res.render('login',{error:'User not found'})
    const isMath= await bcrypt.compare(userpassword,user.userpassword)
    if(!isMath) return res.render('login',{error:'invalid paassword'})
    
    req.session.user = username
    res.redirect('/')
});
app.post('/register',async(req,res)=>{
    const {username,userpassword}=req.body
    const hasedPassword= await bcrypt.hash(userpassword, 10);
    //res.send({username,userpassword:hasedPassword});
    await User.create({username,userpassword:hasedPassword})
    res.redirect('/login')
})
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/login')
    })
})
const port=;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
