const app = require("./src/app")
const dotenv = require("dotenv");
dotenv.config();
const connectoDB = require("./src/auth/db")

app.listen(3000,()=>{
    console.log("server is running ")
})

connectoDB();

