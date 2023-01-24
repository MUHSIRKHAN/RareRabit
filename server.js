require('dotenv').config()
const bodyParser = require('body-parser');
var session = require('express-session')
const express=require('express')
const app=express();
const path=require('path')
const http=require('http')
const connectDB=require("./database/mongoose")
const mongoose =require("mongoose")
const adminRoutes=require('./routes/admin');
const userRoutes=require('./routes/user')
const flash=require('connect-flash')


app.use(express.urlencoded({ extended: false }));
//app.use(bodyParser.urlencoded({extended:false}));

app.use(express.json())
app.use(flash())

app.set("views",path.join(__dirname,"views"))
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 100000 * 60 }
}))

app.use((req, res, next) => {
  res.set(
      "Cache-control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});
app.use("/assets",express.static(path.join(__dirname,"public/assets")))
app.use("/",express.static(path.join(__dirname,"/public/")))
app.use("/adminassets",express.static(path.join(__dirname,"public/adminassets")))
app.set("view engine","ejs");
app.use('/admin',adminRoutes);
app.use('/',userRoutes  )

 



connectDB()
app.use((req,res,next)=>{
    
    res.status(404).send('<h1>page not found</h1>');
});



mongoose.connection.once("open",()=>{
  console.log("Connected to mongoDB")
  app.listen(3000, () => {
    console.log("Server is running at port 3000");
  });
})
