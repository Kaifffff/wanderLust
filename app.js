const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");



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


// ----  index route //
app.get("/listings",async (req,res)=>{
    let allListing = await Listing.find({});
    res.render("./listings/index.ejs",{allListing});
})

// --- new route
app.get("/listings/new",(req,res)=>{
    res.render("./listings/new.ejs");
});

// ---- show route 
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/show.ejs",{listing});
});

// create route 

app.post("/listings", async (req,res)=>{
    const newLIsting = new Listing(req.body.listing);
    await newLIsting.save();
    res.redirect('/listings');
});

//edit route 
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
});

// update route

app.put("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

// delete route 

app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
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