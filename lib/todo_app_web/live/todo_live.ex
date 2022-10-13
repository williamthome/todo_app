defmodule TodoAppWeb.TodoLive do
  use TodoAppWeb, :live_view
  alias TodoApp.Todos
  alias TodoApp.Todos.Todo

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

    <%= for todo <- @todos do %>
      <div>
        <label>
          <input
            type="checkbox"
            checked={todo.done}
            phx-click="toggle_done"
            phx-value-id={todo.id}
          />
          <span><%= todo.title %></span>
        </label>
        <button
          type="button"
          phx-click="delete"
          phx-value-id={todo.id}
        >
          X
        </button>
      </div>
    <% end %>

    <button type="button" phx-click="clear">
      Clear Completed
    </button>

    <div>
      <%= for filter <- @filters do %>
        <button
          type="button"
          phx-click="filter"
          phx-value-name={filter.name}
        >
          <%= filter.label %>
          <%= if Map.get(filter, :selected), do: "(Selected)" %>
        </button>
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
    case Todos.get_todo(id) do
      nil ->
        false

      todo ->
        Todos.update_todo(todo, callback.(todo))
    end

    socket
    |> fetch()
  end

  defp delete_todo(socket, id) do
    case Todos.get_todo(id) do
      nil ->
        false

      todo ->
        Todos.delete_todo(todo)
    end

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
