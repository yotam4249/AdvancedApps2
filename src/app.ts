import initApp from './server'


const port = process.env.PORT;

initApp().then((app) =>{
    app.listen(port,()=>{
        console.log(`Listenenig on port : http://127.0.0.1:${port}`);
    });
})
    


