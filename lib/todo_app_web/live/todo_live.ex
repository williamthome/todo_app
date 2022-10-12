defmodule TodoAppWeb.TodoLive do
  use TodoAppWeb, :live_view
  alias TodoApp.Todos
  alias TodoApp.Todos.Todo

  def mount(_args, _session, socket) do
    socket =
      socket
      |> changeset()
      |> fetch()

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <.form
      :let={f}
      for={@changeset}
      phx-submit="add"
    >
      <%= checkbox f, :done %>
      <%= text_input f, :title, placeholder: "Create a new todo.." %>
      <%= error_tag f, :title %>
    </.form>

    <%= for todo <- @todos do %>
      <div>
        <%= todo.done %>
        <%= todo.title %>
      </div>
    <% end %>

    There is <%= Enum.count(@todos) %> todos.
    """
  end

  def handle_event("add", %{"todo" => todo}, socket) do
    socket =
      case Todos.create_todo(todo) do
        {:ok, %Todo{}} ->
          socket
          |> fetch()

        {:error, changeset} ->
          socket
          |> changeset(changeset)
      end

    {:noreply, socket}
  end

  defp fetch(socket) do
    socket
    |> assign(todos: Todos.list_todos())
  end

  defp changeset(socket) do
    socket
    |> changeset(Todos.change_todo(%Todo{}))
  end

  defp changeset(socket, changeset) do
    socket
    |> assign(changeset: changeset)
  end
end
