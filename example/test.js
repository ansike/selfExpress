const SelfExpress = require("../lib/index");
const app = new SelfExpress();

app.use("/", (req, res, next) => {
  console.log(1)
  next()
});

app.use("/", (req, res) => {
  console.log(2)
  res.end("hello world url");
});
app
  .get("/urlss", (req, res, next) => {
    // res.end(`hello world get ${req.url}`);
    console.log("1");
    next();
  })
  .get("/urlss", (req, res, next) => {
    next(new Error("there is an error"));
  })
  .get("/urlss", (req, res) => {
    console.log("3");
    res.end(`hello world get2 ${req.url}`);
  });

app.post("/urlss", (req, res) => {
  res.end(`hello world post ${req.url}`);
});

console.log(JSON.stringify(app));
app.listen(4000);
