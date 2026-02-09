import app from "./app.js";
import { PORT } from "./env.js";

app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
