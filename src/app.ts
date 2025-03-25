import initApp from './server'
import https from 'https'
import fs from 'fs'

const port = process.env.PORT;

console.log(process.env.NODE_ENV)
initApp().then((app) =>{
    if(process.env.NODE_ENV != "production"){
        app.listen(port,()=>{
            console.log(`Listenenig on port : http://localhost:${port}`);
        });
    }
    else{
        const prop = {
            key: fs.readFileSync("client-key.pem"),
            cert: fs.readFileSync("client-cert.pem")
        }
        console.log(prop)
        https.createServer(prop,app).listen(port, () => {
            console.log(`HTTPS Server running on https://localhost:${port}`);
          })
    }
})
    


