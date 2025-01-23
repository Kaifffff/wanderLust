const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./model/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js")
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./model/review.js");

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


const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

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
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("./listings/show.ejs",{listing});
}));

// create route 

app.post("/listings",
    validateListing,
    wrapAsync(async (req,res,next)=>{
        let result = listingSchema.validate(req.body);
        console.log(result);
        if(result.error){
            throw new ExpressError(400 , result.error);
        }
    const newLIsting = new Listing(req.body.listing);
    await newLIsting.save();
    res.redirect('/listings');
}));

//edit route 
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
}));

// update route

app.put("/listings/:id",validateListing, wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// delete route 

app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

//Reviews Post Route

app.post("/listings/:id/reviews", validateReview,wrapAsync( async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

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