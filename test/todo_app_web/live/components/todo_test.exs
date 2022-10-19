defmodule TodoAppWeb.TodoComponentTest do
  use TodoAppWeb.LiveCase

  alias TodoApp.Todos.Todo
  alias TodoAppWeb.Components.Todo, as: TodoComponent

  test "todo" do
    todo = %Todo{
      title: "MyTodo"
    }

    assigns = %{
      checkbox_id: "checkbox",
      toggle_done_event: "toggle",
      delete_event: "delete",
      todo: todo,
    }

    assert render_component(&TodoComponent.todo/1, assigns) =~ "MyTodo"
  end
end
