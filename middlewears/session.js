exports.sessionCheck = (req,res,next)=>{ 
    if(req.session.user) next()
    else res.redirect('/')
}

exports.sessionCheckAxios  = (req,res,next)=>{
    if(req.session.user) next()
    else res.json({response : "login"})
}

exports.loginCheck = (req,res,next)=>{
    if(req.session.user) res.redirect('/')
    else next()
}
