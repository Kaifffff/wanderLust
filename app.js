const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./model/review.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.set("view engin","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=>{
    res.send("wworking ");
});


// const validateListing = (req,res,next)=>{
//     let {error} = listingSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };

// const validateReview = (req,res,next)=>{
//     let {error} = reviewSchema.validate(req.body);
//     if(error){
//         let errMsg = error.details.map((el)=> el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     }else{
//         next();
//     }
// };

app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404 ,"page not found"));
});

app.use((err,req,res,next)=>{
    let {statusCode = 500 , message = "something wrong "} = err;
    res.status(statusCode).render("error.ejs",{message});
});
// app.get("/test", async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"Home",
//         description:"lake area",
//         price:1500,
//         location:"goa",
//         country:"india",
//     });
//     await sampleListing.save();
//     res.send("save Successfuly");
// });
app.listen(8080,()=>{
    console.log("server listening on port 8080");
});