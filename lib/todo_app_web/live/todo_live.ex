defmodule TodoAppWeb.TodoLive do
  use TodoAppWeb, :live_view

  alias TodoApp.Todos
  alias TodoApp.Todos.Todo

  import TodoAppWeb.Components.Todo
  import TodoAppWeb.Components.Filter

  @filters [
    %{name: "all", label: "All", clause: [], selected: true},
    %{name: "active", label: "Active", clause: [done: false]},
    %{name: "completed", label: "Completed", clause: [done: true]}
  ]

  def mount(_args, _session, socket) do
    socket =
      socket
      |> assign(filters: @filters)
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

    <div id="drag" phx-hook="Drag" class="todos">
      <%= for todo <- @todos do %>
        <div data-id={todo.id} class="my-drag" draggable="true">
          <div class="my-drop-area"></div>
          <div class="my-todo-holder">
            <.todo
              todo={todo}
              toggle_done_event="toggle_done"
              delete_event="delete"
            />
          </div>
        </div>
      <% end %>
    </div>

    <button type="button" phx-click="clear">
      Clear Completed
    </button>

    <div>
      <%= for filter <- @filters do %>
        <.filter
          filter={filter}
          filter_event="filter"
        />
      <% end %>
    </div>

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

  def handle_event("delete", %{"id" => id}, socket) do
    socket =
      socket
      |> delete_todo(id)

    {:noreply, socket}
  end

  def handle_event("filter", %{"name" => filter_name}, socket) do
    socket =
      socket
      |> filter(filter_name)

    {:noreply, socket}
  end

  def handle_event("clear", %{}, socket) do
    socket =
      socket
      |> clear_completed()

    {:noreply, socket}
  end

  def handle_event("drop", %{"from" => from, "to" => to}, socket) do
    {from, _} = :string.to_integer(from)
    {to, _} = :string.to_integer(to)

    IO.inspect(["drop", from, to])

    {:noreply, socket}
  end

  defp fetch(socket) do
    filter =
      Enum.find(socket.assigns.filters, fn f ->
        Map.get(f, :selected) == true
      end)

    socket
    |> assign(todos: Todos.list_sorted_todos(filter.clause))
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
    Todos.get_todo_and_callback(id, fn
      todo -> Todos.update_todo(todo, callback.(todo))
    end)

    socket
    |> fetch()
  end

  defp delete_todo(socket, id) do
    Todos.get_todo_and_callback(id, &Todos.delete_todo/1)

    socket
    |> fetch()
  end

  defp filter(socket, filter_name) do
    filters =
      Enum.map(socket.assigns.filters, fn
        %{:name => ^filter_name} = filter ->
          Map.put(filter, :selected, true)

        filter ->
          Map.put(filter, :selected, false)
      end)

    socket
    |> assign(filters: filters)
    |> fetch()
  end

  defp clear_completed(socket) do
    Todos.clear_completed()

    socket
    |> fetch()
  end
end
