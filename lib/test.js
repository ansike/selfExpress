const SelfExpress = require("./index");
const app = new SelfExpress();

// app.use("/", (req, res) => {
//   res.end("hello world /");
// });
// app.use("/url", (req, res) => {
//   res.end("hello world url");
// });

app.listen(4000);
