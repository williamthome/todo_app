defmodule TodoAppWeb.TodoLive do
  use TodoAppWeb, :live_view

  alias TodoApp.Todos
  alias TodoApp.Todos.Todo

  import TodoAppWeb.Components.Todo
  import TodoAppWeb.Components.Filter

  @theme :light
  @filters [
    %{name: "all", label: "All", clause: [], selected: true},
    %{name: "active", label: "Active", clause: [done: false]},
    %{name: "completed", label: "Completed", clause: [done: true]}
  ]

  def mount(_args, _session, socket) do
    Todos.subscribe()

    socket =
      socket
      |> assign_theme()
      |> assign_filters()
      |> assign_changeset()
      |> assign_todos()

    {:ok, socket}
  end

  def render(assigns) do
    ~H"""
    <.form
      id="todo_form"
      class="todo-holder card rounded-border"
      :let={f}
      for={@changeset}
      phx-submit="create"
      phx-hook="FormReset"
    >
      <div class="checkbox-container">
        <%= checkbox f, :done, class: "checkbox-input checkbox-icon" %>
        <%= label f, :done, "", class: "checkbox-icon" %>
      </div>

      <%= text_input f, :title, placeholder: "Create a new todo..", phx_reset: "" %>
    </.form>

    <div class="todos card rounded-border elevated">
      <div id="drag" phx-hook="Drag" class="todos todos-holder">
        <%= for todo <- @todos do %>
          <div
            id={"todo-#{todo.id}-holder"}
            data-id={todo.id}
            data-done={to_string(todo.done)}
            class="drag-wrapper"
            draggable="true"
          >
            <div class="drop-area"></div>
            <div class="drag-content">
              <.todo
                todo={todo}
                toggle_done_event="toggle_done"
                delete_event="delete"
              />
            </div>
          </div>
        <% end %>
      </div>

      <div class="todos-footer todo-holder card">
        <span>5 items left</span>
        <div class="filters">
          <%= for filter <- @filters do %>
            <.filter
              filter={filter}
              filter_event="filter"
            />
          <% end %>
        </div>
        <button type="button" phx-click="clear">
          Clear Completed
        </button>
      </div>
    </div>

    <div class="filters todo-holder card rounded-border elevated">
      <%= for filter <- @filters do %>
        <.filter
          filter={filter}
          filter_event="filter"
        />
      <% end %>
    </div>

    <div class="hint">Drag and drop to reorder list</div>
    """
  end

  def handle_info({Todos, [:todo | _], _}, socket) do
    socket =
      socket
      |> assign_todos()

    {:noreply, socket}
  end

  def handle_event("toggle_theme", %{}, socket) do
    socket =
      socket
      |> toggle_theme()
      |> push_event("toggle-theme", %{})

    {:noreply, socket}
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

    reply =
      case Todos.update_position(from, to) do
        {:ok, {_from_todo, _to_todo}} ->
          %{result: :ok}
        {:error, reason} ->
          IO.inspect({:error, reason})
          %{result: :error, reason: "Something bad happened :("}
      end

    {:reply, reply, socket}
  end

  defp toggle_theme(socket) do
    theme =
      case socket.assigns.theme do
        :light -> :dark
        :dark -> :light
      end

    socket
    |> assign_theme(theme)
  end

  defp assign_theme(socket) do
    socket
    |> assign_theme(@theme)
  end

  defp assign_theme(socket, theme) when theme in [:light, :dark] do
    socket
    |> assign(theme: theme)
  end

  defp assign_filters(socket) do
    socket
    |> assign_filters(@filters)
  end

  defp assign_filters(socket, filters) do
    socket
    |> assign(filters: filters)
  end

  defp assign_todos(socket) do
    filter =
      Enum.find(socket.assigns.filters, fn f ->
        Map.get(f, :selected) == true
      end)

    socket
    |> assign(todos: Todos.list_sorted_todos(filter.clause))
  end

  defp assign_changeset(socket) do
    socket
    |> assign_changeset(Todos.change_todo(%Todo{}))
  end

  defp assign_changeset(socket, changeset) do
    socket
    |> assign(changeset: changeset)
  end

  defp create_todo(socket, attrs) do
    case Todos.create_todo(attrs) do
      {:ok, %Todo{}} ->
        socket

      {:error, changeset} ->
        socket
        |> assign_changeset(changeset)
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
  end

  defp delete_todo(socket, id) do
    Todos.get_todo_and_callback(id, &Todos.delete_todo/1)

    socket
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
    |> assign_filters(filters)
    |> assign_todos()
  end

  defp clear_completed(socket) do
    Todos.clear_completed()

    socket
  end
end
