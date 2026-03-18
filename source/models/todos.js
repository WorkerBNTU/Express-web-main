import { Todo } from "./__loaddatabase.js";
import { join } from "path";
import { rm } from "fs/promises";
import { currentDir } from "../utility.js";

export async function getListTodos(user, doneAtLast, search) {
    const qTodos = Todo.find({ user: user });
    if (doneAtLast === '1')
        qTodos.sort('done createdAt');
    else
        qTodos.sort('createdAt');
    if (search)
        qTodos.contains(search);
    return await qTodos;
} 

export async function getItem(id, user) {
    return await Todo.findOne({ _id: id, user: user })
}

export async function addItem(todo) {
    const oTodo = new Todo(todo);
    await oTodo.save();
}

export async function setDoneItem(id, user) {
    return await Todo.findOneAndSetDone(id, user);
}

export async function deleteItem(id, user) {
    return await Todo.findOneAndDelete({_id: id, user: user});
}

export async function deleteTodosByUser(user) {
    const todos = await Todo.find({ user });

    for (const t of todos) {
        if (t.addendum) {
            try {
                await rm(join(currentDir, "storage", "uploaded", t.addendum));
            } catch (e) {
                // игнорируем ошибки удаления файла (например, если его уже нет)
            }
        }
    }

    return await Todo.deleteMany({ user });
}