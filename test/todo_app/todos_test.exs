defmodule TodoApp.TodosTest do
  use TodoApp.DataCase

  alias TodoApp.Todos

  describe "todos" do
    alias TodoApp.Todos.Todo

    import TodoApp.TodosFixtures

    @invalid_attrs %{done: nil, title: nil}

    test "list_todos/0 returns all todos" do
      todo = todo_fixture()
      assert Todos.list_todos() == [todo]
    end

    test "get_todo!/1 returns the todo with given id" do
      todo = todo_fixture()
      assert Todos.get_todo!(todo.id) == todo
    end

    test "create_todo/1 with valid data creates a todo" do
      valid_attrs = %{done: true, title: "some title"}

      assert {:ok, %Todo{} = todo} = Todos.create_todo(valid_attrs)
      assert todo.done == true
      assert todo.title == "some title"
    end

    test "create_todo/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Todos.create_todo(@invalid_attrs)
    end

    test "update_todo/2 with valid data updates the todo" do
      todo = todo_fixture()
      update_attrs = %{done: false, title: "some updated title"}

      assert {:ok, %Todo{} = todo} = Todos.update_todo(todo, update_attrs)
      assert todo.done == false
      assert todo.title == "some updated title"
    end

    test "update_todo/2 with invalid data returns error changeset" do
      todo = todo_fixture()
      assert {:error, %Ecto.Changeset{}} = Todos.update_todo(todo, @invalid_attrs)
      assert todo == Todos.get_todo!(todo.id)
    end

    test "update_position/1 swap todos position" do
      from_todo = todo_fixture(%{position: 0})
      to_todo = todo_fixture(%{position: 1})

      assert {:ok, {from_todo, to_todo}} = Todos.update_position(from_todo.id, to_todo.id)
      assert Todos.get_todo!(from_todo.id).position == to_todo.position
      assert Todos.get_todo!(to_todo.id).position == from_todo.position
    end

    test "delete_todo/1 deletes the todo" do
      todo = todo_fixture()
      assert {:ok, %Todo{}} = Todos.delete_todo(todo)
      assert_raise Ecto.NoResultsError, fn -> Todos.get_todo!(todo.id) end
    end

    test "change_todo/1 returns a todo changeset" do
      todo = todo_fixture()
      assert %Ecto.Changeset{} = Todos.change_todo(todo)
    end
  end
end
