const { stackTraceLimit } = require("./errorHandler");

 class APIFeatures 
 {
     constructor(query,queryString)
     {
         this.query = query;
         this.queryString = queryString;
     }

     search()
     {
         const keyword = this.queryString.keyword ? {
             name:{
                 $regex : this.queryString.keyword,
                 $options : 'i'

             }
         }:{}
        //  console.log(keyword);
         this.query = this.query.find({...keyword});
         return this;
     }

     filter()
     {
         const queryCopy = {...this.queryString};
        // console.log(queryCopy);
         //removinf field from the query
         const removeFields = ['keyword','limit' , 'page'];
         removeFields.forEach(el => delete queryCopy[el]);
        //  console.log(queryCopy);

        //advance filter for price, ratings, etc
        let queryString = JSON.stringify(queryCopy);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g,match => `$${match}`);
        // console.log(queryString);
         this.query = this.query.find(JSON.parse(queryString));
         return this;
     }

     pagination(resultPerPage)
     {
         const currentPage = Number(this.queryString.page) || 1;
         const skip = resultPerPage *(currentPage-1);

         this.query = this.query.limit(resultPerPage).skip(skip);
         return this;
     }
 }

 module.exports = APIFeatures;