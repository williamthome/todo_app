defmodule TodoAppWeb.TodoLive do
  use TodoAppWeb, :live_view
  alias TodoApp.Todos

  def mount(_args, _session, socket) do
    {:ok, socket |> assign(todos: Todos.list_todos)}
  end

  def render(assigns) do
    ~H"""
    Hello, World!
    There is <%= Enum.count(@todos) %> todos.
    """
  end
end
