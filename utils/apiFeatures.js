class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    //1:filter()
    filter() {
        let queryObj = { ...this.queryStr };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);
        // advance filtering:for gte,lte,gt,lt
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(
            /\b(gte|lte|gt|lt)\b/g,
            (match) => `$${match}`
        );
        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }
    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }
    paginate() {
        const page = +this.queryStr.page || 1;
        const limit = +this.queryStr.limit || 100;
        const skippedDocuments = (page - 1) * limit;
        if (this.queryStr.page || this.queryStr.limit) {
            this.query = this.query.skip(skippedDocuments).limit(limit);
            // IDN WHY NOT ERROR HANDLING:
            // const numTours = await Tour.countDocuments();
            // if (skippedDocuments >= numTours) {
            //     throw new Error('The page DNE');
            // }
        }
        return this;
    }
}
module.exports = APIFeatures;
