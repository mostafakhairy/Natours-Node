module.exports = class ApiExtensions {
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
  }
  sort() {
    //sorting
    //for sorting desc use -[field name] like -price and for sorting using many
    //field use [field name1 field name2 etc..] like price rating name id
    this.query = this.query.sort(this.queryString.sort);
    return this;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedArray = ['page', 'sort', 'limit', 'fields'];
    excludedArray.forEach(c => delete queryObj[c]);
    //normal filtering ==
    //const query = Tour.find(queryObj)
    //advanced filtering
    /* we set param[$operation] like price[$lt]
    if not working we can use following code
     const queryString = JSON.stringify(queryObj).replace(
       /\b(lt|gt|lte|gte)\b/g,
       match => `$${match}`
     );*/
    this.query = this.query.find(queryObj);
    return this;
  }
  paging() {
    //paging
    const page = +this.queryString.page - 1 || 0;
    const itemsPerPage = +this.queryString.limit || 100;
    this.query = this.query.skip(page * itemsPerPage).limit(itemsPerPage);
    return this;
  }
  limitFields() {
    //limiting fields
    //same as sorting but for excluding some default fields we use -[field name] like -__v
    this.query = this.query.select(this.queryString.fields);
    return this;
  }
};
