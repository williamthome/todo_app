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
      phx-submit="create"
    >
      <%= checkbox f, :done %>
      <%= text_input f, :title, placeholder: "Create a new todo.." %>
      <%= error_tag f, :title %>
    </.form>

    <%= for todo <- @todos do %>
      <div>
        <input
          type="checkbox"
          checked={todo.done}
          phx-click="toggle_done"
          phx-value-id={todo.id}
        />
        <span><%= todo.title %></span>
      </div>
    <% end %>

    There is <%= Enum.count(@todos) %> todos.
    """
  end

  def handle_event("create", %{"todo" => attrs}, socket) do
    socket =
      socket
      |> create_todo(attrs)

    {:noreply, socket}
  end

  def handle_event("toggle_done", %{"id" => id}, socket) do
    socket =
      socket
      |> toggle_done(id)

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

  defp create_todo(socket, attrs) do
    case Todos.create_todo(attrs) do
      {:ok, %Todo{}} ->
        socket
        |> fetch()

      {:error, changeset} ->
        socket
        |> changeset(changeset)
    end
  end

  defp toggle_done(socket, id) do
    socket
    |> update_todo(id, fn todo -> %{done: !todo.done} end)
  end

  defp update_todo(socket, id, callback) do
    case Todos.get_todo(id) do
      :nil ->
        :false

      todo ->
        Todos.update_todo(todo, callback.(todo))
    end

    socket
    |> fetch()
  end
end
