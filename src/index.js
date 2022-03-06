import express from "express";
import cors from "cors";
import { Client, Repository } from "redis-om";
import { todoSchema } from "../schema/todo.schema.js";

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

const client = new Client();
await client.open(
  "redis://admin:Insea@2034@redis-19247.c93.us-east-1-3.ec2.cloud.redislabs.com:19247"
);

const todoRepo = new Repository(todoSchema, client);
await todoRepo.dropIndex()
await todoRepo.createIndex()

app.post('/addTodo', async (req, res) => {
  const todoItem = todoRepo.createEntity();

  todoItem.status = req.body.status
  todoItem.todo = req.body.todo
  todoItem.id = await todoRepo.save(todoItem)
  res.send("Created !");
});

app.get("/getTodos", async (req, res) => {
    res.send(await todoRepo.search().returnAll());
  });

app.delete("/deleteTodo/:id", async (req, res) => {
    await todoRepo.remove(req.params.id)
    res.send("Deleted !");
});

app.put("/updateTodo/:id", async (req, res) => {
    const todoItem = await todoRepo.fetch(req.params.id)

    todoItem.todo = req.body.todo
    todoItem.status = req.body.status

    await todoRepo.save(todoItem)
    res.send("Updated !");
});

app.listen(port, () => console.log(`listening on port ${port} !`));
